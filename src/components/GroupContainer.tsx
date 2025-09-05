import { useMemo } from "react";
import { useCurrentTime } from "../contexts/TimeContext";
import { useCompleteGroupItem } from "../hooks/useCompleteGroupItem";
import { type ReminderGroup, useAppStore } from "../store";
import { Group } from "./Group";

interface GroupContainerProps {
	group: ReminderGroup;
	idx: number;
	totalGroups: number;
	completeGroupItem?: (groupId: string, itemId: string) => void;
}

/**
 * Container component that handles store access for Group
 * This eliminates prop drilling by accessing store directly
 */
export const GroupContainer = ({
	group,
	idx,
	totalGroups,
	completeGroupItem: propCompleteGroupItem,
}: GroupContainerProps) => {
	// Get current time from context (only this component re-renders when time changes)
	const nowTs = useCurrentTime();

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
		toggleGroupItemEnabled: storeToggleGroupItemEnabled,
		deleteGroupItem: storeDeleteGroupItem,
		updateGroup: storeUpdateGroup,
	} = useAppStore();

	// Use the complete group item hook (with scoring) as the default
	const { completeGroupItem: completeGroupItemWithScoring } =
		useCompleteGroupItem();

	// Use prop complete function if provided, otherwise use the scoring-aware version
	const completeGroupItemFn =
		propCompleteGroupItem ?? completeGroupItemWithScoring;

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
			completeGroupItem={completeGroupItemFn}
			toggleGroupItemEnabled={storeToggleGroupItemEnabled}
			deleteGroupItem={storeDeleteGroupItem}
			storeSnoozeGroup={storeSnoozeGroup}
			storeAddLogEntry={storeAddLogEntry}
		/>
	);
};
