import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "./Components/CrashTypeSelector";
import { crashEndpointUrl } from "./queries/socrataQueries";
import { dataStartDate, summaryCurrentYearEndDate } from "../../constants/time";

const CrashesByPopulation = () => {
  const [crashType, setCrashType] = useState(null);
  const [data, setData] = useState([]);

  const url = `${crashEndpointUrl}?$query=`;

  // Fetch data for By Month Average and Cumulative visualizations
  useEffect(() => {
    const dateCondition = `crash_date BETWEEN '${dataStartDate.format(
      "YYYY-MM-DD"
    )}' and '${summaryCurrentYearEndDate}'`;
    const queryGroupAndOrder = `GROUP BY year ORDER BY year`;

    const queries = {
      fatalities: `SELECT date_extract_y(crash_date) as year, sum(death_cnt) as total 
                   WHERE death_cnt > 0 AND ${dateCondition} ${queryGroupAndOrder}`,
      fatalitiesAndSeriousInjuries: `SELECT date_extract_y(crash_date) as year, sum(death_cnt) + sum(sus_serious_injry_cnt) as total 
                                     WHERE (death_cnt > 0 OR sus_serious_injry_cnt > 0) AND ${dateCondition} ${queryGroupAndOrder}`,
      seriousInjuries: `SELECT date_extract_y(crash_date) as year, sum(sus_serious_injry_cnt) as total 
                        WHERE sus_serious_injry_cnt > 0 AND ${dateCondition} ${queryGroupAndOrder}`,
    };

    !!crashType &&
      axios
        .get(url + encodeURIComponent(queries[crashType.name]))
        .then((res) => {
          setData(res.data);
        });
  }, [crashType, url]);

  return (
    <Container className="m-0 p-0">
      <Row>
        <Col>
          <h2 className="text-left font-weight-bold">
            By Population (Rate Per 100,000)
          </h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <CrashTypeSelector setCrashType={setCrashType} />
        </Col>
      </Row>
      <Row>
        <Col>
          <hr />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col>{JSON.stringify(data)}</Col>
      </Row>
    </Container>
  );
};

export default CrashesByPopulation;
