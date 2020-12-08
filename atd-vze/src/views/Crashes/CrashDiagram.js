import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  ButtonGroup,
  Alert,
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import axios from "axios";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import sample from "../../assets/img/brand/sample.png";

const CrashDiagram = props => {
  const [rotation, setRotation] = useState(0);
  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);

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
                <Alert color="warning">
                  <strong>
                    CR3 PDFs are not available for temporary records.
                  </strong>
                  <br />
                  Using the case id, check the{" "}
                  <a href={"https://cris.dot.state.tx.us/"} target={"_new"}>
                    CRIS website
                  </a>{" "}
                  for the latest status of this crash.
                </Alert>
              ) : props.isCr3Stored ? (
                <Button
                  color="primary"
                  style={{ float: "right" }}
                  onClick={requestCR3}
                >
                  Download CR-3 PDF
                </Button>
              ) : (
                <div>
                  <Button
                    color="primary"
                    style={{ float: "right" }}
                    onClick={toggle}
                  >
                    CR-3 PDF Not Available
                  </Button>
                  <Modal isOpen={modal} toggle={toggle}>
                    <ModalHeader toggle={toggle}>
                      CR-3 PDF Not Available
                    </ModalHeader>
                    <ModalBody>
                      The CR-3 file for this crash has not been imported. Use
                      Brazos to search for the associated CR-3 Crash Report.
                    </ModalBody>
                  </Modal>
                </div>
              )}
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
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
        </CardBody>
      </Card>
    </div>
  );
};

export default CrashDiagram;
