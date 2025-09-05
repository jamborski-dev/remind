import { useMemo } from "react";
import { useAppStore } from "../store";

/**
 * Selective store hooks to prevent unnecessary re-renders
 * Each hook only subscribes to the specific slice it needs
 */

// Core data selectors
export const useGroups = () => useAppStore((state) => state.groups);
export const useLogEntries = () => useAppStore((state) => state.logEntries);
export const useScore = () => useAppStore((state) => state.score);
export const useNowTs = () => useAppStore((state) => state.nowTs);

// Modal state selectors
export const useDueGroupItem = () => useAppStore((state) => state.dueGroupItem);
export const useShowFirstPointModal = () =>
	useAppStore((state) => state.showFirstPointModal);
export const useTierUpgradeModal = () =>
	useAppStore((state) => state.tierUpgradeModal);
export const useGroupToDelete = () =>
	useAppStore((state) => state.groupToDelete);
export const useShowSettingsModal = () =>
	useAppStore((state) => state.showSettingsModal);

// Settings selectors
export const useSelectedSoundId = () =>
	useAppStore((state) => state.selectedSoundId);
export const useShowActivityLog = () =>
	useAppStore((state) => state.showActivityLog);
export const useActivityLogLimit = () =>
	useAppStore((state) => state.activityLogLimit);
export const useWakeLockSupported = () =>
	useAppStore((state) => state.wakeLockSupported);

// Action selectors (these are stable references from Zustand)
export const useSetGroups = () => useAppStore((state) => state.setGroups);
export const useSetLogEntries = () =>
	useAppStore((state) => state.setLogEntries);
export const useSetScore = () => useAppStore((state) => state.setScore);
export const useSetNowTs = () => useAppStore((state) => state.setNowTs);

export const useSetDueGroupItem = () =>
	useAppStore((state) => state.setDueGroupItem);
export const useSetShowFirstPointModal = () =>
	useAppStore((state) => state.setShowFirstPointModal);
export const useSetTierUpgradeModal = () =>
	useAppStore((state) => state.setTierUpgradeModal);
export const useSetGroupToDelete = () =>
	useAppStore((state) => state.setGroupToDelete);
export const useSetShowSettingsModal = () =>
	useAppStore((state) => state.setShowSettingsModal);

export const useSetSelectedSoundId = () =>
	useAppStore((state) => state.setSelectedSoundId);
export const useSetShowActivityLog = () =>
	useAppStore((state) => state.setShowActivityLog);
export const useSetActivityLogLimit = () =>
	useAppStore((state) => state.setActivityLogLimit);
export const useSetWakeLockSupported = () =>
	useAppStore((state) => state.setWakeLockSupported);

export const useRemoveGroup = () => useAppStore((state) => state.removeGroup);
export const useIncrementScore = () =>
	useAppStore((state) => state.incrementScore);

// Memoized selectors for modal state
export const useModalState = () => {
	const dueGroupItem = useDueGroupItem();
	const showFirstPointModal = useShowFirstPointModal();
	const tierUpgradeModal = useTierUpgradeModal();
	const groupToDelete = useGroupToDelete();
	const showSettingsModal = useShowSettingsModal();

	return useMemo(
		() => ({
			dueGroupItem,
			showFirstPointModal,
			tierUpgradeModal,
			groupToDelete,
			showSettingsModal,
		}),
		[
			dueGroupItem,
			showFirstPointModal,
			tierUpgradeModal,
			groupToDelete,
			showSettingsModal,
		],
	);
};

// Memoized selectors for settings
export const useSettings = () => {
	const selectedSoundId = useSelectedSoundId();
	const showActivityLog = useShowActivityLog();
	const activityLogLimit = useActivityLogLimit();
	const wakeLockSupported = useWakeLockSupported();

	return useMemo(
		() => ({
			selectedSoundId,
			showActivityLog,
			activityLogLimit,
			wakeLockSupported,
		}),
		[selectedSoundId, showActivityLog, activityLogLimit, wakeLockSupported],
	);
};
