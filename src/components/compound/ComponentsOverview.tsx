import { Alert } from "@/components/design-system/feedback/Alert";
import { ToastContainer } from "@/components/design-system/feedback/Toast";
import { Button } from "@/components/design-system/interactions/Button";
import { Flex } from "@/components/design-system/layout/Flex";
import { Text } from "@/components/design-system/typography/Text";
import { useToast } from "@/hooks/useToast";

export const ComponentsOverview = () => {
	const variants = [
		"solid",
		"subtle",
		"surface",
		"outline",
		"ghost",
		"plain",
	] as const;
	const sizes = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const;

	const {
		toasts,
		showSuccess,
		showError,
		showWarning,
		showInfo,
		dismissToast,
	} = useToast();

	const handleShowToasts = () => {
		showSuccess("Success!", "Your action completed successfully.");

		showError(
			"Error occurred",
			<>
				Something went wrong. Please{" "}
				<button type="button" onClick={() => console.log("Retry clicked")}>
					try again
				</button>{" "}
				or{" "}
				<button type="button" onClick={() => console.log("Support clicked")}>
					contact support
				</button>
				.
			</>,
		);

		showWarning(
			"Warning",
			"This action might have unintended consequences. Please review before proceeding.",
		);

		showInfo(
			"Info",
			"We will be performing server upgrades on October 12th from 6am - 8am PST. Service interruptions may occur.",
		);
	};

	return (
		<>
			<Flex direction="column" gap="2rem" p="1rem">
				{/* Variants Row */}
				<Flex gap="1rem" wrap="wrap">
					{variants.map((variant) => (
						<Button key={variant} variant={variant} color="#1a1a1a">
							{variant.charAt(0).toUpperCase() + variant.slice(1)}
						</Button>
					))}
				</Flex>
				{/* Sizes Row */}
				<Flex gap="1rem" wrap="wrap" alignItems="center">
					{sizes.map((size) => (
						<Button key={size} size={size} color="#1a1a1a">
							{size.toUpperCase()}
						</Button>
					))}
				</Flex>

				{/* Toast Demo Section */}
				<Flex gap="1rem" wrap="wrap" alignItems="center">
					<Button onClick={handleShowToasts} color="#1a1a1a">
						Show All Toasts
					</Button>
					<Button
						onClick={() => showSuccess("Quick Success", "Task completed!")}
						color="#10b981"
					>
						Success Toast
					</Button>
					<Button
						onClick={() => showError("Quick Error", "Something failed!")}
						color="#ef4444"
					>
						Error Toast
					</Button>
					<Button
						onClick={() => showWarning("Quick Warning", "Please be careful!")}
						color="#f59e0b"
					>
						Warning Toast
					</Button>
					<Button
						onClick={() => showInfo("Quick Info", "Here's some information.")}
						color="#3b82f6"
					>
						Info Toast
					</Button>
				</Flex>

				<Text as="h1" size="4xl">
					Welcome to the Styled Components Example
				</Text>

				<Flex gap="1rem" wrap="wrap" justifyContent="center">
					<Alert.Root status="info">
						<Alert.Indicator status="info" />
						<Alert.Content>This is an informational alert</Alert.Content>
					</Alert.Root>
					<Alert.Root status="success">
						<Alert.Indicator status="success" />
						<Alert.Content>This is an informational alert</Alert.Content>
					</Alert.Root>
					<Alert.Root status="error">
						<Alert.Indicator status="error" />
						<Alert.Content>
							<Alert.Title>Error Alert</Alert.Title>
							<Alert.Description>
								This is an informational alert
							</Alert.Description>
						</Alert.Content>
					</Alert.Root>
				</Flex>
			</Flex>

			{/* Toast Container */}
			<ToastContainer toasts={toasts} onDismiss={dismissToast} />
		</>
	);
};
