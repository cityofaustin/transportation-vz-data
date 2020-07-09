import React, { useState } from "react";

import { Table, Badge, Button, Input } from "reactstrap";

const RelatedRecordsTable = ({
  fieldConfig,
  data,
  sortField,
  tableName,
  keyField,
  lookupOptions,
  mutation,
  refetch,
  ...props
}) => {
  const [editField, setEditField] = useState("");
  const [editRow, setEditRow] = useState("");
  const [formData, setFormData] = useState("");

  const handleEditClick = (field, row) => {
    setEditField(field);
    setEditRow(row);
  };

  const handleCancelClick = e => {
    e.preventDefault();

    // RESET state on cancel
    setEditField("");
    setEditRow("");
    setFormData({});
  };

  const handleInputChange = e => {
    // TODO: Make this less specific to person table
    // TODO: Bug if persons have same unit id

    const manualFieldKey = "prsn_injry_sev_id";

    const newFormState = Object.assign(formData, {
      [manualFieldKey]: e.target.value,
      updated_by: localStorage.getItem("hasura_user_email"),
    });
    setFormData(newFormState);
  };

  const handleSubmit = e => {
    e.preventDefault();

    console.log("Submitting RelatedRecordsTable form data:", formData);

    // Append form data state to mutation template
    mutation.variables.changes = { ...formData };
    // TODO: instead of personId, use a generic key variable
    // and convert it to camelcase for the mutation object
    mutation.variables.personId = editRow.person_id;

    props.client.mutate(mutation).then(res => {
      if (!res.errors) {
        refetch();
      } else {
        console.log(res.errors);
      }
    });

    // RESET state after submit
    setEditField("");
    setEditRow("");
    setFormData({});
  };

  const formatValue = (data, field) => {
    let fieldValue = data[field];

    if (typeof data[field] === "object") {
      fieldValue =
        data[field] && data[field][fieldConfig.fields[field].lookup_desc];
    }

    // Display null values as blanks, but allow 0
    return fieldValue === null || fieldValue === "" ? "" : fieldValue;
  };

  return (
    <>
      <h5>{fieldConfig.title}</h5>
      <Table responsive>
        <thead>
          <tr>
            {Object.keys(fieldConfig.fields).map(field => (
              <th key={`th_${fieldConfig.fields[field].label}`}>
                {fieldConfig.fields[field].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data
            .sort((a, b) => (a[sortField] > b[sortField] ? 1 : -1))
            .map(row => {
              return (
                <tr key={`table-${tableName}-${row[keyField]}`}>
                  {Object.keys(fieldConfig.fields).map((field, i) => {
                    const isEditing = editField === field && row === editRow;
                    return (
                      <td key={i}>
                        {isEditing && (
                          <form onSubmit={e => handleSubmit(e)}>
                            <Input
                              name={field}
                              id={field}
                              onChange={e => handleInputChange(e)}
                              defaultValue={formatValue(row, field)}
                              type="select"
                            >
                              {lookupOptions.map(option => {
                                const fieldLookupPrefix =
                                  fieldConfig.fields[field].lookupPrefix;
                                return (
                                  <option
                                    value={option[`${fieldLookupPrefix}_id`]}
                                    key={option[`${fieldLookupPrefix}_id`]}
                                  >
                                    {option[`${fieldLookupPrefix}_desc`]}
                                  </option>
                                );
                              })}
                            </Input>
                            <Button
                              type="submit"
                              block
                              color="primary"
                              size="sm"
                              className="btn-pill mt-2"
                            >
                              <i className="fa fa-check edit-toggle" />
                            </Button>
                            <Button
                              type="cancel"
                              block
                              color="danger"
                              size="sm"
                              className="btn-pill mt-2"
                              onClick={e => handleCancelClick(e)}
                            >
                              <i className="fa fa-times edit-toggle"></i>
                            </Button>
                          </form>
                        )}

                        {!isEditing &&
                          (fieldConfig.fields[field].badge ? (
                            <Badge
                              color={fieldConfig.fields[field].badgeColor(
                                formatValue(row, field)
                              )}
                            >
                              {formatValue(row, field)}
                            </Badge>
                          ) : (
                            formatValue(row, field)
                          ))}

                        {fieldConfig.fields[field].editable && !isEditing && (
                          // TODO:
                          //   // && !isReadOnly(roles)
                          <Button
                            block
                            color="secondary"
                            size="sm"
                            className="btn-pill mt-2"
                            style={{ width: "50px" }}
                            onClick={e => handleEditClick(field, row)}
                          >
                            <i className="fa fa-pencil edit-toggle" />
                          </Button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </Table>
    </>
  );
};

export default RelatedRecordsTable;
