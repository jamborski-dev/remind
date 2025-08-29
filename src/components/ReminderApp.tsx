import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./ReminderApp.css";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type FixMeLater = any;

// ---- Types ----
export type Reminder = {
	id: string;
	text: string;
	enabled: boolean;
	everyMinutes: number; // recurrence interval
	startAtMinutes: number; // time-of-day start (minutes since local midnight)
	nextDueTime: number; // epoch ms for the next due occurrence
	createdAt: number; // epoch ms
	lastShownAt?: number; // epoch ms
	snoozeUntil?: number; // epoch ms
	completedToday?: number; // count of completions today
};

export type LogEntry = {
	id: string;
	reminderId: string;
	text: string;
	action: "done" | "snooze" | "dismiss";
	at: number; // epoch ms
	snoozeForMinutes?: number;
};

const LOG_STORAGE_KEY = "zuza-reminders:log:v";

function loadLog(): LogEntry[] {
	try {
		const raw = localStorage.getItem(LOG_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function saveLog(entries: LogEntry[]) {
	localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(entries));
}
const formatTime = (ts: number) =>
	new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ---- Utilities ----
const STORAGE_KEY = "zuza-reminders:v3"; // bump version for new fields
const now = () => Date.now();
const GRACE_MS = 5000; // allow 5s grace: treat slightly-past due times as due now
const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);
const uid = () => Math.random().toString(36).slice(2, 9);
function toLocalMinutesSinceMidnight(ts: number) {
	const d = new Date(ts);
	return d.getHours() * 60 + d.getMinutes();
}
function startOfLocalDay(ts: number) {
	const d = new Date(ts);
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}

function minutesToHHMM(mins: number) {
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function normalizeMinutesDay(mins: number) {
	return ((mins % 1440) + 1440) % 1440;
}

function formatCountdown(ms: number) {
	const total = Math.max(0, Math.floor(ms / 1000));
	const s = total % 60;
	const m = Math.floor(total / 60) % 60;
	const h = Math.floor(total / 3600);
	if (h > 0)
		return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	return `${m}:${String(s).padStart(2, "0")}`;
}

function nextDueOnOrAfter(reminder: Reminder, timestamp: number) {
	const dayStart = startOfLocalDay(timestamp);
	const startTs = dayStart + reminder.startAtMinutes * 60_000;
	if (timestamp <= startTs) return startTs;
	const intervalMs = reminder.everyMinutes * 60_000;
	const elapsed = Math.floor((timestamp - startTs) / intervalMs);
	return startTs + (elapsed + 1) * intervalMs;
}

function loadReminders(): Reminder[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as Partial<Reminder>[];
		if (!Array.isArray(parsed)) return [];
		return parsed.map((item) => {
			const createdAt = Number((item as FixMeLater).createdAt ?? now());
			let startAtMinutes: number;

			if (typeof (item as FixMeLater).startAtMinutes === "number") {
				startAtMinutes = clamp(
					Number((item as FixMeLater).startAtMinutes),
					0,
					1439,
				);
			} else {
				// Legacy migration from delayMinutes -> startAtMinutes
				const legacyDelay = Number((item as FixMeLater).delayMinutes ?? 0);
				const legacyStartTs = createdAt + legacyDelay * 60_000;
				startAtMinutes = clamp(
					toLocalMinutesSinceMidnight(legacyStartTs),
					0,
					1439,
				);
			}
			const baseReminder = {
				id: item.id ?? uid(),
				text: item.text ?? "",
				enabled: item.enabled ?? true,
				everyMinutes: clamp(Number(item.everyMinutes ?? 5), 1, 240),
				startAtMinutes,
				createdAt,
				lastShownAt:
					typeof item.lastShownAt === "number" ? item.lastShownAt : undefined,
				snoozeUntil:
					typeof item.snoozeUntil === "number" ? item.snoozeUntil : undefined,
				completedToday:
					typeof item.completedToday === "number"
						? item.completedToday
						: item.completedToday === true
							? 1
							: 0,
			} as Reminder;
			let nextDueTime: number;
			if (typeof (item as FixMeLater).nextDueTime === "number") {
				const stored = Number((item as FixMeLater).nextDueTime);
				const n = now();
				if (stored + GRACE_MS >= n) {
					nextDueTime = stored; // keep slightly-past so it can fire immediately
				} else {
					nextDueTime = nextDueOnOrAfter(baseReminder, n);
				}
			} else {
				// No stored nextDueTime (legacy/new): compute based on today from startAtMinutes
				nextDueTime = nextDueOnOrAfter(baseReminder, now());
			}
			return { ...baseReminder, nextDueTime };
		});
	} catch {
		return [];
	}
}

function saveReminders(items: Reminder[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function isSameLocalDay(a: number, b: number) {
	const dateA = new Date(a);
	const dateB = new Date(b);
	return (
		dateA.getFullYear() === dateB.getFullYear() &&
		dateA.getMonth() === dateB.getMonth() &&
		dateA.getDate() === dateB.getDate()
	);
}

// ---- Simple chime with Web Audio API ----
async function playChime() {
	try {
		const AudioContextCtor =
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(window as FixMeLater).AudioContext ||
			(window as FixMeLater).webkitAudioContext;
		if (!AudioContextCtor) return;
		const audioContext = new AudioContextCtor();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();
		oscillator.type = "sine";
		oscillator.frequency.value = 880; // A5 ping
		gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(
			0.2,
			audioContext.currentTime + 0.01,
		);
		gainNode.gain.exponentialRampToValueAtTime(
			0.0001,
			audioContext.currentTime + 0.6,
		);
		oscillator.connect(gainNode).connect(audioContext.destination);
		oscillator.start();
		oscillator.stop(audioContext.currentTime + 0.65);
	} catch {
		// ignore autoplay or construction errors
	}
}

function isReminderDue(reminder: Reminder, timestamp: number) {
	if (!reminder.enabled) return false;
	return timestamp >= reminder.nextDueTime;
}

// ---- Modal ----
function Modal({
	open,
	children,
	onClose,
}: { open: boolean; children: React.ReactNode; onClose: () => void }) {
	if (!open) return null;
	return (
		<div className="modal-overlay">
			<div className="modal">
				{children}
				<div className="modal-actions">
					<button type={"button"} onClick={onClose} className="btn">
						Close
					</button>
				</div>
			</div>
		</div>
	);
}

// ---- Main App ----
export default function App() {
	const [reminders, setReminders] = useState<Reminder[]>(() => loadReminders());
	const [dueReminder, setDueReminder] = useState<Reminder | null>(null);
	const [tickSeconds, setTickSeconds] = useState(15); // scheduler tick
	const [newEveryMinutes, setNewEveryMinutes] = useState(5);
	const [newStartAt, setNewStartAt] = useState(() =>
		minutesToHHMM(toLocalMinutesSinceMidnight(now())),
	);
	const [wakeLockSupported, setWakeLockSupported] = useState<boolean>(false);
	const [logEntries, setLogEntries] = useState<LogEntry[]>(() => loadLog());
	const [nowTs, setNowTs] = useState<number>(now());
	// Live countdown ticker for reminder cards
	useEffect(() => {
		const id = setInterval(() => setNowTs(now()), 1000);
		return () => clearInterval(id);
	}, []);

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const wakeLockRef = useRef<FixMeLater>(null);
	const schedulerRef = useRef<number | null>(null);
	const clearScheduled = () => {
		if (schedulerRef.current !== null) {
			clearTimeout(schedulerRef.current);
			schedulerRef.current = null;
		}
	};

	// Persist
	useEffect(() => {
		saveReminders(reminders);
	}, [reminders]);

	useEffect(() => {
		saveLog(logEntries);
	}, [logEntries]);

	// Reset completedToday flags at local midnight and realign nextDueTime to today
	useEffect(() => {
		const intervalId = setInterval(() => {
			setReminders((previous) => {
				const timestamp = now();
				const FixMeLaterNeedsReset = previous.some(
					(reminder) =>
						(reminder.completedToday ?? 0) > 0 &&
						!isSameLocalDay(reminder.lastShownAt ?? timestamp, timestamp),
				);
				if (!FixMeLaterNeedsReset) return previous;
				return previous.map((reminder) => {
					const next = isSameLocalDay(reminder.nextDueTime, timestamp)
						? reminder.nextDueTime
						: nextDueOnOrAfter(reminder, timestamp);
					return { ...reminder, completedToday: 0, nextDueTime: next };
				});
			});
		}, 60_000);
		return () => clearInterval(intervalId);
	}, []);

	// Wake Lock support
	useEffect(() => {
		// @ts-ignore
		setWakeLockSupported(!!navigator.wakeLock);
	}, []);

	const acquireWakeLock = async () => {
		try {
			// @ts-ignore
			const wakeLock = await navigator.wakeLock.request("screen");
			wakeLockRef.current = wakeLock;
			wakeLock.addEventListener("release", () => {
				wakeLockRef.current = null;
			});
		} catch (error) {
			console.warn("WakeLock error", error);
		}
	};

	const releaseWakeLock = async () => {
		try {
			await wakeLockRef.current?.release();
			wakeLockRef.current = null;
		} catch {}
	};

	// Core scheduler replaced by precise timeout with grace window
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// If a modal is open, don't schedule the next one yet
		if (dueReminder) {
			clearScheduled();
			return;
		}
		const current = now();
		// Find anything due within grace
		const dueNow = reminders
			.filter((r) => r.enabled)
			.filter((r) => current + GRACE_MS >= r.nextDueTime)
			.sort((a, b) => a.nextDueTime - b.nextDueTime);
		if (dueNow.length > 0) {
			setDueReminder(dueNow[0]);
			clearScheduled();
			return;
		}
		// Nothing due now; schedule the soonest future reminder
		const future = reminders
			.filter((r) => r.enabled)
			.sort((a, b) => a.nextDueTime - b.nextDueTime)[0];
		clearScheduled();
		if (future) {
			const delay = Math.max(0, future.nextDueTime - current);
			schedulerRef.current = window.setTimeout(() => {
				setDueReminder((existing) => existing ?? future);
			}, delay);
		}
		return clearScheduled;
	}, [reminders, dueReminder]);

	// Play chime when a reminder pops
	useEffect(() => {
		if (dueReminder) playChime();
	}, [dueReminder]);

	const markShown = (id: string) =>
		setReminders((previous) =>
			previous.map((reminder) =>
				reminder.id === id
					? {
							...reminder,
							lastShownAt: now(),
							snoozeUntil: undefined,
							nextDueTime:
								reminder.nextDueTime + reminder.everyMinutes * 60_000,
						}
					: reminder,
			),
		);

	const snooze = (id: string, minutes: number) => {
		setReminders((previous) =>
			previous.map((reminder) =>
				reminder.id === id
					? {
							...reminder,
							snoozeUntil: undefined,
							nextDueTime: reminder.nextDueTime + minutes * 60_000,
						}
					: reminder,
			),
		);
		const target = reminders.find((r) => r.id === id);
		if (target) {
			setLogEntries((prev) => [
				{
					id: uid(),
					reminderId: id,
					text: target.text,
					action: "snooze",
					at: now(),
					snoozeForMinutes: minutes,
				},
				...prev,
			]);
		}
	};

	const completeToday = (id: string) => {
		setReminders((previous) =>
			previous.map((reminder) =>
				reminder.id === id
					? {
							...reminder,
							lastShownAt: now(),
							nextDueTime:
								reminder.nextDueTime + reminder.everyMinutes * 60_000,
						}
					: reminder,
			),
		);
		const target = reminders.find((r) => r.id === id);
		if (target) {
			setLogEntries((prev) => [
				{
					id: uid(),
					reminderId: id,
					text: target.text,
					action: "done",
					at: now(),
				},
				...prev,
			]);
		}
	};

	const addReminder = (
		text: string,
		everyMinutes: number,
		startAtHHMM: string,
	) => {
		if (!text.trim()) return;
		const sanitizedEvery = clamp(everyMinutes || 5, 1, 240);
		const [hh, mm] = (
			startAtHHMM || minutesToHHMM(toLocalMinutesSinceMidnight(now()))
		).split(":");
		const startAtMinutes = clamp(
			(Number(hh) || 0) * 60 + (Number(mm) || 0),
			0,
			1439,
		);
		const temp: Reminder = {
			id: "temp",
			text: "",
			enabled: true,
			everyMinutes: sanitizedEvery,
			startAtMinutes,
			createdAt: now(),
			nextDueTime: 0,
		};
		const nextDueTime = nextDueOnOrAfter(temp, now());
		setReminders((previous) => [
			...previous,
			{
				id: uid(),
				text: text.trim(),
				enabled: true,
				everyMinutes: sanitizedEvery,
				startAtMinutes,
				createdAt: now(),
				nextDueTime,
			},
		]);
	};

	const removeReminder = (id: string) =>
		setReminders((previous) =>
			previous.filter((reminder) => reminder.id !== id),
		);

	const toggleEnabled = (id: string) =>
		setReminders((previous) =>
			previous.map((reminder) =>
				reminder.id === id
					? { ...reminder, enabled: !reminder.enabled }
					: reminder,
			),
		);

	const resetToday = () =>
		setReminders((previous) =>
			previous.map((reminder) => ({ ...reminder, completedToday: 0 })),
		);

	const adjustEveryMinutes = (id: string, delta: number) =>
		setReminders((previous) =>
			previous.map((reminder) =>
				reminder.id === id
					? {
							...reminder,
							everyMinutes: clamp(reminder.everyMinutes + delta, 1, 240),
						}
					: reminder,
			),
		);

	const adjustStartAtMinutes = (id: string, delta: number) =>
		setReminders((previous) =>
			previous.map((reminder) =>
				reminder.id === id
					? {
							...reminder,
							startAtMinutes: normalizeMinutesDay(
								reminder.startAtMinutes + delta,
							),
						}
					: reminder,
			),
		);

	// Derived
	const activeCount = useMemo(
		() => reminders.filter((reminder) => reminder.enabled).length,
		[reminders],
	);

	const sortedReminders = useMemo(() => {
		return [...reminders].sort((a, b) => a.nextDueTime - b.nextDueTime);
	}, [reminders]);

	const todaysActivity = useMemo(() => {
		const current = now();
		return logEntries
			.filter(
				(e) =>
					isSameLocalDay(e.at, current) &&
					(e.action === "done" || e.action === "snooze"),
			)
			.sort((a, b) => b.at - a.at);
	}, [logEntries]);

	const clearTodaysActivity = () => {
		const current = now();
		setLogEntries((prev) => prev.filter((e) => !isSameLocalDay(e.at, current)));
	};

	// ---- Seed builder for demo/dev ----
	function buildSeedReminders(creationTime: number): Reminder[] {
		const baseStart = toLocalMinutesSinceMidnight(creationTime);
		const mkNext = (offset: number, every = 15) =>
			nextDueOnOrAfter(
				{
					id: "seed",
					text: "",
					enabled: true,
					everyMinutes: every,
					startAtMinutes: normalizeMinutesDay(baseStart + offset),
					createdAt: creationTime,
					nextDueTime: 0,
				} as Reminder,
				creationTime,
			);
		const minutesAgo = (m: number) => creationTime - m * 60_000;
		return [
			{
				id: uid(),
				text: "Check Slack / Email triage",
				enabled: true,
				everyMinutes: 15,
				startAtMinutes: normalizeMinutesDay(baseStart),
				createdAt: creationTime,
				completedToday: 0,
				nextDueTime: mkNext(0),
			},
			{
				id: uid(),
				text: "Open patient CRM and scan for new tasks",
				enabled: true,
				everyMinutes: 15,
				startAtMinutes: normalizeMinutesDay(baseStart + 5),
				createdAt: creationTime,
				completedToday: 0,
				nextDueTime: mkNext(5),
			},
			{
				id: uid(),
				text: "5-min stretch + hydrate",
				enabled: true,
				everyMinutes: 15,
				startAtMinutes: normalizeMinutesDay(baseStart + 10),
				createdAt: creationTime,
				completedToday: 0,
				nextDueTime: mkNext(10),
			},
			{
				id: uid(),
				text: "Demo: watch the countdown",
				enabled: true,
				everyMinutes: 2,
				startAtMinutes: normalizeMinutesDay(baseStart + 1),
				createdAt: creationTime,
				lastShownAt: minutesAgo(3),
				completedToday: 0,
				nextDueTime: mkNext(1, 2),
			},
		];
	}
	// Quick starter content if empty
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (reminders.length === 0) {
			const creationTime = now();
			setReminders(buildSeedReminders(creationTime));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	// Dev-only reseed handler
	const reseedDev = () => {
		const creationTime = now();
		// Clear all local storage for a clean demo state
		localStorage.clear();
		setLogEntries([]);
		setReminders(buildSeedReminders(creationTime));
		setDueReminder(null);
	};

	// Form refs
	const textInputRef = useRef<HTMLInputElement | null>(null);

	return (
		<div className="app">
			<header className="header">
				<h1>Zuza Interval Reminder</h1>
				<div className="header-actions">
					<span className="muted">Active today: {activeCount}</span>
					<button type="button" onClick={resetToday} className="btn">
						Reset Today
					</button>
					<label className="tick">
						Tick
						<input
							type="number"
							value={tickSeconds}
							min={5}
							max={60}
							onChange={(event) =>
								setTickSeconds(clamp(Number(event.target.value) || 15, 5, 60))
							}
						/>
						s
					</label>
					{wakeLockSupported && (
						<WakeLockSwitch
							acquire={acquireWakeLock}
							release={releaseWakeLock}
						/>
					)}
				</div>
			</header>

			<div className="layout container">
				<aside className="sidebar card">
					<div className="sidebar-header">
						<h2>Activity log</h2>
						<button type="button" className="btn" onClick={clearTodaysActivity}>
							Clear
						</button>
					</div>

					{todaysActivity.length === 0 ? (
						<p className="muted small">No activity yet.</p>
					) : (
						<table className="activity-table">
							<thead>
								<tr>
									<th>Time</th>
									<th>Action</th>
									<th>Task</th>
								</tr>
							</thead>
							<tbody>
								{todaysActivity.map((entry) => (
									<tr key={entry.id}>
										<td>{formatTime(entry.at)}</td>
										<td>
											{entry.action === "done"
												? "✓ Done"
												: `Snoozed ${entry.snoozeForMinutes}m`}
										</td>
										<td>{entry.text}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</aside>

				<main className="main">
					<section className="card">
						<h2>Add a reminder</h2>
						<div className="grid">
							<input
								ref={textInputRef}
								placeholder="e.g. Check tickets in Zendesk"
								className="input"
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										addReminder(
											textInputRef.current?.value ?? "",
											newEveryMinutes,
											newStartAt,
										);
										if (textInputRef.current) textInputRef.current.value = "";
									}
								}}
							/>
							<label className="every">
								Every
								<input
									type="number"
									className="input number"
									min={1}
									max={240}
									value={newEveryMinutes}
									onChange={(event) =>
										setNewEveryMinutes(
											clamp(Number(event.target.value) || 5, 1, 240),
										)
									}
								/>
								min
							</label>
							<label className="every">
								Start at
								<input
									type="time"
									className="input number"
									value={newStartAt}
									onChange={(event) => setNewStartAt(event.target.value)}
								/>
							</label>
							<button
								type="button"
								className="btn primary"
								onClick={() => {
									addReminder(
										textInputRef.current?.value ?? "",
										newEveryMinutes,
										newStartAt,
									);
									if (textInputRef.current) textInputRef.current.value = "";
								}}
							>
								Add
							</button>
						</div>
					</section>

					<section className="list">
						{reminders.length === 0 ? (
							<p className="muted">No reminders yet. Add one above.</p>
						) : (
							sortedReminders.map((reminder, idx) => (
								<motion.article
									key={reminder.id}
									className="card row"
									layout
									transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
								>
									<div className="left">
										<div>
											<div
												className="title-row"
												style={{
													display: "flex",
													alignItems: "center",
													gap: 8,
												}}
											>
												<div className="title" style={{ flex: "0 1 auto" }}>
													{reminder.text}
												</div>
												{idx === 0 && reminder.enabled && (
													<span className="badge primary">Due next</span>
												)}
											</div>
											<div className="small muted">
												every {reminder.everyMinutes} min • starts{" "}
												{minutesToHHMM(reminder.startAtMinutes)}
												{(reminder.completedToday ?? 0) > 0 && (
													<span className="badge">
														completed {reminder.completedToday}x
													</span>
												)}
											</div>
										</div>
										<button
											type="button"
											className={`chip ${reminder.enabled ? "chip-on" : "chip-off"}`}
											onClick={() => toggleEnabled(reminder.id)}
										>
											{reminder.enabled ? "Enabled" : "Disabled"}
										</button>
										<div className="small muted" style={{ marginTop: 8 }}>
											<strong>Last done:</strong>{" "}
											{reminder.lastShownAt
												? formatDistanceToNow(reminder.lastShownAt, {
														addSuffix: true,
													})
												: "never"}{" "}
											• {(() => {
												const diff = reminder.nextDueTime - nowTs;
												return diff <= 0 ? (
													<span
														style={{
															color: "var(--danger, #c00)",
															fontWeight: 600,
														}}
													>
														due now
													</span>
												) : (
													<>
														<strong>Next:</strong> in {formatCountdown(diff)}
													</>
												);
											})()}
										</div>
									</div>
									<div className="right">
										<button
											type="button"
											className="btn"
											title="Less frequent"
											onClick={() => adjustEveryMinutes(reminder.id, -1)}
										>
											– every
										</button>
										<button
											type="button"
											className="btn"
											title="More frequent"
											onClick={() => adjustEveryMinutes(reminder.id, +1)}
										>
											+ every
										</button>
										<button
											type="button"
											title="Earlier start"
											className="btn"
											onClick={() => adjustStartAtMinutes(reminder.id, -1)}
										>
											– start
										</button>
										<button
											type="button"
											title="Later start"
											className="btn"
											onClick={() => adjustStartAtMinutes(reminder.id, +1)}
										>
											+ start
										</button>
										<button
											type="button"
											className="btn"
											onClick={() => markShown(reminder.id)}
										>
											Mark Shown
										</button>
										<button
											type="button"
											className="btn warn"
											onClick={() => snooze(reminder.id, 5)}
										>
											Snooze 5m
										</button>
										<button
											type="button"
											className="btn success"
											onClick={() => completeToday(reminder.id)}
										>
											Mark Complete
										</button>
										<button
											type="button"
											className="btn danger"
											onClick={() => removeReminder(reminder.id)}
										>
											Delete
										</button>
									</div>
								</motion.article>
							))
						)}
					</section>
				</main>
			</div>

			<footer className="footer">
				Runs entirely in your browser. Data stored via localStorage. Keep this
				tab open.
				{import.meta.env?.DEV && (
					<div style={{ marginTop: 8 }}>
						<button type="button" className="btn" onClick={reseedDev}>
							Reseed demo data (dev)
						</button>
					</div>
				)}
			</footer>

			{/* Due modal */}
			<Modal open={!!dueReminder} onClose={() => setDueReminder(null)}>
				{dueReminder && (
					<div>
						<h3 className="center">Reminder</h3>
						<p className="center big">{dueReminder.text}</p>
						<div className="modal-buttons">
							<button
								type="button"
								className="btn success"
								onClick={() => {
									completeToday(dueReminder.id);
									setDueReminder(null);
								}}
							>
								Mark Complete
							</button>
							<button
								type="button"
								className="btn primary"
								onClick={() => {
									markShown(dueReminder.id);
									setDueReminder(null);
								}}
							>
								Dismiss
							</button>
							<button
								type="button"
								className="btn warn"
								onClick={() => {
									snooze(dueReminder.id, 5);
									setDueReminder(null);
								}}
							>
								Snooze 5m
							</button>
							<button
								type="button"
								className="btn warn"
								onClick={() => {
									snooze(dueReminder.id, 10);
									setDueReminder(null);
								}}
							>
								Snooze 10m
							</button>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
}

function WakeLockSwitch({
	acquire,
	release,
}: { acquire: () => Promise<void>; release: () => Promise<void> }) {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		const onVisibility = async () => {
			if (document.visibilityState === "visible" && enabled) {
				await acquire();
			}
		};
		document.addEventListener("visibilitychange", onVisibility);
		return () => document.removeEventListener("visibilitychange", onVisibility);
	}, [enabled, acquire]);

	return (
		<button
			type="button"
			className={`btn ${enabled ? "success" : ""}`}
			onClick={async () => {
				if (!enabled) {
					await acquire();
					setEnabled(true);
				} else {
					await release();
					setEnabled(false);
				}
			}}
			title="Prevent the device screen from sleeping (if supported)"
		>
			{enabled ? "Screen Awake" : "Keep Screen Awake"}
		</button>
	);
}
