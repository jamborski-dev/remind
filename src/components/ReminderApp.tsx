import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo } from "react";
import { TimeProvider } from "../contexts/TimeContext";
import { useActivityLog } from "../hooks/useActivityLog";
import { useGroupScheduler } from "../hooks/useGroupScheduler";
import { useModalState as useModalOpenState } from "../hooks/useModalState";
import { useScoring } from "../hooks/useScoring";
import {
	useGroups,
	useIncrementScore,
	useLogEntries,
	useModalState as useModalStateSelectors,
	useRemoveGroup,
	useScore,
	useSetActivityLogLimit,
	useSetDueGroupItem,
	useSetGroupToDelete,
	useSetGroups,
	useSetLogEntries,
	useSetScore,
	useSetSelectedSoundId,
	useSetShowActivityLog,
	useSetShowFirstPointModal,
	useSetShowSettingsModal,
	useSetTierUpgradeModal,
	useSetWakeLockSupported,
	useSettings,
} from "../hooks/useSelectiveStoreHooks";
import { useWakeLock } from "../hooks/useWakeLock";
import { TIER_MESSAGES } from "../scoring-messages";
import { getSoundConfig, playSound } from "../sounds";
import type { ReminderGroup } from "../store";
import {
	buildSeedGroups,
	clearTodaysActivity,
	reseedDev,
} from "../utils/actions";
import { ActivityLogTable } from "./ActivityLogTable";
import { CelebrationModals } from "./CelebrationModals";
import { DeleteGroupModal } from "./DeleteGroupModal";
import { DueItemModalContainer } from "./DueItemModalContainer";
import { GroupContainer } from "./GroupContainer";
import {
	Button,
	Card,
	CardContent,
	FormContainer,
	Layout,
	MutedText,
	RemindersSection,
	Sidebar,
} from "./ReminderApp.styled";
import { ReminderGroupFormContainer } from "./ReminderGroupFormContainer";
import { SettingsModal } from "./SettingsModal";
import { AppLayout } from "./compound/AppLayout";
import { Flex } from "./design-system/layout/Flex";

// ---- Main App ----
export default function App() {
	// Selective store access - only subscribe to what we need
	// This prevents unnecessary re-renders when unrelated store parts change
	const groups = useGroups(); // Only re-renders when groups change
	const logEntries = useLogEntries(); // Only re-renders when log entries change
	const score = useScore(); // Only re-renders when score changes

	// Memoized modal and settings state - grouped for convenience but still selective
	const modals = useModalStateSelectors(); // Memoized to prevent object recreation
	const settings = useSettings(); // Memoized to prevent object recreation

	// Actions (stable references, won't cause re-renders)
	const setGroups = useSetGroups();
	const setLogEntries = useSetLogEntries();
	const setScore = useSetScore();

	const setDueGroupItem = useSetDueGroupItem();
	const setShowFirstPointModal = useSetShowFirstPointModal();
	const setTierUpgradeModal = useSetTierUpgradeModal();
	const setGroupToDelete = useSetGroupToDelete();
	const setShowSettingsModal = useSetShowSettingsModal();

	const setSelectedSoundId = useSetSelectedSoundId();
	const setShowActivityLog = useSetShowActivityLog();
	const setActivityLogLimit = useSetActivityLogLimit();
	const setWakeLockSupported = useSetWakeLockSupported();

	const storeRemoveGroup = useRemoveGroup();
	const storeIncrementScore = useIncrementScore();

	// Destructure commonly used values from memoized state
	const {
		dueGroupItem,
		showFirstPointModal,
		tierUpgradeModal,
		groupToDelete,
		showSettingsModal,
	} = modals;

	const {
		selectedSoundId,
		showActivityLog,
		activityLogLimit,
		wakeLockSupported,
	} = settings;

	// Custom hooks for complex logic
	const { paginatedActivity, activityLogPage, setActivityLogPage } =
		useActivityLog(logEntries, activityLogLimit);
	const { anyModalOpen } = useModalOpenState(
		dueGroupItem,
		groupToDelete,
		showFirstPointModal,
		tierUpgradeModal,
		showSettingsModal,
	);
	const { handleAcquireWakeLock, handleReleaseWakeLock } =
		useWakeLock(setWakeLockSupported);
	const { currentTier } = useScoring(
		groups,
		score,
		storeIncrementScore,
		setShowFirstPointModal,
		setTierUpgradeModal,
	);

	// Group scheduler - check for due group items - pause when modals are open
	useGroupScheduler({
		groups,
		anyModalOpen,
		setDueGroupItem,
	});

	// Play sound when a reminder pops
	useEffect(() => {
		if (dueGroupItem) {
			const soundConfig = getSoundConfig(selectedSoundId);
			playSound(soundConfig);
		}
	}, [dueGroupItem, selectedSoundId]);

	// Group deletion handler - memoized to prevent recreation on every render
	const deleteGroup = useCallback(
		(group: ReminderGroup) => {
			storeRemoveGroup(group.id);
			setGroupToDelete(null);
			// Clear any due modal if it's for this group
			if (dueGroupItem?.group.id === group.id) {
				setDueGroupItem(null);
			}
		},
		[storeRemoveGroup, setGroupToDelete, dueGroupItem, setDueGroupItem],
	);

	// Activity log clear handler - memoized to prevent recreation
	const handleClearTodaysActivity = useCallback(() => {
		clearTodaysActivity(logEntries, setLogEntries, setActivityLogPage);
	}, [logEntries, setLogEntries, setActivityLogPage]);

	// Dev-only reseed handler - declared early to use in useMemo
	const handleReseedDev = useCallback(() => {
		localStorage.clear();
		setDueGroupItem(null);
		setShowFirstPointModal(false);
		reseedDev(setGroups, setLogEntries, setScore);
	}, [
		setDueGroupItem,
		setShowFirstPointModal,
		setGroups,
		setLogEntries,
		setScore,
	]);

	// AppLayout props - memoized to prevent unnecessary object recreation
	const appLayoutProps = useMemo(
		() => ({
			currentTier: TIER_MESSAGES[currentTier],
			score,
			groupsCount: groups.length,
			reseedDev: handleReseedDev,
			wakeLockSupported,
			acquireWakeLock: handleAcquireWakeLock,
			releaseWakeLock: handleReleaseWakeLock,
			setShowSettingsModal,
		}),
		[
			currentTier,
			score,
			groups.length,
			handleReseedDev,
			wakeLockSupported,
			handleAcquireWakeLock,
			handleReleaseWakeLock,
			setShowSettingsModal,
		],
	);

	// Activity log table props - memoized to prevent unnecessary re-renders
	const activityLogTableProps = useMemo(
		() => ({
			paginatedActivity,
			groups,
			activityLogPage,
			setActivityLogPage,
		}),
		[paginatedActivity, groups, activityLogPage, setActivityLogPage],
	);

	// ---- Seed builder for demo/dev ----
	// Quick starter content if empty (development only)
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// Only auto-seed in development environment
		if (import.meta.env.DEV && groups.length === 0) {
			const creationTime = Date.now();
			setGroups(buildSeedGroups(creationTime));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<TimeProvider paused={anyModalOpen}>
			<AppLayout {...appLayoutProps}>
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
									<Button type="button" onClick={handleClearTodaysActivity}>
										Clear
									</Button>
								</Flex>

								<CardContent>
									<ActivityLogTable {...activityLogTableProps} />
								</CardContent>
							</Card>
						</Sidebar>
					)}

					<FormContainer direction="column" gap="1.5rem">
						<ReminderGroupFormContainer />
					</FormContainer>

					<RemindersSection direction="column" gap="1rem">
						<Flex direction="column" gap="1rem">
							{groups.length === 0 ? (
								<MutedText>No groups yet. Add one above.</MutedText>
							) : (
								<AnimatePresence mode="popLayout" initial={false}>
									{groups.map((group: ReminderGroup, idx: number) => (
										<GroupContainer
											key={group.id}
											group={group}
											idx={idx}
											totalGroups={groups.length}
										/>
									))}
								</AnimatePresence>
							)}
						</Flex>
					</RemindersSection>
				</Layout>

				{/* Modals */}
				<DueItemModalContainer />

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

				{/* Settings Modal */}
				<SettingsModal
					isOpen={showSettingsModal}
					onClose={() => setShowSettingsModal(false)}
					selectedSoundId={selectedSoundId}
					setSelectedSoundId={setSelectedSoundId}
					showActivityLog={showActivityLog}
					setShowActivityLog={setShowActivityLog}
					activityLogLimit={activityLogLimit}
					setActivityLogLimit={setActivityLogLimit}
					setActivityLogPage={setActivityLogPage}
				/>
			</AppLayout>
		</TimeProvider>
	);
}
