import { useAppStore } from "../store";

/**
 * Custom hook that provides organized access to the app store
 * Reduces verbosity in components by grouping related store values
 */
export function useAppStoreSelectors() {
	const store = useAppStore();

	return {
		// Core data
		groups: store.groups,
		logEntries: store.logEntries,
		score: store.score,
		nowTs: store.nowTs,

		// Modal states
		modals: {
			dueGroupItem: store.dueGroupItem,
			showFirstPointModal: store.showFirstPointModal,
			tierUpgradeModal: store.tierUpgradeModal,
			groupToDelete: store.groupToDelete,
			showSettingsModal: store.showSettingsModal,
		},

		// Settings
		settings: {
			selectedSoundId: store.selectedSoundId,
			showActivityLog: store.showActivityLog,
			activityLogLimit: store.activityLogLimit,
			wakeLockSupported: store.wakeLockSupported,
		},

		// Actions - Core
		actions: {
			setGroups: store.setGroups,
			setLogEntries: store.setLogEntries,
			setScore: store.setScore,
			setNowTs: store.setNowTs,
		},

		// Actions - Modals
		modalActions: {
			setDueGroupItem: store.setDueGroupItem,
			setShowFirstPointModal: store.setShowFirstPointModal,
			setTierUpgradeModal: store.setTierUpgradeModal,
			setGroupToDelete: store.setGroupToDelete,
			setShowSettingsModal: store.setShowSettingsModal,
		},

		// Actions - Settings
		settingsActions: {
			setSelectedSoundId: store.setSelectedSoundId,
			setShowActivityLog: store.setShowActivityLog,
			setActivityLogLimit: store.setActivityLogLimit,
			setWakeLockSupported: store.setWakeLockSupported,
		},

		// Helper actions
		helpers: {
			removeGroup: store.removeGroup,
			incrementScore: store.incrementScore,
		},
	};
}
