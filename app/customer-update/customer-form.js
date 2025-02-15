"use client"
import React, { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Select from "react-select";
import { Formik } from "formik";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import makeAnimated from "react-select/animated";
import { BASE_URL, ROUTES } from "@/utils/common";
import { UPDATE_CUSTOMER_FORMIK } from "@/utils/formik-data";
import { Trans } from "react-i18next";

const animatedComponents = makeAnimated();

export function CustomerForm(props) {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };
  const { initialValues, setValues, toForm } = props;
  const [roles, setRoles] = useState([]);
  const [countries, setCountries] = useState([]);
  const authToken = localStorage.getItem("Auth Token");

  const fetchRoles = async () => {
    const response = await fetch(`${BASE_URL}/roles?page=1&size=1000`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    });
    const jsonData = await response.json();
    if (jsonData.success) {
      const rolesList = jsonData.roles.data;
      const roleOptions = rolesList?.map((role) => {
        if (role) {
          return {
            label: role?.name,
            value: role?.id,
          };
        }
      });
      setRoles(roleOptions);
    }
  };

  const fetchCountries = async () => {
    const response = await fetch(`${BASE_URL}/countries?page=1&size=1000`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    });
    const jsonData = await response.json();
    if (jsonData.success) {
      const countriesList = jsonData.countries.data;
      const countryOptions = countriesList.map((country) => {
        if (country) {
          return {
            label: country.nicename,
            value: country.id,
          };
        }
      });
      setCountries(countryOptions);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchCountries();
  }, []);

  const onSubmit = useCallback(
    (values) => {
      setValues(values);
    },
    [setValues] 
  );

  return (
    <>
      <div className="page-header mb-0">
        <h3 className="page-title">
          {toForm === "addUser" ? "Add New" : "Edit"}<Trans>Customer</Trans>
        </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link className="nav-link" href={ROUTES.customer}>
                <Trans>Customer</Trans>
              </Link>
            </li>
            <li className="breadcrumb-item pt-2" aria-current="page">
              {" "}
              Edit
              <Trans>Customer</Trans>{" "}
            </li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3>Customer Form</h3>
            </div>
            <div className="card-body">
              <Formik
                validationSchema={
                  toForm === "addUser"
                    ? UPDATE_CUSTOMER_FORMIK.validationSchema
                    : UPDATE_CUSTOMER_FORMIK.validationSchema
                }
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
                  touched,
                  errors,
                }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group
                      as={Row}
                      className="mb-3"
                      controlId="account_rejected"
                    >
                      <Form.Label column sm="2">
                        <Trans>Status</Trans>:
                      </Form.Label>
                      <Col>
                        <BootstrapSwitchButton
                          name="account_rejected"
                          checked={values?.account_rejected == 0}
                          onChange={(checked) => {
                            console.log("checked 156", checked);
                            setFieldValue("account_rejected", checked ? 0 : 1);
                          }}
                          onBlur={handleBlur}
                          onlabel="On"
                          offlabel="Off"
                          size="sm"
                          onstyle="secondary"
                          isInvalid={!!errors?.account_rejected}
                        />
                      </Col>
                    </Form.Group>
                    <Form.Group
                      as={Row}
                      className="mb-3"
                      controlId="first_name"
                    >
                      <Form.Label column sm="2">
                        First Name:
                      </Form.Label>
                      <Col>
                        <Form.Control
                          type="text"
                          name="first_name"
                          value={values?.first_name}
                          onChange={handleChange}
                          placeholder="First Name"
                          isInvalid={!!errors?.first_name}
                          autoComplete="new-first_name"
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {errors?.first_name}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="last_name">
                      <Form.Label column sm="2">
                        <Trans>Last Name</Trans>:
                      </Form.Label>
                      <Col>
                        <Form.Control
                          type="text"
                          name="last_name"
                          value={values?.last_name}
                          onChange={handleChange}
                          placeholder="Last Name"
                          isInvalid={!!errors?.last_name}
                          autoComplete="new-last_name"
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {errors.last_name}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    {toForm === "addUser" ? (
                      <Form.Group
                        as={Row}
                        className="mb-3"
                        controlId="password"
                      >
                        <Form.Label column sm="2">
                          Password:
                        </Form.Label>
                        <Col>
                          <Form.Control
                            type="password"
                            name="password"
                            value={values?.password}
                            onChange={handleChange}
                            placeholder="Password"
                            isInvalid={!!errors?.password}
                            autoComplete="new-password"
                          />

                          <button
                            type="button"
                            className="btn btn-out  line-secondary"
                            onClick={togglePasswordVisibility}
                          >
                            <span
                              className={
                                showPassword ? "mdi mdi-eye-off" : "mdi mdi-eye"
                              }
                            ></span>
                          </button>

                          <Form.Control.Feedback type="invalid" tooltip>
                            {errors?.password}
                          </Form.Control.Feedback>
                        </Col>
                      </Form.Group>
                    ) : (
                      ""
                    )}
                    <Form.Group as={Row} className="mb-3" controlId="phone">
                      <Form.Label column sm="2">
                        <Trans>Phone</Trans>:
                      </Form.Label>
                      <Col>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={values.phone}
                          onChange={handleChange}
                          placeholder="Phone"
                          isInvalid={!!errors?.phone}
                          autoComplete="new-phone"
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {errors?.phone}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="country">
                      <Form.Label column sm="2">
                        <Trans>Country</Trans>:
                      </Form.Label>
                      <Col>
                        <Select
                          name="text"
                          defaultValue={{
                            label: values.country.nicename,
                            value: values.country.id,
                          }}
                          options={countries}
                          onChange={(e) => {
                            setFieldValue("country", e);
                          }}
                          isInvalid={!!errors.country}
                          placeholder="Country"
                          isSearchable={true}
                          closeMenuOnSelect={false}
                          components={animatedComponents}
                          error={errors?.topics}
                          touched={touched?.topics}
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {errors?.country}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    <Form.Group
                      as={Row}
                      className="mb-3"
                      controlId="edit"
                    ></Form.Group>
                    <Button type="submit">
                      {toForm === "addUser" ? "Add" : "Update"}
                    </Button>
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
export default CustomerForm;
