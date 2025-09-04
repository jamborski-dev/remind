import { AnimatePresence } from "motion/react";
import {
	FaArrowDown,
	FaArrowUp,
	FaCheck,
	FaPencil,
	FaTrash,
	FaXmark,
} from "react-icons/fa6";
import type { ReminderGroup, ReminderGroupItem } from "../store";
import { formatCountdown } from "../utils/time";
import { GroupItem } from "./GroupItem";
import {
	Badge,
	ColorPicker,
	CountdownBadge,
	EditableInterval,
	EditableTitle,
	GroupActionsButton,
	GroupCard,
	GroupTitle,
	SmallButton,
	StatusBadge,
	ToggleSwitch,
} from "./ReminderApp.styled";
import { Flex } from "./design-system/layout/Flex";

interface EditingGroup {
	id: string;
	title: string;
	interval: number;
	color: string;
}

interface GroupProps {
	group: ReminderGroup;
	idx: number;
	totalGroups: number;
	nowTs: number;
	editingGroup: EditingGroup | null;
	setEditingGroup: (group: EditingGroup | null) => void;
	getSortedGroupItems: (group: ReminderGroup) => ReminderGroupItem[];
	startEditingGroup: (group: ReminderGroup) => void;
	saveGroupEdit: () => void;
	cancelGroupEdit: () => void;
	moveGroup: (groupId: string, direction: 1 | -1) => void;
	toggleGroupEnabled: (groupId: string) => void;
	setGroupToDelete: (group: ReminderGroup) => void;
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

export const Group = ({
	group,
	idx,
	totalGroups,
	nowTs,
	editingGroup,
	setEditingGroup,
	getSortedGroupItems,
	startEditingGroup,
	saveGroupEdit,
	cancelGroupEdit,
	moveGroup,
	toggleGroupEnabled,
	setGroupToDelete,
	completeGroupItem,
	toggleGroupItemEnabled,
	deleteGroupItem,
	storeSnoozeGroup,
	storeAddLogEntry,
}: GroupProps) => {
	return (
		<GroupCard
			key={group.id}
			layoutId={group.id}
			layout="position"
			$borderColor={group.color}
			$enabled={group.enabled ?? true}
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
			<Flex
				alignItems="center"
				mb="1rem"
				gap="0.5rem"
				justifyContent="space-between"
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					{editingGroup?.id === group.id ? (
						<>
							<EditableTitle
								value={editingGroup.title}
								onChange={(e) =>
									setEditingGroup({
										...editingGroup,
										title: e.target.value,
									})
								}
								onKeyDown={(e) => {
									if (e.key === "Enter") saveGroupEdit();
									if (e.key === "Escape") cancelGroupEdit();
								}}
								autoFocus
							/>
							<ColorPicker
								type="color"
								value={editingGroup.color}
								onChange={(e) =>
									setEditingGroup({
										...editingGroup,
										color: e.target.value,
									})
								}
							/>
						</>
					) : (
						<GroupTitle>{group.title}</GroupTitle>
					)}

					{(() => {
						if (!(group.enabled ?? true)) {
							return (
								<StatusBadge
									$isDue={false}
									style={{
										backgroundColor: "#f3f4f6",
										color: "#6b7280",
										border: "1px solid #d1d5db",
									}}
								>
									paused
								</StatusBadge>
							);
						}
						// Check if all items in the group are disabled
						const hasEnabledItems = group.items.some(
							(item) => item.enabled !== false,
						);
						if (!hasEnabledItems) {
							return (
								<StatusBadge
									$isDue={false}
									style={{
										backgroundColor: "#f3f4f6",
										color: "#6b7280",
										border: "1px solid #d1d5db",
									}}
								>
									paused
								</StatusBadge>
							);
						}
						const diff = group.nextDueTime - nowTs;
						if (diff <= 0) {
							return <StatusBadge $isDue={true}>due now</StatusBadge>;
						}
						return (
							<CountdownBadge $isDue={false}>
								{formatCountdown(diff)}
							</CountdownBadge>
						);
					})()}

					{editingGroup?.id === group.id ? (
						<>
							<span>every</span>
							<EditableInterval
								type="number"
								min="1"
								max="240"
								value={editingGroup.interval}
								onChange={(e) =>
									setEditingGroup({
										...editingGroup,
										interval: Number(e.target.value) || 1,
									})
								}
							/>
							<span>min</span>
						</>
					) : (
						<Badge>every {group.intervalMinutes} min</Badge>
					)}
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					{editingGroup?.id === group.id ? (
						<Flex gap="0.25rem" ml="0.5rem">
							<SmallButton
								type="button"
								$variant="success"
								onClick={saveGroupEdit}
							>
								<FaCheck />
							</SmallButton>
							<SmallButton type="button" onClick={cancelGroupEdit}>
								<FaXmark />
							</SmallButton>
						</Flex>
					) : (
						<>
							<GroupActionsButton
								type="button"
								onClick={() => startEditingGroup(group)}
								title="Edit group"
							>
								<FaPencil />
							</GroupActionsButton>
							<GroupActionsButton
								type="button"
								onClick={() => moveGroup(group.id, -1)}
								title="Move group up"
								disabled={idx === 0}
							>
								<FaArrowUp />
							</GroupActionsButton>
							<GroupActionsButton
								type="button"
								onClick={() => moveGroup(group.id, 1)}
								title="Move group down"
								disabled={idx === totalGroups - 1}
							>
								<FaArrowDown />
							</GroupActionsButton>
						</>
					)}

					<ToggleSwitch
						$enabled={group.enabled ?? true}
						onClick={() => toggleGroupEnabled(group.id)}
						title={(group.enabled ?? true) ? "Disable group" : "Enable group"}
					/>

					<GroupActionsButton
						type="button"
						$variant="danger"
						onClick={() => setGroupToDelete(group)}
						title="Delete group"
					>
						<FaTrash />
					</GroupActionsButton>
				</div>
			</Flex>
			<Flex direction="column" gap="0.75rem">
				<AnimatePresence mode="popLayout" initial={false}>
					{getSortedGroupItems(group).map((item, itemIdx) => {
						// Current item is the first enabled item (since disabled items are at bottom)
						const isCurrentItem =
							item.id === group.items[group.currentItemIndex]?.id;
						return (
							<GroupItem
								key={item.id}
								item={item}
								group={group}
								isCurrentItem={isCurrentItem}
								nowTs={nowTs}
								idx={itemIdx}
								completeGroupItem={completeGroupItem}
								toggleGroupItemEnabled={toggleGroupItemEnabled}
								deleteGroupItem={deleteGroupItem}
								storeSnoozeGroup={storeSnoozeGroup}
								storeAddLogEntry={storeAddLogEntry}
							/>
						);
					})}
				</AnimatePresence>
			</Flex>
		</GroupCard>
	);
};
