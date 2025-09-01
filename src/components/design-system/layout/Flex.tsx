import { css, styled } from "styled-components";
import { toSpacing } from "../utils/spacing";
import type { SpacingProps } from "../utils/spacing";
import { Box } from "./Box";

// FLEX PROPERTIES
interface FlexProps extends SpacingProps {
	direction?: "row" | "column" | "row-reverse" | "column-reverse";
	wrap?: "nowrap" | "wrap" | "wrap-reverse";
	justifyContent?:
		| "flex-start"
		| "flex-end"
		| "center"
		| "space-between"
		| "space-around"
		| "space-evenly";
	alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
	alignContent?:
		| "flex-start"
		| "flex-end"
		| "center"
		| "stretch"
		| "space-between"
		| "space-around";
	gap?: number | string;
	flex?: boolean | string; // Allow boolean or string for flex property
	grow?: number;
	shrink?: number;
	basis?: string | number;
}

const flexStyles = css<FlexProps>`
  ${({ direction }) => direction && `flex-direction: ${direction};`}
  ${({ wrap }) => wrap && `flex-wrap: ${wrap};`}
  ${({ justifyContent }) => justifyContent && `justify-content: ${justifyContent};`}
  ${({ alignItems }) => alignItems && `align-items: ${alignItems};`}
  ${({ alignContent }) => alignContent && `align-content: ${alignContent};`}
  ${({ gap }) => gap && `gap: ${typeof gap === "number" ? toSpacing(gap) : gap};`}
  ${({ flex }) => flex !== undefined && `flex: ${typeof flex === "boolean" ? (flex ? 1 : 0) : flex};`}
  ${({ grow }) => grow !== undefined && `flex-grow: ${grow};`}
  ${({ shrink }) => shrink !== undefined && `flex-shrink: ${shrink};`}
  ${({ basis }) => basis && `flex-basis: ${typeof basis === "number" ? toSpacing(basis) : basis};`}
`;

export const Flex = styled(Box)<FlexProps>`
  display: flex;
  ${flexStyles}
`;
