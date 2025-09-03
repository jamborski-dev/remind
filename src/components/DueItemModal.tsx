import { FaCheck, FaClock } from "react-icons/fa6";
import type { DueGroupItem, LogEntry } from "../store";
import { uid } from "../utils/helpers";
import { formatShortDistance } from "../utils/time";
import { Modal } from "./Modal";
import { Button } from "./ReminderApp.styled";
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

const ModalMetaInfo = ({ children }: { children: React.ReactNode }) => (
	<div
		style={{
			textAlign: "center",
			fontSize: "0.875rem",
			color: "#6b7280",
			marginBottom: "1rem",
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
		<Modal open={!!dueGroupItem}>
			{dueGroupItem && (
				<div>
					<CenterText>
						<h3>{dueGroupItem.group.title}</h3>
					</CenterText>
					<CenterText className="big">{dueGroupItem.item.title}</CenterText>
					<ModalMetaInfo>
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
					</ModalMetaInfo>
					<Flex wrap="wrap" gap="0.5rem" justifyContent="center">
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
					</Flex>
				</div>
			)}
		</Modal>
	);
}
