import { Alert } from "@/components/design-system/feedback/Alert";
import { Button } from "@/components/design-system/interactions/Button";
import { Flex } from "@/components/design-system/layout/Flex";
import { Text } from "@/components/design-system/typography/Text";

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

	return (
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
	);
};
