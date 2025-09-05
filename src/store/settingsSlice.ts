import type { StateCreator } from "zustand";
import {
	loadActivityLogLimit,
	loadSelectedSoundId,
	loadShowActivityLog,
	saveActivityLogLimit,
	saveSelectedSoundId,
	saveShowActivityLog,
} from "./storage";

export interface SettingsSlice {
	// Settings states
	selectedSoundId: string;
	showActivityLog: boolean;
	activityLogLimit: number;

	// Actions
	setSelectedSoundId: (soundId: string) => void;
	setShowActivityLog: (show: boolean) => void;
	setActivityLogLimit: (limit: number) => void;
}

export const createSettingsSlice: StateCreator<
	SettingsSlice,
	[],
	[],
	SettingsSlice
> = (set) => ({
	// Initial state
	selectedSoundId: loadSelectedSoundId(),
	showActivityLog: loadShowActivityLog(),
	activityLogLimit: loadActivityLogLimit(),

	// Actions
	setSelectedSoundId: (selectedSoundId) => {
		set({ selectedSoundId });
		saveSelectedSoundId(selectedSoundId);
	},

	setShowActivityLog: (showActivityLog) => {
		set({ showActivityLog });
		saveShowActivityLog(showActivityLog);
	},

	setActivityLogLimit: (activityLogLimit) => {
		set({ activityLogLimit });
		saveActivityLogLimit(activityLogLimit);
	},
});
