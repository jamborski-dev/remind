import { create } from "zustand";
import type { TierInfo } from "./scoring-messages";
import { DEFAULT_SOUND_ID } from "./sounds";

// Types
interface ReminderGroupItem {
	id: string;
	title: string;
	createdAt: number;
	lastShownAt?: number;
	enabled?: boolean;
}

interface ReminderGroup {
	id: string;
	title: string;
	items: ReminderGroupItem[];
	currentItemIndex: number;
	intervalMinutes: number;
	nextDueTime: number;
	enabled?: boolean;
	color: string;
	pausedRemainingMs?: number;
	createdAt: number;
	snoozedAt?: number;
	snoozedForMinutes?: number;
}

interface LogEntry {
	id: string;
	reminderId: string;
	action: string;
	at: number;
	text?: string;
	snoozeForMinutes?: number;
}

interface EditingGroup {
	id: string;
	title: string;
	interval: number;
	color: string;
}

interface DueGroupItem {
	group: ReminderGroup;
	item: ReminderGroupItem;
}

// Store interface
interface AppState {
	// Core data
	groups: ReminderGroup[];
	logEntries: LogEntry[];
	score: number;
	nowTs: number;

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

	// Settings states
	selectedSoundId: string;
	showActivityLog: boolean;
	activityLogLimit: number;

	// App states
	wakeLockSupported: boolean;

	// Actions
	setGroups: (groups: ReminderGroup[]) => void;
	setLogEntries: (entries: LogEntry[]) => void;
	setScore: (score: number) => void;
	setNowTs: (timestamp: number) => void;

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

	setSelectedSoundId: (soundId: string) => void;
	setShowActivityLog: (show: boolean) => void;
	setActivityLogLimit: (limit: number) => void;

	setWakeLockSupported: (supported: boolean) => void;

	// Helper actions for complex updates
	updateGroup: (groupId: string, update: Partial<ReminderGroup>) => void;
	updateGroupItem: (
		groupId: string,
		itemId: string,
		update: Partial<ReminderGroupItem>,
	) => void;
	addGroup: (group: ReminderGroup) => void;
	removeGroup: (groupId: string) => void;
	addLogEntry: (entry: LogEntry) => void;
	incrementScore: () => void;
	completeGroupItem: (groupId: string, itemId: string) => void;
	toggleGroupItemEnabled: (groupId: string, itemId: string) => void;
	deleteGroupItem: (groupId: string, itemId: string) => void;
	moveGroup: (groupId: string, direction: -1 | 1) => void;
	toggleGroupEnabled: (groupId: string) => void;
	snoozeGroup: (groupId: string, minutes: number) => void;

	// Computed values
	isAnyModalOpen: () => boolean;
}

// Storage functions (import these from your existing code)
const GROUPS_STORAGE_KEY = "zuza-reminders:groups:v1";
const LOG_STORAGE_KEY = "zuza-reminders:log:v1";
const SCORE_STORAGE_KEY = "zuza-reminders:score:v1";
const SOUND_STORAGE_KEY = "zuza-reminders:sound:v1";

function loadGroups(): ReminderGroup[] {
	try {
		const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function loadLog(): LogEntry[] {
	try {
		const raw = localStorage.getItem(LOG_STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function loadScore(): number {
	try {
		const raw = localStorage.getItem(SCORE_STORAGE_KEY);
		return raw ? Number.parseInt(raw, 10) || 0 : 0;
	} catch {
		return 0;
	}
}

function loadSelectedSoundId(): string {
	try {
		const raw = localStorage.getItem(SOUND_STORAGE_KEY);
		return raw || DEFAULT_SOUND_ID;
	} catch {
		return DEFAULT_SOUND_ID;
	}
}

function loadShowActivityLog(): boolean {
	try {
		const raw = localStorage.getItem("showActivityLog");
		return raw ? raw === "true" : true; // Default to showing activity log
	} catch {
		return true;
	}
}

function loadActivityLogLimit(): number {
	try {
		const raw = localStorage.getItem("activityLogLimit");
		return raw ? Number.parseInt(raw, 10) : 25; // Default to 25 items
	} catch {
		return 25;
	}
}

function saveGroups(groups: ReminderGroup[]) {
	localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
}

function saveLog(entries: LogEntry[]) {
	localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(entries));
}

function saveScore(score: number) {
	localStorage.setItem(SCORE_STORAGE_KEY, score.toString());
}

function saveSelectedSoundId(soundId: string) {
	localStorage.setItem(SOUND_STORAGE_KEY, soundId);
}

function saveShowActivityLog(show: boolean) {
	localStorage.setItem("showActivityLog", show.toString());
}

function saveActivityLogLimit(limit: number) {
	localStorage.setItem("activityLogLimit", limit.toString());
}

function now(): number {
	return Date.now();
}

export function uid(): string {
	return Math.random().toString(36).substr(2, 9);
}

// Create the store
export const useAppStore = create<AppState>()((set, get) => ({
	// Initial state
	groups: loadGroups(),
	logEntries: loadLog(),
	score: loadScore(),
	nowTs: now(),

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

	selectedSoundId: loadSelectedSoundId(),
	showActivityLog: loadShowActivityLog(),
	activityLogLimit: loadActivityLogLimit(),

	wakeLockSupported: false,

	// Actions
	setGroups: (groups) => {
		set({ groups });
		saveGroups(groups);
	},

	setLogEntries: (logEntries) => {
		set({ logEntries });
		saveLog(logEntries);
	},

	setScore: (score) => {
		set({ score });
		saveScore(score);
	},

	setNowTs: (nowTs) => set({ nowTs }),

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

	setWakeLockSupported: (wakeLockSupported) => set({ wakeLockSupported }),

	// Helper actions for complex updates
	updateGroup: (groupId, update) => {
		const state = get();
		const updatedGroups = state.groups.map((g) =>
			g.id === groupId ? { ...g, ...update } : g,
		);
		set({ groups: updatedGroups });
		saveGroups(updatedGroups);
	},

	updateGroupItem: (groupId, itemId, update) => {
		const state = get();
		const updatedGroups = state.groups.map((g) =>
			g.id === groupId
				? {
						...g,
						items: g.items.map((i) =>
							i.id === itemId ? { ...i, ...update } : i,
						),
					}
				: g,
		);
		set({ groups: updatedGroups });
		saveGroups(updatedGroups);
	},

	addGroup: (group) => {
		const state = get();
		const updatedGroups = [group, ...state.groups];
		set({ groups: updatedGroups });
		saveGroups(updatedGroups);
	},

	removeGroup: (groupId) => {
		const state = get();
		const updatedGroups = state.groups.filter((g) => g.id !== groupId);
		set({ groups: updatedGroups });
		saveGroups(updatedGroups);
	},

	addLogEntry: (entry) => {
		const state = get();
		const updatedEntries = [entry, ...state.logEntries];
		set({ logEntries: updatedEntries });
		saveLog(updatedEntries);
	},

	incrementScore: () => {
		const state = get();
		const newScore = state.score + 1;
		set({ score: newScore });
		saveScore(newScore);
	},

	// Complex operations
	completeGroupItem: (groupId: string, itemId: string) => {
		const state = get();
		const updatedGroups = state.groups.map((g) => {
			if (g.id !== groupId) return g;

			// Find the current item and mark it as completed
			const itemIndex = g.items.findIndex((i) => i.id === itemId);
			if (itemIndex === -1) return g;

			const updatedItems = g.items.map((i) =>
				i.id === itemId ? { ...i, lastShownAt: now() } : i,
			);

			// Calculate next item index (cycle through enabled items)
			const enabledItems = updatedItems.filter((i) => i.enabled ?? true);
			if (enabledItems.length === 0) return { ...g, items: updatedItems };

			const currentEnabledIndex = enabledItems.findIndex(
				(i) => i.id === itemId,
			);
			const nextEnabledIndex = (currentEnabledIndex + 1) % enabledItems.length;
			const nextItem = enabledItems[nextEnabledIndex];

			const nextItemIndex = updatedItems.findIndex((i) => i.id === nextItem.id);

			return {
				...g,
				items: updatedItems,
				currentItemIndex: nextItemIndex,
				nextDueTime: now() + g.intervalMinutes * 60_000,
				// Clear snooze status when completing an item
				snoozedAt: undefined,
				snoozedForMinutes: undefined,
			};
		});

		set({ groups: updatedGroups });
		saveGroups(updatedGroups);
	},

	toggleGroupItemEnabled: (groupId, itemId) => {
		const state = get();
		const updatedGroups = state.groups.map((g) => {
			if (g.id !== groupId) return g;

			const updatedItems = g.items.map((i) =>
				i.id === itemId ? { ...i, enabled: !(i.enabled ?? true) } : i,
			);

			// If this was the current item and it got disabled, advance to next enabled item
			const currentItem = g.items[g.currentItemIndex];
			if (currentItem?.id === itemId && !(currentItem.enabled ?? true)) {
				const enabledItems = updatedItems.filter((i) => i.enabled ?? true);
				if (enabledItems.length > 0) {
					const nextItemIndex = updatedItems.findIndex(
						(i) => i.id === enabledItems[0].id,
					);
					return { ...g, items: updatedItems, currentItemIndex: nextItemIndex };
				}
			}

			return { ...g, items: updatedItems };
		});

		set({ groups: updatedGroups });
		saveGroups(updatedGroups);
	},

	deleteGroupItem: (groupId, itemId) => {
		const state = get();
		const updatedGroups = state.groups.map((g) =>
			g.id === groupId
				? { ...g, items: g.items.filter((i) => i.id !== itemId) }
				: g,
		);
		set({ groups: updatedGroups });
		saveGroups(updatedGroups);
	},

	moveGroup: (groupId, direction) => {
		const state = get();
		const idx = state.groups.findIndex((g) => g.id === groupId);
		if (idx < 0) return;
		const nextIdx = idx + direction;
		if (nextIdx < 0 || nextIdx >= state.groups.length) return;
		const copy = [...state.groups];
		const [group] = copy.splice(idx, 1);
		copy.splice(nextIdx, 0, group);
		set({ groups: copy });
		saveGroups(copy);
	},

	toggleGroupEnabled: (groupId) => {
		const state = get();
		const updatedGroups = state.groups.map((g) => {
			if (g.id !== groupId) return g;

			const currentTime = Date.now();
			const isCurrentlyEnabled = g.enabled ?? true;

			if (isCurrentlyEnabled) {
				// Disabling: pause the current timer
				const remainingMs = Math.max(0, g.nextDueTime - currentTime);
				return { ...g, enabled: false, pausedRemainingMs: remainingMs };
			}
			// Enabling: resume the timer
			const resumeTime = g.pausedRemainingMs
				? currentTime + g.pausedRemainingMs
				: currentTime + g.intervalMinutes * 60_000;
			return {
				...g,
				enabled: true,
				nextDueTime: resumeTime,
				pausedRemainingMs: undefined,
			};
		});

		set({ groups: updatedGroups });
		saveGroups(updatedGroups);
	},

	snoozeGroup: (groupId, minutes) => {
		const state = get();
		const currentTime = Date.now();
		const updatedGroups = state.groups.map((g) =>
			g.id === groupId
				? {
						...g,
						nextDueTime: currentTime + minutes * 60_000,
						snoozedAt: currentTime,
						snoozedForMinutes: minutes,
					}
				: g,
		);
		set({ groups: updatedGroups });
		saveGroups(updatedGroups);
	},

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
}));

// Export types for use in components
export type {
	ReminderGroup,
	ReminderGroupItem,
	LogEntry,
	EditingGroup,
	DueGroupItem,
};
