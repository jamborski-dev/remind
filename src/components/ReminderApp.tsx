import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { useActivityLog } from "../hooks/useActivityLog";
import { useAppStoreSelectors } from "../hooks/useAppStoreSelectors";
import { useGroupScheduler } from "../hooks/useGroupScheduler";
import { useModalState } from "../hooks/useModalState";
import { useScoring } from "../hooks/useScoring";
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
	// Organized store access
	const {
		groups,
		logEntries,
		score,
		nowTs,
		modals,
		settings,
		actions,
		modalActions,
		settingsActions,
		helpers,
	} = useAppStoreSelectors();

	// Destructure commonly used values
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

	const { setGroups, setLogEntries, setScore, setNowTs } = actions;

	const {
		setDueGroupItem,
		setShowFirstPointModal,
		setTierUpgradeModal,
		setGroupToDelete,
		setShowSettingsModal,
	} = modalActions;

	const {
		setSelectedSoundId,
		setShowActivityLog,
		setActivityLogLimit,
		setWakeLockSupported,
	} = settingsActions;

	const { removeGroup: storeRemoveGroup, incrementScore: storeIncrementScore } =
		helpers;

	// Custom hooks for complex logic
	const { paginatedActivity, activityLogPage, setActivityLogPage } =
		useActivityLog(logEntries, activityLogLimit);
	const { anyModalOpen } = useModalState(
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

	// Live countdown ticker for reminder cards - pause when modals are open
	useEffect(() => {
		if (anyModalOpen) {
			// Don't update time when any modal is open (pauses all timers)
			return;
		}
		const id = setInterval(() => setNowTs(Date.now()), 1000);
		return () => clearInterval(id);
	}, [setNowTs, anyModalOpen]);

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

	// Group deletion handler

	const deleteGroup = (group: ReminderGroup) => {
		storeRemoveGroup(group.id);
		setGroupToDelete(null);
		// Clear any due modal if it's for this group
		if (dueGroupItem?.group.id === group.id) {
			setDueGroupItem(null);
		}
	};

	const handleClearTodaysActivity = () => {
		clearTodaysActivity(logEntries, setLogEntries, setActivityLogPage);
	};

	// ---- Seed builder for demo/dev ----
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
	const handleReseedDev = () => {
		localStorage.clear();
		setDueGroupItem(null);
		setShowFirstPointModal(false);
		reseedDev(setGroups, setLogEntries, setScore);
	};

	return (
		<AppLayout
			currentTier={TIER_MESSAGES[currentTier]}
			score={score}
			groupsCount={groups.length}
			reseedDev={handleReseedDev}
			wakeLockSupported={wakeLockSupported}
			acquireWakeLock={handleAcquireWakeLock}
			releaseWakeLock={handleReleaseWakeLock}
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
								<Button type="button" onClick={handleClearTodaysActivity}>
									Clear
								</Button>
							</Flex>

							<CardContent>
								<ActivityLogTable
									paginatedActivity={paginatedActivity}
									groups={groups}
									activityLogPage={activityLogPage}
									setActivityLogPage={setActivityLogPage}
								/>
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
								{groups.map((group, idx) => (
									<GroupContainer
										key={group.id}
										group={group}
										idx={idx}
										totalGroups={groups.length}
										nowTs={nowTs}
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
	);
}
