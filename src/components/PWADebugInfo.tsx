import { useEffect, useState } from "react";
import styled from "styled-components";

const DebugPanel = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  max-width: 300px;
  z-index: 9999;
`;

const DebugItem = styled.div`
  margin: 2px 0;
`;

export function PWADebugInfo() {
	const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});
	const [showDebug, setShowDebug] = useState(false);

	useEffect(() => {
		// Only show debug in development or when debugging is explicitly enabled
		const shouldShowDebug =
			import.meta.env.DEV ||
			localStorage.getItem("pwa-debug") === "true" ||
			window.location.search.includes("debug=true");

		setShowDebug(shouldShowDebug);

		if (shouldShowDebug) {
			const info = {
				isSecureContext: window.isSecureContext,
				hasServiceWorker: "serviceWorker" in navigator,
				userAgent: navigator.userAgent,
				standalone: window.matchMedia("(display-mode: standalone)").matches,
				beforeInstallPromptSupported: "onbeforeinstallprompt" in window,
				protocol: window.location.protocol,
				host: window.location.host,
			};

			setDebugInfo(info);

			// Check manifest
			fetch("/manifest.json")
				.then((response) => response.json())
				.then((manifest) => {
					setDebugInfo((prev) => ({ ...prev, manifestLoaded: true, manifest }));
				})
				.catch(() => {
					setDebugInfo((prev) => ({ ...prev, manifestLoaded: false }));
				});

			// Check service worker registration
			if ("serviceWorker" in navigator) {
				navigator.serviceWorker.getRegistration().then((registration) => {
					setDebugInfo((prev) => ({
						...prev,
						swRegistered: !!registration,
						swState: registration?.active?.state,
					}));
				});
			}
		}
	}, []);

	if (!showDebug) {
		return null;
	}

	return (
		<DebugPanel>
			<strong>PWA Debug Info</strong>
			{Object.entries(debugInfo).map(([key, value]) => (
				<DebugItem key={key}>
					<strong>{key}:</strong> {String(value)}
				</DebugItem>
			))}
			<DebugItem>
				<em>
					Add ?debug=true to URL or set localStorage pwa-debug=true to see this
				</em>
			</DebugItem>
		</DebugPanel>
	);
}
