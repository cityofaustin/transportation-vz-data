import React, { useState } from "react";
import DataTable from "../../Components/DataTable";
import LocationMap from "./LocationMap";
import LocationEditMap from "./LocationEditMap";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Container,
  Button,
  ButtonGroup,
} from "reactstrap";

import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";

import locationDataMap from "./locationDataMap";
import LocationCrashes from "./LocationCrashes";

import { GET_LOCATION } from "../../queries/Locations";
import { GET_LOOKUPS } from "../../queries/lookups";

function Location(props) {
  const locationId = props.match.params.id;
  const [mapSelected, setMapSelected] = useState("aerial");
  const { loading, error, data, refetch } = useQuery(GET_LOCATION, {
    variables: { id: locationId },
  });

  // Import Lookup tables and aggregate an object of uiType= "select" options
  const { data: lookupSelectOptions } = useQuery(GET_LOOKUPS);

  const [editField, setEditField] = useState("");
  const [formData, setFormData] = useState({});

  const handleMapChange = e => {
    e.preventDefault();
    setMapSelected(e.target.id);
  };

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <h2 className="h2 mb-3">{data.atd_txdot_locations[0].description}</h2>
        </Col>
      </Row>
      {/* <Row> */}
      <Row>
        <Col md="6">
          <Card>
            <CardHeader>
              <i className="fa fa-map fa-lg mt-3"></i> View or Edit Location
              <ButtonGroup className="float-right">
                <Button
                  active={mapSelected === "aerial"}
                  id="aerial"
                  onClick={handleMapChange}
                  color="dark"
                  outline
                >
                  Aerial Map
                </Button>
                <Button
                  active={mapSelected === "edit"}
                  id="edit"
                  onClick={handleMapChange}
                  color="dark"
                  outline
                >
                  Edit Polygon
                </Button>
              </ButtonGroup>
            </CardHeader>
            <CardBody>
              {data && mapSelected === "aerial" && <LocationMap data={data} />}
              {data && mapSelected === "edit" && (
                <LocationEditMap data={data} refetch={refetch} />
              )}
            </CardBody>
          </Card>
        </Col>

        <DataTable
          dataMap={locationDataMap}
          dataTable={"atd_txdot_locations"}
          data={data}
          formData={formData}
          lookupSelectOptions={lookupSelectOptions}
        />
      </Row>
      {/* {locationDataMap.map(section => {
            return (
              <Card key={section.title}>
                <CardHeader>{section.title}</CardHeader>
                <CardBody>
                  <Table responsive striped hover>
                    <tbody>
                      {Object.keys(section.fields).map((field, i) => {
                        const fieldConfigObject = section.fields[field];
                        const fieldLabel = fieldConfigObject.label;
                        let fieldValueDisplay = "";

                        switch (field) {
                          // TODO: figure out a better way to parse through nested values
                          case "est_comp_cost":
                            fieldValueDisplay = !!data.atd_txdot_locations[0]
                              .crashes_count_cost_summary
                              ? data.atd_txdot_locations[0].crashes_count_cost_summary.est_comp_cost.toLocaleString()
                              : "No data";
                            break;
                          default:
                            fieldValueDisplay =
                              data.atd_txdot_locations[0][field];
                        }

                        if (fieldConfigObject.format === "datetime") {
                          fieldValueDisplay = formatDateTimeString(
                            fieldValueDisplay
                          );
                        }

                        if (fieldConfigObject.format === "dollars") {
                          fieldValueDisplay = formatCostToDollars(
                            fieldValueDisplay
                          );
                        }

                        return (
                          <tr key={i}>
                            <td>
                              <strong>{fieldLabel}</strong>
                            </td>
                            <td>{fieldValueDisplay}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            );
          })} */}
      {/* </Row> */}
      <Row>
        <Col>
          <LocationCrashes locationId={locationId} />
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Location);
