import type { Toast } from "../components/design-system/feedback/Toast";

/**
 * Toast utility functions for common use cases
 */

export const createToastId = (): string => {
	return Math.random().toString(36).substr(2, 9);
};

export const createToast = (
	status: Toast["status"],
	title: string,
	message?: React.ReactNode,
	options: Partial<Omit<Toast, "id" | "status" | "title" | "message">> = {},
): Toast => {
	return {
		id: createToastId(),
		status,
		title,
		message,
		duration: 5000,
		...options,
	};
};

/**
 * Pre-configured toast creators for common scenarios
 */
export const toastPresets = {
	// Success scenarios
	saved: () =>
		createToast(
			"success",
			"Saved",
			"Your changes have been saved successfully.",
		),
	created: (itemName = "Item") =>
		createToast(
			"success",
			"Created",
			`${itemName} has been created successfully.`,
		),
	updated: (itemName = "Item") =>
		createToast(
			"success",
			"Updated",
			`${itemName} has been updated successfully.`,
		),
	deleted: (itemName = "Item") =>
		createToast(
			"success",
			"Deleted",
			`${itemName} has been deleted successfully.`,
		),

	// Error scenarios
	networkError: () =>
		createToast(
			"error",
			"Network Error",
			"Unable to connect to the server. Please check your internet connection.",
		),
	serverError: () =>
		createToast(
			"error",
			"Server Error",
			"Something went wrong on our end. Please try again later.",
		),
	validationError: (message: string) =>
		createToast("error", "Validation Error", message),
	permissionDenied: () =>
		createToast(
			"error",
			"Permission Denied",
			"You don't have permission to perform this action.",
		),

	// Warning scenarios
	unsavedChanges: () =>
		createToast(
			"warning",
			"Unsaved Changes",
			"You have unsaved changes. Make sure to save before leaving.",
		),
	sessionExpiring: () =>
		createToast(
			"warning",
			"Session Expiring",
			"Your session will expire in 5 minutes. Please save your work.",
		),

	// Info scenarios
	maintenance: (duration = "1 hour") =>
		createToast(
			"info",
			"Scheduled Maintenance",
			`System maintenance is scheduled for ${duration}. Some features may be unavailable.`,
		),
	newFeature: (featureName: string) =>
		createToast(
			"info",
			"New Feature",
			`${featureName} is now available! Check it out in the settings.`,
		),
	loading: (action = "Processing") =>
		createToast("info", action, "Please wait while we process your request.", {
			duration: 0,
		}), // 0 = no auto dismiss
};
