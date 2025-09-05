import { useEffect, useState } from "react";
import { useAppStore } from "../store";

// Type for store with toast methods
type StoreWithToast = {
	showToast: (toast: {
		status: string;
		title: string;
		message?: React.ReactNode;
		duration?: number;
	}) => void;
};

export function PWAUpdateChecker() {
	const [registration, setRegistration] =
		useState<ServiceWorkerRegistration | null>(null);
	const showToast = useAppStore(
		(state) => (state as unknown as StoreWithToast).showToast,
	);

	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.ready.then((reg) => {
				setRegistration(reg);

				// Listen for updates
				reg.addEventListener("updatefound", () => {
					const newWorker = reg.installing;
					if (newWorker) {
						newWorker.addEventListener("statechange", () => {
							if (
								newWorker.state === "installed" &&
								navigator.serviceWorker.controller
							) {
								// New content is available
								showToast({
									status: "info",
									title: "Update Available",
									message: (
										<div>
											A new version of re:MIND is available.{" "}
											<button
												type="button"
												onClick={handleUpdate}
												style={{
													background: "none",
													border: "none",
													color: "inherit",
													textDecoration: "underline",
													cursor: "pointer",
													padding: 0,
													font: "inherit",
												}}
											>
												Refresh to update
											</button>
										</div>
									),
									duration: 0, // Persistent until user acts
								});
							}
						});
					}
				});
			});
		}
	}, [showToast]);

	const handleUpdate = () => {
		if (registration?.waiting) {
			registration.waiting.postMessage({ type: "SKIP_WAITING" });
			registration.waiting.addEventListener("statechange", () => {
				if (registration.waiting?.state === "activated") {
					window.location.reload();
				}
			});
		} else {
			window.location.reload();
		}
	};

	// This component doesn't render anything visible
	return null;
}

// Enhanced service worker with update handling
export const registerSW = () => {
	if ("serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker
				.register("/sw.js")
				.then((registration) => {
					// Handle updates
					registration.addEventListener("updatefound", () => {
						const newWorker = registration.installing;
						if (newWorker) {
							newWorker.addEventListener("statechange", () => {
								if (
									newWorker.state === "installed" &&
									navigator.serviceWorker.controller
								) {
									// New content is available
								}
							});
						}
					});
				})
				.catch((registrationError) => {
					console.error("SW registration failed: ", registrationError);
				});
		});

		// Handle messages from service worker
		navigator.serviceWorker.addEventListener("message", (event) => {
			if (event.data && event.data.type === "SKIP_WAITING") {
				window.location.reload();
			}
		});
	}
};
