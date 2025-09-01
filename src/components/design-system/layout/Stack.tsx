import { styled } from "styled-components";
import { Grid } from "./Grid";

export const Stack = styled(Grid)`
  grid-template-columns: auto;
  grid-auto-rows: auto;
  grid-template-areas: 'component_stack';

  & > * {
    grid-area: component_stack;
  }
`;
