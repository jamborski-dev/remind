import { useCompleteGroupItem } from "../hooks/useCompleteGroupItem";
import { useAppStore } from "../store";
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

		// Store actions
		snoozeGroup: storeSnoozeGroup,
		addLogEntry: storeAddLogEntry,
	} = useAppStore();

	// Use the complete group item hook
	const { completeGroupItem } = useCompleteGroupItem();

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
