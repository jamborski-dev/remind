import { useCallback, useEffect, useRef } from "react";
import { acquireWakeLock, releaseWakeLock } from "../utils/actions";

/**
 * Enhanced wake lock hook with automatic cleanup to prevent stuck locks.
 *
 * Safety features:
 * - Auto-releases wake lock when page becomes hidden (visibilitychange)
 * - Auto-releases wake lock on component unmount
 * - Re-acquires wake lock when page becomes visible (if user had requested it)
 */
export function useWakeLock(
	setWakeLockSupported: (supported: boolean) => void,
) {
	const wakeLockRef = useRef<WakeLockSentinel | null>(null);
	const isUserRequestedRef = useRef<boolean>(false);

	// Wake Lock support detection
	useEffect(() => {
		// @ts-ignore
		setWakeLockSupported(!!navigator.wakeLock);
	}, [setWakeLockSupported]);

	// Auto-release wake lock when page becomes hidden
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.hidden) {
				// Page is hidden, release wake lock
				if (wakeLockRef.current) {
					releaseWakeLock(wakeLockRef);
				}
			} else {
				// Page is visible again, re-acquire if user had requested it
				if (isUserRequestedRef.current && !wakeLockRef.current) {
					acquireWakeLock(wakeLockRef);
				}
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (wakeLockRef.current) {
				releaseWakeLock(wakeLockRef);
				isUserRequestedRef.current = false;
			}
		};
	}, []);

	const handleAcquireWakeLock = useCallback(async () => {
		await acquireWakeLock(wakeLockRef);
		isUserRequestedRef.current = true;
	}, []);

	const handleReleaseWakeLock = useCallback(async () => {
		await releaseWakeLock(wakeLockRef);
		isUserRequestedRef.current = false;
	}, []);

	return {
		handleAcquireWakeLock,
		handleReleaseWakeLock,
	};
}
