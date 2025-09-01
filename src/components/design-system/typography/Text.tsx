import { styled } from "styled-components";
import { typographySizes } from "../utils/constants";
import type { Size } from "../utils/constants";
import { spacing } from "../utils/spacing";
import type { SpacingProps } from "../utils/spacing";

interface TypographyProps extends SpacingProps {
	size?: Size;
	color?: string;
	weight?: number | string;
}

export const Text = styled.p<TypographyProps>`
  margin: 0;
  font-size: ${({ size = "md" }) => typographySizes[size]};
  color: ${({ color = "#222" }) => color};
  font-weight: ${({ weight }) => weight ?? 400};
  line-height: 1.5;
  ${spacing}
`;
