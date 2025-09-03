// General utility functions and constants

// ---- Constants ----
export const GRACE_MS = 5000; // allow 5s grace: treat slightly-past due times as due now

// ---- Helper functions ----
export const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

export function uid(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
