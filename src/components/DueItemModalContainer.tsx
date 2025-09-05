import { getSoundConfig, playSound } from "../constants/sounds";
import { useAppStore } from "../store";
import { uid } from "../utils/helpers";
import { DueItemModal } from "./DueItemModal";

/**
 * Container component that handles store access for DueItemModal
 * This eliminates prop drilling by accessing store directly
 */
export const DueItemModalContainer = () => {
	const {
		// Core data
		dueGroupItem,
		setDueGroupItem,
		logEntries,
		selectedSoundId,
		groups,

		// Store actions
		snoozeGroup: storeSnoozeGroup,
		addLogEntry: storeAddLogEntry,
		completeGroupItem: storeCompleteGroupItem,
	} = useAppStore();

	// Complete group item with sound and logging
	const completeGroupItem = (groupId: string, itemId: string) => {
		// Find the group and item
		const group = groups.find((g) => g.id === groupId);
		if (!group) return;

		const item = group.items.find((i) => i.id === itemId);
		if (!item) return;

		// Play sound
		const soundConfig = getSoundConfig(selectedSoundId);
		playSound(soundConfig);

		// Use store action for the update
		storeCompleteGroupItem(groupId, itemId);

		// Add log entry
		storeAddLogEntry({
			id: uid(),
			reminderId: item.id,
			action: "done",
			at: Date.now(),
			text: item.title,
		});
	};

	return (
		<DueItemModal
			dueGroupItem={dueGroupItem}
			setDueGroupItem={setDueGroupItem}
			logEntries={logEntries}
			completeGroupItem={completeGroupItem}
			storeSnoozeGroup={storeSnoozeGroup}
			storeAddLogEntry={storeAddLogEntry}
		/>
	);
};
