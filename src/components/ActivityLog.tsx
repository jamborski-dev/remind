import { FaCheck, FaClock } from "react-icons/fa6";
import type { LogEntry } from "../store";
import { formatTime } from "../utils/time";
import {
	ActivityTable,
	Button,
	Card,
	CardContent,
	MutedText,
	Sidebar,
} from "./ReminderApp.styled";
import { Flex } from "./design-system/layout/Flex";

interface ActivityLogProps {
	paginatedActivity: {
		items: LogEntry[];
		totalPages: number;
		currentPage: number;
		itemsPerPage: number;
	};
	activityLogPage: number;
	setActivityLogPage: (page: number) => void;
	getGroupColorForReminder: (reminderId: string) => string;
	clearTodaysActivity: () => void;
}

export function ActivityLog({
	paginatedActivity,
	activityLogPage,
	setActivityLogPage,
	getGroupColorForReminder,
	clearTodaysActivity,
}: ActivityLogProps) {
	return (
		<Sidebar direction="column" gap="1rem">
			<Card>
				<Flex justifyContent="space-between" alignItems="center" mb="1rem">
					<h2 style={{ fontSize: "1rem" }}>Activity log</h2>
					<Button type="button" onClick={clearTodaysActivity}>
						Clear
					</Button>
				</Flex>

				<CardContent>
					{paginatedActivity.items.length === 0 ? (
						<MutedText $small>No activity yet.</MutedText>
					) : (
						<>
							<ActivityTable>
								<thead>
									<tr>
										<th>Time</th>
										<th />
										<th>Task</th>
									</tr>
								</thead>
								<tbody>
									{paginatedActivity.items.map((entry) => (
										<tr key={entry.id}>
											<td>{formatTime(entry.at)}</td>
											<td>
												{entry.action === "done" ? (
													<FaCheck />
												) : (
													<Flex alignItems="center" gap={1}>
														<FaClock />
														{entry.snoozeForMinutes}M
													</Flex>
												)}
											</td>
											<td>
												<Flex alignItems="center" gap={1}>
													<div
														style={{
															width: "8px",
															height: "8px",
															borderRadius: "50%",
															backgroundColor: getGroupColorForReminder(
																entry.reminderId,
															),
															flexShrink: 0,
														}}
													/>
													{entry.text}
												</Flex>
											</td>
										</tr>
									))}
								</tbody>
							</ActivityTable>

							{/* Pagination controls */}
							{paginatedActivity.totalPages > 1 && (
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginTop: "1rem",
										fontSize: "0.875rem",
									}}
								>
									<Button
										type="button"
										onClick={() =>
											setActivityLogPage(Math.max(0, activityLogPage - 1))
										}
										disabled={activityLogPage === 0}
										style={{ minWidth: "80px" }}
									>
										Previous
									</Button>
									<span>
										Page {activityLogPage + 1} of {paginatedActivity.totalPages}
									</span>
									<Button
										type="button"
										onClick={() =>
											setActivityLogPage(
												Math.min(
													paginatedActivity.totalPages - 1,
													activityLogPage + 1,
												),
											)
										}
										disabled={
											activityLogPage === paginatedActivity.totalPages - 1
										}
										style={{ minWidth: "80px" }}
									>
										Next
									</Button>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</Sidebar>
	);
}
