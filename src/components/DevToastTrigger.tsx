import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import styled from "styled-components";
import { useAppStore } from "../store";
import type { Toast, ToastStatus } from "../store/types";

// Type for store with toast methods
type StoreWithToast = {
	showToast: (toast: Omit<Toast, "id">) => void;
};

interface ToastOption {
	value: string;
	label: string;
	status: ToastStatus;
	title: string;
	message?: React.ReactNode;
	duration?: number;
}

const toastOptions: ToastOption[] = [
	{
		value: "success-simple",
		label: "Success - Simple",
		status: "success",
		title: "Success!",
		message: "Task completed successfully.",
	},
	{
		value: "success-rich",
		label: "Success - Rich Content",
		status: "success",
		title: "Account Updated",
		message: (
			<>
				Your account was successfully updated. Do the happy dance and get
				yourself an ice cream taco.
			</>
		),
	},
	{
		value: "error-simple",
		label: "Error - Simple",
		status: "error",
		title: "Error occurred",
		message: "Something went wrong. Please try again.",
	},
	{
		value: "error-rich",
		label: "Error - Rich Content",
		status: "error",
		title: "Network Error",
		message: (
			<>
				AHHHHHHHHHH! RUN FOR YOUR LIVES!!! Oh no stop, it's just an app
				notification error.{" "}
				<button type="button" onClick={() => console.log("Retry clicked")}>
					Retry
				</button>{" "}
				or{" "}
				<button type="button" onClick={() => console.log("Support clicked")}>
					contact support
				</button>
				.
			</>
		),
	},
	{
		value: "warning-simple",
		label: "Warning - Simple",
		status: "warning",
		title: "Warning",
		message: "Please review your changes before proceeding.",
	},
	{
		value: "warning-rich",
		label: "Warning - Rich Content",
		status: "warning",
		title: "Unsaved Changes",
		message: "Ruh-roh. Something went wrong but we are looking into it.",
	},
	{
		value: "info-simple",
		label: "Info - Simple",
		status: "info",
		title: "Info",
		message: "Here's some helpful information.",
	},
	{
		value: "info-rich",
		label: "Info - Rich Content",
		status: "info",
		title: "Server Maintenance",
		message: (
			<>
				We will be performing server upgrades on October 12th from 6am - 8am
				PST. Service interruptions may occur.
			</>
		),
	},
	{
		value: "persistent",
		label: "Persistent Toast",
		status: "info",
		title: "Processing",
		message: "This toast won't auto-dismiss. Close it manually.",
		duration: 0, // No auto-dismiss
	},
];

const Container = styled.div`
	position: relative;
	display: inline-block;
`;

const Trigger = styled.button`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.375rem 0.75rem;
	background: #ffffff;
	border: 1px solid #d1d5db;
	border-radius: 6px;
	font-size: 0.875rem;
	color: #374151;
	cursor: pointer;
	transition: all 0.15s ease-in-out;
	min-width: 120px;
	justify-content: space-between;

	&:hover {
		border-color: #9ca3af;
		background: #f9fafb;
	}

	&:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	svg {
		transition: transform 0.15s ease-in-out;
		color: #6b7280;
	}

	&[data-open="true"] svg {
		transform: rotate(180deg);
	}
`;

const Dropdown = styled.div`
	position: absolute;
	top: calc(100% + 0.25rem);
	left: 0;
	right: 0;
	background: #ffffff;
	border: 1px solid #d1d5db;
	border-radius: 6px;
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
		0 4px 6px -2px rgba(0, 0, 0, 0.05);
	z-index: 9998;
	max-height: 300px;
	overflow-y: auto;
	min-width: 200px;
`;

const Option = styled.button`
	display: block;
	width: 100%;
	padding: 0.5rem 0.75rem;
	text-align: left;
	font-size: 0.875rem;
	color: #374151;
	background: none;
	border: none;
	cursor: pointer;
	transition: background-color 0.15s ease-in-out;
	white-space: nowrap;

	&:hover {
		background: #f3f4f6;
	}

	&:focus {
		outline: none;
		background: #f3f4f6;
	}

	&:first-child {
		border-top-left-radius: 6px;
		border-top-right-radius: 6px;
	}

	&:last-child {
		border-bottom-left-radius: 6px;
		border-bottom-right-radius: 6px;
	}
`;

export function DevToastTrigger() {
	const [isOpen, setIsOpen] = useState(false);
	const showToast = useAppStore(
		(state) => (state as unknown as StoreWithToast).showToast,
	);

	const handleOptionClick = (option: ToastOption) => {
		console.log("DevToastTrigger: Attempting to show toast", option.title);
		showToast({
			status: option.status,
			title: option.title,
			message: option.message,
			duration: option.duration,
		});
		setIsOpen(false);
	};

	const handleClickOutside = React.useCallback((event: MouseEvent) => {
		const target = event.target as Element;
		if (!target.closest("[data-toast-trigger]")) {
			setIsOpen(false);
		}
	}, []);

	React.useEffect(() => {
		if (isOpen) {
			document.addEventListener("click", handleClickOutside);
			return () => document.removeEventListener("click", handleClickOutside);
		}
	}, [isOpen, handleClickOutside]);

	return (
		<Container data-toast-trigger>
			<Trigger
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				data-open={isOpen}
				title="Test Toast Notifications (dev)"
			>
				<span>Test Toasts</span>
				<FiChevronDown />
			</Trigger>

			{isOpen && (
				<Dropdown>
					{toastOptions.map((option) => (
						<Option
							key={option.value}
							type="button"
							onClick={() => handleOptionClick(option)}
						>
							{option.label}
						</Option>
					))}
				</Dropdown>
			)}
		</Container>
	);
}
