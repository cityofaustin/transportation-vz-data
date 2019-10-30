import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Alert,
  Input,
  Button,
} from "reactstrap";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";

import CrashCollapses from "./CrashCollapses";
import CrashMap from "./Maps/CrashMap";
import CrashEditCoordsMap from "./Maps/CrashEditCoordsMap";
import Widget02 from "../Widgets/Widget02";
import CrashChangeLog from "./CrashChangeLog";
import CR3Record from "./CR3Record";
import { crashDataMap } from "./crashDataMap";
import {
  formatCostToDollars,
  formatDateTimeString,
} from "../../helpers/format";
import "./crash.scss";

import { GET_CRASH, UPDATE_CRASH, GET_LOOKUPS } from "../../queries/crashes";

const calculateYearsLifeLost = people => {
  // Assume 75 year life expectancy,
  // Find the difference between person.prsn_age & 75
  // Sum over the list of ppl with .reduce
  return people.reduce((accumulator, person) => {
    let years = 0;
    if (person.injury_severity.injry_sev_desc === "KILLED") {
      let yearsLifeLost = 75 - Number(person.prsn_age);
      // What if the person is older than 75?
      // For now, so we don't have negative numbers,
      // Assume years of life lost is 0
      years = yearsLifeLost < 0 ? 0 : yearsLifeLost;
    }
    return accumulator + years;
  }, 0); // start with a count at 0 years
};

function Crash(props) {
  const crashId = props.match.params.id;
  const { loading, error, data, refetch } = useQuery(GET_CRASH, {
    variables: { crashId },
  });

  // Import Lookup tables and aggregate an object of uiType= "select" options
  const { data: lookupSelectOptions } = useQuery(GET_LOOKUPS);

  const [editField, setEditField] = useState("");
  const [formData, setFormData] = useState({});
  const [isEditingCoords, setIsEditingCoords] = useState(false);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const createGeocoderAddressString = data => {
    const geocoderAddressFields = [
      "rpt_block_num",
      "rpt_street_pfx",
      "street_name",
      "rpt_street_pfx",
    ];
    let geocoderAddressString = "";
    geocoderAddressFields.forEach(field => {
      if (data.atd_txdot_crashes[0][field] !== null) {
        geocoderAddressString = geocoderAddressString.concat(
          data.atd_txdot_crashes[0][field] + " "
        );
      }
    });
    return geocoderAddressString;
  };

  const handleInputChange = e => {
    const newFormState = Object.assign(formData, {
      [editField]: e.target.value,
      updated_by: localStorage.getItem("hasura_user_email"),
    });
    setFormData(newFormState);
  };

  const handleCancelClick = e => {
    e.preventDefault();

    setEditField("");
  };

  const handleFieldUpdate = e => {
    e.preventDefault();

    props.client
      .mutate({
        mutation: UPDATE_CRASH,
        variables: {
          crashId: crashId,
          changes: formData,
        },
      })
      .then(res => refetch());

    setEditField("");
  };

  const {
    apd_confirmed_death_count: deathCount,
    sus_serious_injry_cnt: seriousInjuryCount,
    latitude_primary: latitude,
    longitude_primary: longitude,
    address_confirmed_primary: primaryAddress,
    address_confirmed_secondary: secondaryAddress,
    cr3_stored_flag: cr3StoredFlag,
  } = data.atd_txdot_crashes[0];

  const mapGeocoderAddress = createGeocoderAddressString(data);
  const yearsLifeLostCount = calculateYearsLifeLost(
    data.atd_txdot_primaryperson.concat(data.atd_txdot_person)
  );

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <h2 className="h2 mb-3">{`${primaryAddress} & ${secondaryAddress}`}</h2>
        </Col>
      </Row>
      <Row>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={`${deathCount}`}
            mainText="Fatalities"
            icon="fa fa-heartbeat"
            color="danger"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={`${seriousInjuryCount}`}
            mainText="Serious Injuries"
            icon="fa fa-medkit"
            color="warning"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={`${yearsLifeLostCount}`}
            mainText="Years of Life Lost"
            icon="fa fa-hourglass-end"
            color="info"
          />
        </Col>
      </Row>
      <Row>
        <Col xs="12" md="6">
          <div className="mb-4">
            <Card>
              <CardHeader>
                <Row>
                  <Col>
                    Crash Location{" "}
                    {(data && data.atd_txdot_crash_locations.length > 0 && (
                      <>
                        (ID:&nbsp;
                        <Link
                          to={`/locations/${
                            data.atd_txdot_crash_locations[0]["location_id"]
                          }`}
                        >
                          {data.atd_txdot_crash_locations[0]["location_id"]}
                        </Link>
                        )
                      </>
                    )) ||
                      "(Unassigned)"}
                  </Col>
                  <Col>
                    {!isEditingCoords && (
                      <Button
                        color="primary"
                        style={{ float: "right" }}
                        onClick={e => setIsEditingCoords(!isEditingCoords)}
                      >
                        Edit Coordinates
                      </Button>
                    )}
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {(!latitude || !longitude) && (
                  <Alert color="danger">
                    Crash record is missing latitude and longitude values
                    required for map display.
                  </Alert>
                )}
                {!isEditingCoords && latitude && longitude ? (
                  <>
                    <CrashMap data={data.atd_txdot_crashes[0]} />
                    <Table responsive striped hover>
                      <tbody></tbody>
                    </Table>
                  </>
                ) : (
                  <>
                    <CrashEditCoordsMap
                      data={data.atd_txdot_crashes[0]}
                      mapGeocoderAddress={mapGeocoderAddress}
                      crashId={crashId}
                      refetchCrashData={refetch}
                      setIsEditingCoords={setIsEditingCoords}
                    />
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        </Col>
        <Col>
          <CR3Record crashId={crashId} isCr3Stored={cr3StoredFlag === "Y"} />
          <CrashCollapses data={data} />
        </Col>
      </Row>
      <Row>
        {crashDataMap.map(section => {
          return (
            <Col xs="12" md="6">
              <Card key={section.title}>
                <CardHeader>{section.title}</CardHeader>
                <CardBody>
                  <Table responsive striped hover>
                    <tbody>
                      {Object.keys(section.fields).map((field, i) => {
                        const isEditing = field === editField;
                        const fieldConfigObject = section.fields[field];

                        const fieldLabel = fieldConfigObject.label;

                        const formattedDollarValue =
                          fieldConfigObject.format === "dollars" &&
                          formatCostToDollars(data.atd_txdot_crashes[0][field]);

                        const formatDateTimeValue =
                          fieldConfigObject.format === "datetime" &&
                          formatDateTimeString(
                            data.atd_txdot_crashes[0][field]
                          );

                        const fieldValue =
                          formattedDollarValue ||
                          formatDateTimeValue ||
                          (formData && formData[field.data]) ||
                          data.atd_txdot_crashes[0][field];

                        const fieldUiType = fieldConfigObject.uiType;

                        const lookupPrefix = fieldConfigObject.lookupPrefix
                          ? fieldConfigObject.lookupPrefix
                          : field.split("_id")[0];

                        // If there is no lookup options, we can assume the field value can be displayed as is.
                        // If there is a lookup option, then the value is an ID to be referenced in a lookup table.
                        const fieldValueDisplay =
                          // make sure the value isn't null blank
                          fieldValue &&
                          // make sure there is a lookup object in the config
                          !!fieldConfigObject.lookupOptions &&
                          // make sure the config lookup object matches with lookup queries
                          lookupSelectOptions[fieldConfigObject.lookupOptions]
                            ? lookupSelectOptions[
                                fieldConfigObject.lookupOptions
                              ].find(
                                item =>
                                  item[`${lookupPrefix}_id`] === fieldValue
                              )[`${lookupPrefix}_desc`]
                            : fieldValue;

                        const selectOptions =
                          lookupSelectOptions[fieldConfigObject.lookupOptions];

                        return (
                          <tr key={i}>
                            <td>
                              <strong>{fieldLabel}</strong>
                            </td>
                            <td>
                              {isEditing ? (
                                <form onSubmit={e => handleFieldUpdate(e)}>
                                  {fieldUiType === "select" && (
                                    <Input
                                      name={field}
                                      id={field}
                                      onChange={e => handleInputChange(e)}
                                      defaultValue={fieldValue}
                                      type="select"
                                    >
                                      {selectOptions.map(option => (
                                        <option
                                          value={option[`${lookupPrefix}_id`]}
                                        >
                                          {option[`${lookupPrefix}_desc`]}
                                        </option>
                                      ))}
                                    </Input>
                                  )}
                                  {fieldUiType === "text" && (
                                    <input
                                      type="text"
                                      defaultValue={fieldValue}
                                      onChange={e => handleInputChange(e)}
                                    />
                                  )}

                                  <button type="submit">
                                    <i className="fa fa-check edit-toggle" />
                                  </button>
                                  <button type="cancel">
                                    <i
                                      className="fa fa-times edit-toggle"
                                      onClick={e => handleCancelClick(e)}
                                    ></i>
                                  </button>
                                </form>
                              ) : (
                                fieldValueDisplay
                              )}
                            </td>
                            <td>
                              {fieldConfigObject.editable && !isEditing && (
                                <i
                                  className="fa fa-pencil edit-toggle"
                                  onClick={() => setEditField(field)}
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          );
        })}

        <Col lg={6}>
          <CrashChangeLog data={data} />
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Crash);
