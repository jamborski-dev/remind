import { getSoundConfig, playSound } from "../constants/sounds";
import {
	type LogEntry,
	type ReminderGroup,
	type ReminderGroupItem,
	uid,
} from "../store";
import { isSameLocalDay } from "./time";

// ---- Group Item Management Actions ----

export const addGroupItem =
	(
		groupItems: ReminderGroupItem[],
		setGroupItems: (items: ReminderGroupItem[]) => void,
	) =>
	() => {
		const newItem: ReminderGroupItem = {
			id: uid(),
			title: "",
			enabled: true,
			createdAt: Date.now(),
		};
		setGroupItems([...groupItems, newItem]);
	};

export const removeGroupItem =
	(
		groupItems: ReminderGroupItem[],
		setGroupItems: (items: ReminderGroupItem[]) => void,
	) =>
	(id: string) => {
		// Keep at least one item in the group
		const newItems =
			groupItems.length > 1
				? groupItems.filter((i) => i.id !== id)
				: groupItems;
		setGroupItems(newItems);
	};

export const updateGroupItem =
	(
		groupItems: ReminderGroupItem[],
		setGroupItems: (items: ReminderGroupItem[]) => void,
	) =>
	(id: string, title: string) => {
		const newItems = groupItems.map((i) => (i.id === id ? { ...i, title } : i));
		setGroupItems(newItems);
	};

export const moveGroupItem =
	(
		groupItems: ReminderGroupItem[],
		setGroupItems: (items: ReminderGroupItem[]) => void,
	) =>
	(id: string, direction: -1 | 1) => {
		const idx = groupItems.findIndex((i) => i.id === id);
		if (idx < 0) return;
		const nextIdx = idx + direction;
		if (nextIdx < 0 || nextIdx >= groupItems.length) return;
		const copy = [...groupItems];
		const [item] = copy.splice(idx, 1);
		copy.splice(nextIdx, 0, item);
		setGroupItems(copy);
	};

// ---- Group Management Actions ----

export const startEditingGroup = (
	group: ReminderGroup,
	setEditingGroup: (group: ReminderGroup | null) => void,
	setGroupTitle: (title: string) => void,
	setGroupInterval: (interval: number) => void,
	setGroupColor: (color: string) => void,
	setGroupItems: (items: ReminderGroupItem[]) => void,
) => {
	setEditingGroup(group);
	setGroupTitle(group.title);
	setGroupInterval(group.intervalMinutes);
	setGroupColor(group.color);
	setGroupItems(group.items || []);
};

export const saveGroupEdit = (
	editingGroup: ReminderGroup | null,
	groupTitle: string,
	groupInterval: number,
	groupColor: string,
	groupItems: ReminderGroupItem[],
	storeUpdateGroup: (group: ReminderGroup) => void,
	setEditingGroup: (group: ReminderGroup | null) => void,
) => {
	if (!editingGroup) return;

	const updatedGroup: ReminderGroup = {
		...editingGroup,
		title: groupTitle,
		intervalMinutes: groupInterval,
		color: groupColor,
		items: groupItems.filter((item) => item.title.trim()),
	};
	storeUpdateGroup(updatedGroup);
	setEditingGroup(null);
};

export const cancelGroupEdit = (
	setEditingGroup: (group: ReminderGroup | null) => void,
) => {
	setEditingGroup(null);
};

export const deleteGroup = (
	group: ReminderGroup,
	storeRemoveGroup: (id: string) => void,
	setGroupToDelete: (group: ReminderGroup | null) => void,
) => {
	storeRemoveGroup(group.id);
	setGroupToDelete(null);
};

export const moveGroup =
	(storeMoveGroup: (groupId: string, direction: -1 | 1) => void) =>
	(groupId: string, direction: -1 | 1) => {
		storeMoveGroup(groupId, direction);
	};

export const toggleGroupEnabled =
	(storeToggleGroupEnabled: (groupId: string) => void) => (groupId: string) => {
		storeToggleGroupEnabled(groupId);
	};

export const submitGroup = (
	groupItems: ReminderGroupItem[],
	editingGroup: ReminderGroup | null,
	groupTitle: string,
	groupInterval: number,
	groupColor: string,
	storeAddGroup: (group: ReminderGroup) => void,
	storeUpdateGroup: (group: ReminderGroup) => void,
	setEditingGroup: (group: ReminderGroup | null) => void,
	setGroupTitle: (title: string) => void,
	setGroupInterval: (interval: number) => void,
	setGroupColor: (color: string) => void,
	setGroupItems: (items: ReminderGroupItem[]) => void,
	setFormExpanded: (expanded: boolean) => void,
) => {
	const titles = groupItems.map((i) => i.title.trim()).filter(Boolean);
	if (!groupTitle.trim() || !titles.length) return;

	if (editingGroup) {
		// Update existing group
		const updatedGroup: ReminderGroup = {
			...editingGroup,
			title: groupTitle,
			intervalMinutes: groupInterval,
			color: groupColor,
			items: groupItems.filter((item) => item.title.trim()),
		};
		storeUpdateGroup(updatedGroup);
		setEditingGroup(null);
	} else {
		// Add new group
		const newGroup: ReminderGroup = {
			id: uid(),
			title: groupTitle,
			intervalMinutes: groupInterval,
			color: groupColor,
			items: titles.map((title) => ({
				id: uid(),
				title,
				enabled: true,
				createdAt: Date.now(),
			})),
			createdAt: Date.now(),
			enabled: true,
			currentItemIndex: 0,
			nextDueTime: Date.now() + groupInterval * 60 * 1000,
		};
		storeAddGroup(newGroup);
	}

	// Reset form
	setGroupTitle("");
	setGroupInterval(60); // 1 hour default in minutes
	setGroupColor("#4f46e5");
	setGroupItems([]);
	setFormExpanded(false);
};

// ---- Group Item Actions ----

export const completeGroupItem = (
	groupId: string,
	itemId: string,
	groups: ReminderGroup[],
	selectedSoundId: string,
	storeCompleteGroupItem: (groupId: string, itemId: string) => void,
	storeAddLogEntry: (entry: {
		id: string;
		reminderId: string;
		action: string;
		at: number;
		text?: string;
	}) => void,
	pendingScoreRef: React.MutableRefObject<string | null>,
) => {
	// Find the group and check if this completes a loop before updating
	const group = groups.find((g) => g.id === groupId);
	if (!group) return;

	const enabledItems = group.items.filter((i) => i.enabled ?? true);
	const currentEnabledIndex = enabledItems.findIndex((i) => i.id === itemId);
	const isLoopCompleted = currentEnabledIndex === enabledItems.length - 1;

	if (isLoopCompleted) {
		pendingScoreRef.current = groupId;
	}

	// Use store action for the update
	storeCompleteGroupItem(groupId, itemId);

	// Add log entry
	const item = group.items.find((i) => i.id === itemId);
	if (item) {
		const soundConfig = getSoundConfig(selectedSoundId);
		playSound(soundConfig);

		storeAddLogEntry({
			id: uid(),
			reminderId: item.id,
			action: "done",
			at: Date.now(),
			text: item.title,
		});
	}
};

export const toggleGroupItemEnabled =
	(storeToggleGroupItemEnabled: (groupId: string, itemId: string) => void) =>
	(groupId: string, itemId: string) => {
		storeToggleGroupItemEnabled(groupId, itemId);
	};

export const deleteGroupItem =
	(storeDeleteGroupItem: (groupId: string, itemId: string) => void) =>
	(groupId: string, itemId: string) => {
		storeDeleteGroupItem(groupId, itemId);
	};

// ---- Pure Utility Functions ----

export const getGroupColorForReminder = (
	reminderId: string,
	groups: ReminderGroup[],
): string => {
	for (const group of groups) {
		const item = group.items.find((item) => item.id === reminderId);
		if (item) return group.color;
	}
	return "#4f46e5"; // Default color
};

export const getSortedGroupItems = (groupItems: ReminderGroupItem[]) => {
	if (!groupItems?.length) return { enabledItems: [], disabledItems: [] };

	const enabledItems = groupItems.filter((item) => item.enabled !== false);
	const disabledItems = groupItems.filter((item) => item.enabled === false);

	return { enabledItems, disabledItems };
};

// ---- Activity Management Actions ----

export const clearTodaysActivity = (
	logEntries: LogEntry[],
	setLogEntries: (entries: LogEntry[]) => void,
	setActivityLogPage: (page: number) => void,
) => {
	const current = Date.now();
	const filteredEntries = logEntries.filter((entry) => {
		// Check if entry has 'at' field for date comparison (store LogEntry format)
		const entryTime = entry.at;
		return !isSameLocalDay(entryTime, current);
	});
	setLogEntries(filteredEntries);
	setActivityLogPage(0);
};

// ---- Development/Admin Actions ----

/**
 * Builds seed groups for development/demo purposes.
 * NOTE: Should only be used in development environment or explicit admin actions.
 * Do not auto-call in production when storage is empty.
 */
export const buildSeedGroups = (creationTime: number): ReminderGroup[] => {
	const mkItems = (titles: string[]): ReminderGroupItem[] =>
		titles.map((title) => ({
			id: uid(),
			title,
			enabled: true,
			createdAt: creationTime,
		}));

	return [
		{
			id: uid(),
			title: "Health & Wellness",
			intervalMinutes: 5, // 5 minutes for dev testing
			color: "#10b981",
			items: mkItems([
				"Drink water",
				"Take deep breaths",
				"Stretch or move",
				"Check posture",
			]),
			createdAt: creationTime,
			enabled: true,
			currentItemIndex: 0,
			nextDueTime: creationTime + 5 * 60 * 1000,
		},
		{
			id: uid(),
			title: "Focus & Productivity",
			intervalMinutes: 3, // 3 minutes for dev testing
			color: "#3b82f6",
			items: mkItems([
				"Review priorities",
				"Clear desk space",
				"Take a short break",
				"Plan next steps",
			]),
			createdAt: creationTime + 1,
			enabled: true,
			currentItemIndex: 0,
			nextDueTime: creationTime + 3 * 60 * 1000,
		},
		{
			id: uid(),
			title: "Social Connection",
			intervalMinutes: 8, // 8 minutes for dev testing
			color: "#8b5cf6",
			items: mkItems([
				"Send a message to someone",
				"Make a quick call",
				"Share something positive",
				"Express gratitude",
			]),
			createdAt: creationTime + 2,
			enabled: true,
			currentItemIndex: 0,
			nextDueTime: creationTime + 8 * 60 * 1000,
		},
	];
};

export const reseedDev = (
	setGroups: (groups: ReminderGroup[]) => void,
	setLogEntries: (entries: LogEntry[]) => void,
	setScore: (score: number) => void,
) => {
	const seedGroups = buildSeedGroups(Date.now());
	setGroups(seedGroups);
	setLogEntries([]);
	setScore(0);
};

// ---- Wake Lock Actions ----

export const acquireWakeLock = async (
	wakeLockRef: React.MutableRefObject<WakeLockSentinel | null>,
) => {
	if (!("wakeLock" in navigator)) return;

	try {
		wakeLockRef.current = await navigator.wakeLock.request("screen");
	} catch (err) {
		console.error("Failed to acquire wake lock:", err);
	}
};

export const releaseWakeLock = async (
	wakeLockRef: React.MutableRefObject<WakeLockSentinel | null>,
) => {
	if (wakeLockRef.current) {
		try {
			await wakeLockRef.current.release();
			wakeLockRef.current = null;
		} catch (err) {
			console.error("Failed to release wake lock:", err);
		}
	}
};
