import { css, styled } from "styled-components";
import { sizes } from "../utils/constants";
import type { Size } from "../utils/constants";
import { spacing } from "../utils/spacing";
import type { SpacingProps } from "../utils/spacing";

const buttonVariants = {
	solid: (color: string) => css`
    background: ${color};
    color: white;
    &:hover {
      background: #2b2b2b;
    }
  `,
	subtle: (_color: string) => css`
    background: #f3f3f3;
    color: #111;
    &:hover {
      background: #e2e2e2;
    }
  `,
	surface: (_color: string) => css`
    background: #f9f9f9;
    color: #111;
    box-shadow: inset 0 0 0 1px #ddd;
    &:hover {
      background: #eee;
    }
  `,
	outline: (color: string) => css`
    background: transparent;
    border: 1px solid ${color};
    color: ${color};
    &:hover {
      background: ${color}22;
    }
  `,
	ghost: (color: string) => css`
    background: transparent;
    color: ${color};
    &:hover {
      background: ${color}22;
    }
  `,
	plain: (_color: string) => css`
    background: none;
    border: none;
    color: inherit;
    padding: 0;
    &:hover {
      text-decoration: underline;
    }
  `,
};

interface ButtonProps extends SpacingProps {
	variant?: "solid" | "outline" | "ghost" | "subtle" | "surface" | "plain";
	size?: Size;
	color?: string;
}

export const Button = styled.button<ButtonProps>`
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.2s ease, color 0.2s ease, border 0.2s ease;
  display: flex;
  align-items: center;

  ${({ size = "md" }) => {
		const sizeStyles = sizes[size];
		return css`
      padding: ${sizeStyles.padding};
      font-size: ${sizeStyles.fontSize};
      border-radius: ${sizeStyles.borderRadius};
    `;
	}}

  ${({ variant = "solid", color = "#1a1a1a" }) => buttonVariants[variant](color)}

  ${spacing}
`;
