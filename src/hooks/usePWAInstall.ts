import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	readonly userChoice: Promise<{
		outcome: "accepted" | "dismissed";
		platform: string;
	}>;
	prompt(): Promise<void>;
}

export function usePWAInstall() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [isInstallable, setIsInstallable] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);

	useEffect(() => {
		// Check if app is already installed (running in standalone mode)
		const isStandalone = window.matchMedia(
			"(display-mode: standalone)",
		).matches;
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		const isInStandaloneMode =
			isStandalone ||
			(isIOS &&
				!(
					window as Window & { navigator: Navigator & { standalone?: boolean } }
				).navigator.standalone === false);

		setIsInstalled(isInStandaloneMode);

		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			setIsInstallable(true);
		};

		const handleAppInstalled = () => {
			setIsInstalled(true);
			setIsInstallable(false);
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

	const installApp = async () => {
		if (!deferredPrompt) {
			return false;
		}

		try {
			await deferredPrompt.prompt();
			const choiceResult = await deferredPrompt.userChoice;

			if (choiceResult.outcome === "accepted") {
				setIsInstalled(true);
				setIsInstallable(false);
			}

			setDeferredPrompt(null);
			return choiceResult.outcome === "accepted";
		} catch (error) {
			console.error("Error installing app:", error);
			return false;
		}
	};

	const getInstallInstructions = () => {
		const userAgent = navigator.userAgent.toLowerCase();
		const isIOS = /ipad|iphone|ipod/.test(userAgent);
		const isFirefox = userAgent.includes("firefox");
		const isChrome = userAgent.includes("chrome") && !userAgent.includes("edg");
		const isSafari =
			userAgent.includes("safari") && !userAgent.includes("chrome");

		if (isIOS) {
			return "Tap the Share button and select 'Add to Home Screen'";
		}
		if (isFirefox) {
			return "Tap the menu (three dots) and select 'Install' or 'Add to Home Screen'";
		}
		if (isChrome) {
			return "Tap the menu (three dots) and select 'Add to Home Screen' or 'Install App'";
		}
		if (isSafari) {
			return "Tap the Share button and select 'Add to Home Screen'";
		}
		return "Look for 'Install' or 'Add to Home Screen' option in your browser menu";
	};

	return {
		isInstallable,
		isInstalled,
		installApp,
		getInstallInstructions,
		canPromptInstall: !!deferredPrompt,
	};
}
