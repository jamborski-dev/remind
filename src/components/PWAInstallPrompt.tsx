import { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import styled from "styled-components";

const InstallPrompt = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #3b82f6;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      transform: translate(-50%, 100%);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }
`;

const InstallButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
`;

interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	readonly userChoice: Promise<{
		outcome: "accepted" | "dismissed";
		platform: string;
	}>;
	prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showPrompt, setShowPrompt] = useState(false);

	useEffect(() => {
		const handleBeforeInstallPrompt = (e: Event) => {
			// Prevent the mini-infobar from appearing on mobile
			e.preventDefault();
			// Stash the event so it can be triggered later
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			setShowPrompt(true);
		};

		const handleAppInstalled = () => {
			console.log("PWA was installed");
			setShowPrompt(false);
			setDeferredPrompt(null);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleAppInstalled);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
			window.removeEventListener("appinstalled", handleAppInstalled);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) return;

		// Show the install prompt
		deferredPrompt.prompt();

		// Wait for the user to respond to the prompt
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === "accepted") {
			console.log("User accepted the install prompt");
		} else {
			console.log("User dismissed the install prompt");
		}

		// We've used the prompt, so we can't use it again
		setDeferredPrompt(null);
		setShowPrompt(false);
	};

	const handleDismiss = () => {
		setShowPrompt(false);
		// Optionally set a flag in localStorage to not show again for a while
		localStorage.setItem("pwa-install-dismissed", Date.now().toString());
	};

	// Don't show if already dismissed recently
	useEffect(() => {
		const dismissed = localStorage.getItem("pwa-install-dismissed");
		if (dismissed) {
			const dismissedTime = Number.parseInt(dismissed, 10);
			const daysSinceDismiss =
				(Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
			if (daysSinceDismiss < 7) {
				// Don't show for 7 days after dismissal
				setShowPrompt(false);
			}
		}
	}, []);

	if (!showPrompt || !deferredPrompt) {
		return null;
	}

	return (
		<InstallPrompt>
			<FiDownload size={20} />
			<span>Install re:MIND for a better experience!</span>
			<InstallButton onClick={handleInstallClick} type="button">
				<FiDownload size={16} />
				Install
			</InstallButton>
			<CloseButton onClick={handleDismiss} type="button" title="Dismiss">
				×
			</CloseButton>
		</InstallPrompt>
	);
}
