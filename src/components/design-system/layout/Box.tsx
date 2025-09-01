import { styled } from "styled-components";
import { spacing } from "../utils/spacing";
import type { SpacingProps } from "../utils/spacing";

export const Box = styled.div<SpacingProps>`
  ${spacing}
`;
