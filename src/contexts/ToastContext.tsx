import { type ReactNode, createContext, useContext } from "react";
import { ToastContainer } from "../components/design-system/feedback/Toast";
import { useToast } from "../hooks/useToast";
import type { ShowToastOptions } from "../hooks/useToast";

interface ToastContextValue {
	showToast: (options: ShowToastOptions) => string;
	showSuccess: (
		title: string,
		message?: React.ReactNode,
		options?: Omit<ShowToastOptions, "status" | "title" | "message">,
	) => string;
	showError: (
		title: string,
		message?: React.ReactNode,
		options?: Omit<ShowToastOptions, "status" | "title" | "message">,
	) => string;
	showWarning: (
		title: string,
		message?: React.ReactNode,
		options?: Omit<ShowToastOptions, "status" | "title" | "message">,
	) => string;
	showInfo: (
		title: string,
		message?: React.ReactNode,
		options?: Omit<ShowToastOptions, "status" | "title" | "message">,
	) => string;
	dismissToast: (id: string) => void;
	dismissAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastContext(): ToastContextValue {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToastContext must be used within a ToastProvider");
	}
	return context;
}

interface ToastProviderProps {
	children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
	const toastMethods = useToast();

	return (
		<ToastContext.Provider value={toastMethods}>
			{children}
			{/* Render ToastContainer here so it's always mounted */}
			<ToastContainer
				toasts={toastMethods.toasts}
				onDismiss={toastMethods.dismissToast}
			/>
		</ToastContext.Provider>
	);
}
