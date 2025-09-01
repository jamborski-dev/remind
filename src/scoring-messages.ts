export type ScoreTier = "default" | "bronze" | "silver" | "gold";

export interface TierInfo {
	tier: ScoreTier;
	title: string;
	message: string;
	emoji: string;
	color: string;
}

export const TIER_MESSAGES: Record<ScoreTier, TierInfo> = {
	default: {
		tier: "default",
		title: "Getting Started",
		message: "Building your reminder habit, one step at a time.",
		emoji: "🌱",
		color: "#6b7280", // gray
	},
	bronze: {
		tier: "bronze",
		title: "Bronze Level",
		message: "You're getting into a good rhythm. Keep it up!",
		emoji: "🥉",
		color: "#cd7f32", // bronze
	},
	silver: {
		tier: "silver",
		title: "Silver Level",
		message: "Nice consistency! Your habits are really taking shape.",
		emoji: "🥈",
		color: "#c0c0c0", // silver
	},
	gold: {
		tier: "gold",
		title: "Gold Level",
		message: "Excellent work! You've mastered the art of consistent reminders.",
		emoji: "🥇",
		color: "#ffd700", // gold
	},
};

export function calculateTier(score: number, groupCount: number): ScoreTier {
	const pointsPerTier = 3; // Always 3 points per tier

	if (score >= pointsPerTier * 3) return "gold"; // 9 points
	if (score >= pointsPerTier * 2) return "silver"; // 6 points
	if (score >= pointsPerTier) return "bronze"; // 3 points
	return "default";
}

export function getTierThresholds(groupCount: number): number[] {
	const pointsPerTier = 3; // Always 3 points per tier
	return [
		pointsPerTier, // bronze threshold (3)
		pointsPerTier * 2, // silver threshold (6)
		pointsPerTier * 3, // gold threshold (9)
	];
}
