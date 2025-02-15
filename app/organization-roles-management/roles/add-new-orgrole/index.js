import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Formik } from "formik";
import * as yup from "yup";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import useInterval, { BASE_URL, ROUTES } from "../../../basic-ui/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "../../../hooks/useCountry";
import useUser from "../../../hooks/useUser";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { Trans } from "react-i18next";

const schema = yup.object().shape({
  status: yup.bool().required(),
  name: yup.string().required(),
});

export function AddNewRole() {
  const history = useHistory();
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  console.log("organizations", organizations);
  const { country } = useCountry();
  const { user } = useUser();
  const authToken = localStorage.getItem("Auth Token");
  console.log("user", user);
  //   const fetchPermissions = async () => {
  //     if (!user.role_id) {
  //       setPermissions({ add: true, view: true, edit: true, delete: true });
  //       setSpinner(false);
  //     } else {
  //       var rolePermission = user.role.permissions.filter(
  //         (permission) => permission.section === "Roles"
  //       );
  //       console.log("Role Permission: ", rolePermission);
  //       if (rolePermission.length && rolePermission[0].status) {
  //         setSpinner(false);
  //         setPermissions(...rolePermission);
  //       } else {
  //         history.push(ROUTES.roles);
  //       }
  //     }
  //   };

  //   useEffect(() => {
  //     setSpinner(true);
  //     fetchPermissions();
  //   }, [country]);

  //   useInterval(fetchPermissions, 20000, 5);

  const fetchData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/get-organization-by-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`, 
          "x-api-key": "Ohana-Agent-oo73",       
        },
        body: JSON.stringify({ uid: user.user_id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not in JSON format");
      }

      const jsonData = await response.json();
      const { data } = jsonData;
      setOrganizations(data.org_id);
      console.log("Response Data:", jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const initialValues = {
    status: true,
    name: "",
  };

  const onSubmit = useCallback(async (values) => {
    const data = {
      org_id: organizations,
      status: values.status,
      name: values.name,
    };
    console.log(data);

    const response = await fetch(`${BASE_URL}/create-roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`, 
        "x-api-key": "Ohana-Agent-oo73",       
      },
      body: JSON.stringify(data),
    });
    const jsonData = await response.json();

    toast.success("Role Added Successfully!");

    history.push(ROUTES.org_roles);

    // if (jsonData.success) {
    //   history.push(ROUTES.org_roles);
    // }
  });

  return (
    <>
      <div className="page-header">
        <h3 className="page-title">
          <Trans>New Role</Trans>
        </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link className="nav-link" to={ROUTES.org_roles}>
                <Trans>Roles</Trans>
              </Link>
            </li>
            <li className="breadcrumb-item pt-2" aria-current="page">
              <Trans>Add New Role</Trans>
            </li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3>
                <Trans>Add New Role</Trans>
              </h3>
            </div>
            <div className="card-body">
              <Formik
                validationSchema={schema}
                onSubmit={onSubmit}
                initialValues={initialValues}
                enableReinitialize
              >
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  setFieldValue,
                  values,
                  errors,
                }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group as={Row} className="mb-3" controlId="status">
                      <Form.Label column sm="2">
                        <Trans>Status</Trans> :
                      </Form.Label>
                      <Col>
                        <BootstrapSwitchButton
                          name="status"
                          value={values.status}
                          onChange={(e) => {
                            setFieldValue("status", e);
                          }}
                          onBlur={handleBlur}
                          checked={values.status}
                          onlabel="On"
                          offlabel="Off"
                          size="sm"
                          onstyle="secondary"
                          isInvalid={!!errors.status}
                        />
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="name">
                      <Form.Label column sm="2">
                        <Trans>Name</Trans>:
                      </Form.Label>
                      <Col>
                        <Form.Control
                          type="text"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          placeholder="Name"
                          isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {errors.name}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    <Button type="submit">Add</Button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default AddNewRole;
