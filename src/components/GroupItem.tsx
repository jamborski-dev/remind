import { FaCheck, FaClock, FaTrash } from "react-icons/fa6";
import { type ReminderGroup, type ReminderGroupItem, uid } from "../store";
import { formatShortDistance, formatTime } from "../utils/time";
import {
	CountdownBadge,
	DueText,
	GroupActionsButton,
	GroupItemMainRow,
	GroupItemMeta,
	GroupItemRow,
	GroupItemSecondaryRow,
	GroupItemText,
	ItemTitleSpan,
	ResponsiveButtonGroup,
	StatusBadge,
	ToggleSwitch,
} from "./ReminderApp.styled";

interface GroupItemProps {
	item: ReminderGroupItem;
	group: ReminderGroup;
	isCurrentItem: boolean;
	nowTs: number;
	idx: number;
	completeGroupItem: (groupId: string, itemId: string) => void;
	toggleGroupItemEnabled: (groupId: string, itemId: string) => void;
	deleteGroupItem: (groupId: string, itemId: string) => void;
	storeSnoozeGroup: (groupId: string, minutes: number) => void;
	storeAddLogEntry: (entry: {
		id: string;
		reminderId: string;
		action: string;
		at: number;
		text?: string;
		snoozeForMinutes?: number;
	}) => void;
}

export const GroupItem = ({
	item,
	group,
	isCurrentItem,
	nowTs,
	idx,
	completeGroupItem,
	toggleGroupItemEnabled,
	deleteGroupItem,
	storeSnoozeGroup,
	storeAddLogEntry,
}: GroupItemProps) => {
	const isGroupDue = group.nextDueTime <= nowTs;

	return (
		<GroupItemRow
			key={item.id}
			layoutId={item.id}
			layout="position"
			$enabled={item.enabled ?? true}
			transition={{
				layout: {
					duration: 0.4,
					ease: [0.4, 0.0, 0.2, 1], // Custom cubic-bezier for smooth motion
				},
				opacity: {
					duration: 0.3,
					ease: "easeInOut",
				},
				scale: {
					duration: 0.3,
					ease: "easeInOut",
				},
			}}
			initial={{
				opacity: 0,
				scale: 0.9,
				y: 20,
			}}
			animate={{
				opacity: 1,
				scale: 1,
				y: 0,
				transition: {
					duration: 0.3,
					ease: "easeOut",
					delay: idx * 0.05, // Stagger effect
				},
			}}
			exit={{
				opacity: 0,
				scale: 0.8,
				y: -20,
				transition: {
					duration: 0.2,
					ease: "easeIn",
				},
			}}
		>
			<GroupItemMainRow>
				<GroupItemText $enabled={item.enabled ?? true}>
					<ItemTitleSpan>{item.title}</ItemTitleSpan>
					{isCurrentItem &&
						(item.enabled ?? true) &&
						(group.enabled ?? true) &&
						(() => {
							// Check if recently snoozed (within 30 seconds of snooze action)
							const recentlySnoozeThreshold = 30 * 1000; // 30 seconds
							const isRecentlySnooze =
								group.snoozedAt &&
								nowTs - group.snoozedAt < recentlySnoozeThreshold;

							if (isRecentlySnooze && group.snoozedForMinutes) {
								return (
									<StatusBadge
										$isDue={false}
										style={{
											backgroundColor: "#fbbf24",
											color: "#92400e",
										}}
									>
										Snoozed {group.snoozedForMinutes}m
									</StatusBadge>
								);
							}

							return (
								<StatusBadge $isDue={isGroupDue}>
									{isGroupDue ? "Due now" : "Due next"}
								</StatusBadge>
							);
						})()}
					<GroupItemMeta>
						{isCurrentItem &&
							(() => {
								if (!(group.enabled ?? true)) {
									return (
										<CountdownBadge $isDue={false} $isPaused={true}>
											paused
										</CountdownBadge>
									);
								}
								if (!(item.enabled ?? true)) {
									return (
										<CountdownBadge $isDue={false} $isPaused={true}>
											paused
										</CountdownBadge>
									);
								}
								const diff = group.nextDueTime - nowTs;
								return diff <= 0 ? (
									<DueText>due now</DueText>
								) : (
									<>at {formatTime(group.nextDueTime)}</>
								);
							})()}
					</GroupItemMeta>
				</GroupItemText>
			</GroupItemMainRow>
			<GroupItemSecondaryRow>
				<GroupItemMeta>
					<strong>Last: </strong>{" "}
					{item.lastShownAt
						? formatShortDistance(item.lastShownAt)
						: "never"}{" "}
				</GroupItemMeta>
				{/* GroupItemButtonGroup replaced with ResponsiveButtonGroup */}
				<ResponsiveButtonGroup alignItems="center">
					<GroupActionsButton
						type="button"
						$variant="success"
						title="Mark complete"
						onClick={() => completeGroupItem(group.id, item.id)}
					>
						<FaCheck />
					</GroupActionsButton>

					<GroupActionsButton
						type="button"
						$variant="warn"
						title="Snooze 5 minutes"
						onClick={() => {
							storeSnoozeGroup(group.id, 5);
							// Add log entry for snooze action
							storeAddLogEntry({
								id: uid(),
								reminderId: item.id,
								action: "snooze",
								at: Date.now(),
								text: item.title,
								snoozeForMinutes: 5,
							});
						}}
					>
						<FaClock style={{ marginRight: "4px" }} />
						5M
					</GroupActionsButton>

					<ToggleSwitch
						$enabled={item.enabled ?? true}
						onClick={() => toggleGroupItemEnabled(group.id, item.id)}
						title={(item.enabled ?? true) ? "Disable item" : "Enable item"}
					/>

					<GroupActionsButton
						type="button"
						$variant="danger"
						onClick={() => deleteGroupItem(group.id, item.id)}
						title="Delete item"
					>
						<FaTrash color="#fff" />
					</GroupActionsButton>
				</ResponsiveButtonGroup>
			</GroupItemSecondaryRow>
		</GroupItemRow>
	);
};
