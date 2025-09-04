import { useMemo } from "react";
import { type ReminderGroup, useAppStore } from "../store";
import { Group } from "./Group";

interface GroupContainerProps {
	group: ReminderGroup;
	idx: number;
	totalGroups: number;
	nowTs: number;
}

/**
 * Container component that handles store access for Group
 * This eliminates prop drilling by accessing store directly
 */
export const GroupContainer = ({
	group,
	idx,
	totalGroups,
	nowTs,
}: GroupContainerProps) => {
	const {
		// Form states needed for editing
		editingGroup,
		setEditingGroup,
		setGroupToDelete,
		groupTitle,
		groupInterval,
		groupColor,
		setGroupTitle,
		setGroupInterval,
		setGroupColor,

		// Store actions for group operations
		moveGroup: storeMoveGroup,
		toggleGroupEnabled: storeToggleGroupEnabled,
		snoozeGroup: storeSnoozeGroup,
		addLogEntry: storeAddLogEntry,
		completeGroupItem: storeCompleteGroupItem,
		toggleGroupItemEnabled: storeToggleGroupItemEnabled,
		deleteGroupItem: storeDeleteGroupItem,
		updateGroup: storeUpdateGroup,
	} = useAppStore();

	// Helper functions moved from ReminderApp
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
			if (enabledCurrentIndex > 0) {
				const rotatedEnabled = [
					...enabledItems.slice(enabledCurrentIndex),
					...enabledItems.slice(0, enabledCurrentIndex),
				];
				return [...rotatedEnabled, ...disabledItems];
			}

			return [...enabledItems, ...disabledItems];
		};
	}, []);

	const startEditingGroup = (group: ReminderGroup) => {
		setEditingGroup({
			id: group.id,
			title: group.title,
			interval: group.intervalMinutes,
			color: group.color,
		});
		setGroupTitle(group.title);
		setGroupInterval(group.intervalMinutes);
		setGroupColor(group.color);
	};

	const saveGroupEdit = () => {
		if (!editingGroup) return;

		storeUpdateGroup(editingGroup.id, {
			title: groupTitle,
			intervalMinutes: groupInterval,
			color: groupColor,
		});
		setEditingGroup(null);
	};

	const cancelGroupEdit = () => {
		setEditingGroup(null);
	};

	return (
		<Group
			group={group}
			idx={idx}
			totalGroups={totalGroups}
			nowTs={nowTs}
			editingGroup={editingGroup}
			setEditingGroup={setEditingGroup}
			getSortedGroupItems={getSortedGroupItems}
			startEditingGroup={startEditingGroup}
			saveGroupEdit={saveGroupEdit}
			cancelGroupEdit={cancelGroupEdit}
			moveGroup={storeMoveGroup}
			toggleGroupEnabled={storeToggleGroupEnabled}
			setGroupToDelete={setGroupToDelete}
			completeGroupItem={storeCompleteGroupItem}
			toggleGroupItemEnabled={storeToggleGroupItemEnabled}
			deleteGroupItem={storeDeleteGroupItem}
			storeSnoozeGroup={storeSnoozeGroup}
			storeAddLogEntry={storeAddLogEntry}
		/>
	);
};
