import type { StateCreator } from "zustand";
import type { TierInfo } from "../constants/scoring-messages";
import { now, uid } from "./storage";
import type {
	DueGroupItem,
	EditingGroup,
	ReminderGroup,
	ReminderGroupItem,
} from "./types";

export interface UISlice {
	// Modal states
	dueGroupItem: DueGroupItem | null;
	showFirstPointModal: boolean;
	tierUpgradeModal: TierInfo | null;
	groupToDelete: ReminderGroup | null;
	showSettingsModal: boolean;

	// Form states
	groupTitle: string;
	groupInterval: number;
	groupColor: string;
	formExpanded: boolean;
	editingGroup: EditingGroup | null;
	groupItems: ReminderGroupItem[];

	// App states
	wakeLockSupported: boolean;

	// Actions
	setDueGroupItem: (item: DueGroupItem | null) => void;
	setShowFirstPointModal: (show: boolean) => void;
	setTierUpgradeModal: (modal: TierInfo | null) => void;
	setGroupToDelete: (group: ReminderGroup | null) => void;
	setShowSettingsModal: (show: boolean) => void;

	setGroupTitle: (title: string) => void;
	setGroupInterval: (interval: number) => void;
	setGroupColor: (color: string) => void;
	setFormExpanded: (expanded: boolean) => void;
	setEditingGroup: (group: EditingGroup | null) => void;
	setGroupItems: (items: ReminderGroupItem[]) => void;

	setWakeLockSupported: (supported: boolean) => void;

	// Computed values
	isAnyModalOpen: () => boolean;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (
	set,
	get,
) => ({
	// Initial state
	dueGroupItem: null,
	showFirstPointModal: false,
	tierUpgradeModal: null,
	groupToDelete: null,
	showSettingsModal: false,

	groupTitle: "",
	groupInterval: 5,
	groupColor: "#3b82f6",
	formExpanded: false,
	editingGroup: null,
	groupItems: [
		{
			id: uid(),
			title: "",
			createdAt: now(),
		},
	],

	wakeLockSupported: false,

	// Actions
	setDueGroupItem: (dueGroupItem) => set({ dueGroupItem }),
	setShowFirstPointModal: (showFirstPointModal) => set({ showFirstPointModal }),
	setTierUpgradeModal: (tierUpgradeModal) => set({ tierUpgradeModal }),
	setGroupToDelete: (groupToDelete) => set({ groupToDelete }),
	setShowSettingsModal: (showSettingsModal) => set({ showSettingsModal }),

	setGroupTitle: (groupTitle) => set({ groupTitle }),
	setGroupInterval: (groupInterval) => set({ groupInterval }),
	setGroupColor: (groupColor) => set({ groupColor }),
	setFormExpanded: (formExpanded) => set({ formExpanded }),
	setEditingGroup: (editingGroup) => set({ editingGroup }),
	setGroupItems: (groupItems) => set({ groupItems }),

	setWakeLockSupported: (wakeLockSupported) => set({ wakeLockSupported }),

	// Computed values
	isAnyModalOpen: () => {
		const state = get();
		return !!(
			state.dueGroupItem ||
			state.groupToDelete ||
			state.showFirstPointModal ||
			state.tierUpgradeModal ||
			state.showSettingsModal
		);
	},
});
