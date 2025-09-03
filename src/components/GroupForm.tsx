import { AnimatePresence, motion } from "framer-motion";
import { FaArrowDown, FaArrowUp, FaXmark } from "react-icons/fa6";
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

interface GroupItem {
	id: string;
	title: string;
}

interface GroupFormProps {
	formExpanded: boolean;
	setFormExpanded: (expanded: boolean) => void;
	groupTitle: string;
	setGroupTitle: (title: string) => void;
	groupColor: string;
	setGroupColor: (color: string) => void;
	groupItems: GroupItem[];
	updateGroupItem: (id: string, title: string) => void;
	moveGroupItem: (id: string, direction: number) => void;
	removeGroupItem: (id: string) => void;
	addGroupItem: () => void;
	groupInterval: number;
	setGroupInterval: (interval: number) => void;
	submitGroup: () => void;
}

export function GroupForm({
	formExpanded,
	setFormExpanded,
	groupTitle,
	setGroupTitle,
	groupColor,
	setGroupColor,
	groupItems,
	updateGroupItem,
	moveGroupItem,
	removeGroupItem,
	addGroupItem,
	groupInterval,
	setGroupInterval,
	submitGroup,
}: GroupFormProps) {
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
											onChange={(e) => updateGroupItem(item.id, e.target.value)}
										/>
										<Button
											type="button"
											title="Move up"
											onClick={() => moveGroupItem(item.id, -1)}
										>
											<FaArrowUp />
										</Button>
										<Button
											type="button"
											title="Move down"
											onClick={() => moveGroupItem(item.id, +1)}
										>
											<FaArrowDown />
										</Button>
										<Button
											$variant="danger"
											type="button"
											title="Remove"
											onClick={() => removeGroupItem(item.id)}
										>
											<FaXmark />
										</Button>
									</Flex>
								))}
								<Button type="button" onClick={addGroupItem}>
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
}
