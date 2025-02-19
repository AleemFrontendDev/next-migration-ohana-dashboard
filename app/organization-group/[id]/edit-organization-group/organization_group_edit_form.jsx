import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button, Table } from "react-bootstrap";
import * as Yup from "yup";
import { Formik, Field, ErrorMessage, FieldArray } from "formik";
import { Trans } from "react-i18next";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import Link from "next/link";
import { ROUTES } from "@/utils/common";
import Select from "react-select";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { BASE_URL } from "@/utils/common";

import makeAnimated from "react-select/animated";
import { useAuthToken } from "@/utils/useAuthToken";

const animatedComponents = makeAnimated();
const authToken = useAuthToken();

function OrganizationGroupEditForm({
  initialValues,
  handleSubmitFun,
  countries,
  regions,
}) {

  useEffect(() => {
    if (initialValues?.region) {
      getCitiesOfCountry(initialValues?.region?.value);
    }   
  }, []);

  const [citiesData, setCitiesData] = useState([]);
  const [cityDataFetched, setCityDataFetch] = useState(false);

  const getCitiesOfCountry = async (region_id) => {
    setCityDataFetch(false);
    try { 
      const response = await fetch(`${BASE_URL}/get-all-cities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`, 
          "x-api-key": "Ohana-Agent-oo73",       
        },
        body: JSON.stringify({ region_id: region_id }),
      });
      const jsonData = await response.json();
      console.log("Get city of country api response", jsonData);
      if (jsonData.status === "success") {
        console.log("City Data", jsonData);
        const { data } = jsonData;
        const cityOptions = data.cities.map((city) => {
          if (city) {
            return {
              label: city.name,
              value: city.id,
            };
          }
        });
        setCitiesData(cityOptions);
        setCityDataFetch(true);
      }
    } catch (error) {
      console.log("Error in getting cities of country", error);
    }
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Group Name is required"),
    shortname: Yup.string().optional(),
    country: Yup.string().required("Country is required"),
    region: Yup.object().required("Region is required"),
    city: Yup.object().required("City is required"),
    new_admins: Yup.array().of(
      Yup.object().shape({
        firstname: Yup.string().required("First name is required"),
        lastname: Yup.string().required("Last name is required"),
        email: Yup.string().email("Invalid email").optional(),
        country: Yup.object().required("Country is required"),
        phone: Yup.string()
          .required("Phone is required")
          .test(
            "isValidPhoneNumber",
            "Phone number is not valid",
            function (value) {
              const { country } = this.parent;
              const countryTextCode = country?.iso;
              if (!countryTextCode) return true;
              const phoneNumber = parsePhoneNumberFromString(
                value || "",
                countryTextCode
              );
              return phoneNumber ? phoneNumber.isValid() : false;
            }
          ),
      })
    ),
    default_pools: Yup.array().of(
      Yup.object().shape({
        active: Yup.boolean(),
      })
    ),
    manual_pools: Yup.array().of(
      Yup.object().shape({
        active: Yup.boolean(),
      })
    ),
  });

  const predefinedPools = [
    {
      name: "Contributions",
      label: "Contributions in Cash",
      amount: "0",
      active: false,
    },
    {
      name: "Solidity",
      label: "Solidity in Cash",
      amount: "0",
      active: false,
    },
    {
      name: "Bank/Microfinance",
      label: "Money with Bank/Microfinance",
      amount: "0",
      active: false,
    },
  ];
  const addPredefinedPools = (arrayHelpers) => {
    predefinedPools.forEach((pool) => {
      arrayHelpers.push(pool);
    });
  };

  const predefinedDefaultPools = [
    {
      name: "Contributions",
      label: "Contributions",
      active: false,
      type: "Permanent",
      periodicity: "Weekly",
      amount_type: "Any Amount",
      amount: "0",
    },
    {
      name: "Solidity",
      label: "Solidity",
      active: false,
      type: "Permanent",
      periodicity: "Weekly",
      amount_type: "Any Amount",
      amount: "0",
    },
  ];

  const addPredefinedDefaultPools = (arrayHelpers) => {
    predefinedDefaultPools.forEach((pool) => {
      arrayHelpers.push(pool);
    });
  };

  return (
    <div className="container-fluid">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          console.log("Group Submit Data", values);
          await handleSubmitFun(values);
        }}
      >
        {({ values, errors, touched, handleSubmit, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <h2 className="mb-3">
              {initialValues?.name} ({initialValues?.country})
            </h2>

            <section className="p-3 mb-3">
              <div>
                <Row xs={1} md={3} xl={5}>
                  <Col className="mb-3">
                    <label htmlFor={`name`}>
                      <Trans>Group Name</Trans>:
                    </label>
                    <Field
                      type="text"
                      name={`name`}
                      className={`form-control ${
                        errors && errors.name ? "is-invalid" : ""
                      }`}
                    />
                    <ErrorMessage
                       name={`name`}
                      component="div"
                      className="invalid-feedback"
                    />
                  </Col>
                  <Col className="mb-3">
                    <label htmlFor={`shortname`}>
                      <Trans>Group Acronym</Trans>:
                    </label>
                    <Field
                      type="text"
                      name={`shortname`}
                      className={`form-control ${
                        errors && errors.shortname ? "is-invalid" : ""
                      }`}
                    />
                    <ErrorMessage
                      name={`shortname`}
                      component="div"
                      className="invalid-feedback"
                    />
                  </Col>
                  <Col className="mb-3">
                    <label htmlFor={`country`}>
                      <Trans>Country</Trans>:
                    </label>
                    <Field
                      type="text"
                      name={`country`}
                      className="form-control"
                      disabled
                    />
                  </Col>

                  <Col className="mb-3">
                    <div className="mb-3">
                      <label htmlFor={`region`}>
                        <Trans>Region</Trans>:
                      </label>

                      <Select
                        name={`region`}
                        defaultValue={values?.region}
                        options={regions}
                        onChange={(e) => {
                          setFieldValue(`region`, e);
                          setFieldValue(`city`, "");
                          getCitiesOfCountry(e.value);
                        }}
                        className={`${
                          errors &&
                          errors.region &&
                          "border border-danger rounded-2"
                        } `}
                        isInvalid={errors.region}
                        placeholder="Region"
                        isMulti={false}
                        isSearchable={true}
                        closeMenuOnSelect={true}
                        components={animatedComponents}
                        error={errors && errors.region}
                        touched={touched && touched.region}
                      />
                      {errors && errors.region && (
                        <div className="is-invalid"></div>
                      )}

                      <ErrorMessage
                        name={`region`}
                        component="div"
                        className="invalid-feedback is-invalid"
                      />
                    </div>
                  </Col>

                  {cityDataFetched && (
                    <Col className="mb-3">
                      <div className="mb-3">
                        <label htmlFor={`city`}>
                          <Trans>Commune</Trans>:
                        </label>

                        <Select
                          name={`city`}
                          defaultValue={values?.city}
                          options={citiesData}
                          onChange={(e) => {
                            setFieldValue(`city`, e);
                          }}
                          className={`${
                            errors &&
                            errors.city &&
                            "border border-danger rounded-2"
                          } `}
                          isInvalid={errors.city}
                          placeholder="Commune"
                          isMulti={false}
                          isSearchable={true}
                          closeMenuOnSelect={true}
                          components={animatedComponents}
                          error={errors && errors.city}
                          touched={touched && touched.city}
                        />
                        {errors && errors.city && (
                          <div className="is-invalid"></div>
                        )}

                        <ErrorMessage
                          name={`city`}
                          component="div"
                          className="invalid-feedback is-invalid"
                        />
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            </section>

            <section className="bg-white p-4 mb-3">
              <h4 className="mb-4 font-weight-bold">
                <Trans>Group Admins</Trans>
              </h4>
              <section className="table-responsive">
                <Table bordered={true}>
                  <thead>
                    <tr>
                      <th>Sr #</th>
                      <th>
                        <Trans>First Name</Trans> 
                      </th>
                      <th>
                        <Trans>Last Name</Trans>
                      </th>
                      <th>
                        <Trans>Email</Trans>
                      </th>
                      <th>
                        <Trans>Phone</Trans>
                      </th>
                      <th>
                        <Trans>Status</Trans>
                      </th>
                      <th>
                        <Trans>Action</Trans>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {values?.admins?.map((admin, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{admin.firstname}</td>
                        <td>{admin.lastname}</td>
                        <td>{admin.email}</td>
                        <td>{admin.phone}</td>
                        <td>
                          <BootstrapSwitchButton
                            checked={admin.rejected === 0}
                            onChange={(check) => {
                              console.log("User Status check", check);
                              setFieldValue(
                                `admins[${index}].rejected`,
                                check ? 1 : 0
                              );
                            }}
                            onlabel="On"
                            offlabel="Off"
                            size="sm"
                            onstyle="secondary"
                          />
                        </td>
                        <td>
                          <Link
                            className="nav-link p-0"
                            href={ROUTES.edit_org_user.replace(":id", admin.id)}
                          >
                            <div className="icon-holder bg-secondary text-center p-2 rounded">
                              <i className="mdi mdi-square-edit-outline"></i>
                            </div>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </section>
            </section>

            <section
              className={`${
                values?.new_admins.length > 0 && "bg-white p-3"
              } mb-3`}
            >
              {values?.new_admins.length > 0 && (
                <h5 className="mb-4 font-weight-bold">
                  <Trans>Add New Admins</Trans>
                </h5>
              )}
              <FieldArray name="new_admins">
                {(arrayHelpers) => (
                  <>
                    {values?.new_admins?.map((admin, index) => (
                      <div
                        key={index}
                        className="d-flex w-100 align-items-center"
                      >
                        <div className="flex-fill">
                          <Row xs={1} lg={5}>
                            <Col className="mb-3">
                              <div className="mb-3">
                                <label
                                  htmlFor={`new_admins.${index}.firstname`}
                                >
                                  <Trans>First Name</Trans>:
                                </label>
                                <Field
                                  type="text"
                                  name={`new_admins.${index}.firstname`}
                                  className={`form-control ${
                                    errors.new_admins &&
                                    errors.new_admins[index] &&
                                    errors.new_admins[index].firstname
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                <ErrorMessage
                                  name={`new_admins.${index}.firstname`}
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </div>
                            </Col>
                            <Col className="mb-3">
                              <div className="mb-3">
                                <label htmlFor={`new_admins.${index}.lastname`}>
                                  <Trans>Last Name</Trans>:
                                </label>
                                <Field
                                  type="text"
                                  name={`new_admins.${index}.lastname`}
                                  className={`form-control ${
                                    errors.new_admins &&
                                    errors.new_admins[index] &&
                                    errors.new_admins[index].lastname
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                <ErrorMessage
                                  name={`new_admins.${index}.lastname`}
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </div>
                            </Col>
                            <Col className="mb-3">
                              <div className="mb-3">
                                <label htmlFor={`new_admins.${index}.email`}>
                                  <Trans>Email</Trans>: (Optional)
                                </label>
                                <Field
                                  type="email"
                                  name={`new_admins.${index}.email`}
                                  className={`form-control ${
                                    errors.new_admins &&
                                    errors.new_admins[index] &&
                                    errors.new_admins[index].email
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                <ErrorMessage
                                  name={`new_admins.${index}.email`}
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </div>
                            </Col>

                            <Col className="mb-3">
                              <div className="mb-3">
                                <label htmlFor={`new_admins.${index}.country`}>
                                  <Trans>Country</Trans>:
                                </label>
                                <Select
                                  name={`new_admins.${index}.country`}
                                  defaultValue={`new_admins.${index}.country`}
                                  options={countries}
                                  onChange={(option) =>
                                    setFieldValue(
                                      `new_admins.${index}.country`,
                                      option
                                    )
                                  }
                                  className={`${
                                    errors.new_admins &&
                                    errors.new_admins[index] &&
                                    errors.new_admins[index].country &&
                                    "border border-danger rounded-2"
                                  } `}
                                  isInvalid={
                                    errors.new_admins &&
                                    errors.new_admins[index] &&
                                    errors.new_admins[index].country
                                  }
                                  placeholder="Country"
                                  isMulti={false}
                                  isSearchable={true}
                                  closeMenuOnSelect={true}
                                  components={animatedComponents}
                                  error={
                                    errors.new_admins &&
                                    errors.new_admins[index] &&
                                    errors.new_admins[index].country
                                  }
                                  touched={
                                    touched.new_admins &&
                                    touched.new_admins[index] &&
                                    touched.new_admins[index].country
                                  }
                                />
                                <ErrorMessage
                                  name={`new_admins.${index}.country`}
                                  component="div"
                                  className="invalid-feedback is-invalid"
                                />
                              </div>
                            </Col>

                            <Col className="mb-3">
                              <div className="mb-3">
                                <label htmlFor={`new_admins.${index}.phone`}>
                                  <Trans>Phone Number</Trans>:
                                </label>
                                <Field
                                  type="number"
                                  name={`new_admins.${index}.phone`}
                                  disabled={!values.new_admins[index].country}
                                  className={`form-control ${
                                    errors.new_admins &&
                                    errors.new_admins[index] &&
                                    errors.new_admins[index].phone
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                <ErrorMessage
                                  name={`new_admins.${index}.phone`}
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </div>
                            </Col>
                          </Row>
                        </div>
                        {admin?.appended === true && (
                          <button
                            type="button"
                            className="btn btn-danger ml-2 p-1 d-flex justify-content-center align-items-center"
                            onClick={() => arrayHelpers.remove(index)}
                          >
                            <i className="mdi mdi-trash-can m-0"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <Row className={"justify-content-center"}>
                      <Col md={6} lg={4}>
                        <Button
                          variant="primary"
                          type="button"
                          className="w-100 py-3"
                          onClick={() =>
                            arrayHelpers.push({
                              firstname: "",
                              lastname: "",
                              email: "",
                              phone: "",
                              appended: true,
                            })
                          }
                        >
                          <Trans>Add New Admin</Trans>
                        </Button>
                      </Col>
                    </Row>
                  </>
                )}
              </FieldArray>
            </section>
            {values.default_pools.length > 0 && (
              <OrganizationGroupPoolTable
                title="Ohana Default Pools"
                tableData={values.default_pools}
                onStatusChange={(index, status) => {
                  setFieldValue(`default_pools[${index}].active`, status);
                }}
              />
            )}
            {values?.manual_pools.length > 0 && (
              <OrganizationGroupPoolTable
                title="Manual Pools"
                tableData={values.manual_pools}
                onStatusChange={(index, status) => {
                  setFieldValue(`manual_pools[${index}].active`, status);
                }}
              />
            )}
            <section className="bg-white p-3 mb-3">
              {values?.new_default_pools.length > 0 && (
                <h4 className="mb-4 font-weight-bold">
                  <Trans>Ohana Default Pools</Trans>
                </h4>
              )}

              {values?.new_default_pools.length > 0 && (
                <h6>
                  <Trans>Activate default Pools for this Group</Trans>
                </h6>
              )}

              <FieldArray name="new_default_pools">
                {(arrayHelpers) => (
                  <>
                    {values.new_default_pools.map((pool, index) => (
                      <div key={index} className="mb-3">
                        <Row className="align-items-center">
                          <Col md={3} className="mb-3 mb-md-0">
                            <div>
                              <label className="m-0">
                                <Field
                                  type="checkbox"
                                  name={`new_default_pools[${index}].active`}
                                />
                                <span className="ml-3">
                                  <Trans>{pool.label}</Trans>
                                </span>
                              </label>
                            </div>
                          </Col>
                          <Col md={9}>
                            <div className="flex-fill bg-light p-2">
                              <Row>
                                <Col
                                  md={6}
                                  xl={
                                    pool.amount_type === "Fixed Amount" ? 3 : 4
                                  }
                                  className="mb-3 mb-xl-0"
                                >
                                  <label
                                    htmlFor={`new_default_pools[${index}].type`}
                                  >
                                    <Trans>Type</Trans>:
                                  </label>
                                  <Field
                                    as="select"
                                    name={`new_default_pools[${index}].type`}
                                    disabled={!pool.active}
                                    className={`form-control ${
                                      errors.new_default_pools &&
                                      errors.new_default_pools[index] &&
                                      errors.new_default_pools[index].type
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                  >
                                    <option value="">Select Type</option>
                                    <option value="Permanent">Permanent</option>
                                    <option value="Temporary">Temporary</option>
                                  </Field>
                                  <ErrorMessage
                                    name={`new_default_pools[${index}].type`}
                                    component="div"
                                    className="invalid-feedback"
                                  />
                                </Col>
                                <Col
                                  md={6}
                                  xl={
                                    pool.amount_type === "Fixed Amount" ? 3 : 4
                                  }
                                  className="mb-3 mb-xl-0"
                                >
                                  <label
                                    htmlFor={`new_default_pools[${index}].periodicity`}
                                  >
                                    <Trans>Periodicity</Trans>:
                                  </label>
                                  <Field
                                    as="select"
                                    name={`new_default_pools[${index}].periodicity`}
                                    disabled={!pool.active}
                                    className={`form-control ${
                                      errors.new_default_pools &&
                                      errors.new_default_pools[index] &&
                                      errors.new_default_pools[index]
                                        .periodicity
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                  >
                                    <option value="">Select Periodicity</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Semesterly">
                                      Semesterly
                                    </option>
                                    <option value="Yearly">Yearly</option>
                                  </Field>
                                  <ErrorMessage
                                    name={`new_default_pools[${index}].periodicity`}
                                    component="div"
                                    className="invalid-feedback"
                                  />
                                </Col>
                                <Col
                                  md={6}
                                  xl={
                                    pool.amount_type === "Fixed Amount" ? 3 : 4
                                  }
                                  className="mb-3 mb-xl-0"
                                >
                                  <label
                                    htmlFor={`new_default_pools[${index}].amount_type`}
                                  >
                                    <Trans>Amount Type</Trans>:
                                  </label>
                                  <Field
                                    as="select"
                                    name={`new_default_pools[${index}].amount_type`}
                                    disabled={!pool.active}
                                    className={`form-control ${
                                      errors.new_default_pools &&
                                      errors.new_default_pools[index] &&
                                      errors.new_default_pools[index]
                                        .amount_type
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                  >
                                    <option value="">Select Type</option>
                                    <option value="Any Amount">
                                      Any Amount
                                    </option>
                                    <option value="Fixed Amount">Fixed</option>
                                  </Field>
                                  <ErrorMessage
                                    name={`new_default_pools[${index}].amount_type`}
                                    component="div"
                                    className="invalid-feedback"
                                  />
                                </Col>

                                {pool.amount_type === "Fixed Amount" && (
                                  <Col
                                    md={6}
                                    xl={
                                      pool.amount_type === "Fixed Amount"
                                        ? 3
                                        : 4
                                    }
                                    className="mb-3 mb-xl-0"
                                  >
                                    <label
                                      htmlFor={`new_default_pools[${index}].amount`}
                                    >
                                      <Trans>Amount</Trans>:
                                    </label>
                                    <Field
                                      type="number"
                                      name={`new_default_pools[${index}].amount`}
                                      disabled={!pool.active}
                                      className={`form-control ${
                                        errors.new_default_pools &&
                                        errors.new_default_pools[index] &&
                                        errors.new_default_pools[index].amount
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                    />
                                    <ErrorMessage
                                      name={`new_default_pools[${index}].amount`}
                                      component="div"
                                      className="invalid-feedback"
                                    />
                                  </Col>
                                )}
                              </Row>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    ))}

                    <Row className="justify-content-center">
                   
                          <Col md={6} lg={4}>
                            <Button
                              variant="primary"
                              type="button"
                              className="w-100 py-3"
                              onClick={() =>
                                addPredefinedDefaultPools(arrayHelpers)
                              }
                            >
                              <Trans>Add Ohana Pools</Trans>
                            </Button>
                          </Col>
                      
                    </Row>
                  </>
                )}
              </FieldArray>
            </section>

            <section className="p-3 mb-3">
              {values?.new_manual_pools.length > 0 && (
                <h4 className="mb-4 font-weight-bold">
                  <Trans>Manual Pools</Trans>
                </h4>
              )}
              <FieldArray name="new_manual_pools">
                {(arrayHelpers) => (
                  <>
                    {values.new_manual_pools.map((pool, index) => (
                      <div key={index} className="mb-3">
                        <Row className="align-items-center">
                          <Col md={4}>
                            <label>
                              <Field
                                type="checkbox"
                                name={`new_manual_pools[${index}].active`}
                                checked={pool.active}
                                onChange={(e) => {
                                  const newValue = e.target.checked;
                                  setFieldValue(
                                    `new_manual_pools[${index}].active`,
                                    newValue
                                  );
                                }}
                                className="m-0"
                              />
                              <span className="ml-3">
                                <Trans>{pool.label}</Trans>
                              </span>
                            </label>
                          </Col>
                          <Col md={8}>
                            <Row className="align-items-center">
                              <Col md={4}>
                                <label
                                  htmlFor={`new_manual_pools[${index}].amount`}
                                  className="m-0"
                                >
                                  <Trans>Current Amount</Trans>:
                                </label>
                              </Col>
                              <Col md={8}>
                                <Field
                                  type="number"
                                  name={`new_manual_pools[${index}].amount`}
                                  disabled={!pool.active}
                                  className={`form-control ${
                                    errors.new_manual_pools &&
                                    errors.new_manual_pools[index] &&
                                    errors.new_manual_pools[index].amount
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                <ErrorMessage
                                  name={`new_manual_pools[${index}].amount`}
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </div>
                    ))}
                    <Row className="justify-content-center">
                      <Col md={6} lg={4}>
                       
                            <Button
                              variant="primary"
                              type="button"
                              className="w-100 py-3"
                              onClick={() => addPredefinedPools(arrayHelpers)}
                            >
                              <Trans>Add Ohana Manual Pools</Trans>
                            </Button>
                       
                      </Col>
                    </Row>
                  </>
                )}
              </FieldArray>
            </section>
            <Row className="justify-content-center">
              <Col md={6} lg={4}>
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-3"
                  style={{
                    background: "#FFBB22",
                    borderColor: "#FFBB22",
                  }}
                >
                  <Trans>Update Group</Trans>
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default OrganizationGroupEditForm;

const OrganizationGroupPoolTable = ({ onStatusChange, title, tableData }) => {
  return (
    <section className="bg-white p-3 mb-3">
      <h4 className="mb-4 font-weight-bold">
        <Trans>{title}</Trans> ({tableData.length})
      </h4>
      <section className="table-responsive">
        <Table bordered={true}>
          <thead>
            <tr>
              <td>Sr.</td>
              <th>
                <Trans>Name</Trans>
              </th>
              <th>
                <Trans>Created At</Trans>
              </th>
              <th>
                <Trans>Balance</Trans>
              </th>
              <th>
                <Trans>Status</Trans>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData?.map((pool, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <Trans>{pool.title}</Trans>
                </td>
                <td>{new Date(pool.created_at).toLocaleDateString("en-US")}</td>
                <td>
                  {pool.org_pool_type == "Manual Pool"
                    ? pool.amount
                    : pool.balance}{" "}
                  {pool.currancy}
                </td>
                <td>
                  <BootstrapSwitchButton
                    checked={pool.active}
                    disabled={
                      pool.org_pool_type == "Manual Pool"
                        ? pool.amount
                        : pool.balance > 0
                    }
                    onChange={(check) => {
                      console.log("Pool Status check", check);
                      onStatusChange(index, check);
                    }}
                    onlabel="On"
                    offlabel="Off"
                    size="sm"
                    onstyle="secondary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </section>
  );
};
