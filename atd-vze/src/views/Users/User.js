import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
} from "reactstrap";

import usersData from "./UsersData";

class User extends Component {
  render() {
    const user = usersData.find(
      user => user.id.toString() === this.props.match.params.id
    );

    const userDetails = user
      ? Object.entries(user).filter(entry => entry !== "id")
      : [
          [
            "id",
            <span>
              <i className="text-muted icon-ban"></i> Not found
            </span>,
          ],
        ];

    // User info response
    // {
    //   "email": "user_email",
    //   "email_verified": true,
    //   "updated_at": "2020-03-04T17:15:01.221Z",
    //   "user_id": "user_id",
    //   "name": "user_email",
    //   "picture": "picture_link",
    //   "nickname": "nickname",
    //   "identities": [
    //     {
    //       "user_id": "user_id",
    //       "provider": "auth0",
    //       "connection": "Username-Password-Authentication",
    //       "isSocial": false
    //     }
    //   ],
    //   "created_at": "2019-08-16T19:49:49.758Z",
    //   "user_metadata": {},
    //   "last_login": "2020-03-04T17:15:01.221Z",
    //   "last_ip": "",
    //   "logins_count": 38,
    //   "app_metadata": {
    //     "roles": [
    //       "role",
    //     ]
    //   }
    // },

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={6}>
            <Card>
              <CardHeader>
                <strong>
                  <i className="icon-info pr-1"></i>User ID:{" "}
                  {this.props.match.params.id}
                </strong>
              </CardHeader>
              <CardBody>
                <Row className="align-items-center mb-3">
                  <Col col="6" sm="4" md="2" xl className="mb-xl-0">
                    <Link
                      to={`/users/edit/${this.props.match.params.id}`}
                      className="link"
                    >
                      <Button color="primary">
                        <i className="fa fa-user-plus"></i> Edit User
                      </Button>
                    </Link>
                  </Col>
                </Row>
                <Table responsive striped hover>
                  <tbody>
                    {userDetails.map(([key, value]) => {
                      return (
                        <tr key={key}>
                          <td>{`${key}:`}</td>
                          <td>
                            <strong>{value}</strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default User;
