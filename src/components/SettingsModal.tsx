import type React from "react";
import { FaArrowLeft, FaArrowRight, FaPlay } from "react-icons/fa6";
import Select from "react-select";
import { SOUND_CONFIGS } from "../constants/sounds";
import { getSoundConfig, playSound } from "../constants/sounds";
import { Modal } from "./design-system/feedback/Modal";
import { Button } from "./design-system/interactions/Button";

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	selectedSoundId: string;
	setSelectedSoundId: (soundId: string) => void;
	showActivityLog: boolean;
	setShowActivityLog: (show: boolean) => void;
	activityLogLimit: number;
	setActivityLogLimit: (limit: number) => void;
	setActivityLogPage: (page: number) => void;
}

const ToggleSwitch = ({
	$enabled,
	onClick,
	title,
}: { $enabled: boolean; onClick: () => void; title: string }) => (
	<button
		type="button"
		onClick={onClick}
		title={title}
		style={{
			position: "relative",
			width: "48px",
			height: "24px",
			borderRadius: "12px",
			border: "none",
			backgroundColor: $enabled ? "#4f46e5" : "#e5e7eb",
			cursor: "pointer",
			transition: "all 0.2s ease",
			padding: 0,
		}}
	>
		<div
			style={{
				position: "absolute",
				top: "2px",
				left: $enabled ? "26px" : "2px",
				width: "20px",
				height: "20px",
				borderRadius: "50%",
				backgroundColor: "white",
				transition: "all 0.2s ease",
				boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
			}}
		/>
	</button>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({
	isOpen,
	onClose,
	selectedSoundId,
	setSelectedSoundId,
	showActivityLog,
	setShowActivityLog,
	activityLogLimit,
	setActivityLogLimit,
	setActivityLogPage,
}) => {
	return (
		<Modal.Root isOpen={isOpen} onClose={onClose}>
			<Modal.Header>
				<h3 style={{ margin: 0 }}>Settings</h3>
			</Modal.Header>

			<Modal.Body>
				<div style={{ padding: "1rem 0" }}>
					<h4 style={{ marginBottom: "0.5rem" }}>Notification Sound</h4>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "0.5rem",
							marginBottom: "0.5rem",
						}}
					>
						<Button
							type="button"
							onClick={() => {
								const currentIndex = SOUND_CONFIGS.findIndex(
									(s) => s.id === selectedSoundId,
								);
								const prevIndex =
									currentIndex > 0
										? currentIndex - 1
										: SOUND_CONFIGS.length - 1;
								const prevSound = SOUND_CONFIGS[prevIndex];
								setSelectedSoundId(prevSound.id);
								// Preview the sound
								const soundConfig = getSoundConfig(prevSound.id);
								playSound(soundConfig);
							}}
							title="Previous sound"
							style={{ minWidth: "40px", height: "40px" }}
						>
							<FaArrowLeft />
						</Button>
						<Select
							value={{
								value: selectedSoundId,
								label:
									SOUND_CONFIGS.find((s) => s.id === selectedSoundId)?.name ||
									"Unknown",
							}}
							onChange={(option) => {
								if (option) {
									setSelectedSoundId(option.value);
									// Preview the sound when selected
									const soundConfig = getSoundConfig(option.value);
									playSound(soundConfig);
								}
							}}
							options={SOUND_CONFIGS.map((config) => ({
								value: config.id,
								label: config.name,
							}))}
							placeholder="Select a notification sound..."
							isSearchable={false}
							styles={{
								control: (base) => ({
									...base,
									minHeight: "40px",
								}),
								container: (base) => ({
									...base,
									flex: 1,
								}),
							}}
						/>
						<Button
							type="button"
							onClick={() => {
								const currentIndex = SOUND_CONFIGS.findIndex(
									(s) => s.id === selectedSoundId,
								);
								const nextIndex =
									currentIndex < SOUND_CONFIGS.length - 1
										? currentIndex + 1
										: 0;
								const nextSound = SOUND_CONFIGS[nextIndex];
								setSelectedSoundId(nextSound.id);
								// Preview the sound
								const soundConfig = getSoundConfig(nextSound.id);
								playSound(soundConfig);
							}}
							title="Next sound"
							style={{ minWidth: "40px", height: "40px" }}
						>
							<FaArrowRight />
						</Button>
						<Button
							type="button"
							onClick={() => {
								// Preview the currently selected sound
								const soundConfig = getSoundConfig(selectedSoundId);
								playSound(soundConfig);
							}}
							title="Play current sound"
							style={{ minWidth: "40px", height: "40px" }}
						>
							<FaPlay />
						</Button>
					</div>
					<p
						style={{
							fontSize: "0.875rem",
							color: "#666",
							margin: "0.5rem 0 0 0",
						}}
					>
						Use arrows to cycle through sounds, play button to preview current
						selection, or click dropdown to choose directly
					</p>
				</div>

				<div style={{ padding: "1rem 0" }}>
					<h4 style={{ marginBottom: "0.5rem" }}>Display Options</h4>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "0.5rem",
							marginBottom: "0.5rem",
						}}
					>
						<span>Show Activity Log</span>
						<ToggleSwitch
							$enabled={showActivityLog}
							onClick={() => setShowActivityLog(!showActivityLog)}
							title={
								showActivityLog ? "Hide activity log" : "Show activity log"
							}
						/>
					</div>
					<p
						style={{
							fontSize: "0.875rem",
							color: "#666",
							margin: "0.5rem 0 0 0",
						}}
					>
						Toggle visibility of the activity log sidebar
					</p>

					<div style={{ marginTop: "1rem" }}>
						<h5 style={{ marginBottom: "0.5rem", margin: "0 0 0.5rem 0" }}>
							Activity Log Items
						</h5>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
								marginBottom: "0.5rem",
							}}
						>
							<span style={{ fontSize: "0.875rem", color: "#666" }}>
								Only show last
							</span>
							<div
								style={{
									display: "flex",
									borderRadius: "6px",
									border: "1px solid #e6e6ef",
									overflow: "hidden",
									backgroundColor: "#f7f7fb",
								}}
							>
								{[10, 25, 50, 100].map((limit, index) => (
									<button
										key={limit}
										type="button"
										onClick={() => {
											setActivityLogLimit(limit);
											setActivityLogPage(0);
										}}
										style={{
											padding: "0.5rem 1rem",
											border: "none",
											backgroundColor:
												activityLogLimit === limit ? "#4f46e5" : "transparent",
											color: activityLogLimit === limit ? "white" : "#111",
											cursor: "pointer",
											fontSize: "0.875rem",
											fontWeight: activityLogLimit === limit ? "600" : "400",
											borderRight: index < 3 ? "1px solid #e6e6ef" : "none",
											transition: "all 0.2s ease",
											minWidth: "40px",
										}}
										onMouseEnter={(e) => {
											if (activityLogLimit !== limit) {
												e.currentTarget.style.backgroundColor = "#e6e6ef";
											}
										}}
										onMouseLeave={(e) => {
											if (activityLogLimit !== limit) {
												e.currentTarget.style.backgroundColor = "transparent";
											}
										}}
									>
										{limit}
									</button>
								))}
							</div>
							<span style={{ fontSize: "0.875rem", color: "#666" }}>items</span>
						</div>
						<p
							style={{
								fontSize: "0.875rem",
								color: "#666",
								margin: "0 0 0 0",
							}}
						>
							{activityLogLimit > 20
								? "Items will be paginated (20 per page)"
								: "All items shown on one page"}
						</p>
					</div>
				</div>
			</Modal.Body>

			<Modal.Actions>
				<Button type="button" onClick={onClose}>
					Close
				</Button>
			</Modal.Actions>
		</Modal.Root>
	);
};
