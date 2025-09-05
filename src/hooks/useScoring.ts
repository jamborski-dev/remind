import { useEffect, useRef } from "react";
import {
	TIER_MESSAGES,
	type TierInfo,
	calculateTier,
} from "../constants/scoring-messages";
import type { ReminderGroup } from "../store";

export function useScoring(
	groups: ReminderGroup[],
	score: number,
	incrementScore: () => void,
	setShowFirstPointModal: (show: boolean) => void,
	setTierUpgradeModal: (modal: TierInfo | null) => void,
) {
	const pendingScoreRef = useRef<string | null>(null);

	// Calculate current tier based on score and group count
	const currentTier = calculateTier(score);

	// Handle scoring when a loop is completed
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

			// Show first point modal if this is the first point
			if (prevScore === 0) {
				console.log("Showing first point modal!");
				setShowFirstPointModal(true);
			}
			// Show tier upgrade modal if tier has changed and it's not the first point
			else if (prevTier !== newTier) {
				console.log(`Tier upgraded from ${prevTier} to ${newTier}!`);
				setTierUpgradeModal(TIER_MESSAGES[newTier]);
			}

			pendingScoreRef.current = null; // Clear the pending score
		}
	}, [groups]); // Trigger when groups state changes

	return {
		currentTier,
		pendingScoreRef,
	};
}
