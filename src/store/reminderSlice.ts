import type { StateCreator } from "zustand";
import {
	loadGroups,
	loadLog,
	loadScore,
	now,
	saveGroups,
	saveLog,
	saveScore,
} from "./storage";
import type { LogEntry, ReminderGroup, ReminderGroupItem } from "./types";

export interface ReminderSlice {
	// Core data
	groups: ReminderGroup[];
	logEntries: LogEntry[];
	score: number;

	// Actions
	setGroups: (groups: ReminderGroup[]) => void;
	setLogEntries: (entries: LogEntry[]) => void;
	setScore: (score: number) => void;

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
}

export const createReminderSlice: StateCreator<
	ReminderSlice,
	[],
	[],
	ReminderSlice
> = (set, get) => ({
	// Initial state
	groups: loadGroups(),
	logEntries: loadLog(),
	score: loadScore(),

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
});
