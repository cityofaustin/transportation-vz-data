import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";

import { withApollo } from "react-apollo";
import { CSVLink } from "react-csv";

import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  ButtonGroup,
  Spinner,
} from "reactstrap";

import GridTableHeader from "./GridTableHeader";
import GridTablePagination from "./GridTablePagination";
import GridTableSearch from "./GridTableSearch";

const GridTable = ({ title, query, fieldMap }) => {
  /**
   * State management:
   *      limit {int} - Contains the current limit of results in a page
   *      offset {int} - Contains the current offset for querying in the database
   *      page {int} - Contains the current page number (1 by default)
   *      sortColumn {string} - Contains the name of the column being used to sort the data
   *      sortOrder {string} - Contains either 'asc' or 'desc'
   *      searchString {string} - Contains the string to search for in searchable columns.
   */
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [searchParameters, setSearchParameters] = useState({});

  /**
   * Handles the
   * @param {string} col - The name of the column
   **/
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

  const changePage = n => {
    console.log("Changing page to: " + n);
    setPage(n);
    setOffset(n * limit - limit);
  };

  const moveNextPage = () => {
    changePage(page + 1);
  };

  const moveBackPage = () => {
    changePage(page - 1);
  };

  const handleRowClick = e => {
    const rowNumber = parseInt(e.target.value);
    setLimit(rowNumber);
  };

  const clearFilters = () => {
    setSearchParameters({});
  };

  /**
   *
   * Query Management
   *
   **/

  // Where
  query.cleanWhere(); // Clean slate
  if (searchParameters["column"] && searchParameters["value"]) {
    query.setWhere(
      searchParameters["column"],
      `_like: "%${searchParameters["value"]}%"`
    );
  }

  // Order By

  // Query Management
  if (sortColumn !== "" && sortOrder !== "") {
    console.log("Changing order...");
    query.setOrder(sortColumn, sortOrder);
  }

  // Limit & Offset
  query.limit = limit;
  query.offset = offset;

  /**
   *
   * Render
   *
   **/

  // Make Query && Error handling
  console.log(query.query);
  let { loading, error, data } = useQuery(query.gql);
  if (error) return `Error! ${error.message}`;

  let dataEntries = [];
  let totalRecords = 0;
  let totalPages = 1;

  // If we have data
  if (data[query.table]) {
    loading = false;
    console.log("Got a response: ");
    console.log(data[query.table]);
    totalRecords = data[query.table + "_aggregate"]["aggregate"]["count"];
    totalPages = Math.ceil(totalRecords / limit);

    // DataEntries: For each item in the data array, generate a row with each column
    data[query.table].map((row, index) =>
      dataEntries.push(
        <tr key={index}>
          {query.columns.map(column => (
            <td>
              {query.isPK(column) ? (
                <Link to={`${query.singleItem}/${row[column]}`}>
                  {row[column]}
                </Link>
              ) : (
                row[column]
              )}
            </td>
          ))}
        </tr>
      )
    );
  }

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <i className="fa fa-car" /> {title}
            </CardHeader>
            <CardBody>
              <GridTableSearch
                query={query}
                clearFilters={clearFilters}
                setSearchParameters={setSearchParameters}
              />
              <ButtonGroup className="mb-2 float-right">
                <GridTablePagination
                  moveNext={moveNextPage}
                  moveBack={moveBackPage}
                  pageNumber={page}
                  limit={limit}
                  totalRecords={totalRecords}
                  totalPages={totalPages}
                  handleRowClick={handleRowClick}
                />
                {data[query.table] && (
                  <CSVLink
                    className=""
                    data={data[query.table]}
                    filename={query.table + Date.now()}
                  >
                    <i className="fa fa-save fa-2x ml-2 mt-1" />
                  </CSVLink>
                )}
              </ButtonGroup>
              <Table responsive>
                <GridTableHeader
                  query={query}
                  handleTableHeaderClick={handleTableHeaderClick}
                  sortColumn={sortColumn}
                  sortOrder={sortOrder}
                />

                <tbody>
                  {loading ? (
                    <Spinner className="mt-2" color="primary" />
                  ) : (
                    data && dataEntries
                  )}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default withApollo(GridTable);
