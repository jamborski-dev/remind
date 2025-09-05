import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

interface TimeContextValue {
	nowTs: number;
}

const TimeContext = createContext<TimeContextValue | null>(null);

interface TimeProviderProps {
	children: ReactNode;
	/**
	 * Update interval in milliseconds. Default is 1000 (1 second).
	 */
	interval?: number;
	/**
	 * Whether the timer should be paused. When paused, time updates stop.
	 */
	paused?: boolean;
}

export function TimeProvider({
	children,
	interval = 1000,
	paused = false,
}: TimeProviderProps) {
	const [nowTs, setNowTs] = useState(() => Date.now());

	useEffect(() => {
		try {
			if (paused) {
				// Don't update time when paused
				return;
			}

			const id = setInterval(() => {
				try {
					setNowTs(Date.now());
				} catch (error) {
					console.error("Error updating time:", error);
					// Continue with stale time rather than crashing
				}
			}, interval);
			return () => clearInterval(id);
		} catch (error) {
			console.error("Error setting up time interval:", error);
			// Return a cleanup function even if setup failed
			return () => {};
		}
	}, [interval, paused]);

	const value: TimeContextValue = {
		nowTs,
	};

	return <TimeContext.Provider value={value}>{children}</TimeContext.Provider>;
}

/**
 * Hook to get the current timestamp that updates automatically.
 * Only components that call this hook will re-render when time changes.
 */
export function useCurrentTime(): number {
	const context = useContext(TimeContext);
	if (!context) {
		throw new Error("useCurrentTime must be used within a TimeProvider");
	}
	return context.nowTs;
}
