import type { TierInfo } from "../constants/scoring-messages";
import { Modal } from "./Modal";
import { Button } from "./ReminderApp.styled";
import { Flex } from "./design-system/layout/Flex";

interface CelebrationModalsProps {
	showFirstPointModal: boolean;
	setShowFirstPointModal: (show: boolean) => void;
	tierUpgradeModal: TierInfo | null;
	setTierUpgradeModal: (modal: TierInfo | null) => void;
}

const CenterText = ({
	children,
	className,
	style,
}: {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}) => (
	<div
		style={{
			textAlign: "center",
			margin: "1rem 0",
			fontSize: className === "big" ? "1.5rem" : "1rem",
			fontWeight: className === "big" ? "bold" : "normal",
			marginBottom: className === "big" ? "2rem" : "1rem",
			...style,
		}}
	>
		{children}
	</div>
);

export function CelebrationModals({
	showFirstPointModal,
	setShowFirstPointModal,
	tierUpgradeModal,
	setTierUpgradeModal,
}: CelebrationModalsProps) {
	return (
		<>
			{/* First point celebration modal */}
			<Modal open={showFirstPointModal}>
				<div>
					<CenterText>
						<h3>🎉 Congratulations! 🎉</h3>
					</CenterText>
					<CenterText className="big">First Point Earned!</CenterText>
					<CenterText style={{ marginBottom: "2rem" }}>
						You completed your first reminder loop! Keep it up and build your
						streak. Your score will now appear in the header.
					</CenterText>
					<Flex wrap="wrap" gap="0.5rem" justifyContent="center">
						<Button
							type="button"
							$variant="success"
							onClick={() => setShowFirstPointModal(false)}
						>
							Awesome! 🚀
						</Button>
					</Flex>
				</div>
			</Modal>

			{/* Tier upgrade celebration modal */}
			<Modal open={!!tierUpgradeModal}>
				{tierUpgradeModal && (
					<div>
						<CenterText>
							<h3>
								{tierUpgradeModal.emoji} {tierUpgradeModal.title}{" "}
								{tierUpgradeModal.emoji}
							</h3>
						</CenterText>
						<CenterText className="big">Level Up!</CenterText>
						<CenterText style={{ marginBottom: "2rem" }}>
							{tierUpgradeModal.message}
						</CenterText>
						<Flex wrap="wrap" gap="0.5rem" justifyContent="center">
							<Button
								type="button"
								$variant="success"
								onClick={() => setTierUpgradeModal(null)}
								style={{ backgroundColor: tierUpgradeModal.color }}
							>
								Continue the Journey ✨
							</Button>
						</Flex>
					</div>
				)}
			</Modal>
		</>
	);
}
