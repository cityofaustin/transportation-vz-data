import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import { withApollo } from "react-apollo";
import { gql } from "apollo-boost";

const TableSortHeader = ({ setOrderFilter, fieldMap, columns }) => {
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    const orderQuery = () => {
      let queryStringArray = [];
      queryStringArray.push({
        ORDER_BY: `order_by: { ${sortColumn}: ${sortOrder} }`,
      });
      queryStringArray.push({ type: `Order` });
      return queryStringArray;
    };
    const queryStringArray = orderQuery();
    setOrderFilter(queryStringArray);
  }, [sortColumn, sortOrder, setOrderFilter]);

  const handleTableHeaderClick = col => {
    if (sortOrder === "" && sortColumn === "") {
      // First time sort is applied
      setSortOrder("asc");
      setSortColumn(col);
    } else if (sortColumn === col) {
      // Repeat sort on column
      sortOrder === "desc" ? setSortOrder("asc") : setSortOrder("desc");
    } else if (sortColumn !== col) {
      // Sort different column after initial sort
      setSortOrder("desc");
      setSortColumn(col);
    }
  };

  const convertFieldNameToTitle = col => {
    let title = "";
    fieldMap.map(
      field => (title = field.fields[col] ? field.fields[col] : title)
    );
    return title;
  };

  // Add greyed-out arrow to indicate that sort is possible
  const renderSortArrow = col =>
    sortColumn === col ? (
      <i
        className={`fa fa-arrow-circle-${sortOrder === "asc" ? "up" : "down"}`}
      />
    ) : null;

  return (
    <thead>
      <tr>
        {columns.map((col, i) => (
          <th onClick={e => handleTableHeaderClick(col)} key={`th-${i}`}>
            {renderSortArrow(col)} {convertFieldNameToTitle(col)}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default withApollo(TableSortHeader);
