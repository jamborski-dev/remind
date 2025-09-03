import { AnimatePresence, motion } from "motion/react";
import type { MouseEvent, ReactNode } from "react";
import { ModalContent, ModalOverlay } from "./ReminderApp.styled";

interface ModalProps {
	open: boolean;
	onClose?: () => void;
	children: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
	return (
		<AnimatePresence>
			{open && (
				<ModalOverlay
					as={motion.div}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
				>
					<ModalContent
						as={motion.div}
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						onClick={(e: MouseEvent) => e.stopPropagation()}
					>
						{children}
					</ModalContent>
				</ModalOverlay>
			)}
		</AnimatePresence>
	);
}
