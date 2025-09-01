import { Navigation } from "@/components/compound/Navigation";
import { Grid } from "@/components/design-system/layout/Grid";
import type { FC, PropsWithChildren } from "react";
import { styled } from "styled-components";
import { Box } from "../design-system/layout/Box";

export const AppMainGrid: FC<PropsWithChildren> = ({ children }) => {
	return (
		<PrimaryGrid
			as="main"
			templateColumns="100px auto"
			templateRows="50px auto"
			templateAreas={`'topbar topbar' 'sidebar main'`}
		>
			<TopBar>ajjaslfkas</TopBar>
			<Sidebar>
				<Navigation />
			</Sidebar>
			<MainContent>{children}</MainContent>
		</PrimaryGrid>
	);
};

const PrimaryGrid = styled(Grid)`
  height: 100vh;
`;

const Sidebar = styled(Box)`
  grid-area: sidebar;
  border-right: 1px solid #e0e0e0;
`;

const TopBar = styled(Box)`
  grid-area: topbar;
  border-bottom: 1px solid #e0e0e0;
`;

const MainContent = styled(Box)`
  grid-area: main;
`;
