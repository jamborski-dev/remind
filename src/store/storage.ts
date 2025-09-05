import { DEFAULT_SOUND_ID } from "../constants/sounds";
import type { LogEntry, ReminderGroup } from "./types";

// Storage keys
const GROUPS_STORAGE_KEY = "zuza-reminders:groups:v1";
const LOG_STORAGE_KEY = "zuza-reminders:log:v1";
const SCORE_STORAGE_KEY = "zuza-reminders:score:v1";
const SOUND_STORAGE_KEY = "zuza-reminders:sound:v1";

// Load functions
export function loadGroups(): ReminderGroup[] {
	try {
		const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function loadLog(): LogEntry[] {
	try {
		const raw = localStorage.getItem(LOG_STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function loadScore(): number {
	try {
		const raw = localStorage.getItem(SCORE_STORAGE_KEY);
		return raw ? Number.parseInt(raw, 10) || 0 : 0;
	} catch {
		return 0;
	}
}

export function loadSelectedSoundId(): string {
	try {
		const raw = localStorage.getItem(SOUND_STORAGE_KEY);
		return raw || DEFAULT_SOUND_ID;
	} catch {
		return DEFAULT_SOUND_ID;
	}
}

export function loadShowActivityLog(): boolean {
	try {
		const raw = localStorage.getItem("showActivityLog");
		return raw ? raw === "true" : true; // Default to showing activity log
	} catch {
		return true;
	}
}

export function loadActivityLogLimit(): number {
	try {
		const raw = localStorage.getItem("activityLogLimit");
		return raw ? Number.parseInt(raw, 10) : 25; // Default to 25 items
	} catch {
		return 25;
	}
}

// Save functions
export function saveGroups(groups: ReminderGroup[]) {
	localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
}

export function saveLog(entries: LogEntry[]) {
	localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(entries));
}

export function saveScore(score: number) {
	localStorage.setItem(SCORE_STORAGE_KEY, score.toString());
}

export function saveSelectedSoundId(soundId: string) {
	localStorage.setItem(SOUND_STORAGE_KEY, soundId);
}

export function saveShowActivityLog(show: boolean) {
	localStorage.setItem("showActivityLog", show.toString());
}

export function saveActivityLogLimit(limit: number) {
	localStorage.setItem("activityLogLimit", limit.toString());
}

// Utility functions
export function now(): number {
	return Date.now();
}

export function uid(): string {
	return Math.random().toString(36).substr(2, 9);
}
