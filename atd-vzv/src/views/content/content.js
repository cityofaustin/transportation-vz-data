import React from "react";
import { useRoutes, usePath } from "hookrouter";
import { routes } from "../../routes/routes";
import Header from "../nav/header";
import NotFound from "../NotFound/NotFound";

import { Container } from "reactstrap";
import styled from "styled-components";
import { drawer } from "../../constants/drawer";
import { responsive } from "../../constants/responsive";

// TODO: overflow-y scroll on Dashboard

const Content = ({ toggle, mapFilters }) => {
  const routeResult = useRoutes(routes);
  const currentPath = usePath();

  // No need for overflow with map and overflow-y: scroll; breaks Map
  const StyledContent = styled.div`
    .content {
      padding: 0px;
      width: calc(100vw - ${drawer.width}px);
      height: calc(100vh - ${drawer.headerHeight}px);
      ${currentPath !== "/map" && `overflow-y: scroll;`}
    }

    /* Fill space left behind by SideDrawer on mobile */
    @media only screen and (max-width: ${responsive.sm}px) {
      .content {
        width: 100vw;
        height: calc(100vh - ${drawer.headerHeight}px);
        ${currentPath !== "/map" && `overflow-y: scroll;`}
      }
    }
  `;

  return (
    <StyledContent>
      <Container fluid className="content bg-light">
        <Header toggleSidebar={toggle} />
        {routeResult(mapFilters) || <NotFound />}
      </Container>
    </StyledContent>
  );
};

export default Content;
