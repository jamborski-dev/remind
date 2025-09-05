import type React from "react";
import { FaArrowLeft, FaArrowRight, FaPlay } from "react-icons/fa6";
import {
	FiCheck,
	FiDownload,
	FiInfo,
	FiRefreshCw,
	FiSmartphone,
} from "react-icons/fi";
import Select from "react-select";
import { SOUND_CONFIGS } from "../constants/sounds";
import { getSoundConfig, playSound } from "../constants/sounds";
import { usePWAInstall } from "../hooks/usePWAInstall";
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

const InfoText = ({ children }: { children: React.ReactNode }) => (
	<div
		style={{
			display: "flex",
			alignItems: "flex-start",
			gap: "0.375rem",
			fontSize: "0.75rem",
			color: "#9ca3af",
			margin: "0.375rem 0 0 0",
			lineHeight: "1.3",
		}}
	>
		<FiInfo
			style={{
				width: "12px",
				height: "12px",
				marginTop: "1px",
				flexShrink: 0,
				opacity: 0.7,
			}}
		/>
		<span>{children}</span>
	</div>
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
	const {
		isInstalled,
		installApp,
		getInstallInstructions,
		canPromptInstall,
		hasUpdate,
		applyUpdate,
	} = usePWAInstall();
	return (
		<Modal.Root isOpen={isOpen} onClose={onClose}>
			<Modal.Header>
				<h3 style={{ margin: 0 }}>Settings</h3>
			</Modal.Header>

			<Modal.Body>
				{/* Notification Sound Section */}
				<div style={{ paddingBottom: "1.5rem" }}>
					<h4
						style={{
							marginBottom: "1rem",
							marginTop: 0,
							fontSize: "1.1rem",
							fontWeight: "600",
						}}
					>
						Notification Sound
					</h4>
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
					<InfoText>
						Use arrows to cycle through sounds, play button to preview current
						selection, or click dropdown to choose directly
					</InfoText>
				</div>

				{/* Section Divider */}
				<div
					style={{
						height: "1px",
						backgroundColor: "#e5e7eb",
						margin: "1rem 0",
					}}
				/>

				{/* Display Options Section */}
				<div style={{ paddingBottom: "1.5rem" }}>
					<h4
						style={{
							marginBottom: "1rem",
							marginTop: 0,
							fontSize: "1.1rem",
							fontWeight: "600",
						}}
					>
						Display Options
					</h4>
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
					<InfoText>Toggle visibility of the activity log sidebar</InfoText>

					{/* Sub-section divider */}
					<div
						style={{
							height: "1px",
							backgroundColor: "#f3f4f6",
							margin: "1.5rem 0 1rem 0",
						}}
					/>

					<div style={{ marginTop: "1rem" }}>
						<h5
							style={{
								marginBottom: "0.75rem",
								margin: "0 0 0.75rem 0",
								fontSize: "1rem",
								fontWeight: "500",
								color: "#4b5563",
							}}
						>
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
						<InfoText>
							{activityLogLimit > 20
								? "Items will be paginated (20 per page)"
								: "All items shown on one page"}
						</InfoText>
					</div>
				</div>

				{/* Section Divider */}
				<div
					style={{
						height: "1px",
						backgroundColor: "#e5e7eb",
						margin: "1rem 0",
					}}
				/>

				{/* PWA Installation Section */}
				<div style={{ paddingBottom: "1.5rem" }}>
					<h4
						style={{
							marginBottom: "1rem",
							marginTop: 0,
							fontSize: "1.1rem",
							fontWeight: "600",
						}}
					>
						App Installation
					</h4>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "0.75rem",
							marginBottom: "0.75rem",
						}}
					>
						<div
							style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
						>
							{isInstalled ? (
								<>
									<FiCheck style={{ color: "#10b981", fontSize: "1.25rem" }} />
									<span style={{ color: "#10b981", fontWeight: "500" }}>
										App Installed
									</span>
								</>
							) : (
								<>
									<FiSmartphone
										style={{ color: "#6b7280", fontSize: "1.25rem" }}
									/>
									<span style={{ color: "#6b7280" }}>Not Installed</span>
								</>
							)}
						</div>
						{!isInstalled && canPromptInstall && (
							<Button
								type="button"
								onClick={async () => {
									await installApp();
								}}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.5rem",
									fontSize: "0.875rem",
									padding: "0.5rem 1rem",
								}}
							>
								<FiDownload size={16} />
								Install App
							</Button>
						)}
						{hasUpdate && (
							<Button
								type="button"
								onClick={() => {
									applyUpdate();
								}}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.5rem",
									fontSize: "0.875rem",
									padding: "0.5rem 1rem",
									backgroundColor: "#f59e0b",
									borderColor: "#f59e0b",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = "#d97706";
									e.currentTarget.style.borderColor = "#d97706";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = "#f59e0b";
									e.currentTarget.style.borderColor = "#f59e0b";
								}}
							>
								<FiRefreshCw size={16} />
								Update Available
							</Button>
						)}
					</div>
					{isInstalled ? (
						<InfoText>
							re:MIND is installed as an app on your device. You can launch it
							from your home screen or app drawer.
							{hasUpdate &&
								" An update is available - click the update button to apply it."}
						</InfoText>
					) : (
						<InfoText>
							{canPromptInstall
								? "Install re:MIND as an app for faster access and offline functionality. Click the button above to install."
								: `To install re:MIND as an app: ${getInstallInstructions()}`}
						</InfoText>
					)}
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
