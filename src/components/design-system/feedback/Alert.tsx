import { Box } from "@/components/design-system/layout/Box";
import {
	FiAlertCircle,
	FiAlertTriangle,
	FiCheckCircle,
	FiInfo,
} from "react-icons/fi";
import styled, { css } from "styled-components";

type Status = "error" | "success" | "warning" | "info";

interface AlertProps {
	status?: Status;
	children: React.ReactNode;
}

const statusStyles = {
	error: {
		bg: "#FED7D7",
		icon: <FiAlertCircle />,
		color: "#C53030",
	},
	success: {
		bg: "#C6F6D5",
		icon: <FiCheckCircle />,
		color: "#2F855A",
	},
	warning: {
		bg: "#FAF089",
		icon: <FiAlertTriangle />,
		color: "#975A16",
	},
	info: {
		bg: "#BEE3F8",
		icon: <FiInfo />,
		color: "#2B6CB0",
	},
};

const Root = styled(Box)<{ status: Status }>`
  display: flex;
  align-items: start;
  gap: 1rem;
  border-radius: 6px;
  padding: 1rem;
  ${({ status }) => css`
    background-color: ${statusStyles[status as keyof typeof statusStyles].bg};
    color: ${statusStyles[status as keyof typeof statusStyles].color};
  `}
`;

const Indicator = styled.div`
  font-size: 1.25rem;
  flex-shrink: 0;
  line-height: 1;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Title = styled.div`
  font-weight: bold;
`;

const Description = styled.div`
  font-size: 0.875rem;
  line-height: 1.4;
`;

export const Alert = {
	Root: ({ status = "info", children }: AlertProps) => (
		<Root status={status}>{children}</Root>
	),
	Indicator: ({ status = "info" }: { status?: Status }) => (
		<Indicator>{statusStyles[status].icon}</Indicator>
	),
	Content,
	Title,
	Description,
};
