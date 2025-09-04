import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import styled from "styled-components";

// Modal styled components
const ModalOverlay = styled(motion.div)`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	padding: 1rem;
`;

const ModalContent = styled(motion.div)`
	background: white;
	border-radius: 12px;
	padding: 1.5rem;
	max-width: 500px;
	width: 100%;
	max-height: 90vh;
	overflow-y: auto;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	position: relative;
`;

const ModalHeader = styled.div`
	text-align: center;
	margin-bottom: 1rem;
	
	h1, h2, h3, h4, h5, h6 {
		margin: 0;
		font-weight: 600;
	}
`;

const ModalBody = styled.div`
	margin-bottom: 1rem;
`;

const ModalActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	justify-content: center;
	margin-top: 1.5rem;
`;

const ModalMetaInfo = styled.div`
	text-align: center;
	font-size: 0.875rem;
	color: #6b7280;
	margin-bottom: 1rem;
`;

// Context for compound component
interface ModalContextType {
	isOpen: boolean;
	onClose?: () => void;
}

const ModalContext = React.createContext<ModalContextType | null>(null);

const useModalContext = () => {
	const context = React.useContext(ModalContext);
	if (!context) {
		throw new Error("Modal compound components must be used within Modal.Root");
	}
	return context;
};

// Root component
interface ModalRootProps {
	children: React.ReactNode;
	isOpen: boolean;
	onClose?: () => void;
}

const ModalRoot: React.FC<ModalRootProps> = ({ children, isOpen, onClose }) => {
	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && onClose) {
			onClose();
		}
	};

	const contextValue: ModalContextType = {
		isOpen,
		onClose,
	};

	return (
		<ModalContext.Provider value={contextValue}>
			<AnimatePresence>
				{isOpen && (
					<ModalOverlay
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={handleOverlayClick}
					>
						<ModalContent
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.2 }}
						>
							{children}
						</ModalContent>
					</ModalOverlay>
				)}
			</AnimatePresence>
		</ModalContext.Provider>
	);
};

// Header component
interface ModalHeaderProps {
	children: React.ReactNode;
}

const ModalHeaderComponent: React.FC<ModalHeaderProps> = ({ children }) => {
	useModalContext(); // Ensure we're within a Modal.Root
	return <ModalHeader>{children}</ModalHeader>;
};

// Body component
interface ModalBodyProps {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}

const ModalBodyComponent: React.FC<ModalBodyProps> = ({
	children,
	className,
	style,
}) => {
	useModalContext(); // Ensure we're within a Modal.Root
	return (
		<ModalBody className={className} style={style}>
			{children}
		</ModalBody>
	);
};

// Actions component
interface ModalActionsProps {
	children: React.ReactNode;
}

const ModalActionsComponent: React.FC<ModalActionsProps> = ({ children }) => {
	useModalContext(); // Ensure we're within a Modal.Root
	return <ModalActions>{children}</ModalActions>;
};

// Meta info component for additional info display
interface ModalMetaInfoProps {
	children: React.ReactNode;
}

const ModalMetaInfoComponent: React.FC<ModalMetaInfoProps> = ({ children }) => {
	useModalContext(); // Ensure we're within a Modal.Root
	return <ModalMetaInfo>{children}</ModalMetaInfo>;
};

// Compound exports
export const Modal = {
	Root: ModalRoot,
	Header: ModalHeaderComponent,
	Body: ModalBodyComponent,
	Actions: ModalActionsComponent,
	MetaInfo: ModalMetaInfoComponent,
};

// Individual exports for flexibility
export {
	ModalRoot,
	ModalHeaderComponent as ModalHeader,
	ModalBodyComponent as ModalBody,
	ModalActionsComponent as ModalActions,
	ModalMetaInfoComponent as ModalMetaInfo,
};

// Legacy compatibility - basic modal wrapper for gradual migration
interface LegacyModalProps {
	children: React.ReactNode;
	open: boolean;
	onClose?: () => void;
}

export const LegacyModal: React.FC<LegacyModalProps> = ({
	children,
	open,
	onClose,
}) => {
	return (
		<Modal.Root isOpen={open} onClose={onClose}>
			<Modal.Body>{children}</Modal.Body>
		</Modal.Root>
	);
};
