import { useMemo } from "react";
import type { DueGroupItem, ReminderGroup } from "../store";

export function useModalState(
	dueGroupItem: DueGroupItem | null,
	groupToDelete: ReminderGroup | null,
	showSettingsModal: boolean,
) {
	const anyModalOpen = useMemo(
		() => !!(dueGroupItem || groupToDelete || showSettingsModal),
		[dueGroupItem, groupToDelete, showSettingsModal],
	);

	return {
		anyModalOpen,
	};
}
