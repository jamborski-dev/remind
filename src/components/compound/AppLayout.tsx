import { FaGear, FaRotateRight } from "react-icons/fa6";
import type { TierInfo } from "../../constants/scoring-messages";
import { DevToastTrigger } from "../DevToastTrigger";
import {
	AppContainer,
	Button,
	Footer,
	GlobalStyle,
	Header,
	HeaderScore,
	HeaderTitle,
	MutedText,
} from "../ReminderApp.styled";
import { WakeLockSwitch } from "../WakeLockSwitch";
import { Flex } from "../design-system/layout/Flex";

interface AppLayoutProps {
	children: React.ReactNode;
	currentTier: TierInfo;
	score: number;
	groupsCount: number;
	reseedDev?: () => void;
	wakeLockSupported: boolean;
	acquireWakeLock: () => Promise<void>;
	releaseWakeLock: () => Promise<void>;
	setShowSettingsModal: (show: boolean) => void;
}

export function AppLayout({
	children,
	currentTier,
	score,
	groupsCount,
	reseedDev,
	wakeLockSupported,
	acquireWakeLock,
	releaseWakeLock,
	setShowSettingsModal,
}: AppLayoutProps) {
	return (
		<>
			<GlobalStyle />
			<AppContainer direction="column">
				<Header templateColumns="1fr auto 1fr" alignItems="center">
					<HeaderTitle>re:MIND</HeaderTitle>
					<HeaderScore
						$tierColor={currentTier.color}
						$showTrophy={currentTier.tier === "gold"}
						style={{
							opacity: score > 0 ? 1 : 0,
						}}
					>
						{currentTier.emoji} {score} point
						{score !== 1 ? "s" : ""}
					</HeaderScore>
					<Flex alignItems="center" gap="1rem" style={{ justifySelf: "end" }}>
						<MutedText>Groups: {groupsCount}</MutedText>
						{import.meta.env?.DEV && reseedDev && (
							<Button
								type="button"
								onClick={reseedDev}
								title="Reseed demo groups (dev)"
							>
								<FaRotateRight />
							</Button>
						)}
						{import.meta.env?.DEV && <DevToastTrigger />}
						{wakeLockSupported && (
							<WakeLockSwitch
								acquire={acquireWakeLock}
								release={releaseWakeLock}
							/>
						)}
						<Button
							type="button"
							onClick={() => setShowSettingsModal(true)}
							title="Settings"
						>
							<FaGear />
						</Button>
					</Flex>
				</Header>

				{children}

				<Footer>
					Runs entirely in your browser. Data stored via localStorage. Keep this
					tab open.
				</Footer>
			</AppContainer>
		</>
	);
}
