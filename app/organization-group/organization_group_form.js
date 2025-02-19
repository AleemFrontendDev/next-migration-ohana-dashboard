import React, { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import * as Yup from "yup";
import { Formik, Field, ErrorMessage, FieldArray } from "formik";
import { Trans } from "react-i18next";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { BASE_URL } from "../basic-ui/common";
import { useAuthToken } from "@/utils/useAuthToken";

const animatedComponents = makeAnimated();
const authToken = useAuthToken();
function OrganizationGroupForm({
  initialValues,
  handleSubmitFun,
  countries,
  regions,
}) {
  const [citiesData, setCitiesData] = useState([]);
  const [cityDataFetched, setCityDataFetch] = useState(false);
  const validationSchema = Yup.object().shape({
    groups: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required("Group Name is required"),
        shortname: Yup.string().optional(),
        country: Yup.string().required("Country is required"),
        region: Yup.object().required("Region is required"),
        city: Yup.object().required("City is required"),
      })
    ),
    admins: Yup.array().of(
      Yup.object().shape({
        firstname: Yup.string().required("First Name is required"),
        lastname: Yup.string().required("Last Name is required"),
        email: Yup.string().email("Invalid email").optional(),
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
        country: Yup.object().required("Country is required"),
      })
    ),

    default_pools: Yup.array().of(
      Yup.object().shape({
        active: Yup.boolean(),
        type: Yup.string().when("active", {
          is: true,
          then: Yup.string().required("Type is required"),
        }),
        periodicity: Yup.string().when("active", {
          is: true,
          then: Yup.string().required("Periodicity is required"),
        }),
        amount_type: Yup.string().when("active", {
          is: true,
          then: Yup.string().required("Amount Type is required"),
        }),
        amount: Yup.string().when("active", {
          is: true,
          then: Yup.string().when("amount_type", {
            is: "Fixed Amount",
            then: Yup.string().required("Amount is required"),
          }),
        }),
      })
    ),
    manual_pools: Yup.array().of(
      Yup.object().shape({
        active: Yup.boolean(),
        amount: Yup.string().when("active", {
          is: true,
          then: Yup.string().required("Amount is required"),
        }),
      })
    ),
  });

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
              <Trans>Add Group</Trans>:
            </h2>

            <section className="bg-white p-3 mb-3">
              <>
                {values.groups.map((_, index) => (
                  <div key={index}>
                    <Row xs={1} md={3} xl={5}>
                      <Col className="mb-3">
                        <label htmlFor={`groups[${index}].name`}>
                          <Trans>Group Name</Trans>:
                        </label>
                        <Field
                          type="text"
                          name={`groups[${index}].name`}
                          className={`form-control ${
                            errors.groups &&
                            errors.groups[index] &&
                            errors.groups[index].name
                              ? "is-invalid"
                              : ""
                          }`}
                        />
                        <ErrorMessage
                          name={`groups[${index}].name`}
                          component="div"
                          className="invalid-feedback"
                        />
                      </Col>
                      <Col className="mb-3">
                        <label htmlFor={`groups[${index}].shortname`}>
                          <Trans>Group Acronym</Trans>:
                        </label>
                        <Field
                          type="text"
                          name={`groups[${index}].shortname`}
                          className={`form-control ${
                            errors.groups &&
                            errors.groups[index] &&
 
                            errors.groups[index].shortname
                              ? "is-invalid"
                              : ""
                          }`}
                        />
                        <ErrorMessage
                          name={`groups[${index}].shortname`}
                          component="div"
                          className="invalid-feedback"
                        />
                      </Col>

                      <Col className="mb-3">
                        <label htmlFor={`groups[${index}].country`}>
                          <Trans>Country</Trans>:
                        </label>
                        <Field
                          type="text"
                          name={`groups[${index}].country`}
                          className="form-control"
                          disabled
                        />
                      </Col>

                      <Col className="mb-3">
                        <div className="mb-3">
                          <label htmlFor={`groups[${index}].region`}>
                            <Trans>Region</Trans>:
                          </label>

                          <Select
                            name={`groups[${index}].region`}
                            defaultValue={`groups[${index}].region`}
                            options={regions}
                            onChange={(e) => {
                              setFieldValue(`groups[${index}].region`, e);
                              getCitiesOfCountry(e.value);
                            }}
                            className={`${
                              errors.groups &&
                              errors.groups[index] &&
                              errors.groups[index].region &&
                              "border border-danger rounded-2"
                            } `}
                            isInvalid={
                              errors.groups &&
                              errors.groups[index] &&
                              errors.groups[index].region
                            }
                            placeholder="Region"
                            isMulti={false}
                            isSearchable={true}
                            closeMenuOnSelect={true}
                            components={animatedComponents}
                            error={
                              errors.groups &&
                              errors.groups[index] &&
                              errors.groups[index].region
                            }
                            touched={
                              touched.groups &&
                              touched.groups[index] &&
                              touched.groups[index].region
                            }
                          />
                          {errors.groups &&
                            errors.groups[index] &&
                            errors.groups[index].region && (
                              <div className="is-invalid"></div>
                            )}

                          <ErrorMessage
                            name={`groups[${index}].region`}
                            component="div"
                            className="invalid-feedback is-invalid"
                          />
                        </div>
                      </Col>
                      {cityDataFetched && (
                        <Col className="mb-3">
                          <div className="mb-3">
                            <label htmlFor={`groups[${index}].city`}>
                              <Trans>Commune</Trans>:
                            </label>

                            <Select
                              name={`groups[${index}].city`}
                              defaultValue={`groups[${index}].city`}
                              options={citiesData}
                              onChange={(e) => {
                                setFieldValue(`groups[${index}].city`, e);
                              }}
                              className={`${
                                errors.groups &&
                                errors.groups[index] &&
                                errors.groups[index].city &&
                                "border border-danger rounded-2"
                              } `}
                              isInvalid={
                                errors.groups &&
                                errors.groups[index] &&
                                errors.groups[index].city
                              }
                              placeholder="Commune"
                              isMulti={false}
                              isSearchable={true}
                              closeMenuOnSelect={true}
                              components={animatedComponents}
                              error={
                                errors.groups &&
                                errors.groups[index] &&
                                errors.groups[index].city
                              }
                              touched={
                                touched.groups &&
                                touched.groups[index] &&
                                touched.groups[index].city
                              }
                            />
                            {errors.groups &&
                              errors.groups[index] &&
                              errors.groups[index].city && (
                                <div className="is-invalid"></div>
                              )}

                            <ErrorMessage
                              name={`groups[${index}].city`}
                              component="div"
                              className="invalid-feedback is-invalid"
                            />
                          </div>
                        </Col>
                      )}
                    </Row>
                  </div>
                ))}
              </>
            </section>

            <section className="bg-white p-3 mb-3">
              <h5 className="mb-4 font-weight-bold">
                <Trans>Add Minimum Two Admins</Trans> *
              </h5>
              <FieldArray name="admins">
                {(arrayHelpers) => (
                  <>
                    {values?.admins?.map((admin, index) => (
                      <div key={index} className="d-flex w-100 align-items-end">
                        <div className="flex-fill">
                          <Row xs={1} md={3} xl={5}>
                            <Col className="mb-3">
                              <div className="mb-3">
                                <label htmlFor={`admins.${index}.firstname`}>
                                  <Trans>First Name</Trans>:
                                </label>
                                <Field
                                  type="text"
                                  name={`admins.${index}.firstname`}
                                  className={`form-control ${
                                    errors.admins &&
                                    errors.admins[index] &&
                                    errors.admins[index].firstname
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                <ErrorMessage
                                  name={`admins.${index}.firstname`}
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </div>
                            </Col>
                            <Col className="mb-3">
                              <div className="mb-3">
                                <label htmlFor={`admins.${index}.lastname`}>
                                  <Trans>Last Name</Trans>:
                                </label>
                                <Field
                                  type="text"
                                  name={`admins.${index}.lastname`}
                                  className={`form-control ${
                                    errors.admins &&
                                    errors.admins[index] &&
                                    errors.admins[index].lastname
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                <ErrorMessage
                                  name={`admins.${index}.lastname`}
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </div>
                            </Col>
                            <Col className="mb-3">
                              <div className="mb-3">
                                <label htmlFor={`admins.${index}.email`}>
                                  <Trans>Email</Trans>: (Optional)
                                </label>
                                <Field
                                  type="email"
                                  name={`admins.${index}.email`}
                                  className={`form-control ${
                                    errors.admins &&
                                    errors.admins[index] &&
                                    errors.admins[index].email
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                <ErrorMessage
                                  name={`admins.${index}.email`}
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </div>
                            </Col>
                            <Col className="mb-3">
                              <div className="mb-3">
                                <label htmlFor={`admins.${index}.country`}>
                                  <Trans>Country</Trans>:
                                </label>
                                <Select
                                  name={`admins.${index}.country`}
                                  defaultValue={`admins.${index}.country`}
                                  options={countries}
                                  onChange={(option) =>
                                    setFieldValue(
                                      `admins.${index}.country`,
                                      option
                                    )
                                  }
                                  className={`${
                                    errors.admins &&
                                    errors.admins[index] &&
                                    errors.admins[index].country &&
                                    "border border-danger rounded-2"
                                  } `}
                                  isInvalid={
                                    errors.admins &&
                                    errors.admins[index] &&
                                    errors.admins[index].country
                                  }
                                  placeholder="Country"
                                  isMulti={false}
                                  isSearchable={true}
                                  closeMenuOnSelect={true}
                                  components={animatedComponents}
                                  error={
                                    errors.admins &&
                                    errors.admins[index] &&
                                    errors.admins[index].country
                                  }
                                  touched={
                                    touched.admins &&
                                    touched.admins[index] &&
                                    touched.admins[index].country
                                  }
                                />
                                <ErrorMessage
                                  name={`admins.${index}.country`}
                                  component="div"
                                  className="invalid-feedback is-invalid"
                                />
                              </div>
                            </Col>

                            <Col className="mb-3">
                              <div className="mb-3">
                                <label htmlFor={`admins.${index}.phone`}>
                                  <Trans>Phone Number</Trans>:
                                </label>
                                <Field
                                  type="number"
                                  name={`admins.${index}.phone`}
                                  disabled={!values.admins[index].country}
                                  className={`form-control ${
                                    errors.admins &&
                                    errors.admins[index] &&
                                    errors.admins[index].phone
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                <ErrorMessage
                                  name={`admins.${index}.phone`}
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
                            className="btn btn-danger ml-2 p-1 d-flex justify-content-center align-items-center mb-5"
                            onClick={() => arrayHelpers.remove(index)}
                          >
                            <i className="mdi mdi-trash-can m-0"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <Row className="justify-content-center">
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

            <section className="bg-white p-3 mb-3">
              <h4 className="mb-4 font-weight-bold">
                <Trans>Ohana Default Pools</Trans>
              </h4>
              <section>
                <h6>
                  <Trans>Activate default Pools for this Group</Trans>
                </h6>
                <FieldArray name="default_pools">
                  {(arrayHelpers) => (
                    <>
                      {values.default_pools.map((pool, index) => (
                        <div key={index} className="mb-3">
                          <Row className="align-items-center">
                            <Col md={3} className="mb-3 mb-md-0">
                              <div>
                                <label className="m-0">
                                  <Field
                                    type="checkbox"
                                    name={`default_pools[${index}].active`}
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
                                      pool.amount_type === "Fixed Amount"
                                        ? 3
                                        : 4
                                    }
                                    className="mb-3 mb-xl-0"
                                  >
                                    <label
                                      htmlFor={`default_pools[${index}].type`}
                                    >
                                      <Trans>Type</Trans>:
                                    </label>
                                    <Field
                                      as="select"
                                      name={`default_pools[${index}].type`}
                                      disabled={!pool.active}
                                      className={`form-control ${
                                        errors.default_pools &&
                                        errors.default_pools[index] &&
                                        errors.default_pools[index].type
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                    >
                                      <option value="">Select Type</option>
                                      <option value="Permanent">
                                        Permanent
                                      </option>
                                      <option value="Temporary">
                                        Temporary
                                      </option>
                                    </Field>
                                    <ErrorMessage
                                      name={`default_pools[${index}].type`}
                                      component="div"
                                      className="invalid-feedback"
                                    />
                                  </Col>
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
                                      htmlFor={`default_pools[${index}].periodicity`}
                                    >
                                      <Trans>Periodicity</Trans>:
                                    </label>
                                    <Field
                                      as="select"
                                      name={`default_pools[${index}].periodicity`}
                                      disabled={!pool.active}
                                      className={`form-control ${
                                        errors.default_pools &&
                                        errors.default_pools[index] &&
                                        errors.default_pools[index].periodicity
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                    >
                                      <option value="">
                                        Select Periodicity
                                      </option>
                                      <option value="Daily">Daily</option>
                                      <option value="Weekly">Weekly</option>
                                      <option value="Monthly">Monthly</option>
                                      <option value="Quarterly">
                                        Quarterly
                                      </option>
                                      <option value="Semesterly">
                                        Semesterly
                                      </option>
                                      <option value="Yearly">Yearly</option>
                                    </Field>
                                    <ErrorMessage
                                      name={`default_pools[${index}].periodicity`}
                                      component="div"
                                      className="invalid-feedback"
                                    />
                                  </Col>
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
                                      htmlFor={`default_pools[${index}].type`}
                                    >
                                      <Trans>Amount Type</Trans>:
                                    </label>
                                    <Field
                                      as="select"
                                      name={`default_pools[${index}].amount_type`}
                                      disabled={!pool.active}
                                      className={`form-control ${
                                        errors.default_pools &&
                                        errors.default_pools[index] &&
                                        errors.default_pools[index].amount_type
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                    >
                                      <option value="">Select Type</option>
                                      <option value="Any Amount">
                                        Any Amount
                                      </option>
                                      <option value="Fixed Amount">
                                        Fixed
                                      </option>
                                    </Field>
                                    <ErrorMessage
                                      name={`default_pools[${index}].type`}
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
                                        htmlFor={`default_pools[${index}].amount`}
                                      >
                                        <Trans>Amount</Trans>:
                                      </label>
                                      <Field
                                        type="number"
                                        name={`default_pools[${index}].amount`}
                                        disabled={!pool.active}
                                        className={`form-control ${
                                          errors.default_pools &&
                                          errors.default_pools[index] &&
                                          errors.default_pools[index].amount
                                            ? "is-invalid"
                                            : ""
                                        }`}
                                      />
                                      <ErrorMessage
                                        name={`default_pools[${index}].amount`}
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
                    </>
                  )}
                </FieldArray>
              </section>
            </section>
            <section className="bg-white p-3 mb-3">
              <h4 className="mb-4 font-weight-bold">
                <Trans>Manual Pools</Trans>
              </h4>
              <FieldArray name="manual_pools">
                {(arrayHelpers) => (
                  <>
                    {values.manual_pools.map((pool, index) => (
                      <div key={index} className="mb-3">
                        <Row className="align-items-center">
                          <Col md={4}>
                            <label>
                              <Field
                                type="checkbox"
                                name={`manual_pools[${index}].active`}
                                checked={pool.active}
                                onChange={(e) => {
                                  const newValue = e.target.checked;
                                  setFieldValue(
                                    `manual_pools[${index}].active`,
                                    newValue
                                  );
                                  // Synchronize other checkboxes
                                  // const updatedPools = values.manual_pools.map(
                                  //   (p, idx) => ({
                                  //     ...p,
                                  //     active: newValue,
                                  //   })
                                  // );
                                  // setFieldValue("manual_pools", updatedPools);
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
                                  htmlFor={`manual_pools[${index}].amount`}
                                  className="m-0"
                                >
                                  <Trans>Current Amount</Trans>:
                                </label>
                              </Col>
                              <Col md={8}>
                                <Field
                                  type="number"
                                  name={`manual_pools[${index}].amount`}
                                  disabled={!pool.active}
                                  className={`form-control ${
                                    errors.manual_pools &&
                                    errors.manual_pools[index] &&
                                    errors.manual_pools[index].amount
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                <ErrorMessage
                                  name={`manual_pools[${index}].amount`}
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </div>
                    ))}
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
                  <Trans>Submit</Trans>
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default OrganizationGroupForm;
