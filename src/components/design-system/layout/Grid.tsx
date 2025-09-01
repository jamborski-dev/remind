import { css, styled } from "styled-components";
import { toSpacing } from "../utils/spacing";
import type { SpacingProps } from "../utils/spacing";
import { Box } from "./Box";

// GRID PROPERTIES
interface GridProps extends SpacingProps {
	// Grid container properties
	templateColumns?: string;
	templateRows?: string;
	templateAreas?: string;
	gap?: number | string;
	rowGap?: number | string;
	columnGap?: number | string;
	justifyItems?: "start" | "end" | "center" | "stretch";
	alignItems?: "start" | "end" | "center" | "stretch";
	justifyContent?:
		| "start"
		| "end"
		| "center"
		| "stretch"
		| "space-around"
		| "space-between"
		| "space-evenly";
	alignContent?:
		| "start"
		| "end"
		| "center"
		| "stretch"
		| "space-around"
		| "space-between"
		| "space-evenly";
	autoColumns?: string;
	autoRows?: string;
	autoFlow?: "row" | "column" | "row dense" | "column dense";

	// Grid item properties (for when used as a grid item)
	gridColumn?: string;
	gridRow?: string;
	gridArea?: string;
	justifySelf?: "start" | "end" | "center" | "stretch";
	alignSelf?: "start" | "end" | "center" | "stretch";
}

const gridStyles = css<GridProps>`
  ${({ templateColumns }) => templateColumns && `grid-template-columns: ${templateColumns};`}
  ${({ templateRows }) => templateRows && `grid-template-rows: ${templateRows};`}
  ${({ templateAreas }) => templateAreas && `grid-template-areas: ${templateAreas};`}
  ${({ gap }) => gap && `gap: ${typeof gap === "number" ? toSpacing(gap) : gap};`}
  ${({ rowGap }) => rowGap && `row-gap: ${typeof rowGap === "number" ? toSpacing(rowGap) : rowGap};`}
  ${({ columnGap }) => columnGap && `column-gap: ${typeof columnGap === "number" ? toSpacing(columnGap) : columnGap};`}
  ${({ justifyItems }) => justifyItems && `justify-items: ${justifyItems};`}
  ${({ alignItems }) => alignItems && `align-items: ${alignItems};`}
  ${({ justifyContent }) => justifyContent && `justify-content: ${justifyContent};`}
  ${({ alignContent }) => alignContent && `align-content: ${alignContent};`}
  ${({ autoColumns }) => autoColumns && `grid-auto-columns: ${autoColumns};`}
  ${({ autoRows }) => autoRows && `grid-auto-rows: ${autoRows};`}
  ${({ autoFlow }) => autoFlow && `grid-auto-flow: ${autoFlow};`}
  ${({ gridColumn }) => gridColumn && `grid-column: ${gridColumn};`}
  ${({ gridRow }) => gridRow && `grid-row: ${gridRow};`}
  ${({ gridArea }) => gridArea && `grid-area: ${gridArea};`}
  ${({ justifySelf }) => justifySelf && `justify-self: ${justifySelf};`}
  ${({ alignSelf }) => alignSelf && `align-self: ${alignSelf};`}
`;

export const Grid = styled(Box)<GridProps>`
  display: grid;
  ${gridStyles}
`;
