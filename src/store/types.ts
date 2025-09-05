// Core data types
export interface ReminderGroupItem {
	id: string;
	title: string;
	createdAt: number;
	lastShownAt?: number;
	enabled?: boolean;
}

export interface ReminderGroup {
	id: string;
	title: string;
	items: ReminderGroupItem[];
	currentItemIndex: number;
	intervalMinutes: number;
	nextDueTime: number;
	enabled?: boolean;
	color: string;
	pausedRemainingMs?: number;
	createdAt: number;
	snoozedAt?: number;
	snoozedForMinutes?: number;
}

export interface LogEntry {
	id: string;
	reminderId: string;
	action: string;
	at: number;
	text?: string;
	snoozeForMinutes?: number;
}

export interface EditingGroup {
	id: string;
	title: string;
	interval: number;
	color: string;
}

export interface DueGroupItem {
	group: ReminderGroup;
	item: ReminderGroupItem;
}

// Toast types
export type ToastStatus = "success" | "error" | "warning" | "info";

export interface Toast {
	id: string;
	title: string;
	message?: string | React.ReactNode;
	status: ToastStatus;
	duration?: number;
	persistent?: boolean;
}
