import { motion } from "motion/react";
import styled, { createGlobalStyle } from "styled-components";
import { Button as DSButton } from "./design-system/interactions/Button";
import { Flex } from "./design-system/layout/Flex";
import { Grid } from "./design-system/layout/Grid";
import { Text } from "./design-system/typography/Text";

// ---- Global Styles ----
export const GlobalStyle = createGlobalStyle`
	* {
		box-sizing: border-box;
	}
	
	body {
		font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		margin: 0;
		padding: 0;
	}
	
	h1, h2, h3, h4, h5, h6 {
		margin: 0;
		font-weight: 300;
	}
`;

// ---- Main Layout Components ----
// AppContainer component simplified to use Flex layout properties
export const AppContainer = styled(Flex)`
	min-height: 100vh;
	background-color: #fafafa;
	color: #333;
	font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

export const Header = styled(Grid)`
	background: white;
	border-bottom: 1px solid #e0e0e0;
	padding: 1rem 1.5rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const HeaderTitle = styled(Text).attrs({ as: "h1" })`
	font-size: 1.5rem;
	font-weight: 600;
	color: #8d8d8d;
	justify-self: start;
`;

export const HeaderScore = styled.div<{
	$tierColor?: string;
	$showTrophy?: boolean;
}>`
	justify-self: center;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	background: ${(props) => props.$tierColor || "#6b7280"};
	color: white;
	padding: 0.5rem 1rem;
	border-radius: 20px;
	font-weight: 600;
	font-size: 0.9rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	transition: opacity 0.3s ease, background-color 0.3s ease;
	
	${(props) =>
		props.$showTrophy &&
		`
		&::before {
			content: "🏆";
			font-size: 1.1rem;
		}
	`}
`;

// HeaderActions component removed - use Flex component directly in JSX with alignItems="center" gap="1rem" justifySelf="end"

export const Layout = styled.div<{ $showActivityLog?: boolean }>`
	/* margin: 0 auto; */
	padding: 2vw;
	display: grid;
	grid-template-areas: ${(props) =>
		props.$showActivityLog
			? `
		"activity-log form"
		"activity-log reminders"`
			: `
		"form"
		"reminders"`};
	grid-template-columns: ${(props) => (props.$showActivityLog ? "30vw 62vw" : "1fr")};
	grid-template-rows: auto 1fr;
	gap: 2vw;
	flex: 1;
	overflow-y: auto;
	height: 100%;
	
	@media (max-width: 1200px) {
		grid-template-areas: ${(props) =>
			props.$showActivityLog
				? `
			"form"
			"reminders"
			"activity-log"`
				: `
			"form"
			"reminders"`};
		grid-template-columns: 1fr;
		grid-template-rows: ${(props) => (props.$showActivityLog ? "auto auto 1fr" : "auto 1fr")};
		padding: 1rem;
	}
`;

export const Card = styled.div`
	background: white;
	border-radius: 8px;
	padding: 1.5rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	border: 1px solid #e0e0e0;
`;

// biome-ignore format: multiline definition breaks syntax highlighting
export const GroupCard = styled(motion.div)<{ $borderColor?: string; $enabled?: boolean; }>`
	background: white;
	border-radius: 8px;
	padding: 1.5rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	border: 1px solid #e0e0e0;
	border-left: 4px solid ${(props) => props.$borderColor || "#e0e0e0"};
	opacity: ${(props) => (props.$enabled !== false ? 1 : 0.6)};
	filter: ${(props) => (props.$enabled !== false ? "none" : "grayscale(50%)")};
	transition: opacity 0.2s ease, filter 0.2s ease;
`;

export const CardContent = styled.div`
	flex: 1;
	overflow-y: auto;
	min-height: 0;
`;

// Sidebar component simplified to use Flex layout properties
export const Sidebar = styled(Flex)`
	height: 100%;
	grid-area: activity-log;
`;

// SidebarHeader component removed - use Flex component directly in JSX with justifyContent="space-between" alignItems="center"

// Main component simplified to use Flex layout properties
export const Main = styled(Flex)`
	height: 100%;
	grid-area: form;
`;

// ---- Form Components ----
export const Button = styled(DSButton).attrs<{
	$variant?: "primary" | "success" | "warn" | "danger";
}>((props) => ({
	// When no custom variant is specified, use design system "subtle" variant
	variant: props.$variant ? undefined : "subtle",
}))<{
	$variant?: "primary" | "success" | "warn" | "danger";
}>`
  &:disabled {
    filter: grayscale(100%);
    opacity: 0.5;
  }

  ${(props) =>
		props.$variant === "primary" &&
		`
    background: #60a5fa !important;
    color: white !important;
    border: 1px solid #60a5fa !important;

    &:not(:disabled):hover {
      background: #3b82f6 !important;
      border-color: #3b82f6 !important;
    }
  `}

  ${(props) =>
		props.$variant === "success" &&
		`
    background: #6ee7b7 !important;
    color: #065f46 !important;
    border: 1px solid #6ee7b7 !important;

    &:not(:disabled):hover {
      background: #34d399 !important;
      border-color: #34d399 !important;
      color: #065f46 !important;
    }

    & * {
      color: #065f46 !important;
    }
  `}

  ${(props) =>
		props.$variant === "warn" &&
		`
    background: #fde68a !important;
    color: #92400e !important;
    border: 1px solid #fde68a !important;

    &:not(:disabled):hover {
      background: #fbbf24 !important;
      border-color: #fbbf24 !important;
      color: #92400e !important;
    }

    & * {
      color: #92400e !important;
    }
  `}

  ${(props) =>
		props.$variant === "danger" &&
		`
    background: #fca5a5 !important;
    color: #991b1b !important;
    border: 1px solid #fca5a5 !important;

    &:not(:disabled):hover {
      background: #f87171 !important;
      border-color: #f87171 !important;
      color: #991b1b !important;
    }

    & * {
      color: #991b1b !important;
    }
  `}
`;

export const WakeLockButton = styled(Button)<{ $enabled?: boolean }>`
	height: 38px;
  padding: 0;
  display: grid;
  grid-template-columns: 20px 22px;
  align-items: center;
  justify-items: center;
  gap: 3px;
  padding-inline: 0.8rem;

	${(props) =>
		props.$enabled &&
		`
		background: #3063c9;
		color: #fff;
		border-color: #3063c9;

		&:not(:disabled):hover {
			background: #4d77ca;
			border-color: #4d77ca;
		}
	`}
`;

export const ToggleSwitch = styled.button<{ $enabled?: boolean }>`
	position: relative;
	width: 40px;
	height: 22px;
	border: none;
	border-radius: 11px;
	background: ${(props) => (props.$enabled ? "#34d399" : "#d1d5db")};
	cursor: pointer;
	transition: background-color 0.3s ease;
	padding: 0;
	outline: none;

	&:focus {
		box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.3);
	}

	&:hover {
		background: ${(props) => (props.$enabled ? "#10b981" : "#9ca3af")};
	}

	&::before {
		content: '';
		position: absolute;
		top: 2px;
		left: ${(props) => (props.$enabled ? "20px" : "2px")};
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: white;
		transition: left 0.3s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
`;

export const Input = styled.input`
	padding: 0.5rem 0.75rem;
	border: 1px solid #d1d5db;
	border-radius: 6px;
	font-size: 0.875rem;
	transition: border-color 0.2s;
	height: 40px;
	background: white;
	
	&:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 1px #3b82f6;
	}
	
	&.number {
		width: 80px;
	}
`;

export const ColorPicker = styled.input`
	width: 32px;
	height: 32px;
	border: none;
	border-radius: 50%;
	cursor: pointer;
	background: none;
	padding: 0;
	
	&:focus {
		outline: none;
	}
	
	&::-webkit-color-swatch-wrapper {
		padding: 0;
		border-radius: 50%;
	}
	
	&::-webkit-color-swatch {
		border: none;
		border-radius: 50%;
	}
	
	&::-moz-color-swatch {
		border: none;
		border-radius: 50%;
	}
`;

export const Label = styled.label`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	color: #374151;
`;

export const FormGrid = styled.div`
  margin-top: 2rem;
	display: grid;
	grid-template-columns: 1fr auto auto;
	gap: 1rem;
	align-items: end;
`;

// Row component removed - use Flex component directly in JSX with alignItems="center" gap="0.5rem" mb="0.5rem"

export const Badge = styled.span<{ $variant?: "primary" }>`
	padding: 0.25rem 0.5rem;
	background: #f3f4f6;
	color: #374151;
	border-radius: 4px;
	font-size: 0.75rem;
	font-weight: 500;
	
	${(props) =>
		props.$variant === "primary" &&
		`
		background: #dbeafe;
		color: #1d4ed8;
	`}
`;

export const MutedText = styled(Text)<{ $small?: boolean }>`
	color: #6b7280;
	${(props) => props.$small && "font-size: 0.75rem;"}
`;

export const ActivityTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	font-size: 0.65rem;
	table-layout: fixed;
	
	th, td {
		padding: 0.5rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
    		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	th:nth-child(1), td:nth-child(1) {
		width: 15%;
	}
	
	th:nth-child(2), td:nth-child(2) {
		width: 20%;
	}
	
	th:nth-child(3), td:nth-child(3) {
		width: 65%;

	}
	
	th {
		font-weight: 600;
		color: #374151;
		background: #f9fafb;
	}
	
	tr:hover {
		background: #f9fafb;
	}
`;

// ---- Modal Components ----
export const ModalOverlay = styled.div`
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 50;
`;

export const ModalContent = styled.div`
	background: white;
	border-radius: 8px;
	padding: 2rem;
	max-width: 500px;
	width: 90%;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
`;

// ModalActions component removed - use Flex component directly in JSX with justifyContent="center" gap="1rem" mt="1.5rem"

// ModalButtons component removed - use Flex component directly in JSX with wrap="wrap" gap="0.5rem" justifyContent="center"

// ---- Group Components ----
// RemindersSection component simplified to use Flex layout properties
export const RemindersSection = styled(Flex)`
	grid-area: reminders;
`;

// GroupList component removed - use Flex component directly in JSX with direction="column" gap="1rem"

// TitleRow component removed - use Flex component directly in JSX with alignItems="center" mb="1rem" gap="0.5rem" and use ml="auto" on the last child or justifyContent="space-between"

export const GroupTitle = styled.div`
	font-size: 1.125rem;
	font-weight: 600;
	color: #111827;
	cursor: pointer;
	padding: 2px 4px;
	border-radius: 4px;
	transition: background-color 0.2s;
	
	&:hover {
		background-color: #f3f4f6;
	}
`;

// GroupItems component removed - use Flex component directly in JSX with direction="column" gap="0.75rem"

export const GroupItemRow = styled(motion.div)<{ $enabled?: boolean }>`
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 0.75rem;
	background: #f9fafb;
	border-radius: 6px;
	border: 1px solid #e5e7eb;
	opacity: ${(props) => (props.$enabled !== false ? 1 : 0.6)};
	filter: ${(props) => (props.$enabled !== false ? "none" : "grayscale(100%)")};
	transition: opacity 0.2s ease, filter 0.2s ease;

	@media (min-width: 768px) {
		flex-direction: row;
		align-items: center;
		gap: 0.75rem;
	}
`;

export const GroupItemMainRow = styled.div`
	display: flex;
	align-items: center;
	gap: 0.75rem;
	width: 100%;

	@media (min-width: 768px) {
		flex: 1;
	}
`;

export const GroupItemSecondaryRow = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	justify-content: space-between;
	width: 100%;

	@media (min-width: 768px) {
		width: auto;
		justify-content: flex-end;
		gap: 0.75rem;
	}
	
	/* Make buttons smaller on mobile */
	button {
		font-size: 0.8rem;
		/* padding: 0.4rem 0.6rem; */
		
		@media (min-width: 768px) {
			font-size: 0.875rem;
		}
	}
`;

// Special responsive flex component for group item buttons
export const ResponsiveButtonGroup = styled(Flex)`
	gap: 0.4rem;
	
	@media (min-width: 768px) {
		gap: 0.5rem;
	}
`;

export const GroupItemText = styled.div<{ $enabled: boolean }>`
	flex: 1;
	display: flex;
	align-items: center;
	font-weight: 500;
  gap: 0.5rem;
`;

export const GroupItemMeta = styled.div`
	font-size: 0.75rem;
	color: #6b7280;
`;

export const DueText = styled.span`
	color: #dc2626;
	font-weight: 500;
`;

export const Footer = styled.footer`
	border-top: 1px solid #e5e7eb;
	padding: 1rem 2rem;
	font-size: 0.75rem;
	color: #6b7280;
	background-color: #fafafa;
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	gap: 2rem;
	flex-shrink: 0;
	
	@media (max-width: 768px) {
		padding: 1rem;
		gap: 1rem;
		flex-direction: column;
		text-align: center;
	}
`;

// ---- Form-specific styled components to replace inline styles ----
export const FormGridContainer = styled(Label)`
  flex: 4;
`;

export const ColorPickerRow = styled.div`
	display: flex;
  flex-direction: column;
	gap: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	color: #374151;
  flex: 1;
`;

export const RemindersContainer = styled.div`
	grid-column: 1 / -1;
`;

export const RemindersTitle = styled.h3`
	margin-bottom: 8px;
	font-size: 0.875rem;
	margin-top: 1rem;
	margin-bottom: 1rem;
`;

// GroupItemFormRow component removed - use Flex component directly in JSX with gap="8px" alignItems="center" mb="8px" direction="row"

export const FlexInput = styled(Input)`
	flex: 1;
`;

export const CycleContainer = styled.div`
  margin-top: 1rem;
	grid-column: 1 / -1;
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
`;

export const NumberInput = styled(Input)`
	width: 80px;
`;

export const AutoMarginButton = styled(Button)`
	margin-left: auto;
`;

export const CountdownBadge = styled(Badge)<{
	$isDue: boolean;
	$isPaused?: boolean;
}>`
	font-family: monospace;
	min-width: 60px;
	text-align: center;
	background-color: ${(props) => {
		if (props.$isPaused) return "#f3f4f6";
		return props.$isDue ? "#e8fff5" : "#f3f4f6";
	}};
	color: ${(props) => {
		if (props.$isPaused) return "#6b7280";
		return props.$isDue ? "#0f5132" : "#374151";
	}};
	border: ${(props) => {
		if (props.$isPaused) return "1px solid #d1d5db";
		return props.$isDue ? "1px solid #b7f0d0" : "1px solid #d1d5db";
	}};
`;

export const ItemTitleSpan = styled.span`
font-size: 1rem;
	/* margin-right: 8px; */
`;

export const StatusBadge = styled(Badge)<{ $isDue: boolean }>`
	/* margin-left: 8px; */
	background-color: ${(props) => (props.$isDue ? "#e8fff5" : "#059669")};
	color: ${(props) => (props.$isDue ? "#0f5132" : "white")};
	border: ${(props) => (props.$isDue ? "1px solid #b7f0d0" : "none")};
  font-size: 0.8rem;
  white-space: nowrap;
`;

export const DeleteButton = styled(Button)`
	background-color: #fde2e4;
	color: #b4232c;
	border-color: #fac7cc;
	
	&:hover {
		background-color: #fce8ea;
	}
`;

export const DevContainer = styled.div`
	margin-top: 8px;
`;

export const CenterText = styled(Text)`
	text-align: center;

  h3 {
    font-size: 1rem;
    color: #6b7280;
  }
	
	&.big {
		font-size: 2rem;
		font-weight: 500;
		margin: 1rem 0;
	}
`;

export const ModalMetaInfo = styled.div`
	text-align: center;
	font-size: 0.8rem;
	color: #9ca3af;
	margin: 0.5rem 0 2rem;
	opacity: 0.8;
`;

export const EditableTitle = styled.input`
	font-size: 1.125rem;
	font-weight: 600;
	color: #111827;
	border: 1px solid #d1d5db;
	background: transparent;
	padding: 2px 4px;
	border-radius: 4px;
	min-width: 150px;
	
	&:focus {
		outline: none;
		background: white;
		border: 1px solid #3b82f6;
		box-shadow: 0 0 0 1px #3b82f6;
	}
`;

export const EditableInterval = styled.input`
	font-size: 0.75rem;
	font-weight: 500;
	padding: 0.25rem 0.5rem;
	background: #f3f4f6;
	color: #374151;
	border: 1px solid #d1d5db;
	border-radius: 4px;
	width: 50px;
	text-align: center;
	
	&:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 1px #3b82f6;
	}
`;

// EditButtonGroup component removed - use Flex component directly in JSX with gap="0.25rem" ml="0.5rem"

export const SmallButton = styled(Button)`
	padding: 0.25rem 0.5rem;
	font-size: 0.75rem;
`;

export const GroupActionsButton = styled(Button)`
	padding: 0.1875rem 0.5rem;
	font-size: 0.75rem;
	opacity: 0.7;
	transition: opacity 0.2s;
	height: 22px;
	min-height: 22px;
	
	&:not(:disabled):hover {
		opacity: 1;
	}

  &:disabled {
    filter: grayscale(100%);
  }
`;

// TopForm component removed - use Flex component directly in JSX with gap="1rem" alignItems="flex-end"
