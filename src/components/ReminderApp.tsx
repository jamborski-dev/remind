import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	FaArrowDown,
	FaArrowLeft,
	FaArrowRight,
	FaArrowUp,
	FaCheck,
	FaClock,
	FaPencil,
	FaPlay,
	FaTrash,
	FaXmark,
} from "react-icons/fa6";
import Select from "react-select";
import { TIER_MESSAGES, calculateTier } from "../scoring-messages";
import { SOUND_CONFIGS, getSoundConfig, playSound } from "../sounds";
import { type ReminderGroup, uid, useAppStore } from "../store";
import { GRACE_MS, clamp } from "../utils/helpers";
import {
	formatCountdown,
	formatShortDistance,
	formatTime,
	isSameLocalDay,
} from "../utils/time";
import { CelebrationModals } from "./CelebrationModals";
import { DeleteGroupModal } from "./DeleteGroupModal";
import { DueItemModal } from "./DueItemModal";
import { Modal } from "./Modal";
import {
	ActivityTable,
	AutoMarginButton,
	Badge,
	Button,
	Card,
	CardContent,
	ColorPicker,
	ColorPickerRow,
	CountdownBadge,
	CycleContainer,
	DueText,
	EditableInterval,
	EditableTitle,
	FlexInput,
	Footer,
	FormGridContainer,
	GroupActionsButton,
	GroupCard,
	GroupItemMainRow,
	GroupItemMeta,
	GroupItemRow,
	GroupItemSecondaryRow,
	GroupItemText,
	GroupTitle,
	Input,
	ItemTitleSpan,
	Layout,
	Main,
	MutedText,
	NumberInput,
	RemindersContainer,
	RemindersSection,
	RemindersTitle,
	ResponsiveButtonGroup,
	Sidebar,
	SmallButton,
	StatusBadge,
	ToggleSwitch,
} from "./ReminderApp.styled";
import { AppLayout } from "./compound/AppLayout";
import { Flex } from "./design-system/layout/Flex";

// ---- Main App ----
export default function App() {
	// Zustand store
	const {
		// Core data
		groups,
		logEntries,
		score,
		nowTs,

		// Modal states
		dueGroupItem,
		showFirstPointModal,
		tierUpgradeModal,
		groupToDelete,
		showSettingsModal,

		// Form states
		groupTitle,
		groupInterval,
		groupColor,
		formExpanded,
		editingGroup,
		groupItems,

		// Settings states
		selectedSoundId,
		showActivityLog,
		activityLogLimit,

		// App states
		wakeLockSupported,

		// Actions
		setGroups,
		setLogEntries,
		setScore,
		setNowTs,
		setDueGroupItem,
		setShowFirstPointModal,
		setTierUpgradeModal,
		setGroupToDelete,
		setShowSettingsModal,
		setGroupTitle,
		setGroupInterval,
		setGroupColor,
		setFormExpanded,
		setEditingGroup,
		setGroupItems,
		setSelectedSoundId,
		setShowActivityLog,
		setActivityLogLimit,
		setWakeLockSupported,

		// Helper actions
		updateGroup: storeUpdateGroup,
		addGroup: storeAddGroup,
		removeGroup: storeRemoveGroup,
		addLogEntry: storeAddLogEntry,
		incrementScore: storeIncrementScore,
		completeGroupItem: storeCompleteGroupItem,
		toggleGroupItemEnabled: storeToggleGroupItemEnabled,
		deleteGroupItem: storeDeleteGroupItem,
		moveGroup: storeMoveGroup,
		toggleGroupEnabled: storeToggleGroupEnabled,
		snoozeGroup: storeSnoozeGroup,
	} = useAppStore();

	// Pagination state for activity log
	const [activityLogPage, setActivityLogPage] = useState(0);

	const pendingScoreRef = useRef<string | null>(null); // Track which group just completed a loop

	// Calculate current tier based on score and group count
	const currentTier = calculateTier(score);

	// Handle scoring when a loop is completed
	// biome-ignore lint/correctness/useExhaustiveDependencies: this is needed for reacting to other part of state
	useEffect(() => {
		if (pendingScoreRef.current) {
			console.log(
				"Awarding point for completed loop in group:",
				pendingScoreRef.current,
			);
			const prevScore = score;
			storeIncrementScore();
			const newScore = prevScore + 1;
			console.log("Score updated from", prevScore, "to", newScore);

			// Calculate tiers before and after scoring
			const prevTier = calculateTier(prevScore);
			const newTier = calculateTier(newScore);

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

			pendingScoreRef.current = null; // Clear the pending score
		}
	}, [groups]); // Trigger when groups state changes
	// Live countdown ticker for reminder cards - pause when modals are open
	const anyModalOpen = !!(
		dueGroupItem ||
		groupToDelete ||
		showFirstPointModal ||
		tierUpgradeModal ||
		showSettingsModal
	);
	useEffect(() => {
		if (anyModalOpen) {
			// Don't update time when any modal is open (pauses all timers)
			return;
		}
		const id = setInterval(() => setNowTs(Date.now()), 1000);
		return () => clearInterval(id);
	}, [setNowTs, anyModalOpen]);

	const wakeLockRef = useRef<WakeLockSentinel | null>(null);

	// Wake Lock support
	useEffect(() => {
		// @ts-ignore
		setWakeLockSupported(!!navigator.wakeLock);
	}, [setWakeLockSupported]);

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
		if (anyModalOpen) {
			return;
		}
		const current = Date.now();

		// Find any group that's due within grace period
		const dueGroups = groups
			.filter((group) => group.enabled ?? true) // Filter out disabled groups
			.filter((group) => group.items.some((item) => item.enabled !== false))
			.filter((group) => current + GRACE_MS >= group.nextDueTime)
			.sort((a, b) => a.nextDueTime - b.nextDueTime);

		if (dueGroups.length > 0) {
			const group = dueGroups[0];
			// Find the next enabled item starting from currentItemIndex
			const enabledItems = group.items.filter((item) => item.enabled !== false);
			if (enabledItems.length > 0) {
				// Find the current enabled item or fallback to the first enabled item
				let nextEnabledItem = group.items[group.currentItemIndex];
				if (!nextEnabledItem?.enabled) {
					// Current item is disabled, find next enabled item
					const currentItemInEnabledList = enabledItems.find(
						(item) => item.id === group.items[group.currentItemIndex]?.id,
					);
					nextEnabledItem = currentItemInEnabledList || enabledItems[0];
				}
				setDueGroupItem({ group, item: nextEnabledItem });
				return;
			}
		}

		// Nothing due now; schedule the soonest future group
		const futureGroup = groups
			.filter((group) => group.enabled ?? true) // Filter out disabled groups
			.filter((group) => group.items.some((item) => item.enabled !== false))
			.sort((a, b) => a.nextDueTime - b.nextDueTime)[0];

		if (futureGroup) {
			const delay = Math.max(0, futureGroup.nextDueTime - current);
			const timeoutId = window.setTimeout(() => {
				// Find the next enabled item starting from currentItemIndex
				const enabledItems = futureGroup.items.filter(
					(item) => item.enabled !== false,
				);
				if (enabledItems.length > 0) {
					// Find the current enabled item or fallback to the first enabled item
					let nextEnabledItem = futureGroup.items[futureGroup.currentItemIndex];
					if (!nextEnabledItem?.enabled) {
						// Current item is disabled, find next enabled item
						const currentItemInEnabledList = enabledItems.find(
							(item) =>
								item.id === futureGroup.items[futureGroup.currentItemIndex]?.id,
						);
						nextEnabledItem = currentItemInEnabledList || enabledItems[0];
					}
					setDueGroupItem(
						dueGroupItem ?? { group: futureGroup, item: nextEnabledItem },
					);
				}
			}, delay);

			return () => clearTimeout(timeoutId);
		}
	}, [groups, anyModalOpen, setDueGroupItem, dueGroupItem]);

	// Play sound when a reminder pops
	useEffect(() => {
		if (dueGroupItem) {
			const soundConfig = getSoundConfig(selectedSoundId);
			playSound(soundConfig);
		}
	}, [dueGroupItem, selectedSoundId]);

	// Reset pagination when activity log limit changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset pagination when limit changes
	useEffect(() => {
		setActivityLogPage(0);
	}, [activityLogLimit]);

	const addGroupItem = () => {
		const newItem = {
			id: uid(),
			title: "",
			createdAt: Date.now(),
		};
		setGroupItems([...groupItems, newItem]);
	};

	const removeGroupItem = (id: string) => {
		const newItems =
			groupItems.length > 1
				? groupItems.filter((i) => i.id !== id)
				: groupItems;
		setGroupItems(newItems);
	};

	const updateGroupItem = (id: string, title: string) => {
		const newItems = groupItems.map((i) => (i.id === id ? { ...i, title } : i));
		setGroupItems(newItems);
	};

	const moveGroupItem = (id: string, direction: -1 | 1) => {
		const idx = groupItems.findIndex((i) => i.id === id);
		if (idx < 0) return;
		const nextIdx = idx + direction;
		if (nextIdx < 0 || nextIdx >= groupItems.length) return;
		const copy = [...groupItems];
		const [item] = copy.splice(idx, 1);
		copy.splice(nextIdx, 0, item);
		setGroupItems(copy);
	};

	// --- Group item actions ---
	const completeGroupItem = (groupId: string, itemId: string) => {
		console.log("completeGroupItem called with:", groupId, itemId);

		// Find the group and check if this completes a loop before updating
		const group = groups.find((g) => g.id === groupId);
		if (!group) return;

		const enabledItems = group.items.filter((i) => i.enabled ?? true);
		const currentEnabledIndex = enabledItems.findIndex((i) => i.id === itemId);
		const isLoopCompleted = currentEnabledIndex === enabledItems.length - 1;

		if (isLoopCompleted) {
			console.log("Loop completed! Setting pending score for group:", groupId);
			pendingScoreRef.current = groupId;
		}

		// Use store action for the update
		storeCompleteGroupItem(groupId, itemId);

		// Add log entry
		const item = group.items.find((i) => i.id === itemId);
		if (item) {
			storeAddLogEntry({
				id: uid(),
				reminderId: item.id,
				action: "done",
				at: Date.now(),
				text: item.title,
			});
		}
	};

	const toggleGroupItemEnabled = (groupId: string, itemId: string) => {
		storeToggleGroupItemEnabled(groupId, itemId);
	};

	const deleteGroupItem = (groupId: string, itemId: string) => {
		storeDeleteGroupItem(groupId, itemId);
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

		storeUpdateGroup(editingGroup.id, {
			title: editingGroup.title.trim() || "Untitled Group",
			intervalMinutes: clamp(editingGroup.interval || 1, 1, 240),
			color: editingGroup.color,
		});
		setEditingGroup(null);
	};
	const cancelGroupEdit = () => {
		setEditingGroup(null);
	};

	const deleteGroup = (group: ReminderGroup) => {
		storeRemoveGroup(group.id);
		setGroupToDelete(null);
		// Clear any due modal if it's for this group
		if (dueGroupItem?.group.id === group.id) {
			setDueGroupItem(null);
		}
	};

	const moveGroup = (groupId: string, direction: -1 | 1) => {
		storeMoveGroup(groupId, direction);
	};

	const toggleGroupEnabled = (groupId: string) => {
		storeToggleGroupEnabled(groupId);
	};

	const submitGroup = () => {
		const titles = groupItems.map((i) => i.title.trim()).filter(Boolean);
		if (titles.length === 0) return; // require at least one item
		const interval = clamp(groupInterval || 1, 1, 240);
		const nowTs = Date.now();
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
		storeAddGroup(group);
		// reset form
		setGroupTitle("");
		setGroupInterval(5);
		setGroupColor("#3b82f6"); // Reset to default color
		setGroupItems([
			{
				id: uid(),
				title: "",
				createdAt: Date.now(),
			},
		]);
	};

	// Helper function to find group color for a reminder ID
	const getGroupColorForReminder = (reminderId: string): string => {
		for (const group of groups) {
			const item = group.items.find((item) => item.id === reminderId);
			if (item) {
				return group.color;
			}
		}
		return "#6b7280"; // Default gray color if not found
	};

	const todaysActivity = useMemo(() => {
		const current = Date.now();
		const allTodaysEntries = logEntries
			.filter(
				(e) =>
					isSameLocalDay(e.at, current) &&
					(e.action === "done" || e.action === "snooze"),
			)
			.sort((a, b) => b.at - a.at);

		// Apply limit
		return allTodaysEntries.slice(0, activityLogLimit);
	}, [logEntries, activityLogLimit]);

	// Paginated activity for display (if limit > 20, paginate)
	const paginatedActivity = useMemo(() => {
		if (activityLogLimit <= 20) {
			return {
				items: todaysActivity,
				totalPages: 1,
				currentPage: 0,
				itemsPerPage: activityLogLimit,
			};
		}

		const itemsPerPage = 20;
		const totalPages = Math.ceil(todaysActivity.length / itemsPerPage);
		const startIndex = activityLogPage * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;

		return {
			items: todaysActivity.slice(startIndex, endIndex),
			totalPages,
			currentPage: activityLogPage,
			itemsPerPage,
		};
	}, [todaysActivity, activityLogPage, activityLogLimit]);

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
		const current = Date.now();
		setLogEntries(logEntries.filter((e) => !isSameLocalDay(e.at, current)));
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
			const creationTime = Date.now();
			setGroups(buildSeedGroups(creationTime));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	// Dev-only reseed handler
	const reseedDev = () => {
		const creationTime = Date.now();
		localStorage.clear();
		setLogEntries([]);
		setGroups(buildSeedGroups(creationTime));
		setDueGroupItem(null);
		setScore(0);
		setShowFirstPointModal(false);
	};

	// Form refs

	return (
		<AppLayout
			currentTier={TIER_MESSAGES[currentTier]}
			score={score}
			groupsCount={groups.length}
			reseedDev={reseedDev}
			wakeLockSupported={wakeLockSupported}
			acquireWakeLock={acquireWakeLock}
			releaseWakeLock={releaseWakeLock}
			setShowSettingsModal={setShowSettingsModal}
		>
			<Layout $showActivityLog={showActivityLog}>
				{showActivityLog && (
					<Sidebar direction="column" gap="1rem">
						<Card>
							<Flex
								justifyContent="space-between"
								alignItems="center"
								mb="1rem"
							>
								<h2 style={{ fontSize: "1rem" }}>Activity log</h2>
								<Button type="button" onClick={clearTodaysActivity}>
									Clear
								</Button>
							</Flex>

							<CardContent>
								{paginatedActivity.items.length === 0 ? (
									<MutedText $small>No activity yet.</MutedText>
								) : (
									<>
										<ActivityTable>
											<thead>
												<tr>
													<th>Time</th>
													<th />
													<th>Task</th>
												</tr>
											</thead>
											<tbody>
												{paginatedActivity.items.map((entry) => (
													<tr key={entry.id}>
														<td>{formatTime(entry.at)}</td>
														<td>
															{entry.action === "done" ? (
																<FaCheck />
															) : (
																<Flex alignItems="center" gap={1}>
																	<FaClock />
																	{entry.snoozeForMinutes}M
																</Flex>
															)}
														</td>
														<td>
															<Flex alignItems="center" gap={1}>
																<div
																	style={{
																		width: "8px",
																		height: "8px",
																		borderRadius: "50%",
																		backgroundColor: getGroupColorForReminder(
																			entry.reminderId,
																		),
																		flexShrink: 0,
																	}}
																/>
																{entry.text}
															</Flex>
														</td>
													</tr>
												))}
											</tbody>
										</ActivityTable>

										{/* Pagination controls */}
										{paginatedActivity.totalPages > 1 && (
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													marginTop: "1rem",
													fontSize: "0.875rem",
												}}
											>
												<Button
													type="button"
													onClick={() =>
														setActivityLogPage(Math.max(0, activityLogPage - 1))
													}
													disabled={activityLogPage === 0}
													style={{ minWidth: "80px" }}
												>
													Previous
												</Button>
												<span>
													Page {activityLogPage + 1} of{" "}
													{paginatedActivity.totalPages}
												</span>
												<Button
													type="button"
													onClick={() =>
														setActivityLogPage(
															Math.min(
																paginatedActivity.totalPages - 1,
																activityLogPage + 1,
															),
														)
													}
													disabled={
														activityLogPage === paginatedActivity.totalPages - 1
													}
													style={{ minWidth: "80px" }}
												>
													Next
												</Button>
											</div>
										)}
									</>
								)}
							</CardContent>
						</Card>
					</Sidebar>
				)}

				<Main direction="column" gap="1.5rem">
					<Card>
						<Flex justifyContent="space-between" alignItems="center">
							<h2>Create a reminder group</h2>
							<Button
								type="button"
								onClick={() => setFormExpanded(!formExpanded)}
							>
								{formExpanded ? "Collapse" : "Expand"}
							</Button>
						</Flex>

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
									<div
										style={{
											marginTop: "2rem",
											display: "grid",
											gridTemplateColumns: "1fr auto auto",
											gap: "1rem",
											alignItems: "end",
										}}
									>
										<Flex gap="1rem" alignItems="flex-end">
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
										</Flex>

										<RemindersContainer>
											<RemindersTitle className="small">
												Reminders in this group
											</RemindersTitle>
											{groupItems.map((item, idx) => (
												<Flex
													key={item.id}
													gap="8px"
													alignItems="center"
													mb="8px"
													direction="row"
												>
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
												</Flex>
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
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</Card>
				</Main>

				<RemindersSection direction="column" gap="1rem">
					<Flex direction="column" gap="1rem">
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
										<Flex
											alignItems="center"
											mb="1rem"
											gap="0.5rem"
											justifyContent="space-between"
										>
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
													// Check if all items in the group are disabled
													const hasEnabledItems = group.items.some(
														(item) => item.enabled !== false,
													);
													if (!hasEnabledItems) {
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
													<Flex gap="0.25rem" ml="0.5rem">
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
													</Flex>
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
													<FaTrash />
												</GroupActionsButton>
											</div>
										</Flex>
										<Flex direction="column" gap="0.75rem">
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
																		(group.enabled ?? true) &&
																		(() => {
																			// Check if recently snoozed (within 30 seconds of snooze action)
																			const recentlySnoozeThreshold = 30 * 1000; // 30 seconds
																			const isRecentlySnooze =
																				group.snoozedAt &&
																				nowTs - group.snoozedAt <
																					recentlySnoozeThreshold;

																			if (
																				isRecentlySnooze &&
																				group.snoozedForMinutes
																			) {
																				return (
																					<StatusBadge
																						$isDue={false}
																						style={{
																							backgroundColor: "#fbbf24",
																							color: "#92400e",
																						}}
																					>
																						Snoozed {group.snoozedForMinutes}m
																					</StatusBadge>
																				);
																			}

																			return (
																				<StatusBadge $isDue={isGroupDue}>
																					{isGroupDue ? "Due now" : "Due next"}
																				</StatusBadge>
																			);
																		})()}
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
																				const diff = group.nextDueTime - nowTs;
																				return diff <= 0 ? (
																					<DueText>due now</DueText>
																				) : (
																					<>
																						at {formatTime(group.nextDueTime)}
																					</>
																				);
																			})()}
																	</GroupItemMeta>
																</GroupItemText>
															</GroupItemMainRow>
															<GroupItemSecondaryRow>
																<GroupItemMeta>
																	<strong>Last: </strong>{" "}
																	{i.lastShownAt
																		? formatShortDistance(i.lastShownAt)
																		: "never"}{" "}
																</GroupItemMeta>
																{/* GroupItemButtonGroup replaced with ResponsiveButtonGroup */}
																<ResponsiveButtonGroup alignItems="center">
																	<GroupActionsButton
																		type="button"
																		$variant="success"
																		title="Mark complete"
																		onClick={() =>
																			completeGroupItem(group.id, i.id)
																		}
																	>
																		<FaCheck />
																	</GroupActionsButton>

																	<GroupActionsButton
																		type="button"
																		$variant="warn"
																		title="Snooze 5 minutes"
																		onClick={() => {
																			storeSnoozeGroup(group.id, 5);
																			// Add log entry for snooze action
																			storeAddLogEntry({
																				id: uid(),
																				reminderId: i.id,
																				action: "snooze",
																				at: Date.now(),
																				text: i.title,
																				snoozeForMinutes: 5,
																			});
																		}}
																	>
																		<FaClock style={{ marginRight: "4px" }} />
																		5M
																	</GroupActionsButton>

																	<ToggleSwitch
																		$enabled={i.enabled ?? true}
																		onClick={() =>
																			toggleGroupItemEnabled(group.id, i.id)
																		}
																		title={
																			(i.enabled ?? true)
																				? "Disable item"
																				: "Enable item"
																		}
																	/>

																	<GroupActionsButton
																		type="button"
																		$variant="danger"
																		onClick={() =>
																			deleteGroupItem(group.id, i.id)
																		}
																		title="Delete item"
																	>
																		<FaTrash color="#fff" />
																	</GroupActionsButton>
																</ResponsiveButtonGroup>
															</GroupItemSecondaryRow>
														</GroupItemRow>
													);
												})}
											</AnimatePresence>
										</Flex>
									</GroupCard>
								))}
							</AnimatePresence>
						)}
					</Flex>
				</RemindersSection>
			</Layout>

			<Footer>
				Runs entirely in your browser. Data stored via localStorage. Keep this
				tab open.
			</Footer>

			{/* Modals */}
			<DueItemModal
				dueGroupItem={dueGroupItem}
				setDueGroupItem={setDueGroupItem}
				logEntries={logEntries}
				completeGroupItem={completeGroupItem}
				storeSnoozeGroup={storeSnoozeGroup}
				storeAddLogEntry={storeAddLogEntry}
			/>

			<DeleteGroupModal
				groupToDelete={groupToDelete}
				setGroupToDelete={setGroupToDelete}
				deleteGroup={deleteGroup}
			/>

			<CelebrationModals
				showFirstPointModal={showFirstPointModal}
				setShowFirstPointModal={setShowFirstPointModal}
				tierUpgradeModal={tierUpgradeModal}
				setTierUpgradeModal={setTierUpgradeModal}
			/>

			{/* Settings Modal - keeping inline for now due to complexity */}
			<Modal open={showSettingsModal}>
				<div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "1rem",
						}}
					>
						<h3 style={{ margin: 0 }}>Settings</h3>
						<Button
							type="button"
							onClick={() => setShowSettingsModal(false)}
							title="Close settings"
						>
							<FaXmark />
						</Button>
					</div>

					<div style={{ padding: "1rem 0" }}>
						<h4 style={{ marginBottom: "0.5rem" }}>Notification Sound</h4>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
								marginBottom: "0.5rem",
							}}
						>
							<Button
								type="button"
								onClick={() => {
									const currentIndex = SOUND_CONFIGS.findIndex(
										(s) => s.id === selectedSoundId,
									);
									const prevIndex =
										currentIndex > 0
											? currentIndex - 1
											: SOUND_CONFIGS.length - 1;
									const prevSound = SOUND_CONFIGS[prevIndex];
									setSelectedSoundId(prevSound.id);
									// Preview the sound
									const soundConfig = getSoundConfig(prevSound.id);
									playSound(soundConfig);
								}}
								title="Previous sound"
								style={{ minWidth: "40px", height: "40px" }}
							>
								<FaArrowLeft />
							</Button>
							<Select
								value={{
									value: selectedSoundId,
									label:
										SOUND_CONFIGS.find((s) => s.id === selectedSoundId)?.name ||
										"Unknown",
								}}
								onChange={(option) => {
									if (option) {
										setSelectedSoundId(option.value);
										// Preview the sound when selected
										const soundConfig = getSoundConfig(option.value);
										playSound(soundConfig);
									}
								}}
								options={SOUND_CONFIGS.map((config) => ({
									value: config.id,
									label: config.name,
								}))}
								placeholder="Select a notification sound..."
								isSearchable={false}
								styles={{
									control: (base) => ({
										...base,
										minHeight: "40px",
									}),
									container: (base) => ({
										...base,
										flex: 1,
									}),
								}}
							/>
							<Button
								type="button"
								onClick={() => {
									const currentIndex = SOUND_CONFIGS.findIndex(
										(s) => s.id === selectedSoundId,
									);
									const nextIndex =
										currentIndex < SOUND_CONFIGS.length - 1
											? currentIndex + 1
											: 0;
									const nextSound = SOUND_CONFIGS[nextIndex];
									setSelectedSoundId(nextSound.id);
									// Preview the sound
									const soundConfig = getSoundConfig(nextSound.id);
									playSound(soundConfig);
								}}
								title="Next sound"
								style={{ minWidth: "40px", height: "40px" }}
							>
								<FaArrowRight />
							</Button>
							<Button
								type="button"
								onClick={() => {
									// Preview the currently selected sound
									const soundConfig = getSoundConfig(selectedSoundId);
									playSound(soundConfig);
								}}
								title="Play current sound"
								style={{ minWidth: "40px", height: "40px" }}
							>
								<FaPlay />
							</Button>
						</div>
						<p
							style={{
								fontSize: "0.875rem",
								color: "#666",
								margin: "0.5rem 0 0 0",
							}}
						>
							Use arrows to cycle through sounds, play button to preview current
							selection, or click dropdown to choose directly
						</p>
					</div>

					<div style={{ padding: "1rem 0" }}>
						<h4 style={{ marginBottom: "0.5rem" }}>Display Options</h4>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
								marginBottom: "0.5rem",
							}}
						>
							<span>Show Activity Log</span>
							<ToggleSwitch
								$enabled={showActivityLog}
								onClick={() => setShowActivityLog(!showActivityLog)}
								title={
									showActivityLog ? "Hide activity log" : "Show activity log"
								}
							/>
						</div>
						<p
							style={{
								fontSize: "0.875rem",
								color: "#666",
								margin: "0.5rem 0 0 0",
							}}
						>
							Toggle visibility of the activity log sidebar
						</p>

						<div style={{ marginTop: "1rem" }}>
							<h5 style={{ marginBottom: "0.5rem", margin: "0 0 0.5rem 0" }}>
								Activity Log Items
							</h5>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.5rem",
									marginBottom: "0.5rem",
								}}
							>
								<span style={{ fontSize: "0.875rem", color: "#666" }}>
									Only show last
								</span>
								<div
									style={{
										display: "flex",
										borderRadius: "6px",
										border: "1px solid #e6e6ef",
										overflow: "hidden",
										backgroundColor: "#f7f7fb",
									}}
								>
									{[10, 25, 50, 100].map((limit, index) => (
										<button
											key={limit}
											type="button"
											onClick={() => {
												setActivityLogLimit(limit);
												setActivityLogPage(0);
											}}
											style={{
												padding: "0.5rem 1rem",
												border: "none",
												backgroundColor:
													activityLogLimit === limit
														? "#4f46e5"
														: "transparent",
												color: activityLogLimit === limit ? "white" : "#111",
												cursor: "pointer",
												fontSize: "0.875rem",
												fontWeight: activityLogLimit === limit ? "600" : "400",
												borderRight: index < 3 ? "1px solid #e6e6ef" : "none",
												transition: "all 0.2s ease",
												minWidth: "40px",
											}}
											onMouseEnter={(e) => {
												if (activityLogLimit !== limit) {
													e.currentTarget.style.backgroundColor = "#e6e6ef";
												}
											}}
											onMouseLeave={(e) => {
												if (activityLogLimit !== limit) {
													e.currentTarget.style.backgroundColor = "transparent";
												}
											}}
										>
											{limit}
										</button>
									))}
								</div>
								<span style={{ fontSize: "0.875rem", color: "#666" }}>
									items
								</span>
							</div>
							<p
								style={{
									fontSize: "0.875rem",
									color: "#666",
									margin: "0 0 0 0",
								}}
							>
								{activityLogLimit > 20
									? "Items will be paginated (20 per page)"
									: "All items shown on one page"}
							</p>
						</div>
					</div>

					<Flex wrap="wrap" gap="0.5rem" justifyContent="center">
						<Button type="button" onClick={() => setShowSettingsModal(false)}>
							Close
						</Button>
					</Flex>
				</div>
			</Modal>

			{/* Modals */}
			<DueItemModal
				dueGroupItem={dueGroupItem}
				setDueGroupItem={setDueGroupItem}
				logEntries={logEntries}
				completeGroupItem={completeGroupItem}
				storeSnoozeGroup={storeSnoozeGroup}
				storeAddLogEntry={storeAddLogEntry}
			/>

			<DeleteGroupModal
				groupToDelete={groupToDelete}
				setGroupToDelete={setGroupToDelete}
				deleteGroup={deleteGroup}
			/>

			<CelebrationModals
				showFirstPointModal={showFirstPointModal}
				setShowFirstPointModal={setShowFirstPointModal}
				tierUpgradeModal={tierUpgradeModal}
				setTierUpgradeModal={setTierUpgradeModal}
			/>

			{/* Settings Modal - keeping inline for now due to complexity */}
			<Modal open={showSettingsModal}>
				<div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "1rem",
						}}
					>
						<h3 style={{ margin: 0 }}>Settings</h3>
						<Button
							type="button"
							onClick={() => setShowSettingsModal(false)}
							title="Close settings"
						>
							<FaXmark />
						</Button>
					</div>

					<div style={{ padding: "1rem 0" }}>
						<h4 style={{ marginBottom: "0.5rem" }}>Notification Sound</h4>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
								marginBottom: "0.5rem",
							}}
						>
							<Button
								type="button"
								onClick={() => {
									const currentIndex = SOUND_CONFIGS.findIndex(
										(s) => s.id === selectedSoundId,
									);
									const prevIndex =
										currentIndex > 0
											? currentIndex - 1
											: SOUND_CONFIGS.length - 1;
									const prevSound = SOUND_CONFIGS[prevIndex];
									setSelectedSoundId(prevSound.id);
									// Preview the sound
									const soundConfig = getSoundConfig(prevSound.id);
									playSound(soundConfig);
								}}
								title="Previous sound"
								style={{ minWidth: "40px", height: "40px" }}
							>
								<FaArrowLeft />
							</Button>
							<Select
								value={{
									value: selectedSoundId,
									label:
										SOUND_CONFIGS.find((s) => s.id === selectedSoundId)?.name ||
										"Unknown",
								}}
								onChange={(option) => {
									if (option) {
										setSelectedSoundId(option.value);
										// Preview the sound when selected
										const soundConfig = getSoundConfig(option.value);
										playSound(soundConfig);
									}
								}}
								options={SOUND_CONFIGS.map((config) => ({
									value: config.id,
									label: config.name,
								}))}
								placeholder="Select a notification sound..."
								isSearchable={false}
								styles={{
									control: (base) => ({
										...base,
										minHeight: "40px",
									}),
									container: (base) => ({
										...base,
										flex: 1,
									}),
								}}
							/>
							<Button
								type="button"
								onClick={() => {
									const currentIndex = SOUND_CONFIGS.findIndex(
										(s) => s.id === selectedSoundId,
									);
									const nextIndex =
										currentIndex < SOUND_CONFIGS.length - 1
											? currentIndex + 1
											: 0;
									const nextSound = SOUND_CONFIGS[nextIndex];
									setSelectedSoundId(nextSound.id);
									// Preview the sound
									const soundConfig = getSoundConfig(nextSound.id);
									playSound(soundConfig);
								}}
								title="Next sound"
								style={{ minWidth: "40px", height: "40px" }}
							>
								<FaArrowRight />
							</Button>
							<Button
								type="button"
								onClick={() => {
									// Preview the currently selected sound
									const soundConfig = getSoundConfig(selectedSoundId);
									playSound(soundConfig);
								}}
								title="Play current sound"
								style={{ minWidth: "40px", height: "40px" }}
							>
								<FaPlay />
							</Button>
						</div>
						<p
							style={{
								fontSize: "0.875rem",
								color: "#666",
								margin: "0.5rem 0 0 0",
							}}
						>
							Use arrows to cycle through sounds, play button to preview current
							selection, or click dropdown to choose directly
						</p>
					</div>

					<div style={{ padding: "1rem 0" }}>
						<h4 style={{ marginBottom: "0.5rem" }}>Display Options</h4>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
								marginBottom: "0.5rem",
							}}
						>
							<span>Show Activity Log</span>
							<ToggleSwitch
								$enabled={showActivityLog}
								onClick={() => setShowActivityLog(!showActivityLog)}
								title={
									showActivityLog ? "Hide activity log" : "Show activity log"
								}
							/>
						</div>
						<p
							style={{
								fontSize: "0.875rem",
								color: "#666",
								margin: "0.5rem 0 0 0",
							}}
						>
							Toggle visibility of the activity log sidebar
						</p>

						<div style={{ marginTop: "1rem" }}>
							<h5 style={{ marginBottom: "0.5rem", margin: "0 0 0.5rem 0" }}>
								Activity Log Items
							</h5>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.5rem",
									marginBottom: "0.5rem",
								}}
							>
								<span style={{ fontSize: "0.875rem", color: "#666" }}>
									Only show last
								</span>
								<div
									style={{
										display: "flex",
										borderRadius: "6px",
										border: "1px solid #e6e6ef",
										overflow: "hidden",
										backgroundColor: "#f7f7fb",
									}}
								>
									{[10, 25, 50, 100].map((limit, index) => (
										<button
											key={limit}
											type="button"
											onClick={() => {
												setActivityLogLimit(limit);
												setActivityLogPage(0);
											}}
											style={{
												padding: "0.5rem 1rem",
												border: "none",
												backgroundColor:
													activityLogLimit === limit
														? "#4f46e5"
														: "transparent",
												color: activityLogLimit === limit ? "white" : "#111",
												cursor: "pointer",
												fontSize: "0.875rem",
												fontWeight: activityLogLimit === limit ? "600" : "400",
												borderRight: index < 3 ? "1px solid #e6e6ef" : "none",
												transition: "all 0.2s ease",
												minWidth: "40px",
											}}
											onMouseEnter={(e) => {
												if (activityLogLimit !== limit) {
													e.currentTarget.style.backgroundColor = "#e6e6ef";
												}
											}}
											onMouseLeave={(e) => {
												if (activityLogLimit !== limit) {
													e.currentTarget.style.backgroundColor = "transparent";
												}
											}}
										>
											{limit}
										</button>
									))}
								</div>
								<span style={{ fontSize: "0.875rem", color: "#666" }}>
									items
								</span>
							</div>
							<p
								style={{
									fontSize: "0.875rem",
									color: "#666",
									margin: "0 0 0 0",
								}}
							>
								{activityLogLimit > 20
									? "Items will be paginated (20 per page)"
									: "All items shown on one page"}
							</p>
						</div>
					</div>

					<Flex wrap="wrap" gap="0.5rem" justifyContent="center">
						<Button type="button" onClick={() => setShowSettingsModal(false)}>
							Close
						</Button>
					</Flex>
				</div>
			</Modal>
		</AppLayout>
	);
}
