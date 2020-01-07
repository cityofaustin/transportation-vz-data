import React from "react";
import { useRoutes, usePath } from "hookrouter";
import { routes } from "../../routes/routes";
import Header from "../nav/Header";
import NotFound from "../NotFound/NotFound";

import { Container } from "reactstrap";
import styled from "styled-components";
import { drawer } from "../../constants/drawer";
import { responsive } from "../../constants/responsive";

const Content = ({ toggle }) => {
  const routeResult = useRoutes(routes);
  const currentPath = usePath();

  // Map view needs to consider header height and have no overflow scroll to fill view
  // Non-map views need to scroll to show all content
  const mapStyleExceptions = `
    height: ${
      currentPath === "/map"
        ? `calc(100vh - ${drawer.headerHeight}px)`
        : `100vh`
    };
    ${currentPath !== "/map" && `overflow-y: scroll;`}
  `;

  const StyledContent = styled.div`
    .content {
      padding: 0px;
      top: ${drawer.headerHeight}px;
      width: calc(100vw - ${drawer.width}px);
      ${mapStyleExceptions}
    }

    /* Fill space left behind by SideDrawer on mobile */
    @media only screen and (max-width: ${responsive.materialMedium}px) {
      .content {
        width: 100vw;
        ${mapStyleExceptions}
      }
    }
  `;

  return (
    <StyledContent>
      <Container fluid className="content">
        <Header toggleSidebar={toggle} />
        {routeResult || <NotFound />}
      </Container>
    </StyledContent>
  );
};

export default Content;