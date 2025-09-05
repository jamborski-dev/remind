import { FaCheck, FaClock } from "react-icons/fa6";
import type { DueGroupItem, LogEntry } from "../store";
import { uid } from "../utils/helpers";
import { formatShortDistance } from "../utils/time";
import { Button } from "./ReminderApp.styled";
import { Modal } from "./design-system/feedback/Modal";
import { Flex } from "./design-system/layout/Flex";

interface DueItemModalProps {
	dueGroupItem: DueGroupItem | null;
	setDueGroupItem: (item: DueGroupItem | null) => void;
	logEntries: LogEntry[];
	completeGroupItem: (groupId: string, itemId: string) => void;
	storeSnoozeGroup: (groupId: string, minutes: number) => void;
	storeAddLogEntry: (entry: LogEntry) => void;
}

const CenterText = ({
	children,
	className,
	style,
}: {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}) => (
	<div
		style={{
			textAlign: "center",
			margin: "1rem 0",
			fontSize: className === "big" ? "1.5rem" : "1rem",
			fontWeight: className === "big" ? "bold" : "normal",
			...style,
		}}
	>
		{children}
	</div>
);

export function DueItemModal({
	dueGroupItem,
	setDueGroupItem,
	logEntries,
	completeGroupItem,
	storeSnoozeGroup,
	storeAddLogEntry,
}: DueItemModalProps) {
	return (
		<Modal.Root isOpen={!!dueGroupItem} onClose={() => setDueGroupItem(null)}>
			{dueGroupItem && (
				<>
					<Modal.Header>
						<Flex alignItems="center" gap="0.5rem">
							<div
								style={{
									width: "12px",
									height: "12px",
									borderRadius: "50%",
									backgroundColor: dueGroupItem.group.color,
									flexShrink: 0,
								}}
							/>
							<h3>{dueGroupItem.group.title}</h3>
						</Flex>
					</Modal.Header>

					<Modal.Body>
						<CenterText className="big">{dueGroupItem.item.title}</CenterText>
					</Modal.Body>

					<Modal.MetaInfo>
						{(() => {
							const today = new Date().toDateString();
							const todayEntries = logEntries.filter(
								(entry) =>
									entry.reminderId === dueGroupItem.item.id &&
									entry.action === "done" &&
									new Date(entry.at).toDateString() === today,
							);
							const todayCompletions = todayEntries.length;
							const lastEntry = logEntries
								.filter(
									(entry) =>
										entry.reminderId === dueGroupItem.item.id &&
										entry.action === "done",
								)
								.slice(-1)[0];
							const lastDone = lastEntry
								? formatShortDistance(lastEntry.at)
								: "never";
							return (
								<>
									Last done: <strong>{lastDone}</strong> • {todayCompletions}{" "}
									time{todayCompletions !== 1 ? "s" : ""} today
								</>
							);
						})()}
					</Modal.MetaInfo>

					<Modal.Actions>
						<Button
							type="button"
							$variant="success"
							onClick={() => {
								completeGroupItem(dueGroupItem.group.id, dueGroupItem.item.id);
								setDueGroupItem(null);
							}}
						>
							<FaCheck style={{ marginRight: "4px" }} />
							Done
						</Button>
						<Button
							type="button"
							$variant="warn"
							onClick={() => {
								// Snooze the group by 5 minutes
								storeSnoozeGroup(dueGroupItem.group.id, 5);
								// Add log entry for snooze action
								const currentItem =
									dueGroupItem.group.items[dueGroupItem.group.currentItemIndex];
								if (currentItem) {
									storeAddLogEntry({
										id: uid(),
										reminderId: currentItem.id,
										action: "snooze",
										at: Date.now(),
										text: currentItem.title,
										snoozeForMinutes: 5,
									});
								}
								setDueGroupItem(null);
							}}
						>
							<FaClock style={{ marginRight: "4px" }} />
							5M
						</Button>
						<Button
							type="button"
							$variant="warn"
							onClick={() => {
								// Snooze the group by 10 minutes
								storeSnoozeGroup(dueGroupItem.group.id, 10);
								// Add log entry for snooze action
								const currentItem =
									dueGroupItem.group.items[dueGroupItem.group.currentItemIndex];
								if (currentItem) {
									storeAddLogEntry({
										id: uid(),
										reminderId: currentItem.id,
										action: "snooze",
										at: Date.now(),
										text: currentItem.title,
										snoozeForMinutes: 10,
									});
								}
								setDueGroupItem(null);
							}}
						>
							<FaClock style={{ marginRight: "4px" }} />
							10M
						</Button>
					</Modal.Actions>
				</>
			)}
		</Modal.Root>
	);
}
