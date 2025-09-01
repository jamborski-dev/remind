import { motion } from "motion/react";
import styled, { createGlobalStyle } from "styled-components";

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
	}
`;

// ---- Main Layout Components ----
export const AppContainer = styled.div`
	min-height: 100vh;
	background-color: #fafafa;
	color: #333;
	font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	display: flex;
	flex-direction: column;
`;

export const Header = styled.header`
	background: white;
	border-bottom: 1px solid #e0e0e0;
	padding: 1rem 1.5rem;
	display: grid;
	grid-template-columns: 1fr auto 1fr;
	align-items: center;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const HeaderTitle = styled.h1`
	margin: 0;
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

export const HeaderActions = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
	justify-self: end;
`;

export const Layout = styled.div`
	margin: 0 auto;
	padding: 2vw;
	display: grid;
	grid-template-areas: 
		"activity-log form"
		"activity-log reminders";
	grid-template-columns: 30vw 62vw;
	grid-template-rows: auto 1fr;
	gap: 2vw;
	flex: 1;
	overflow-y: auto;
	height: 100%;
	
	@media (max-width: 768px) {
		grid-template-areas:
			"form"
			"reminders"
			"activity-log";
		grid-template-columns: 1fr;
		grid-template-rows: auto auto 1fr;
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

export const GroupCard = styled(motion.div)<{
	$borderColor?: string;
	$enabled?: boolean;
}>`
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

export const Sidebar = styled.aside`
	display: flex;
	flex-direction: column;
	gap: 1rem;
	height: 100%;
	grid-area: activity-log;
`;

export const SidebarHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

export const Main = styled.main`
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	height: 100%;
	grid-area: form;
`;

// ---- Form Components ----
export const Button = styled.button<{
	$variant?: "primary" | "success" | "warn" | "danger";
}>`
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;

  &:not(:disabled):hover {
    cursor: pointer;
    background: #f3f4f6;
    border-color: #bfc6d1;
  }

  &:disabled {
    filter: grayscale(100%);
    opacity: 0.5;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #60a5fa;
  }

  ${(props) =>
		props.$variant === "primary" &&
		`
    background: #60a5fa;
    color: white;
    border-color: #60a5fa;

    &:not(:disabled):hover {
      background: #3b82f6;
      border-color: #3b82f6;
    }
  `}

  ${(props) =>
		props.$variant === "success" &&
		`
    background: #6ee7b7;
    color: #065f46;
    border-color: #6ee7b7;

    &:not(:disabled):hover {
      background: #34d399;
      border-color: #34d399;
      color: #065f46;
    }
  `}

  ${(props) =>
		props.$variant === "warn" &&
		`
    background: #fde68a;
    color: #92400e;
    border-color: #fde68a;

    &:not(:disabled):hover {
      background: #fbbf24;
      border-color: #fbbf24;
      color: #92400e;
    }
  `}

  ${(props) =>
		props.$variant === "danger" &&
		`
    background: #fca5a5;
    color: #991b1b;
    border-color: #fca5a5;

    &:not(:disabled):hover {
      background: #f87171;
      border-color: #f87171;
      color: #991b1b;
    }

    & * {
      color: #991b1b !important;
    }
  `}
`;

export const WakeLockButton = styled(Button)<{ $enabled?: boolean }>`
	width: 48px;
	height: 32px;
	padding: 0;
	display: grid;
	grid-template-columns: 1fr 1fr;
	align-items: center;
	justify-items: center;
	gap: 2px;

	${(props) =>
		props.$enabled &&
		`
		background: #fbbf24;
		color: #92400e;
		border-color: #fbbf24;

		&:not(:disabled):hover {
			background: #f59e0b;
			border-color: #f59e0b;
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
--size: 32px;
	width: var(--size);
	height: var(--size);
	border: none;
	border-radius: var(--size);
	cursor: pointer;
	background: none;
	padding: 0;
	
	&::-webkit-color-swatch-wrapper {
		padding: 2px;
	}
	
	&::-webkit-color-swatch {
		border: none;
		border-radius: 4px;
	}
	
	&::-moz-color-swatch {
		border: none;
		border-radius: 4px;
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

export const Grid = styled.div`
  margin-top: 2rem;
	display: grid;
	grid-template-columns: 1fr auto auto;
	gap: 1rem;
	align-items: end;
`;

export const Row = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 0.5rem;
`;

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

export const MutedText = styled.span<{ $small?: boolean }>`
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

export const ModalActions = styled.div`
	display: flex;
	justify-content: center;
	gap: 1rem;
	margin-top: 1.5rem;
`;

export const ModalButtons = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	justify-content: center;
`;

// ---- Group Components ----
export const RemindersSection = styled.section`
	display: flex;
	flex-direction: column;
	gap: 1rem;
	grid-area: reminders;
`;

export const GroupList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

export const TitleRow = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 1rem;
	gap: 0.5rem;
	
	/* Push the last item (interval badge) to the right */
	> :last-child {
		margin-left: auto;
	}
`;

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

export const GroupItems = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
`;

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
		padding: 0.4rem 0.6rem;
		
		@media (min-width: 768px) {
			font-size: 0.875rem;
			padding: 0.5rem 1rem;
		}
	}
`;

export const GroupItemButtonGroup = styled.div`
	display: flex;
	align-items: center;
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

export const GroupItemFormRow = styled(Row)`
	gap: 8px;
	align-items: center;
	margin-bottom: 8px;
	flex-direction: row;
`;

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

export const CenterText = styled.div`
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
	border: none;
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

export const EditButtonGroup = styled.div`
	display: flex;
	gap: 0.25rem;
	margin-left: 0.5rem;
`;

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

export const TopForm = styled.div`
	display: flex;
	gap: 1rem;
`;
