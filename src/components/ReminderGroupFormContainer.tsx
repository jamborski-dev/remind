import { AnimatePresence, motion } from "motion/react";
import { FaArrowDown, FaArrowUp, FaXmark } from "react-icons/fa6";
import { type ReminderGroup, uid, useAppStore } from "../store";
import {
	addGroupItem,
	moveGroupItem,
	removeGroupItem,
	updateGroupItem,
} from "../utils/actions";
import { clamp } from "../utils/helpers";
import {
	AutoMarginButton,
	Button,
	Card,
	ColorPicker,
	ColorPickerRow,
	CycleContainer,
	FlexInput,
	FormGridContainer,
	Input,
	NumberInput,
	RemindersContainer,
	RemindersTitle,
} from "./ReminderApp.styled";
import { Flex } from "./design-system/layout/Flex";

/**
 * Container component for the reminder group creation form
 * Handles all form state and submission logic
 */
export const ReminderGroupFormContainer = () => {
	const {
		// Form states
		groupTitle,
		groupInterval,
		groupColor,
		formExpanded,
		groupItems,

		// Actions
		setGroupTitle,
		setGroupInterval,
		setGroupColor,
		setFormExpanded,
		setGroupItems,
		addGroup: storeAddGroup,
	} = useAppStore();

	// Group item management actions
	const addGroupItemHandler = addGroupItem(groupItems, setGroupItems);
	const removeGroupItemHandler = removeGroupItem(groupItems, setGroupItems);
	const updateGroupItemHandler = updateGroupItem(groupItems, setGroupItems);
	const moveGroupItemHandler = moveGroupItem(groupItems, setGroupItems);

	const submitGroup = () => {
		const titles = groupItems.map((i) => i.title.trim()).filter(Boolean);
		if (titles.length === 0) return; // require at least one item
		const interval = clamp(groupInterval || 1, 1, 240);
		const nowTs = Date.now();
		const group: ReminderGroup = {
			id: uid(),
			title: groupTitle.trim() || titles[0],
			intervalMinutes: interval,
			items: titles.map((t) => ({
				id: uid(),
				title: t,
				enabled: true,
				createdAt: nowTs,
				lastShownAt: undefined,
			})),
			createdAt: nowTs,
			nextDueTime: nowTs + interval * 60_000, // Group starts after one interval
			currentItemIndex: 0, // Start with first item
			color: groupColor,
			enabled: true, // Default to enabled
		};
		storeAddGroup(group);
		// reset form
		setGroupTitle("");
		setGroupInterval(5);
		setGroupColor("#3b82f6"); // Reset to default color
		setGroupItems([
			{
				id: uid(),
				title: "",
				createdAt: Date.now(),
			},
		]);
	};

	return (
		<Card>
			<Flex justifyContent="space-between" alignItems="center">
				<h2>Create a reminder group</h2>
				<Button type="button" onClick={() => setFormExpanded(!formExpanded)}>
					{formExpanded ? "Collapse" : "Expand"}
				</Button>
			</Flex>

			<AnimatePresence>
				{formExpanded && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{
							opacity: 1,
							height: "auto",
							transition: {
								duration: 0.3,
								ease: "easeOut",
							},
						}}
						exit={{
							opacity: 0,
							height: 0,
							transition: {
								duration: 0.2,
								ease: "easeIn",
							},
						}}
						style={{ overflow: "hidden" }}
					>
						<div
							style={{
								marginTop: "2rem",
								display: "grid",
								gridTemplateColumns: "1fr auto auto",
								gap: "1rem",
								alignItems: "end",
							}}
						>
							<Flex gap="1rem" alignItems="flex-end">
								<FormGridContainer>
									Group title (optional)
									<Input
										type="text"
										placeholder="e.g. Morning routine"
										value={groupTitle}
										onChange={(e) => setGroupTitle(e.target.value)}
									/>
								</FormGridContainer>
								<ColorPickerRow>
									<span>Group color</span>
									<ColorPicker
										type="color"
										value={groupColor}
										onChange={(e) => setGroupColor(e.target.value)}
									/>
								</ColorPickerRow>
							</Flex>

							<RemindersContainer>
								<RemindersTitle className="small">
									Reminders in this group
								</RemindersTitle>
								{groupItems.map((item, idx) => (
									<Flex
										key={item.id}
										gap="8px"
										alignItems="center"
										mb="8px"
										direction="row"
									>
										<FlexInput
											type="text"
											placeholder={`Reminder #${idx + 1} title`}
											value={item.title}
											onChange={(e) =>
												updateGroupItemHandler(item.id, e.target.value)
											}
										/>
										<Button
											type="button"
											title="Move up"
											onClick={() => moveGroupItemHandler(item.id, -1)}
										>
											<FaArrowUp />
										</Button>
										<Button
											type="button"
											title="Move down"
											onClick={() => moveGroupItemHandler(item.id, +1)}
										>
											<FaArrowDown />
										</Button>
										<Button
											$variant="danger"
											type="button"
											title="Remove"
											onClick={() => removeGroupItemHandler(item.id)}
										>
											<FaXmark />
										</Button>
									</Flex>
								))}
								<Button type="button" onClick={addGroupItemHandler}>
									+ Add another
								</Button>
							</RemindersContainer>

							<CycleContainer>
								<span>Cycle every</span>
								<NumberInput
									type="number"
									className="number"
									min={1}
									max={240}
									value={groupInterval}
									onChange={(e) =>
										setGroupInterval(clamp(Number(e.target.value) || 1, 1, 240))
									}
								/>
								<span>minutes</span>
								<AutoMarginButton
									type="button"
									$variant="primary"
									onClick={submitGroup}
								>
									Add group
								</AutoMarginButton>
							</CycleContainer>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</Card>
	);
};
