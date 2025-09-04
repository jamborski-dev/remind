import { useEffect, useMemo, useState } from "react";
import type { LogEntry } from "../store";
import { isSameLocalDay } from "../utils/time";

export interface ActivityLogPagination {
	items: LogEntry[];
	totalPages: number;
	currentPage: number;
	itemsPerPage: number;
}

export function useActivityLog(
	logEntries: LogEntry[],
	activityLogLimit: number,
) {
	const [activityLogPage, setActivityLogPage] = useState(0);

	// Reset pagination when activity log limit changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset pagination when limit changes
	useEffect(() => {
		setActivityLogPage(0);
	}, [activityLogLimit]);

	const todaysActivity = useMemo(() => {
		const current = Date.now();
		const allTodaysEntries = logEntries
			.filter(
				(e) =>
					isSameLocalDay(e.at, current) &&
					(e.action === "done" || e.action === "snooze"),
			)
			.sort((a, b) => b.at - a.at);

		// Apply limit
		return allTodaysEntries.slice(0, activityLogLimit);
	}, [logEntries, activityLogLimit]);

	// Paginated activity for display (if limit > 20, paginate)
	const paginatedActivity: ActivityLogPagination = useMemo(() => {
		if (activityLogLimit <= 20) {
			return {
				items: todaysActivity,
				totalPages: 1,
				currentPage: 0,
				itemsPerPage: activityLogLimit,
			};
		}

		const itemsPerPage = 20;
		const totalPages = Math.ceil(todaysActivity.length / itemsPerPage);
		const startIndex = activityLogPage * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;

		return {
			items: todaysActivity.slice(startIndex, endIndex),
			totalPages,
			currentPage: activityLogPage,
			itemsPerPage,
		};
	}, [todaysActivity, activityLogPage, activityLogLimit]);

	return {
		paginatedActivity,
		activityLogPage,
		setActivityLogPage,
	};
}
