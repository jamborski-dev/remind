import { useEffect, useRef } from "react";
import { acquireWakeLock, releaseWakeLock } from "../utils/actions";

export function useWakeLock(
	setWakeLockSupported: (supported: boolean) => void,
) {
	const wakeLockRef = useRef<WakeLockSentinel | null>(null);

	// Wake Lock support detection
	useEffect(() => {
		// @ts-ignore
		setWakeLockSupported(!!navigator.wakeLock);
	}, [setWakeLockSupported]);

	const handleAcquireWakeLock = () => acquireWakeLock(wakeLockRef);
	const handleReleaseWakeLock = () => releaseWakeLock(wakeLockRef);

	return {
		handleAcquireWakeLock,
		handleReleaseWakeLock,
	};
}
