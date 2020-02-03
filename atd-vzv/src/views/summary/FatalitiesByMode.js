import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import moment from "moment";
import { Bar } from "react-chartjs-2";
import { colors } from "../../constants/colors";

import { Container } from "reactstrap";
import {
  thisMonth,
  thisYear,
  lastYear,
  lastMonth,
  lastDayOfLastMonth
} from "../../constants/time";
import { demographicsEndpointUrl } from "./queries/socrataQueries";

const FatalitiesByMode = () => {
  // Define stacked bar chart properties in order of stack
  const modes = [
    { label: "Motor", flags: ["motor_vehicle_fl"], color: colors.chartRed },
    {
      label: "Pedestrian",
      flags: ["pedestrian_fl"],
      color: colors.chartOrange
    },
    {
      label: "Motorcycle",
      flags: ["motorcycle_fl"],
      color: colors.chartRedOrange
    },
    {
      label: "Pedalcyclist",
      flags: ["pedalcyclist_fl"],
      color: colors.chartLightBlue
    },
    {
      label: "Other",
      flags: [
        "other_fl",
        "train_fl",
        "motorized_conveyance_fl",
        "non_contact_fl",
        "towed_push_trailer_fl"
      ],
      color: colors.chartBlue
    }
  ];
  const yearLimit = 5; // Number of years to display in chart
  const yearsArray = useCallback(() => {
    let years = [];
    // If it is past January, display data up to and including current year,
    // else if it is January, only display data up to the end of last year
    let year = thisMonth > "01" ? thisYear : lastYear;
    for (let i = 0; i < yearLimit; i++) {
      years.push(parseInt(year) - i);
    }
    return years;
  }, []);

  const [chartData, setChartData] = useState("");
  const [latestRecordDate, setLatestRecordDate] = useState("");

  // Fetch data (Mode of fatality in crash)
  useEffect(() => {
    const getChartData = async () => {
      let newData = {};
      // Use Promise.all to let all requests resolve before setting chart data by year
      await Promise.all(
        yearsArray().map(async year => {
          // If getting data for current year (only including years past January), set end of query to last day of previous month,
          // else if getting data for previous years, set end of query to last day of year
          let endDate =
            year.toString() === thisYear
              ? `${year}-${lastMonth}-${lastDayOfLastMonth}T23:59:59`
              : `${year}-12-31T23:59:59`;
          let url = `${demographicsEndpointUrl}?$where=(prsn_injry_sev_id = 4) AND crash_date between '${year}-01-01T00:00:00' and '${endDate}'`;
          await axios.get(url).then(res => {
            newData = { ...newData, ...{ [year]: res.data } };
          });
          return null;
        })
      );
      setChartData(newData);
    };

    getChartData();
  }, [yearsArray]);

  // Fetch latest record from demographics dataset and set for chart subheading
  useEffect(() => {
    // If it is past January, set end of query to last day of previous month,
    // else if it is January, set end of query to last day of last year
    let endDate =
      thisMonth > "01"
        ? `${thisYear}-${lastMonth}-${lastDayOfLastMonth}T23:59:59`
        : `${lastYear}-12-31T23:59:59`;
    let url = `${demographicsEndpointUrl}?$limit=1&$order=crash_date DESC&$where=crash_date < '${endDate}'`;
    axios.get(url).then(res => {
      const latestRecordDate = res.data[0].crash_date;
      const formattedLatestDate = moment(latestRecordDate).format("MMMM YYYY");
      setLatestRecordDate(formattedLatestDate);
    });
  }, []);

  const createChartLabels = () =>
    yearsArray()
      .sort()
      .map(year => `${year}`);

  // Tabulate fatalities by mode from data
  const getModeData = flags =>
    yearsArray()
      .sort()
      .map(year => {
        let fatalities = 0;
        chartData[year].forEach(record =>
          flags.forEach(flag => record[`${flag}`] === "Y" && fatalities++)
        );
        return fatalities;
      });

  // Create dataset for each mode type
  // data property is an array of fatality sums sorted chronologically
  const createTypeDatasets = () =>
    modes.map(mode => ({
      backgroundColor: mode.color,
      borderColor: mode.color,
      borderWidth: 2,
      hoverBackgroundColor: mode.color,
      hoverBorderColor: mode.color,
      label: mode.label,
      data: getModeData(mode.flags)
    }));

  const data = {
    labels: createChartLabels(),
    datasets: !!chartData && createTypeDatasets()
  };

  return (
    <Container>
      <Bar
        data={data}
        options={{
          maintainAspectRatio: true,
          scales: {
            xAxes: [
              {
                stacked: true
              }
            ],
            yAxes: [
              {
                stacked: true
              }
            ]
          }
        }}
      />
      <p className="text-center">Data Through: {latestRecordDate}</p>
    </Container>
  );
};

export default FatalitiesByMode;
