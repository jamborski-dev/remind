import { useEffect } from "react";
import type { ReminderGroup, ReminderGroupItem } from "../store";
import { GRACE_MS } from "../utils/helpers";

interface DueGroupItem {
	group: ReminderGroup;
	item: ReminderGroupItem;
}

interface UseGroupSchedulerProps {
	groups: ReminderGroup[];
	anyModalOpen: boolean;
	setDueGroupItem: (item: DueGroupItem | null) => void;
}

/**
 * Custom hook to handle group scheduling logic
 * Checks for due groups and schedules future reminders
 */
export const useGroupScheduler = ({
	groups,
	anyModalOpen,
	setDueGroupItem,
}: UseGroupSchedulerProps) => {
	useEffect(() => {
		// If any modal is open (including due modal), don't schedule new timers
		if (anyModalOpen) {
			return;
		}

		const current = Date.now();

		// Find any group that's due within grace period
		const dueGroups = groups
			.filter((group) => group.enabled ?? true) // Filter out disabled groups
			.filter((group) => group.items.some((item) => item.enabled !== false))
			.filter((group) => current + GRACE_MS >= group.nextDueTime)
			.sort((a, b) => a.nextDueTime - b.nextDueTime);

		if (dueGroups.length > 0) {
			const group = dueGroups[0];
			// Find the next enabled item starting from currentItemIndex
			const enabledItems = group.items.filter((item) => item.enabled !== false);
			if (enabledItems.length > 0) {
				// Find the current enabled item or fallback to the first enabled item
				let nextEnabledItem = group.items[group.currentItemIndex];
				if (!nextEnabledItem?.enabled) {
					// Current item is disabled, find next enabled item
					const currentItemInEnabledList = enabledItems.find(
						(item) => item.id === group.items[group.currentItemIndex]?.id,
					);
					nextEnabledItem = currentItemInEnabledList || enabledItems[0];
				}
				setDueGroupItem({ group, item: nextEnabledItem });
				return;
			}
		}

		// Nothing due now; schedule the soonest future group
		const futureGroup = groups
			.filter((group) => group.enabled ?? true) // Filter out disabled groups
			.filter((group) => group.items.some((item) => item.enabled !== false))
			.sort((a, b) => a.nextDueTime - b.nextDueTime)[0];

		if (futureGroup) {
			const delay = Math.max(0, futureGroup.nextDueTime - current);
			const timeoutId = window.setTimeout(() => {
				// Find the next enabled item starting from currentItemIndex
				const enabledItems = futureGroup.items.filter(
					(item) => item.enabled !== false,
				);
				if (enabledItems.length > 0) {
					// Find the current enabled item or fallback to the first enabled item
					let nextEnabledItem = futureGroup.items[futureGroup.currentItemIndex];
					if (!nextEnabledItem?.enabled) {
						// Current item is disabled, find next enabled item
						const currentItemInEnabledList = enabledItems.find(
							(item) =>
								item.id === futureGroup.items[futureGroup.currentItemIndex]?.id,
						);
						nextEnabledItem = currentItemInEnabledList || enabledItems[0];
					}
					setDueGroupItem({ group: futureGroup, item: nextEnabledItem });
				}
			}, delay);

			return () => clearTimeout(timeoutId);
		}
	}, [groups, anyModalOpen, setDueGroupItem]);
};
