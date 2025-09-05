import type { StateCreator } from "zustand";
import { uid } from "./storage";
import type { Toast, ToastStatus } from "./types";

export interface ToastSlice {
	// Toast state
	toasts: Toast[];

	// Actions
	showToast: (toast: Omit<Toast, "id">) => void;
	dismissToast: (id: string) => void;
	clearAllToasts: () => void;

	// Convenience methods
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

export const createToastSlice: StateCreator<ToastSlice, [], [], ToastSlice> = (
	set,
	get,
) => ({
	// Initial state
	toasts: [],

	// Actions
	showToast: (toast) => {
		console.log("🍞 ToastSlice: showToast called", toast);
		const newToast: Toast = {
			id: uid(),
			...toast,
		};

		set((state) => {
			const newToasts = [...state.toasts, newToast];
			console.log("🍞 ToastSlice: Updated toasts", newToasts);
			return { toasts: newToasts };
		});

		// Auto-dismiss after duration unless persistent
		if (!toast.persistent && toast.duration !== 0) {
			const duration = toast.duration ?? 5000;
			setTimeout(() => {
				console.log(
					`🍞 ToastSlice: Auto-dismissing toast ${newToast.id} after ${duration}ms`,
				);
				get().dismissToast(newToast.id);
			}, duration);
		}
	},

	dismissToast: (id) => {
		console.log("🍞 ToastSlice: dismissToast called", id);
		set((state) => {
			const newToasts = state.toasts.filter((toast) => toast.id !== id);
			console.log("🍞 ToastSlice: After dismiss, toasts:", newToasts);
			return { toasts: newToasts };
		});
	},

	clearAllToasts: () => {
		console.log("🍞 ToastSlice: clearAllToasts called");
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
});
