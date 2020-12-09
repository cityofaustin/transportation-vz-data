import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  ButtonGroup,
  Col,
  Row,
} from "reactstrap";
import axios from "axios";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import sample from "../../assets/img/brand/sample.png";
import CrashDiagramModal from "./CrashDiagramModal";

const CrashDiagram = props => {
  const [rotation, setRotation] = useState(0);

  console.log(props);

  const requestCR3 = () => {
    const requestUrl = `${process.env.REACT_APP_CR3_API_DOMAIN}/cr3/download/${props.crashId}`;
    const token = window.localStorage.getItem("id_token");

    axios
      .request(requestUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        const win = window.open(res.data.message, "_blank");
        win.focus();
      });
  };

  const rotate = event => {
    setRotation(event.target.value);
  };

  const resetRotate = () => {
    setRotation(0);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <Row>
            <Col>Crash Diagram</Col>
            <Col>
              {props.isTempRecord ? (
                <CrashDiagramModal
                  buttonTitle={[
                    "CR-3 PDF Unavailable",
                    " ",
                    <i className="fa fa-info-circle"></i>,
                  ]}
                  modalTitle={["CR-3 PDF Unavailable"]}
                  modalText={[
                    "CR-3 PDFs are not available for temporary records. Using the case id, check the",
                    " ",
                    <a href={"https://cris.dot.state.tx.us/"} target={"_new"}>
                      CRIS website
                    </a>,
                    " ",
                    "for the latest status of this crash.",
                  ]}
                />
              ) : props.isCr3Stored ? (
                <Button
                  color="primary"
                  style={{ float: "right" }}
                  onClick={requestCR3}
                >
                  Download CR-3 PDF
                </Button>
              ) : (
                <CrashDiagramModal
                  buttonTitle={[
                    "CR-3 PDF Unavailable",
                    " ",
                    <i className="fa fa-info-circle"></i>,
                  ]}
                  modalTitle={["CR-3 PDF Unavailable"]}
                  modalText={[
                    "The CR-3 file for this crash has not been imported.",
                    <br></br>,
                    "Use Brazos to search for the associated CR-3 Crash Report.",
                  ]}
                />
              )}
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          {props.cr3FileMetadata.successful_ocr_diagram_extraction ? (
            <TransformWrapper
              options={{
                limitToBounds: true,
                limitToWrapper: true,
                centerContent: true,
                minScale: 0.5,
              }}
            >
              {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <React.Fragment>
                  <Row>
                    <Col className="tools mb-2">
                      <ButtonGroup>
                        <Button color="primary" onClick={zoomIn}>
                          <i className="fa fa-search-plus"></i>
                        </Button>
                        <Button color="primary" onClick={zoomOut}>
                          <i className="fa fa-search-minus"></i>
                        </Button>
                      </ButtonGroup>
                      <Button
                        color="primary"
                        style={{ float: "right" }}
                        onClick={resetTransform}
                      >
                        <i className="fa fa-expand"></i>
                      </Button>
                    </Col>
                  </Row>
                  <TransformComponent>
                    <Row>
                      <Col className="d-flex justify-content-center">
                        <img
                          className="img-fluid w-75"
                          style={{ transform: `rotate(${rotation}deg)` }}
                          src={sample}
                          alt="test"
                        />
                      </Col>
                    </Row>
                  </TransformComponent>
                  <form>
                    <Row>
                      <Col className="form-group d-flex justify-content-center">
                        <label htmlFor="formControlRange">Rotate image</label>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={rotation}
                          className="form-control-range"
                          id="formControlRange"
                          onChange={rotate}
                        ></input>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="form-group d-flex justify-content-center">
                        <Button color="primary" onClick={resetRotate}>
                          Reset
                        </Button>
                      </Col>
                    </Row>
                  </form>
                </React.Fragment>
              )}
            </TransformWrapper>
          ) : (
            <div>Crash diagram unavailable.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default CrashDiagram;
