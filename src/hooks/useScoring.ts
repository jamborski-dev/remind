import { useEffect, useRef } from "react";
import { TIER_MESSAGES, calculateTier } from "../constants/scoring-messages";
import type { ReminderGroup } from "../store";
import { useAppStore } from "../store";

// Type for store with toast methods
type StoreWithToast = {
	showSuccess: (
		title: string,
		message?: string | React.ReactNode,
		duration?: number,
	) => void;
};

export function useScoring(
	groups: ReminderGroup[],
	score: number,
	incrementScore: () => void,
) {
	const pendingScoreRef = useRef<string | null>(null);
	const prevScoreRef = useRef<number>(score);
	const showSuccess = useAppStore(
		(state) => (state as unknown as StoreWithToast).showSuccess,
	);

	// Calculate current tier based on score and group count
	const currentTier = calculateTier(score);

	// Handle scoring when a loop is completed via pendingScoreRef (legacy)
	// biome-ignore lint/correctness/useExhaustiveDependencies: this is needed for reacting to other part of state
	useEffect(() => {
		if (pendingScoreRef.current) {
			console.log(
				"Awarding point for completed loop in group:",
				pendingScoreRef.current,
			);
			const prevScore = score;
			incrementScore();
			const newScore = prevScore + 1;
			console.log("Score updated from", prevScore, "to", newScore);

			// Calculate tiers before and after scoring
			const prevTier = calculateTier(prevScore);
			const newTier = calculateTier(newScore);

			// Show first point toast if this is the first point
			if (prevScore === 0) {
				console.log("Showing first point toast!");
				showSuccess(
					"🎉 First Point Earned! 🎉",
					"You completed your first reminder loop! Keep it up and build your streak. Your score will now appear in the header.",
					8000, // Show longer for first achievement
				);
			}
			// Show tier upgrade toast if tier has changed and it's not the first point
			else if (prevTier !== newTier) {
				console.log(`Tier upgraded from ${prevTier} to ${newTier}!`);
				const tierInfo = TIER_MESSAGES[newTier];
				showSuccess(
					`${tierInfo.emoji} ${tierInfo.title} - Level Up! ${tierInfo.emoji}`,
					tierInfo.message,
					8000, // Show longer for tier upgrades
				);
			}

			pendingScoreRef.current = null; // Clear the pending score
		}
	}, [groups, showSuccess, incrementScore, score]); // Trigger when groups state changes

	// Handle scoring when score increases (for direct incrementScore calls)
	useEffect(() => {
		const prevScore = prevScoreRef.current;
		if (score > prevScore) {
			console.log("Score increased from", prevScore, "to", score);

			// Calculate tiers before and after scoring
			const prevTier = calculateTier(prevScore);
			const newTier = calculateTier(score);

			// Show first point toast if this is the first point
			if (prevScore === 0) {
				console.log("Showing first point toast!");
				showSuccess(
					"🎉 First Point Earned! 🎉",
					"You completed your first reminder loop! Keep it up and build your streak. Your score will now appear in the header.",
					8000, // Show longer for first achievement
				);
			}
			// Show tier upgrade toast if tier has changed and it's not the first point
			else if (prevTier !== newTier) {
				console.log(`Tier upgraded from ${prevTier} to ${newTier}!`);
				const tierInfo = TIER_MESSAGES[newTier];
				showSuccess(
					`${tierInfo.emoji} ${tierInfo.title} - Level Up! ${tierInfo.emoji}`,
					tierInfo.message,
					8000, // Show longer for tier upgrades
				);
			}
		}

		// Update the previous score ref
		prevScoreRef.current = score;
	}, [score, showSuccess]);

	return {
		currentTier,
		pendingScoreRef,
	};
}
