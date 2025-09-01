import { Link } from "@tanstack/react-router";
import { styled } from "styled-components";
import { Box } from "../design-system/layout/Box";

export const Navigation = () => {
	return (
		<Root>
			<Nav>
				<StyledLink to="/">Home</StyledLink>
				<StyledLink to="/users">Users</StyledLink>
				<StyledLink to="/settings">Settings</StyledLink>
			</Nav>
		</Root>
	);
};

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: underline;
  }
`;

const Root = styled(Box)`
`;
const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
`;
