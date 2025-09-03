// Time-related utility functions

export const formatTime = (ts: number) =>
	new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function formatShortDistance(timestamp: number) {
	const now = Date.now();
	const diff = now - timestamp;
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return "< 1m ago";
	if (minutes < 60) return `${minutes}m ago`;
	if (hours < 24) return `${hours}h ago`;
	return `${days}d ago`;
}

export function formatCountdown(ms: number) {
	const total = Math.max(0, Math.floor(ms / 1000));
	const s = total % 60;
	const m = Math.floor(total / 60) % 60;
	const h = Math.floor(total / 3600);

	if (h > 0)
		return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export function isSameLocalDay(a: number, b: number) {
	const aDate = new Date(a);
	const bDate = new Date(b);
	return (
		aDate.getFullYear() === bDate.getFullYear() &&
		aDate.getMonth() === bDate.getMonth() &&
		aDate.getDate() === bDate.getDate()
	);
}
