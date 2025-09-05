import { useCallback } from "react";
import { getSoundConfig, playSound } from "../constants/sounds";
import { useAppStore } from "../store";
import { uid } from "../utils/helpers";

/**
 * Hook that provides a complete group item function with scoring, logging, and sound
 */
export function useCompleteGroupItem() {
	const {
		// Core data
		groups,
		selectedSoundId,

		// Store actions
		completeGroupItem: storeCompleteGroupItem,
		addLogEntry: storeAddLogEntry,
		incrementScore,
	} = useAppStore();

	const completeGroupItem = useCallback(
		(groupId: string, itemId: string) => {
			// Find the group and item
			const group = groups.find((g) => g.id === groupId);
			if (!group) return;

			const item = group.items.find((i) => i.id === itemId);
			if (!item) return;

			// Check if this completes a loop (for scoring)
			const enabledItems = group.items.filter((i) => i.enabled ?? true);
			const currentEnabledIndex = enabledItems.findIndex(
				(i) => i.id === itemId,
			);
			const isLoopCompleted = currentEnabledIndex === enabledItems.length - 1;

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

			// Award score if loop completed
			if (isLoopCompleted) {
				incrementScore();
			}
		},
		[
			groups,
			selectedSoundId,
			storeCompleteGroupItem,
			storeAddLogEntry,
			incrementScore,
		],
	);

	return { completeGroupItem };
}
