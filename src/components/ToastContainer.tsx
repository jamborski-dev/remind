import React from "react";
import { createPortal } from "react-dom";
import { useAppStore } from "../store";
import type { Toast } from "../store/types";
import { ToastContainer as ToastContainerComponent } from "./design-system/feedback/Toast";

// Type for store with toast methods - avoiding any usage
type StoreWithToast = {
	toasts: Toast[];
	dismissToast: (id: string) => void;
};

export function ToastContainer() {
	// Type assertion to access toast methods that we know exist
	const toasts = useAppStore(
		(state) => (state as unknown as StoreWithToast).toasts,
	);
	const dismissToast = useAppStore(
		(state) => (state as unknown as StoreWithToast).dismissToast,
	);

	console.log("🍞 ToastContainer: Rendering", toasts?.length || 0, "toasts");

	// Ensure toast root exists
	React.useLayoutEffect(() => {
		let toastRoot = document.getElementById("toast-root");
		if (!toastRoot) {
			toastRoot = document.createElement("div");
			toastRoot.id = "toast-root";
			toastRoot.style.position = "fixed";
			toastRoot.style.top = "20px";
			toastRoot.style.right = "20px";
			toastRoot.style.zIndex = "9999";
			toastRoot.style.pointerEvents = "none";
			document.body.appendChild(toastRoot);
		}
	}, []);

	const toastRoot = document.getElementById("toast-root");
	if (!toastRoot) return null;

	return createPortal(
		<ToastContainerComponent toasts={toasts || []} onDismiss={dismissToast} />,
		toastRoot,
	);
}
