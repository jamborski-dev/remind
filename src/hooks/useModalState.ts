import { useMemo } from "react";
import type { TierInfo } from "../scoring-messages";
import type { DueGroupItem, ReminderGroup } from "../store";

export function useModalState(
	dueGroupItem: DueGroupItem | null,
	groupToDelete: ReminderGroup | null,
	showFirstPointModal: boolean,
	tierUpgradeModal: TierInfo | null,
	showSettingsModal: boolean,
) {
	const anyModalOpen = useMemo(
		() =>
			!!(
				dueGroupItem ||
				groupToDelete ||
				showFirstPointModal ||
				tierUpgradeModal ||
				showSettingsModal
			),
		[
			dueGroupItem,
			groupToDelete,
			showFirstPointModal,
			tierUpgradeModal,
			showSettingsModal,
		],
	);

	return {
		anyModalOpen,
	};
}
