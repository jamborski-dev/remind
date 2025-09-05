import { AnimatePresence, motion } from "motion/react";
import React, { type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
	FiAlertCircle,
	FiAlertTriangle,
	FiCheckCircle,
	FiInfo,
	FiX,
} from "react-icons/fi";
import styled, { css } from "styled-components";

export type ToastStatus = "success" | "error" | "warning" | "info";

export interface Toast {
	id: string;
	status: ToastStatus;
	title: string;
	message?: ReactNode;
	duration?: number;
	onClose?: () => void;
}

interface ToastProps {
	toast: Toast;
	onDismiss: (id: string) => void;
}

interface ToastContainerProps {
	toasts: Toast[];
	onDismiss: (id: string) => void;
}

const statusConfig = {
	success: {
		icon: <FiCheckCircle />,
		bgColor: "#ffffff",
		borderColor: "#10b981",
		iconColor: "#10b981",
		titleColor: "#064e3b",
		textColor: "#374151",
		shadowColor: "rgba(16, 185, 129, 0.1)",
	},
	error: {
		icon: <FiAlertCircle />,
		bgColor: "#ffffff",
		borderColor: "#ef4444",
		iconColor: "#ef4444",
		titleColor: "#7f1d1d",
		textColor: "#374151",
		shadowColor: "rgba(239, 68, 68, 0.1)",
	},
	warning: {
		icon: <FiAlertTriangle />,
		bgColor: "#ffffff",
		borderColor: "#f59e0b",
		iconColor: "#f59e0b",
		titleColor: "#78350f",
		textColor: "#374151",
		shadowColor: "rgba(245, 158, 11, 0.1)",
	},
	info: {
		icon: <FiInfo />,
		bgColor: "#ffffff",
		borderColor: "#3b82f6",
		iconColor: "#3b82f6",
		titleColor: "#1e3a8a",
		textColor: "#374151",
		shadowColor: "rgba(59, 130, 246, 0.1)",
	},
} as const;

const ToastWrapper = styled(motion.div).withConfig({
	shouldForwardProp: (prop) => prop !== "status",
})<{ status: ToastStatus }>`
	display: grid;
	grid-template-columns: auto 1fr auto;
	grid-template-areas:
		"icon title close"
		"icon message close";
	gap: 0.75rem;
	align-items: start;
	
	min-width: 320px;
	max-width: 480px;
	padding: 1rem;
	margin-bottom: 0.75rem;
	
	border-radius: 8px;
	border: 1px solid;
	
	backdrop-filter: blur(8px);
	
	${({ status }) => {
		const config = statusConfig[status];
		return css`
			background-color: ${config.bgColor};
			border-color: ${config.borderColor};
			box-shadow: 
				0 4px 6px -1px ${config.shadowColor},
				0 2px 4px -1px rgba(0, 0, 0, 0.06),
				0 0 0 1px ${config.borderColor}20;
		`;
	}}
`;

const IconContainer = styled.div.withConfig({
	shouldForwardProp: (prop) => prop !== "status",
})<{ status: ToastStatus }>`
	grid-area: icon;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	margin-top: 2px;
	
	${({ status }) => css`
		color: ${statusConfig[status].iconColor};
	`}
	
	svg {
		width: 20px;
		height: 20px;
	}
`;

const Title = styled.div.withConfig({
	shouldForwardProp: (prop) => prop !== "status",
})<{ status: ToastStatus }>`
	grid-area: title;
	font-weight: 600;
	font-size: 0.875rem;
	line-height: 1.25rem;
	
	${({ status }) => css`
		color: ${statusConfig[status].titleColor};
	`}
`;

const Message = styled.div.withConfig({
	shouldForwardProp: (prop) => prop !== "status",
})<{ status: ToastStatus }>`
	grid-area: message;
	font-size: 0.875rem;
	line-height: 1.5rem;
	
	${({ status }) => css`
		color: ${statusConfig[status].textColor};
	`}
	
	p {
		margin: 0;
	}
	
	a {
		color: inherit;
		text-decoration: underline;
		font-weight: 500;
		
		&:hover {
			text-decoration: none;
		}
	}
	
	button {
		background: none;
		border: none;
		color: inherit;
		text-decoration: underline;
		font-weight: 500;
		cursor: pointer;
		padding: 0;
		font-size: inherit;
		
		&:hover {
			text-decoration: none;
		}
	}
`;

const CloseButton = styled.button`
	grid-area: close;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	margin-top: 2px;
	
	background: none;
	border: none;
	cursor: pointer;
	padding: 0;
	
	color: #6b7280;
	transition: color 0.15s ease-in-out;
	
	&:hover {
		color: #374151;
	}
	
	svg {
		width: 16px;
		height: 16px;
	}
`;

const ToastPortalContainer = styled.div`
	position: fixed;
	top: 1rem;
	right: 1rem;
	z-index: 9999;
	pointer-events: none;
	
	> * {
		pointer-events: auto;
	}
`;

function ToastItem({ toast, onDismiss }: ToastProps) {
	const config = statusConfig[toast.status];

	console.log("ToastItem: Rendering toast", toast.id, toast.title);

	React.useEffect(() => {
		console.log(
			"ToastItem: Setting up timer for toast",
			toast.id,
			"duration:",
			toast.duration,
		);
		if (toast.duration && toast.duration > 0) {
			const timer = setTimeout(() => {
				console.log("ToastItem: Auto-dismissing toast", toast.id);
				onDismiss(toast.id);
			}, toast.duration);

			return () => {
				console.log("ToastItem: Clearing timer for toast", toast.id);
				clearTimeout(timer);
			};
		}
	}, [toast.id, toast.duration, onDismiss]);

	const handleClose = () => {
		console.log("ToastItem: Manual close for toast", toast.id);
		onDismiss(toast.id);
		toast.onClose?.();
	};

	return (
		<ToastWrapper
			status={toast.status}
			initial={{ opacity: 0, x: 100, scale: 0.95 }}
			animate={{ opacity: 1, x: 0, scale: 1 }}
			exit={{ opacity: 0, x: 100, scale: 0.95 }}
			transition={{
				type: "spring",
				stiffness: 500,
				damping: 30,
			}}
		>
			<IconContainer status={toast.status}>{config.icon}</IconContainer>

			<Title status={toast.status}>{toast.title}</Title>

			{toast.message && (
				<Message status={toast.status}>{toast.message}</Message>
			)}

			<CloseButton onClick={handleClose}>
				<FiX />
			</CloseButton>
		</ToastWrapper>
	);
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
	const portalRoot = document.getElementById("toast-root") || document.body;

	console.log(
		"ToastContainer: Rendering with",
		toasts.length,
		"toasts:",
		toasts.map((t) => ({ id: t.id, title: t.title })),
	);

	return createPortal(
		<ToastPortalContainer>
			<AnimatePresence mode="popLayout">
				{toasts.map((toast) => (
					<ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
				))}
			</AnimatePresence>
		</ToastPortalContainer>,
		portalRoot,
	);
}
