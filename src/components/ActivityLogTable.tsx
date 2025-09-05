import { memo } from "react";
import { FaCheck, FaClock } from "react-icons/fa6";
import type { ActivityLogPagination } from "../hooks/useActivityLog";
import type { ReminderGroup } from "../store";
import { getGroupColorForReminder } from "../utils/actions";
import { formatTime } from "../utils/time";
import { ActivityTable, Button, MutedText } from "./ReminderApp.styled";
import { Flex } from "./design-system/layout/Flex";

interface ActivityLogTableProps {
	paginatedActivity: ActivityLogPagination;
	groups: ReminderGroup[];
	activityLogPage: number;
	setActivityLogPage: (page: number) => void;
}

export const ActivityLogTable = memo(function ActivityLogTable({
	paginatedActivity,
	groups,
	activityLogPage,
	setActivityLogPage,
}: ActivityLogTableProps) {
	if (paginatedActivity.items.length === 0) {
		return <MutedText $small>No activity yet.</MutedText>;
	}

	return (
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
												groups,
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
						onClick={() => setActivityLogPage(Math.max(0, activityLogPage - 1))}
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
								Math.min(paginatedActivity.totalPages - 1, activityLogPage + 1),
							)
						}
						disabled={activityLogPage === paginatedActivity.totalPages - 1}
						style={{ minWidth: "80px" }}
					>
						Next
					</Button>
				</div>
			)}
		</>
	);
});
