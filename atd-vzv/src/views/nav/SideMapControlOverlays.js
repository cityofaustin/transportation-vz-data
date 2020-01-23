import React from "react";
import { StoreContext } from "../../utils/store";

import { ButtonGroup, Button, Card, Label } from "reactstrap";

const SideMapControlOverlays = () => {
  const {
    mapOverlay: [overlay, setOverlay]
  } = React.useContext(StoreContext);

  const overlays = {
    asmp: {
      title: "ASMP Street Levels",
      options: ["1", "2", "3", "4", "5"]
    }
  };

  const handleOverlayClick = (event, parameters) => {
    // Set overlay in Context store or remove it
    const overlayName = event.currentTarget.id;

    if (overlay === "" || overlay.name !== overlayName) {
      setOverlay({
        name: overlayName,
        options: parameters.options
      });
    } else if (overlay.name === overlayName) {
      setOverlay("");
    }
  };

  const handleOverlayOptionClick = event => {
    // Set overlay in Context store or remove it
    const overlayOption = event.currentTarget.id;

    if (!overlay.options.includes(overlayOption)) {
      // Add clicked option to state
      setOverlay(prevState => ({
        ...prevState,
        options: [...prevState.options, ...overlayOption]
      }));
    } else if (overlay.options.includes(overlayOption)) {
      // Remove clicked option from state
      setOverlay(prevState => ({
        ...prevState,
        options: prevState.options.filter(option => option !== overlayOption)
      }));
    }
  };

  return (
    <Card className="mt-3 p-3 card-body">
      <Label className="section-title">Overlays</Label>
      {/* Create a button group for each overlay */}
      {Object.entries(overlays).map(([name, parameters], i) => (
        <Button
          key={i}
          id={name}
          color="info"
          className="w-100 pt-1 pb-1 pl-0 pr-0"
          onClick={event => handleOverlayClick(event, parameters)}
          active={name === overlay.name}
          outline={name !== overlay.name}
        >
          {parameters.title}
        </Button>
      ))}
      {overlay.name === "asmp" && (
        <ButtonGroup>
          {overlays.asmp.options.map((level, i) => (
            <Button
              key={i}
              id={level}
              color="info"
              className="w-100 pt-1 pb-1 pl-0 pr-0"
              //   TODO: Fix active and outline logic
              active={overlay.options.includes(level)}
              outline={!overlay.options.includes(level)}
              onClick={handleOverlayOptionClick}
            >
              {level}
            </Button>
          ))}
        </ButtonGroup>
      )}
    </Card>
  );
};

export default SideMapControlOverlays;
