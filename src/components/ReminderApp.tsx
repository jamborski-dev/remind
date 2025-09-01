import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BsDisplay } from "react-icons/bs";
import {
	FaArrowDown,
	FaArrowUp,
	FaCheck,
	FaLock,
	FaLockOpen,
	FaPencil,
	FaRotateRight,
	FaTrash,
	FaXmark,
} from "react-icons/fa6";
import {
	TIER_MESSAGES,
	type TierInfo,
	calculateTier,
} from "../scoring-messages";
import {
	ActivityTable,
	AppContainer,
	AutoMarginButton,
	Badge,
	Button,
	Card,
	CardContent,
	CenterText,
	ColorPicker,
	ColorPickerRow,
	CountdownBadge,
	CycleContainer,
	DeleteButton,
	DueText,
	EditButtonGroup,
	EditableInterval,
	EditableTitle,
	FlexInput,
	Footer,
	FormGridContainer,
	GlobalStyle,
	Grid,
	GroupActionsButton,
	GroupCard,
	GroupItemButtonGroup,
	GroupItemFormRow,
	GroupItemMainRow,
	GroupItemMeta,
	GroupItemRow,
	GroupItemSecondaryRow,
	GroupItemText,
	GroupItems,
	GroupList,
	GroupTitle,
	Header,
	HeaderActions,
	HeaderScore,
	HeaderTitle,
	Input,
	ItemTitleSpan,
	Layout,
	Main,
	ModalButtons,
	ModalContent,
	ModalMetaInfo,
	ModalOverlay,
	MutedText,
	NumberInput,
	RemindersContainer,
	RemindersSection,
	RemindersTitle,
	Sidebar,
	SidebarHeader,
	SmallButton,
	StatusBadge,
	TitleRow,
	ToggleSwitch,
	TopForm,
	WakeLockButton,
} from "./ReminderApp.styled";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type FixMeLater = any;

// ---- Types ----
export type LogEntry = {
	id: string;
	reminderId: string;
	text: string;
	action: "done" | "snooze" | "dismiss";
	at: number; // epoch ms
	snoozeForMinutes?: number;
};

export type ReminderGroupItem = {
	id: string;
	title: string;
	enabled?: boolean; // UI-only for now; defaults to true
	createdAt: number; // epoch ms
	lastShownAt?: number; // epoch ms
};

export type ReminderGroup = {
	id: string;
	title: string; // optional; defaults to first item
	intervalMinutes: number; // cycle interval for the group
	items: ReminderGroupItem[]; // ordered list of titles
	createdAt: number;
	nextDueTime: number; // epoch ms for the next group cycle
	currentItemIndex: number; // index of currently due item in the cycle
	color?: string; // optional color for the group
	enabled?: boolean; // optional; defaults to true
	pausedRemainingMs?: number; // milliseconds remaining when paused
	completedLoops?: number; // track how many complete loops have been finished
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

const SCORE_STORAGE_KEY = "zuza-reminders:score:v1";

function loadScore(): number {
	try {
		const raw = localStorage.getItem(SCORE_STORAGE_KEY);
		if (!raw) return 0;
		return Number.parseInt(raw, 10) || 0;
	} catch {
		return 0;
	}
}

function saveScore(score: number) {
	localStorage.setItem(SCORE_STORAGE_KEY, score.toString());
}
const formatTime = (ts: number) =>
	new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ---- Utilities ----
const now = () => Date.now();
const GRACE_MS = 5000; // allow 5s grace: treat slightly-past due times as due now
const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);
const uid = () => Math.random().toString(36).slice(2, 9);

function formatCountdown(ms: number) {
	const total = Math.max(0, Math.floor(ms / 1000));
	const s = total % 60;
	const m = Math.floor(total / 60) % 60;
	const h = Math.floor(total / 3600);
	if (h > 0)
		return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	return `${m}:${String(s).padStart(2, "0")}`;
}

const GROUPS_STORAGE_KEY = "zuza-reminder-groups:v2"; // bump version for new structure
function loadGroups(): ReminderGroup[] {
	try {
		const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];

		// Migrate and validate groups
		return parsed.map((group: FixMeLater) => {
			const items = Array.isArray(group.items)
				? group.items.map((item: FixMeLater) => ({
						id: item.id ?? uid(),
						title: item.title ?? "",
						enabled: item.enabled ?? true,
						createdAt: Number(item.createdAt ?? now()),
						lastShownAt:
							typeof item.lastShownAt === "number"
								? item.lastShownAt
								: undefined,
						// Remove nextDueTime from items if it exists (old format)
					}))
				: [];

			return {
				id: group.id ?? uid(),
				title: group.title ?? (items[0]?.title || "Untitled Group"),
				intervalMinutes: clamp(Number(group.intervalMinutes ?? 5), 1, 240),
				items,
				createdAt: Number(group.createdAt ?? now()),
				nextDueTime: Number(group.nextDueTime ?? now()),
				currentItemIndex: clamp(
					Number(group.currentItemIndex ?? 0),
					0,
					Math.max(0, items.length - 1),
				),
				color: group.color ?? "#3b82f6", // Default blue color for existing groups
				enabled: group.enabled ?? true, // Default to enabled for existing groups
				pausedRemainingMs:
					typeof group.pausedRemainingMs === "number"
						? group.pausedRemainingMs
						: undefined,
			};
		});
	} catch {
		return [];
	}
}
function saveGroups(groups: ReminderGroup[]) {
	localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
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
			(
				window as Window &
					typeof globalThis & { webkitAudioContext?: typeof AudioContext }
			).AudioContext ||
			(
				window as Window &
					typeof globalThis & { webkitAudioContext?: typeof AudioContext }
			).webkitAudioContext;
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

// ---- Modal ----
function Modal({
	open,
	children,
}: { open: boolean; children: React.ReactNode }) {
	if (!open) return null;
	return (
		<ModalOverlay>
			<ModalContent>{children}</ModalContent>
		</ModalOverlay>
	);
}

// ---- Main App ----
export default function App() {
	const [dueGroupItem, setDueGroupItem] = useState<{
		group: ReminderGroup;
		item: ReminderGroupItem;
	} | null>(null);
	const [wakeLockSupported, setWakeLockSupported] = useState<boolean>(false);
	const [logEntries, setLogEntries] = useState<LogEntry[]>(() => loadLog());
	const [groups, setGroups] = useState<ReminderGroup[]>(() => loadGroups());
	const [score, setScore] = useState<number>(() => loadScore());
	const [showFirstPointModal, setShowFirstPointModal] =
		useState<boolean>(false);
	const [tierUpgradeModal, setTierUpgradeModal] = useState<TierInfo | null>(
		null,
	);
	const pendingScoreRef = useRef<string | null>(null); // Track which group just completed a loop
	const [nowTs, setNowTs] = useState<number>(now());
	const [groupTitle, setGroupTitle] = useState("");
	const [groupInterval, setGroupInterval] = useState<number>(5);
	const [groupColor, setGroupColor] = useState("#3b82f6"); // Default blue color
	const [formExpanded, setFormExpanded] = useState<boolean>(false);
	const [editingGroup, setEditingGroup] = useState<{
		id: string;
		title: string;
		interval: number;
		color: string;
	} | null>(null);
	const [groupToDelete, setGroupToDelete] = useState<ReminderGroup | null>(
		null,
	);

	// Check if any modal is currently open
	const isAnyModalOpen =
		!!dueGroupItem ||
		!!groupToDelete ||
		showFirstPointModal ||
		!!tierUpgradeModal;

	// Calculate current tier based on score and group count
	const currentTier = calculateTier(score, groups.length);
	const tierInfo = TIER_MESSAGES[currentTier];
	const [groupItems, setGroupItems] = useState<ReminderGroupItem[]>([
		{
			id: uid(),
			title: "",
			createdAt: now(),
		},
	]);

	useEffect(() => {
		saveGroups(groups);
	}, [groups]);

	// Handle scoring when a loop is completed
	// biome-ignore lint/correctness/useExhaustiveDependencies: this is needed for reacting to other part of state
	useEffect(() => {
		if (pendingScoreRef.current) {
			console.log(
				"Awarding point for completed loop in group:",
				pendingScoreRef.current,
			);
			setScore((prevScore) => {
				const newScore = prevScore + 1;
				saveScore(newScore);
				console.log("Score updated from", prevScore, "to", newScore);

				// Calculate tiers before and after scoring
				const prevTier = calculateTier(prevScore, groups.length);
				const newTier = calculateTier(newScore, groups.length);

				// Show first point modal if this is the first point
				if (prevScore === 0) {
					console.log("Showing first point modal!");
					setShowFirstPointModal(true);
				}
				// Show tier upgrade modal if tier has changed and it's not the first point
				else if (prevTier !== newTier) {
					console.log(`Tier upgraded from ${prevTier} to ${newTier}!`);
					setTierUpgradeModal(TIER_MESSAGES[newTier]);
				}

				return newScore;
			});
			pendingScoreRef.current = null; // Clear the pending score
		}
	}, [groups]); // Trigger when groups state changes
	// Live countdown ticker for reminder cards - pause when modals are open
	useEffect(() => {
		if (isAnyModalOpen) {
			// Don't update time when any modal is open (pauses all timers)
			return;
		}
		const id = setInterval(() => setNowTs(now()), 1000);
		return () => clearInterval(id);
	}, [isAnyModalOpen]);

	const wakeLockRef = useRef<WakeLockSentinel | null>(null);

	// Persist
	useEffect(() => {
		saveLog(logEntries);
	}, [logEntries]);

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

	// Group scheduler - check for due group items - pause when modals are open
	useEffect(() => {
		// If any modal is open (including due modal), don't schedule new timers
		if (isAnyModalOpen) {
			return;
		}
		const current = now();

		// Find any group that's due within grace period
		const dueGroups = groups
			.filter((group) => group.enabled ?? true) // Filter out disabled groups
			.filter((group) => group.items.some((item) => item.enabled))
			.filter((group) => current + GRACE_MS >= group.nextDueTime)
			.sort((a, b) => a.nextDueTime - b.nextDueTime);

		if (dueGroups.length > 0) {
			const group = dueGroups[0];
			const currentItem = group.items[group.currentItemIndex];
			if (currentItem?.enabled) {
				setDueGroupItem({ group, item: currentItem });
				return;
			}
		}

		// Nothing due now; schedule the soonest future group
		const futureGroup = groups
			.filter((group) => group.enabled ?? true) // Filter out disabled groups
			.filter((group) => group.items.some((item) => item.enabled))
			.sort((a, b) => a.nextDueTime - b.nextDueTime)[0];

		if (futureGroup) {
			const delay = Math.max(0, futureGroup.nextDueTime - current);
			const timeoutId = window.setTimeout(() => {
				const currentItem = futureGroup.items[futureGroup.currentItemIndex];
				if (currentItem?.enabled) {
					setDueGroupItem(
						(prev) => prev ?? { group: futureGroup, item: currentItem },
					);
				}
			}, delay);

			return () => clearTimeout(timeoutId);
		}
	}, [groups, isAnyModalOpen]);

	// Play chime when a reminder pops
	useEffect(() => {
		if (dueGroupItem) playChime();
	}, [dueGroupItem]);

	const addGroupItem = () =>
		setGroupItems((prev) => [
			...prev,
			{
				id: uid(),
				title: "",
				createdAt: now(),
				nextDueTime: now(),
			},
		]);

	const removeGroupItem = (id: string) =>
		setGroupItems((prev) =>
			prev.length > 1 ? prev.filter((i) => i.id !== id) : prev,
		);

	const updateGroupItem = (id: string, title: string) =>
		setGroupItems((prev) =>
			prev.map((i) => (i.id === id ? { ...i, title } : i)),
		);

	const moveGroupItem = (id: string, direction: -1 | 1) =>
		setGroupItems((prev) => {
			const idx = prev.findIndex((i) => i.id === id);
			if (idx < 0) return prev;
			const nextIdx = idx + direction;
			if (nextIdx < 0 || nextIdx >= prev.length) return prev;
			const copy = [...prev];
			const [item] = copy.splice(idx, 1);
			copy.splice(nextIdx, 0, item);
			return copy;
		});

	// --- Group item actions ---
	const completeGroupItem = (groupId: string, itemId: string) => {
		console.log("completeGroupItem called with:", groupId, itemId);

		setGroups((prev) =>
			prev.map((g) => {
				if (g.id !== groupId) return g;

				// Find the current item and mark it as completed
				const itemIndex = g.items.findIndex((i) => i.id === itemId);
				if (itemIndex === -1) return g;

				const updatedItems = g.items.map((i) =>
					i.id === itemId
						? {
								...i,
								lastShownAt: now(),
							}
						: i,
				);

				// Calculate next item index (cycle through enabled items)
				const enabledItems = updatedItems.filter((i) => i.enabled ?? true);
				if (enabledItems.length === 0) return { ...g, items: updatedItems };

				const currentEnabledIndex = enabledItems.findIndex(
					(i) => i.id === itemId,
				);
				const nextEnabledIndex =
					(currentEnabledIndex + 1) % enabledItems.length;
				const nextItem = enabledItems[nextEnabledIndex];
				const nextItemIndex = updatedItems.findIndex(
					(i) => i.id === nextItem.id,
				);

				// Check if we completed a loop (current item is the last item in the enabled list)
				const isLoopCompleted = currentEnabledIndex === enabledItems.length - 1;
				if (isLoopCompleted) {
					console.log(
						"Loop completed! Current item:",
						itemId,
						"Current index:",
						currentEnabledIndex,
						"Total enabled items:",
						enabledItems.length,
						"Next item:",
						nextItem.id,
					);

					// Set flag to award point - will be handled by useEffect
					pendingScoreRef.current = g.id;
				}

				return {
					...g,
					items: updatedItems,
					currentItemIndex: nextItemIndex,
					nextDueTime: now() + g.intervalMinutes * 60_000,
					completedLoops: (g.completedLoops || 0) + (isLoopCompleted ? 1 : 0),
				};
			}),
		);

		const group = groups.find((g) => g.id === groupId);
		const item = group?.items.find((i) => i.id === itemId);
		if (group && item) {
			setLogEntries((prev) => [
				{
					id: uid(),
					reminderId: item.id,
					text: `${group.title}: ${item.title}`,
					action: "done",
					at: now(),
				},
				...prev,
			]);
		}
	};

	const toggleGroupItemEnabled = (groupId: string, itemId: string) => {
		setGroups((prev) =>
			prev.map((g) => {
				if (g.id !== groupId) return g;

				const currentItem = g.items[g.currentItemIndex];
				const isCurrentItem = currentItem?.id === itemId;
				const isBeingDisabled =
					g.items.find((i) => i.id === itemId)?.enabled ?? true;

				// Update the item's enabled status
				const updatedItems = g.items.map((i) =>
					i.id === itemId ? { ...i, enabled: !(i.enabled ?? true) } : i,
				);

				// If we're disabling the current item, we need to find the next enabled item
				if (isCurrentItem && isBeingDisabled) {
					const enabledItems = updatedItems.filter((i) => i.enabled ?? true);

					if (enabledItems.length === 0) {
						// No enabled items left, just update the items
						return { ...g, items: updatedItems };
					}

					// Find the next enabled item in the original order
					const currentIndex = g.currentItemIndex;
					let nextItemIndex = -1;

					// Look for the next enabled item starting from the current position
					for (let i = 0; i < updatedItems.length; i++) {
						const checkIndex = (currentIndex + 1 + i) % updatedItems.length;
						if (updatedItems[checkIndex].enabled ?? true) {
							nextItemIndex = checkIndex;
							break;
						}
					}

					if (nextItemIndex !== -1) {
						// Transfer the current timer to the next item - keep the existing nextDueTime
						return {
							...g,
							items: updatedItems,
							currentItemIndex: nextItemIndex,
							// Keep the existing nextDueTime so the timer continues seamlessly
						};
					}
				}

				// If we're enabling an item or disabling a non-current item, just update the items
				return {
					...g,
					items: updatedItems,
				};
			}),
		);
	};

	const deleteGroupItem = (groupId: string, itemId: string) => {
		setGroups((prev) =>
			prev.map((g) =>
				g.id === groupId
					? { ...g, items: g.items.filter((i) => i.id !== itemId) }
					: g,
			),
		);
	};

	// --- Group editing and deletion ---
	const startEditingGroup = (group: ReminderGroup) => {
		setEditingGroup({
			id: group.id,
			title: group.title,
			interval: group.intervalMinutes,
			color: group.color || "#3b82f6",
		});
	};

	const saveGroupEdit = () => {
		if (!editingGroup) return;

		setGroups((prev) =>
			prev.map((g) =>
				g.id === editingGroup.id
					? {
							...g,
							title: editingGroup.title.trim() || "Untitled Group",
							intervalMinutes: clamp(editingGroup.interval || 1, 1, 240),
							color: editingGroup.color,
						}
					: g,
			),
		);
		setEditingGroup(null);
	};

	const cancelGroupEdit = () => {
		setEditingGroup(null);
	};

	const deleteGroup = (group: ReminderGroup) => {
		setGroups((prev) => prev.filter((g) => g.id !== group.id));
		setGroupToDelete(null);
		// Clear any due modal if it's for this group
		if (dueGroupItem?.group.id === group.id) {
			setDueGroupItem(null);
		}
	};

	const moveGroup = (groupId: string, direction: -1 | 1) => {
		setGroups((prev) => {
			const idx = prev.findIndex((g) => g.id === groupId);
			if (idx < 0) return prev;
			const nextIdx = idx + direction;
			if (nextIdx < 0 || nextIdx >= prev.length) return prev;
			const copy = [...prev];
			const [group] = copy.splice(idx, 1);
			copy.splice(nextIdx, 0, group);
			return copy;
		});
	};

	const toggleGroupEnabled = (groupId: string) => {
		setGroups((prev) =>
			prev.map((g) => {
				if (g.id !== groupId) return g;

				const currentTime = now();
				const isCurrentlyEnabled = g.enabled ?? true;

				if (isCurrentlyEnabled) {
					// Disabling: store remaining time and set far future nextDueTime
					const remainingMs = Math.max(0, g.nextDueTime - currentTime);
					return {
						...g,
						enabled: false,
						pausedRemainingMs: remainingMs,
						nextDueTime: currentTime + 365 * 24 * 60 * 60 * 1000, // 1 year in the future
					};
				}

				// Enabling: restore timer from paused state
				const remainingMs = g.pausedRemainingMs ?? g.intervalMinutes * 60_000;
				return {
					...g,
					enabled: true,
					nextDueTime: currentTime + remainingMs,
					pausedRemainingMs: undefined,
				};
			}),
		);
	};

	const submitGroup = () => {
		const titles = groupItems.map((i) => i.title.trim()).filter(Boolean);
		if (titles.length === 0) return; // require at least one item
		const interval = clamp(groupInterval || 1, 1, 240);
		const nowTs = now();
		const group: ReminderGroup = {
			id: uid(),
			title: groupTitle.trim() || titles[0],
			intervalMinutes: interval,
			items: titles.map((t) => ({
				id: uid(),
				title: t,
				enabled: true,
				createdAt: nowTs,
				lastShownAt: undefined,
			})),
			createdAt: nowTs,
			nextDueTime: nowTs + interval * 60_000, // Group starts after one interval
			currentItemIndex: 0, // Start with first item
			color: groupColor,
			enabled: true, // Default to enabled
		};
		setGroups((prev) => [group, ...prev]);
		// reset form
		setGroupTitle("");
		setGroupInterval(5);
		setGroupColor("#3b82f6"); // Reset to default color
		setGroupItems([
			{
				id: uid(),
				title: "",
				createdAt: now(),
			},
		]);
	};

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

	// Function to get group items ordered by group's currentItemIndex
	const getSortedGroupItems = useMemo(() => {
		return (group: ReminderGroup) => {
			const items = [...group.items];
			const currentIndex = group.currentItemIndex;

			// Separate enabled and disabled items
			const enabledItems = items.filter((item) => item.enabled !== false);
			const disabledItems = items.filter((item) => item.enabled === false);

			// Find the current item in the enabled items
			const currentItemId = items[currentIndex]?.id;
			const enabledCurrentIndex = enabledItems.findIndex(
				(item) => item.id === currentItemId,
			);

			// Rotate enabled items so current item comes first
			let sortedEnabledItems = [];
			if (enabledCurrentIndex >= 0) {
				sortedEnabledItems = [
					...enabledItems.slice(enabledCurrentIndex),
					...enabledItems.slice(0, enabledCurrentIndex),
				];
			} else {
				sortedEnabledItems = enabledItems;
			}

			// Return enabled items first, then disabled items at the bottom
			return [...sortedEnabledItems, ...disabledItems];
		};
	}, []); // No dependencies needed as this creates a new function

	const clearTodaysActivity = () => {
		const current = now();
		setLogEntries((prev) => prev.filter((e) => !isSameLocalDay(e.at, current)));
	};

	// ---- Seed builder for demo/dev ----
	function buildSeedGroups(creationTime: number): ReminderGroup[] {
		const mkItems = (titles: string[]) =>
			titles.map((title) => ({
				id: uid(),
				title,
				enabled: true,
				createdAt: creationTime,
				lastShownAt: undefined,
			}));
		return [
			{
				id: uid(),
				title: "Morning Focus Cycle",
				intervalMinutes: 5,
				items: mkItems([
					"Plan top 3 tasks",
					"Quick inbox triage",
					"Stand up & stretch",
					"Water break",
				]),
				createdAt: creationTime,
				nextDueTime: creationTime + 5 * 60_000, // 5 minutes from now
				currentItemIndex: 0,
				color: "#10b981", // Green
				enabled: true,
			},
			{
				id: uid(),
				title: "Wellness Mini Loop",
				intervalMinutes: 10,
				items: mkItems([
					"Hydrate",
					"Eye break (20-20-20)",
					"Breathing: 4-4-4-4",
				]),
				createdAt: creationTime,
				nextDueTime: creationTime + 10 * 60_000, // 10 minutes from now
				currentItemIndex: 0,
				color: "#8b5cf6", // Purple
				enabled: true,
			},
		];
	}
	// Quick starter content if empty
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (groups.length === 0) {
			const creationTime = now();
			setGroups(buildSeedGroups(creationTime));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	// Dev-only reseed handler
	const reseedDev = () => {
		const creationTime = now();
		localStorage.clear();
		setLogEntries([]);
		setGroups(buildSeedGroups(creationTime));
		setDueGroupItem(null);
		setScore(0);
		setShowFirstPointModal(false);
	};

	// Form refs

	return (
		<>
			<GlobalStyle />
			<AppContainer>
				<Header>
					<HeaderTitle>re:MIND</HeaderTitle>
					<HeaderScore
						$tierColor={TIER_MESSAGES[currentTier].color}
						$showTrophy={currentTier === "gold"}
						style={{
							opacity: score > 0 ? 1 : 0,
						}}
					>
						{TIER_MESSAGES[currentTier].emoji} {score} point
						{score !== 1 ? "s" : ""}
					</HeaderScore>
					<HeaderActions>
						<MutedText>Groups: {groups.length}</MutedText>
						{import.meta.env?.DEV && (
							<Button
								type="button"
								onClick={reseedDev}
								title="Reseed demo groups (dev)"
							>
								<FaRotateRight />
							</Button>
						)}
						{wakeLockSupported && (
							<WakeLockSwitch
								acquire={acquireWakeLock}
								release={releaseWakeLock}
							/>
						)}
					</HeaderActions>
				</Header>

				<Layout>
					<Sidebar>
						<Card>
							<SidebarHeader>
								<h2>Activity log</h2>
								<Button type="button" onClick={clearTodaysActivity}>
									Clear
								</Button>
							</SidebarHeader>

							<CardContent>
								{todaysActivity.length === 0 ? (
									<MutedText $small>No activity yet.</MutedText>
								) : (
									<ActivityTable>
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
														{entry.action === "done" ? (
															<>
																<FaCheck style={{ marginRight: "4px" }} />
																Done
															</>
														) : (
															`Snoozed ${entry.snoozeForMinutes}m`
														)}
													</td>
													<td>{entry.text}</td>
												</tr>
											))}
										</tbody>
									</ActivityTable>
								)}
							</CardContent>
						</Card>
					</Sidebar>

					<Main>
						<Card>
							<SidebarHeader>
								<h2>Create a reminder group</h2>
								<Button
									type="button"
									onClick={() => setFormExpanded(!formExpanded)}
								>
									{formExpanded ? "Collapse" : "Expand"}
								</Button>
							</SidebarHeader>

							<AnimatePresence>
								{formExpanded && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{
											opacity: 1,
											height: "auto",
											transition: {
												duration: 0.3,
												ease: "easeOut",
											},
										}}
										exit={{
											opacity: 0,
											height: 0,
											transition: {
												duration: 0.2,
												ease: "easeIn",
											},
										}}
										style={{ overflow: "hidden" }}
									>
										<Grid>
											<TopForm>
												<FormGridContainer>
													Group title (optional)
													<Input
														type="text"
														placeholder="e.g. Morning routine"
														value={groupTitle}
														onChange={(e) => setGroupTitle(e.target.value)}
													/>
												</FormGridContainer>
												<ColorPickerRow>
													<span>Group color</span>
													<ColorPicker
														type="color"
														value={groupColor}
														onChange={(e) => setGroupColor(e.target.value)}
													/>
												</ColorPickerRow>
											</TopForm>

											<RemindersContainer>
												<RemindersTitle className="small">
													Reminders in this group
												</RemindersTitle>
												{groupItems.map((item, idx) => (
													<GroupItemFormRow key={item.id}>
														<FlexInput
															type="text"
															placeholder={`Reminder #${idx + 1} title`}
															value={item.title}
															onChange={(e) =>
																updateGroupItem(item.id, e.target.value)
															}
														/>
														<Button
															type="button"
															title="Move up"
															onClick={() => moveGroupItem(item.id, -1)}
														>
															<FaArrowUp />
														</Button>
														<Button
															type="button"
															title="Move down"
															onClick={() => moveGroupItem(item.id, +1)}
														>
															<FaArrowDown />
														</Button>
														<Button
															$variant="danger"
															type="button"
															title="Remove"
															onClick={() => removeGroupItem(item.id)}
														>
															<FaXmark />
														</Button>
													</GroupItemFormRow>
												))}
												<Button type="button" onClick={addGroupItem}>
													+ Add another
												</Button>
											</RemindersContainer>

											<CycleContainer>
												<span>Cycle every</span>
												<NumberInput
													type="number"
													className="number"
													min={1}
													max={240}
													value={groupInterval}
													onChange={(e) =>
														setGroupInterval(
															clamp(Number(e.target.value) || 1, 1, 240),
														)
													}
												/>
												<span>minutes</span>
												<AutoMarginButton
													type="button"
													$variant="primary"
													onClick={submitGroup}
												>
													Add group
												</AutoMarginButton>
											</CycleContainer>
										</Grid>
									</motion.div>
								)}
							</AnimatePresence>
						</Card>
					</Main>

					<RemindersSection>
						<GroupList>
							{groups.length === 0 ? (
								<MutedText>No groups yet. Add one above.</MutedText>
							) : (
								<AnimatePresence mode="popLayout" initial={false}>
									{groups.map((group, idx) => (
										<GroupCard
											key={group.id}
											layoutId={group.id}
											layout="position"
											$borderColor={group.color}
											$enabled={group.enabled ?? true}
											transition={{
												layout: {
													duration: 0.4,
													ease: [0.4, 0.0, 0.2, 1], // Custom cubic-bezier for smooth motion
												},
												opacity: {
													duration: 0.3,
													ease: "easeInOut",
												},
												scale: {
													duration: 0.3,
													ease: "easeInOut",
												},
											}}
											initial={{
												opacity: 0,
												scale: 0.9,
												y: 20,
											}}
											animate={{
												opacity: 1,
												scale: 1,
												y: 0,
												transition: {
													duration: 0.3,
													ease: "easeOut",
													delay: idx * 0.05, // Stagger effect
												},
											}}
											exit={{
												opacity: 0,
												scale: 0.8,
												y: -20,
												transition: {
													duration: 0.2,
													ease: "easeIn",
												},
											}}
										>
											<TitleRow>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: "0.5rem",
													}}
												>
													{editingGroup?.id === group.id ? (
														<>
															<EditableTitle
																value={editingGroup.title}
																onChange={(e) =>
																	setEditingGroup({
																		...editingGroup,
																		title: e.target.value,
																	})
																}
																onKeyDown={(e) => {
																	if (e.key === "Enter") saveGroupEdit();
																	if (e.key === "Escape") cancelGroupEdit();
																}}
																autoFocus
															/>
															<ColorPicker
																type="color"
																value={editingGroup.color}
																onChange={(e) =>
																	setEditingGroup({
																		...editingGroup,
																		color: e.target.value,
																	})
																}
															/>
														</>
													) : (
														<GroupTitle>{group.title}</GroupTitle>
													)}

													{(() => {
														if (!(group.enabled ?? true)) {
															return (
																<StatusBadge
																	$isDue={false}
																	style={{
																		backgroundColor: "#f3f4f6",
																		color: "#6b7280",
																		border: "1px solid #d1d5db",
																	}}
																>
																	paused
																</StatusBadge>
															);
														}
														const diff = group.nextDueTime - nowTs;
														if (diff <= 0) {
															return (
																<StatusBadge $isDue={true}>due now</StatusBadge>
															);
														}
														return (
															<CountdownBadge $isDue={false}>
																{formatCountdown(diff)}
															</CountdownBadge>
														);
													})()}

													{editingGroup?.id === group.id ? (
														<>
															<span>every</span>
															<EditableInterval
																type="number"
																min="1"
																max="240"
																value={editingGroup.interval}
																onChange={(e) =>
																	setEditingGroup({
																		...editingGroup,
																		interval: Number(e.target.value) || 1,
																	})
																}
															/>
															<span>min</span>
														</>
													) : (
														<Badge>every {group.intervalMinutes} min</Badge>
													)}
												</div>

												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: "0.5rem",
													}}
												>
													{editingGroup?.id === group.id ? (
														<EditButtonGroup>
															<SmallButton
																type="button"
																$variant="success"
																onClick={saveGroupEdit}
															>
																<FaCheck />
															</SmallButton>
															<SmallButton
																type="button"
																onClick={cancelGroupEdit}
															>
																<FaXmark />
															</SmallButton>
														</EditButtonGroup>
													) : (
														<>
															<GroupActionsButton
																type="button"
																onClick={() => startEditingGroup(group)}
																title="Edit group"
															>
																<FaPencil />
															</GroupActionsButton>
															<GroupActionsButton
																type="button"
																onClick={() => moveGroup(group.id, -1)}
																title="Move group up"
																disabled={idx === 0}
															>
																<FaArrowUp />
															</GroupActionsButton>
															<GroupActionsButton
																type="button"
																onClick={() => moveGroup(group.id, 1)}
																title="Move group down"
																disabled={idx === groups.length - 1}
															>
																<FaArrowDown />
															</GroupActionsButton>
														</>
													)}

													<ToggleSwitch
														$enabled={group.enabled ?? true}
														onClick={() => toggleGroupEnabled(group.id)}
														title={
															(group.enabled ?? true)
																? "Disable group"
																: "Enable group"
														}
													/>

													<GroupActionsButton
														type="button"
														$variant="danger"
														onClick={() => setGroupToDelete(group)}
														title="Delete group"
													>
														<FaTrash color="#fff" />
													</GroupActionsButton>
												</div>
											</TitleRow>
											<GroupItems>
												<AnimatePresence mode="popLayout" initial={false}>
													{getSortedGroupItems(group).map((i, idx) => {
														// Current item is the first enabled item (since disabled items are at bottom)
														const isCurrentItem =
															i.id === group.items[group.currentItemIndex]?.id;
														const isGroupDue = group.nextDueTime <= nowTs;
														return (
															<GroupItemRow
																key={i.id}
																layoutId={i.id}
																layout="position"
																$enabled={i.enabled ?? true}
																transition={{
																	layout: {
																		duration: 0.4,
																		ease: [0.4, 0.0, 0.2, 1], // Custom cubic-bezier for smooth motion
																	},
																	opacity: {
																		duration: 0.3,
																		ease: "easeInOut",
																	},
																	scale: {
																		duration: 0.3,
																		ease: "easeInOut",
																	},
																}}
																initial={{
																	opacity: 0,
																	scale: 0.9,
																	y: 20,
																}}
																animate={{
																	opacity: 1,
																	scale: 1,
																	y: 0,
																	transition: {
																		duration: 0.3,
																		ease: "easeOut",
																		delay: idx * 0.05, // Stagger effect
																	},
																}}
																exit={{
																	opacity: 0,
																	scale: 0.8,
																	y: -20,
																	transition: {
																		duration: 0.2,
																		ease: "easeIn",
																	},
																}}
															>
																<GroupItemMainRow>
																	<GroupItemText $enabled={i.enabled ?? true}>
																		<ItemTitleSpan>{i.title}</ItemTitleSpan>
																		{isCurrentItem &&
																			(i.enabled ?? true) &&
																			(group.enabled ?? true) && (
																				<StatusBadge $isDue={isGroupDue}>
																					{isGroupDue ? "Due now" : "Due next"}
																				</StatusBadge>
																			)}
																		<GroupItemMeta>
																			{isCurrentItem &&
																				(() => {
																					if (!(group.enabled ?? true)) {
																						return (
																							<CountdownBadge
																								$isDue={false}
																								$isPaused={true}
																							>
																								paused
																							</CountdownBadge>
																						);
																					}
																					if (!(i.enabled ?? true)) {
																						return (
																							<CountdownBadge
																								$isDue={false}
																								$isPaused={true}
																							>
																								paused
																							</CountdownBadge>
																						);
																					}
																					const diff =
																						group.nextDueTime - nowTs;
																					return diff <= 0 ? (
																						<DueText>due now</DueText>
																					) : (
																						<>in {formatCountdown(diff)}</>
																					);
																				})()}
																		</GroupItemMeta>
																	</GroupItemText>
																</GroupItemMainRow>
																<GroupItemSecondaryRow>
																	<GroupItemMeta>
																		<strong>Last: </strong>{" "}
																		{i.lastShownAt
																			? formatDistanceToNow(i.lastShownAt, {
																					addSuffix: true,
																				})
																			: "never"}{" "}
																	</GroupItemMeta>
																	<GroupItemButtonGroup>
																		<Button
																			type="button"
																			$variant="success"
																			title="Mark complete"
																			onClick={() =>
																				completeGroupItem(group.id, i.id)
																			}
																		>
																			<FaCheck />
																		</Button>
																		<Button
																			type="button"
																			$variant={
																				(i.enabled ?? true) ? undefined : "warn"
																			}
																			title={
																				(i.enabled ?? true)
																					? "Disable"
																					: "Enable"
																			}
																			onClick={() =>
																				toggleGroupItemEnabled(group.id, i.id)
																			}
																		>
																			{(i.enabled ?? true)
																				? "Disable"
																				: "Enable"}
																		</Button>
																		<DeleteButton
																			type="button"
																			title="Delete"
																			onClick={() =>
																				deleteGroupItem(group.id, i.id)
																			}
																		>
																			Delete
																		</DeleteButton>
																	</GroupItemButtonGroup>
																</GroupItemSecondaryRow>
															</GroupItemRow>
														);
													})}
												</AnimatePresence>
											</GroupItems>
										</GroupCard>
									))}
								</AnimatePresence>
							)}
						</GroupList>
					</RemindersSection>
				</Layout>

				<Footer>
					Runs entirely in your browser. Data stored via localStorage. Keep this
					tab open.
				</Footer>

				{/* Due modal */}
				<Modal open={!!dueGroupItem}>
					{dueGroupItem && (
						<div>
							<CenterText>
								<h3>{dueGroupItem.group.title}</h3>
							</CenterText>
							<CenterText className="big">{dueGroupItem.item.title}</CenterText>
							<ModalMetaInfo>
								{(() => {
									const today = new Date().toDateString();
									const todayEntries = logEntries.filter(
										(entry) =>
											entry.reminderId === dueGroupItem.item.id &&
											entry.action === "done" &&
											new Date(entry.at).toDateString() === today,
									);
									const todayCompletions = todayEntries.length;
									const lastEntry = logEntries
										.filter(
											(entry) =>
												entry.reminderId === dueGroupItem.item.id &&
												entry.action === "done",
										)
										.slice(-1)[0];
									const lastDone = lastEntry
										? formatDistanceToNow(new Date(lastEntry.at), {
												addSuffix: true,
											})
										: "never";
									return (
										<>
											Last done: <strong>{lastDone}</strong> •{" "}
											{todayCompletions} time{todayCompletions !== 1 ? "s" : ""}{" "}
											today
										</>
									);
								})()}
							</ModalMetaInfo>
							<ModalButtons>
								<Button
									type="button"
									$variant="success"
									onClick={() => {
										completeGroupItem(
											dueGroupItem.group.id,
											dueGroupItem.item.id,
										);
										setDueGroupItem(null);
									}}
								>
									<FaCheck style={{ marginRight: "4px" }} />
									Done
								</Button>
								<Button
									type="button"
									$variant="warn"
									onClick={() => {
										// Snooze the group by 5 minutes
										setGroups((prev) =>
											prev.map((g) =>
												g.id === dueGroupItem.group.id
													? { ...g, nextDueTime: now() + 5 * 60_000 }
													: g,
											),
										);
										setDueGroupItem(null);
									}}
								>
									Snooze 5m
								</Button>
								<Button
									type="button"
									$variant="warn"
									onClick={() => {
										// Snooze the group by 10 minutes
										setGroups((prev) =>
											prev.map((g) =>
												g.id === dueGroupItem.group.id
													? { ...g, nextDueTime: now() + 10 * 60_000 }
													: g,
											),
										);
										setDueGroupItem(null);
									}}
								>
									Snooze 10m
								</Button>
							</ModalButtons>
						</div>
					)}
				</Modal>

				{/* Delete group confirmation modal */}
				<Modal open={!!groupToDelete}>
					{groupToDelete && (
						<div>
							<CenterText>
								<h3>Delete Group</h3>
							</CenterText>
							<CenterText>
								Are you sure you want to delete "{groupToDelete.title}"?
							</CenterText>
							<CenterText
								className="small"
								style={{ marginTop: "0.5rem", color: "#6b7280" }}
							>
								This will permanently delete {groupToDelete.items.length} item
								{groupToDelete.items.length !== 1 ? "s" : ""} and cannot be
								undone.
							</CenterText>
							<ModalButtons>
								<Button type="button" onClick={() => setGroupToDelete(null)}>
									Cancel
								</Button>
								<Button
									type="button"
									$variant="danger"
									onClick={() => deleteGroup(groupToDelete)}
								>
									Delete Group
								</Button>
							</ModalButtons>
						</div>
					)}
				</Modal>

				{/* First point celebration modal */}
				<Modal open={showFirstPointModal}>
					<div>
						<CenterText>
							<h3>🎉 Congratulations! 🎉</h3>
						</CenterText>
						<CenterText className="big">First Point Earned!</CenterText>
						<CenterText style={{ marginBottom: "2rem" }}>
							You completed your first reminder loop! Keep it up and build your
							streak. Your score will now appear in the header.
						</CenterText>
						<ModalButtons>
							<Button
								type="button"
								$variant="success"
								onClick={() => setShowFirstPointModal(false)}
							>
								Awesome! 🚀
							</Button>
						</ModalButtons>
					</div>
				</Modal>

				{/* Tier upgrade celebration modal */}
				<Modal open={!!tierUpgradeModal}>
					{tierUpgradeModal && (
						<div>
							<CenterText>
								<h3>
									{tierUpgradeModal.emoji} {tierUpgradeModal.title}{" "}
									{tierUpgradeModal.emoji}
								</h3>
							</CenterText>
							<CenterText className="big">Tier Upgrade!</CenterText>
							<CenterText style={{ marginBottom: "2rem" }}>
								{tierUpgradeModal.message}
							</CenterText>
							<ModalButtons>
								<Button
									type="button"
									$variant="success"
									onClick={() => setTierUpgradeModal(null)}
									style={{ backgroundColor: tierUpgradeModal.color }}
								>
									Continue the Journey ✨
								</Button>
							</ModalButtons>
						</div>
					)}
				</Modal>
			</AppContainer>
		</>
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
		<WakeLockButton
			type="button"
			$enabled={enabled}
			onClick={async () => {
				if (!enabled) {
					await acquire();
					setEnabled(true);
				} else {
					await release();
					setEnabled(false);
				}
			}}
			title={
				enabled
					? "Screen locked awake - click to unlock"
					: "Screen can sleep - click to lock awake"
			}
		>
			<BsDisplay />
			{enabled ? <FaLock /> : <FaLockOpen />}
		</WakeLockButton>
	);
}
