"use client";
import React, { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Formik } from "formik";
import * as yup from "yup";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { Trans } from "react-i18next";

const schema = yup.object().shape({
  status: yup.bool().required(),
  name: yup.string().required(),
});

export function AddNewRole() {
  const history = useRouter();
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const { country } = useCountry();
  const { user } = useUser();
  const authToken = localStorage.getItem("Auth Token");

  const fetchPermissions = async () => {
    if (!user.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
      setSpinner(false);
    } else {
      var rolePermission = user.role.permissions.filter(
        (permission) => permission.section === "Roles"
      );
      console.log("Role Permission: ", rolePermission);
      if (rolePermission.length && rolePermission[0].status) {
        setSpinner(false);
        setPermissions(...rolePermission);
      } else {
        history.push(ROUTES.roles);
      }
    }
  };

  useEffect(() => {
    setSpinner(true);
    fetchPermissions();
  }, [country]);

  useInterval(fetchPermissions, 20000, 5);

  const initialValues = {
    status: true,
    name: "",
  };

  const onSubmit = useCallback(
    async (values) => {
      if (permissions.add) {
        const data = {
          status: values.status,
          name: values.name,
        };
        const response = await fetch(`${BASE_URL}/add-role`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            "x-api-key": "Ohana-Agent-oo73",
          },
          body: JSON.stringify(data),
        });
        const jsonData = await response.json();
        if (jsonData.success) {
          history.push(ROUTES.roles);
        }
      }
    },
    [permissions]
  );

  return (
    <>
      {permissions && permissions.add && !spinner ? (
        <>
          <div className="page-header">
            <h3 className="page-title">New Role</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link className="nav-link" href={ROUTES.roles}>
                    <Trans>Roles</Trans>
                  </Link>
                </li>
                <li className="breadcrumb-item pt-2" aria-current="page">
                  {" "}
                  <Trans>Add New Role</Trans>{" "}
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
                        <Form.Group
                          as={Row}
                          className="mb-3"
                          controlId="status"
                        >
                          <Form.Label column sm="2">
                            <Trans>Status</Trans>:
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
                            <Trans></Trans>
                            Name:
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
      ) : spinner ? (
        <Spinner
          animation="grow"
          style={{ left: "55%", bottom: "50%", position: "fixed" }}
        />
      ) : (
        <>
          <h1 className="text-center mt-5 pt-5">Permission Denied!</h1>
          <p className="text-center mt-3">
            Sorry!, You don't have permission to access this module.
          </p>
        </>
      )}
    </>
  );
}
export default AddNewRole;
