import { css } from "styled-components";

// Utility types
export interface SpacingProps {
	m?: number | string;
	mt?: number | string;
	mb?: number | string;
	ml?: number | string;
	mr?: number | string;
	p?: number | string;
	pt?: number | string;
	pb?: number | string;
	pl?: number | string;
	pr?: number | string;
}

// Helper function to convert number to rem or return string as-is
export const toSpacing = (value: number | string): string => {
	if (typeof value === "number") {
		return `${value * 0.25}rem`;
	}
	return value;
};

export const spacing = css<SpacingProps>`
  ${({ m }) => m && `margin: ${toSpacing(m)};`}
  ${({ mt }) => mt && `margin-top: ${toSpacing(mt)};`}
  ${({ mb }) => mb && `margin-bottom: ${toSpacing(mb)};`}
  ${({ ml }) => ml && `margin-left: ${toSpacing(ml)};`}
  ${({ mr }) => mr && `margin-right: ${toSpacing(mr)};`}
  ${({ p }) => p && `padding: ${toSpacing(p)};`}
  ${({ pt }) => pt && `padding-top: ${toSpacing(pt)};`}
  ${({ pb }) => pb && `padding-bottom: ${toSpacing(pb)};`}
  ${({ pl }) => pl && `padding-left: ${toSpacing(pl)};`}
  ${({ pr }) => pr && `padding-right: ${toSpacing(pr)};`}
`;
