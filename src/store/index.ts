import { create } from "zustand";
import { type ReminderSlice, createReminderSlice } from "./reminderSlice";
import { type SettingsSlice, createSettingsSlice } from "./settingsSlice";
import { uid } from "./storage";
import type { Toast, ToastStatus } from "./types";
import { type UISlice, createUISlice } from "./uiSlice";

// Combined store type - explicitly include toast methods for proper type inference
export interface AppState extends ReminderSlice, UISlice, SettingsSlice {
	// Toast functionality
	toasts: Toast[];
	showToast: (toast: Omit<Toast, "id">) => void;
	dismissToast: (id: string) => void;
	clearAllToasts: () => void;
	showSuccess: (
		title: string,
		message?: string | React.ReactNode,
		duration?: number,
	) => void;
	showError: (
		title: string,
		message?: string | React.ReactNode,
		duration?: number,
	) => void;
	showWarning: (
		title: string,
		message?: string | React.ReactNode,
		duration?: number,
	) => void;
	showInfo: (
		title: string,
		message?: string | React.ReactNode,
		duration?: number,
	) => void;
	showPersistent: (
		title: string,
		message?: string | React.ReactNode,
		status?: ToastStatus,
	) => void;
}

// Create the store with all slices
export const useAppStore = create<AppState>((set, get, api) => ({
	...createReminderSlice(set, get, api),
	...createUISlice(set, get, api),
	...createSettingsSlice(set, get, api),

	// Toast functionality directly in main store
	toasts: [],

	showToast: (toast) => {
		const newToast: Toast = {
			id: uid(),
			...toast,
		};

		set((state) => {
			const newToasts = [...state.toasts, newToast];
			return { toasts: newToasts };
		});

		// Auto-dismiss after duration unless persistent
		if (!toast.persistent && toast.duration !== 0) {
			const duration = toast.duration ?? 5000;
			setTimeout(() => {
				get().dismissToast(newToast.id);
			}, duration);
		}
	},

	dismissToast: (id) => {
		set((state) => {
			const newToasts = state.toasts.filter((toast) => toast.id !== id);
			return { toasts: newToasts };
		});
	},

	clearAllToasts: () => {
		set({ toasts: [] });
	},

	// Convenience methods
	showSuccess: (title, message, duration) => {
		get().showToast({ title, message, status: "success", duration });
	},

	showError: (title, message, duration) => {
		get().showToast({ title, message, status: "error", duration });
	},

	showWarning: (title, message, duration) => {
		get().showToast({ title, message, status: "warning", duration });
	},

	showInfo: (title, message, duration) => {
		get().showToast({ title, message, status: "info", duration });
	},

	showPersistent: (title, message, status = "info") => {
		get().showToast({ title, message, status, persistent: true });
	},
}));

// Re-export types for convenience
export type {
	ReminderGroup,
	ReminderGroupItem,
	LogEntry,
	EditingGroup,
	DueGroupItem,
	Toast,
	ToastStatus,
} from "./types";

// Re-export utilities
export { uid };
