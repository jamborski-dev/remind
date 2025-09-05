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
		if (paused) {
			// Don't update time when paused
			return;
		}

		const id = setInterval(() => setNowTs(Date.now()), interval);
		return () => clearInterval(id);
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
