import { useCallback, useState } from "react";
import type {
	Toast,
	ToastStatus,
} from "../components/design-system/feedback/Toast";

export interface UseToastOptions {
	defaultDuration?: number;
}

export interface ShowToastOptions {
	status: ToastStatus;
	title: string;
	message?: React.ReactNode;
	duration?: number;
	onClose?: () => void;
}

export function useToast(options: UseToastOptions = {}) {
	const { defaultDuration = 5000 } = options;
	const [toasts, setToasts] = useState<Toast[]>([]);

	console.log(
		"useToast: Hook initialized/re-rendered, current toasts:",
		toasts.map((t) => ({ id: t.id, title: t.title })),
	);

	const showToast = useCallback(
		({
			status,
			title,
			message,
			duration = defaultDuration,
			onClose,
		}: ShowToastOptions) => {
			console.log("useToast: showToast called with", {
				status,
				title,
				message,
				duration,
			});
			const id = Math.random().toString(36).substr(2, 9);
			const toast: Toast = {
				id,
				status,
				title,
				message,
				duration,
				onClose,
			};

			console.log("useToast: Creating toast with ID", id);
			setToasts((prev) => {
				console.log(
					"useToast: Previous toasts:",
					prev.map((t) => ({ id: t.id, title: t.title })),
				);
				const newToasts = [...prev, toast];
				console.log(
					"useToast: New toasts array:",
					newToasts.map((t) => ({ id: t.id, title: t.title })),
				);
				return newToasts;
			});
			return id;
		},
		[defaultDuration],
	);

	const dismissToast = useCallback((id: string) => {
		console.log("useToast: dismissToast called for ID", id);
		setToasts((prev) => {
			console.log(
				"useToast: Before dismiss, toasts:",
				prev.map((t) => ({ id: t.id, title: t.title })),
			);
			const filtered = prev.filter((toast) => toast.id !== id);
			console.log(
				"useToast: After dismiss, toasts:",
				filtered.map((t) => ({ id: t.id, title: t.title })),
			);
			return filtered;
		});
	}, []);

	const dismissAllToasts = useCallback(() => {
		setToasts([]);
	}, []);

	// Convenience methods for different toast types
	const showSuccess = useCallback(
		(
			title: string,
			message?: React.ReactNode,
			options?: Omit<ShowToastOptions, "status" | "title" | "message">,
		) => {
			return showToast({ status: "success", title, message, ...options });
		},
		[showToast],
	);

	const showError = useCallback(
		(
			title: string,
			message?: React.ReactNode,
			options?: Omit<ShowToastOptions, "status" | "title" | "message">,
		) => {
			return showToast({ status: "error", title, message, ...options });
		},
		[showToast],
	);

	const showWarning = useCallback(
		(
			title: string,
			message?: React.ReactNode,
			options?: Omit<ShowToastOptions, "status" | "title" | "message">,
		) => {
			return showToast({ status: "warning", title, message, ...options });
		},
		[showToast],
	);

	const showInfo = useCallback(
		(
			title: string,
			message?: React.ReactNode,
			options?: Omit<ShowToastOptions, "status" | "title" | "message">,
		) => {
			return showToast({ status: "info", title, message, ...options });
		},
		[showToast],
	);

	return {
		toasts,
		showToast,
		showSuccess,
		showError,
		showWarning,
		showInfo,
		dismissToast,
		dismissAllToasts,
	};
}
