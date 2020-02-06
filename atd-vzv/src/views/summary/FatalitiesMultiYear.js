import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import { Line } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";
import { crashEndpointUrl } from "./queries/socrataQueries";
import {
  thisMonth,
  thisYear,
  lastYear,
  lastMonth,
  lastDayOfLastMonth,
  lastMonthString
} from "../../constants/time";
import { colors } from "../../constants/colors";

const FatalitiesMultiYear = () => {
  const getYearsAgoLabel = yearsAgo => {
    return moment()
      .subtract(yearsAgo, "year")
      .format("YYYY");
  };

  const [thisYearDeathArray, setThisYearDeathArray] = useState([]);
  const [lastYearDeathArray, setLastYearDeathArray] = useState([]);
  const [twoYearsAgoDeathArray, setTwoYearsAgoDeathArray] = useState([]);
  const [threeYearsAgoDeathArray, setThreeYearsAgoDeathArray] = useState([]);
  const [fourYearsAgoDeathArray, setFourYearsAgoDeathArray] = useState([]);

  const calculateYearlyTotals = deathArray => {
    return deathArray[deathArray.length - 1];
  };

  const calculateMonthlyTotals = (data, dateString) => {
    // Limit returned data to months of data available and prevent line from zeroing out
    // If dataString is passed in, convert to month string and use to truncate monthIntegerArray
    const monthLimit = dateString ? moment(dateString).format("MM") : "12";
    const monthIntegerArray = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12"
    ];
    const truncatedMonthIntegerArray = monthIntegerArray.slice(
      0,
      monthIntegerArray.indexOf(monthLimit) + 1
    );
    let cumulativeMonthTotal = 0;
    return truncatedMonthIntegerArray.map(month => {
      let monthTotal = 0;
      data.data.forEach(record => {
        if (moment(record.crash_date).format("MM") === month) {
          monthTotal += parseInt(record.apd_confirmed_death_count);
        }
      });
      cumulativeMonthTotal += monthTotal;
      return cumulativeMonthTotal;
    });
  };

  const renderHeader = () => {
    let deathArray;
    let year;
    if (thisMonth > "01") {
      deathArray = thisYearDeathArray;
      year = thisYear;
    } else {
      deathArray = lastYearDeathArray;
      year = lastYear;
    }
    return (
      <h6 style={{ color: colors.blue, textAlign: "center" }}>
        As of {lastMonthString}, there have been{" "}
        <strong>{calculateYearlyTotals(deathArray)}</strong> traffic fatalities
        in {year}.
      </h6>
    );
  };

  useEffect(() => {
    const lastMonthLastDayDate = `${thisYear}-${lastMonth}-${lastDayOfLastMonth}`;
    const thisYearUrl = `${crashEndpointUrl}?$where=apd_confirmed_death_count > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${lastMonthLastDayDate}T23:59:59'`;

    const getFatalitiesByYearsAgoUrl = yearsAgo => {
      let yearsAgoDate = moment()
        .subtract(yearsAgo, "year")
        .format("YYYY");
      return `${crashEndpointUrl}?$where=apd_confirmed_death_count > 0 AND crash_date between '${yearsAgoDate}-01-01T00:00:00' and '${yearsAgoDate}-12-31T23:59:59'`;
    };

    // If there is a full month of data available for the current year (i.e., we are past January),
    // fetch records for this year through last month
    if (thisMonth > "01") {
      axios.get(thisYearUrl).then(res => {
        setThisYearDeathArray(
          calculateMonthlyTotals(res, lastMonthLastDayDate)
        );
      });
    }

    // Fetch records from last year
    axios.get(getFatalitiesByYearsAgoUrl(1)).then(res => {
      setLastYearDeathArray(calculateMonthlyTotals(res));
    });

    // Fetch records from two years ago
    axios.get(getFatalitiesByYearsAgoUrl(2)).then(res => {
      setTwoYearsAgoDeathArray(calculateMonthlyTotals(res));
    });

    // Fetch records from three years ago
    axios.get(getFatalitiesByYearsAgoUrl(3)).then(res => {
      setThreeYearsAgoDeathArray(calculateMonthlyTotals(res));
    });

    // Fetch records from four years ago
    axios.get(getFatalitiesByYearsAgoUrl(4)).then(res => {
      setFourYearsAgoDeathArray(calculateMonthlyTotals(res));
    });
  }, []);

  // Build data object with data from the previous five years
  const data = {
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    datasets: [
      {
        label: `${getYearsAgoLabel(1)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: colors.redGradient5Of5, // Legend box
        borderColor: colors.redGradient5Of5,
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: colors.redGradient5Of5,
        pointBackgroundColor: colors.redGradient5Of5,
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors.redGradient5Of5,
        pointHoverBorderColor: colors.redGradient5Of5,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: lastYearDeathArray
      },
      {
        label: `${getYearsAgoLabel(2)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: colors.redGradient4Of5, // Legend box
        borderColor: colors.redGradient4Of5,
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: colors.redGradient4Of5,
        pointBackgroundColor: colors.redGradient4Of5,
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors.redGradient4Of5,
        pointHoverBorderColor: colors.redGradient4Of5,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: twoYearsAgoDeathArray
      },
      {
        label: `${getYearsAgoLabel(3)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: colors.redGradient3Of5, // Legend box
        borderColor: colors.redGradient3Of5,
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: colors.redGradient3Of5,
        pointBackgroundColor: colors.redGradient3Of5,
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors.redGradient3Of5,
        pointHoverBorderColor: colors.redGradient3Of5,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: threeYearsAgoDeathArray
      },
      {
        label: `${getYearsAgoLabel(4)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: colors.redGradient2Of5, // Legend box
        borderColor: colors.redGradient2Of5,
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: colors.redGradient2Of5,
        pointBackgroundColor: colors.redGradient2Of5,
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors.redGradient2Of5,
        pointHoverBorderColor: colors.redGradient2Of5,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: fourYearsAgoDeathArray
      }
    ]
  };

  // Add current year to data object if we are past January
  if (thisMonth > "01") {
    data.datasets.unshift({
      label: `${thisYear}`,
      fill: false,
      lineTension: 0.1,
      backgroundColor: colors.blue, // Legend box
      borderColor: colors.blue,
      borderCapStyle: "butt",
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: "miter",
      pointBorderColor: colors.blue,
      pointBackgroundColor: colors.blue,
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: colors.blue,
      pointHoverBorderColor: colors.blue,
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: thisYearDeathArray
    });
  }

  return (
    <Container>
      <Row style={{ paddingBottom: 20 }}>
        <Col>{renderHeader()}</Col>
      </Row>
      <Row style={{ paddingBottom: 20 }}>
        <Col xs="6" sm="4" md="2">
          <h6 style={{ textAlign: "center" }}>Prior Years:</h6>
        </Col>
        <Col xs="6" sm="4" md="2">
          <h6 style={{ textAlign: "center" }}>
            <strong>{calculateYearlyTotals(lastYearDeathArray)}</strong> in{" "}
            {getYearsAgoLabel(1)}
          </h6>
        </Col>
        <Col xs="6" sm="4" md="2">
          <h6 style={{ textAlign: "center" }}>
            <strong>{calculateYearlyTotals(twoYearsAgoDeathArray)}</strong> in{" "}
            {getYearsAgoLabel(2)}
          </h6>
        </Col>
        <Col xs="6" sm="4" md="2">
          <h6 style={{ textAlign: "center" }}>
            <strong>{calculateYearlyTotals(threeYearsAgoDeathArray)}</strong> in{" "}
            {getYearsAgoLabel(3)}
          </h6>
        </Col>
        <Col xs="6" sm="4" md="2">
          <h6 style={{ textAlign: "center" }}>
            <strong>{calculateYearlyTotals(fourYearsAgoDeathArray)}</strong> in{" "}
            {getYearsAgoLabel(4)}
          </h6>
        </Col>
      </Row>
      <Row>
        <Col>
          <Line
            data={data}
            options={{
              tooltips: {
                mode: "x"
              }
            }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default FatalitiesMultiYear;
