"use client";
import React, { useState, useEffect } from "react";
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
import useUser from "@/hooks/useUser";
import parsePhoneNumberFromString from "libphonenumber-js";

import * as Yup from "yup";
import { Trans } from "react-i18next";

const animatedComponents = makeAnimated();

export function UserForm({ initialValues, editUser, onSubmit, orgId }) {
  console.log("initialValues", initialValues);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const [organizationId, setOrganizationId] = useState([]);
  console.log("organizationId 29", organizationId);

  const authToken = localStorage.getItem("Auth Token");
  const { user } = useUser();

  const [rolesList, setRolesArray] = useState([]);
  const [rolesDataFetch, setRolesDataFetch] = useState(false);
  const [countriesData, setCountriesData] = useState([]);
  const [allCountries, setAllCountries] = useState([]);
  const [countriesDataFetch, setCountriesDataFetch] = useState(false);
  const [cityList, setCityList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [cityDataFetch, setCityDataFetch] = useState(false);
  const [regionDataFetch, setRegionDataFetch] = useState(false);

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required("First Name is required"),
    last_name: Yup.string().required("Last Name is required"),
    email: Yup.string().email().required("Email is required"),
    phone: Yup.string()
      .required("Phone is required")
      .test(
        "isValidPhoneNumber",
        "Phone number is not valid",
        function (value) {
          const { country } = this.parent;
          console.log("Country:", country);
          const countryTextCode = country?.iso;
          if (!countryTextCode) return true;
          const phoneNumber = parsePhoneNumberFromString(
            value || "",
            countryTextCode
          );
          return phoneNumber ? phoneNumber.isValid() : false;
        }
      ),
    password: !editUser
      ? Yup.string()
          .required("Password is required")
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
            "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
          )
      : Yup.string().optional(),
    country: Yup.object().required("Country is required"),
    region: Yup.object().required("Region is required"),
    // city: Yup.object().required("City is required"),
    role: Yup.object().required("Role is required"),
  });

  const fetchOrgDataByUserId = async () => {
    try {
      const response = await fetch(`${BASE_URL}/get-organization-by-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
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
      console.log("get-organization-by-user Response Data:", jsonData);
      if (jsonData.status === "success") {
        const { data } = jsonData;

        setOrganizationId(data.org_id);

        await fetchRoles(data.org_id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchCountries();
    if (orgId) {
      fetchRoles(orgId);
    } else fetchOrgDataByUserId();
  }, []);

  const fetchRoles = async (org_id) => {
    const response = await fetch(
      `${BASE_URL}/get-roles-by-org-id?page=1&size=1000`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({ org_id: org_id }),
      }
    );
    const jsonData = await response.json();
    console.log("roles data api response jsonData", jsonData);
    if (jsonData.status === "success" && Array.isArray(jsonData.data)) {
        const rolesArray = jsonData.data.map((role) => ({
            label: role.name,
            value: role.id,
        }));
        setRolesArray(rolesArray);
    } else {
        console.error("Invalid roles data:", jsonData.data);
        setRolesArray([]);
    }
    setRolesDataFetch(true);
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
    console.log("Country Data Api response", jsonData);
    if (jsonData.success) {
      const countriesList = jsonData.countries.data;
      const countryOptions = countriesList.map((country) => {
        if (country) {
          return {
            label: country.nicename,
            value: country.id,
            code: country.phonecode,
            iso: country.iso,
          };
        }
      });
      setCountriesData(countryOptions);
      setAllCountries(jsonData.data);
      setCountriesDataFetch(true);
      if (editUser) {
        setCityDataFetch(false);
        setRegionDataFetch(false);
        const selectedCountryId = initialValues.country.value;
        await getRegionOfCountry(selectedCountryId);
        const region_id = initialValues.region.value;
        if (region_id) {
          await getCitiesOfRegion(region_id);
        }
      }
    }
  };

  const getCitiesOfRegion = async (region_id) => {
    console.log("region_id", region_id);

    setCityDataFetch(false);
    try {
      const response = await fetch(`${BASE_URL}/get-all-cities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({ region_id: region_id }),
      });
      const jsonData = await response.json();
      console.log("Get city of country api response", jsonData);
      if (jsonData.status === "success") {
        console.log("City Data", jsonData);
        const { data } = jsonData;
        console.log(data);
        const cityOptions = data.cities.map((city) => {
          if (city) {
            return {
              label: city.name,
              value: city.id,
            };
          }
        });
        console.log("cityOptions", cityOptions);
        setCityList(cityOptions);
        setCityDataFetch(true);
      }
    } catch (error) {
      console.log("Error in getting cities of country", error);
    }
  };

  const getRegionOfCountry = async (country_id) => {
    setRegionDataFetch(false);
    try {
      const response = await fetch(`${BASE_URL}/get-all-regions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
        body: JSON.stringify({ country_id: country_id }),
      });
      const jsonData = await response.json();
      console.log("Get Region of country api response", jsonData);
      if (jsonData.status === "success") {
        console.log("Region Data", jsonData);
        const { data } = jsonData;

        const regionOptions = data.region.map((item) => {
          if (item) {
            return {
              label: item.name,
              value: item.id,
            };
          }
        });

        setRegionList(regionOptions);
        setRegionDataFetch(true);
      }
    } catch (error) {
      console.log("Error in getting Region of country", error);
    }
  };

  const handleCountryChange = async (option, setFieldValue) => {
    setCityList([]);
    setRegionList([]);
    setCityDataFetch(false);
    setCityDataFetch(false);

    setFieldValue("city", "");
    setFieldValue("region", "");
    await getRegionOfCountry(option.value);
  };

  const handleRegionChange = async (option, setFieldValue) => {
    setCityDataFetch(false);
    setFieldValue("city", "");
    await getCitiesOfRegion(option.value);
  };

  return (
    <>
      <div className="page-header mb-0">
        <h3 className="page-title">
          <Trans>{!editUser ? "Add New" : "Edit"} User</Trans>
        </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link className="nav-link" href={ROUTES.org_users}>
                <Trans>Users</Trans>
              </Link>
            </li>
            <li className="breadcrumb-item pt-2" aria-current="page">
              <Trans>{!editUser ? "Add New" : "Edit"} User</Trans>
            </li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3>
                <Trans>{!editUser ? "Add New" : "Edit"} User</Trans>
              </h3>
            </div>
            <div className="card-body">
              <Formik
                onSubmit={(values) => {
                  onSubmit({ ...values, org_id: organizationId });
                }}
                initialValues={initialValues}
                validationSchema={validationSchema}
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
                          value={values?.account_rejected}
                          onChange={(e) => {
                            setFieldValue("account_rejected", e);
                          }}
                          onBlur={handleBlur}
                          checked={values?.account_rejected}
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
                        <Trans>First Name</Trans>:
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
                        <Form.Control.Feedback type="invalid">
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
                        <Form.Control.Feedback type="invalid">
                          {errors?.last_name}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    {!editUser && (
                      <Form.Group
                        as={Row}
                        className="mb-3"
                        controlId="password"
                      >
                        <Form.Label column sm="2">
                          <Trans>Password</Trans>:
                        </Form.Label>
                        <Col>
                          <div className="d-flex gap-0">
                            <div className="flex-fill">
                              <Form.Control
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={values?.password}
                                onChange={handleChange}
                                placeholder="Password"
                                isInvalid={!!errors?.password}
                                autoComplete="new-password"
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors?.password}
                              </Form.Control.Feedback>
                            </div>

                            <div>
                              <Button
                                variant="outline-secondary"
                                className="py-3"
                                onClick={togglePasswordVisibility}
                              >
                                {showPassword ? (
                                  <i className="mdi mdi-eye"></i>
                                ) : (
                                  <i className="mdi mdi-eye-off"></i>
                                )}
                              </Button>
                            </div>
                          </div>
                        </Col>
                      </Form.Group>
                    )}

                    <Form.Group as={Row} className="mb-3" controlId="email">
                      <Form.Label column sm="2">
                        <Trans>Email</Trans>:
                      </Form.Label>
                      <Col>
                        <Form.Control
                          type="email"
                          name="email"
                          value={values?.email}
                          onChange={handleChange}
                          placeholder="Email"
                          isInvalid={!!errors?.email}
                          autoComplete="new-email"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors?.email}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    {countriesDataFetch && (
                      <>
                        <Form.Group
                          as={Row}
                          className="mb-3"
                          controlId="country"
                        >
                          <Form.Label column sm="2">
                            <Trans>Country</Trans>:
                          </Form.Label>
                          <Col>
                            <Select
                              name="country"
                              value={values.country}
                              options={countriesData}
                              onChange={(e) => {
                                setFieldValue("country", e);
                                handleCountryChange(e, setFieldValue);
                              }}
                              className={
                                errors?.country && "border border-danger"
                              }
                              // isMulti={true}
                              isSearchable={true}
                              closeMenuOnSelect={true}
                              components={animatedComponents}
                            />

                            <Form.Control.Feedback
                              type="invalid"
                              className={errors?.country && "d-block"}
                            >
                              {errors?.country}
                            </Form.Control.Feedback>
                          </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3" controlId="phone">
                          <Form.Label column sm="2">
                            <Trans>Phone</Trans>:
                          </Form.Label>
                          <Col>
                            <Form.Control
                              type={"number"}
                              name="phone"
                              value={values?.phone}
                              onChange={handleChange}
                              disabled={!values?.country}
                              placeholder="phone"
                              isInvalid={!!errors?.phone}
                              autoComplete="new-phone"
                            />

                            <Form.Control.Feedback type="invalid">
                              {errors?.phone}
                            </Form.Control.Feedback>
                          </Col>
                        </Form.Group>

                        {regionDataFetch && (
                          <Form.Group
                            as={Row}
                            className="mb-3"
                            controlId="region"
                          >
                            <Form.Label column sm="2">
                              <Trans>Region</Trans>:
                            </Form.Label>
                            <Col>
                              <Select
                                name="region"
                                value={values.region}
                                options={regionList}
                                onChange={(e) => {
                                  setFieldValue("region", e);
                                  handleRegionChange(e, setFieldValue);
                                }}
                                isSearchable={true}
                                components={animatedComponents}
                                // isMulti={true}
                                className={
                                  errors?.region && "border border-danger"
                                }
                              />
                              <Form.Control.Feedback
                                type="invalid"
                                className={errors?.region && "d-block"}
                              >
                                {errors?.region}
                              </Form.Control.Feedback>
                            </Col>
                          </Form.Group>
                        )}
                        {cityDataFetch && (
                          <Form.Group
                            as={Row}
                            className="mb-3"
                            controlId="city"
                          >
                            <Form.Label column sm="2">
                              <Trans>Commune</Trans>:
                            </Form.Label>
                            <Col>
                              <Select
                                name="city"
                                value={values.city}
                                options={cityList}
                                placeholder="Commune"
                                onChange={(e) => {
                                  setFieldValue("city", e);
                                }}
                                isSearchable={true}
                                components={animatedComponents}
                                // isMulti={true}
                                className={
                                  errors?.city && "border border-danger"
                                }
                              />
                              <Form.Control.Feedback
                                type="invalid"
                                className={errors?.city && "d-block"}
                              >
                                {errors?.city}
                              </Form.Control.Feedback>
                            </Col>
                          </Form.Group>
                        )}
                      </>
                    )}
                    {rolesDataFetch && (
                      <Form.Group as={Row} className="mb-3" controlId="role">
                        <Form.Label column sm="2">
                          <Trans>Role</Trans>:
                        </Form.Label>
                        <Col>
                          <Select
                            name="role"
                            defaultValue={values?.role}
                            options={rolesList}
                            onChange={(selectedOption) => {
                              setFieldValue("role", selectedOption);
                            }}
                            isInvalid={!!errors?.role}
                            placeholder="Role"
                            isMulti={false}
                            isSearchable={true}
                            components={animatedComponents}
                            error={errors.topics}
                            touched={touched.topics}
                            className={errors?.role && "border border-danger"}
                          />
                          <Form.Control.Feedback
                            type="invalid"
                            className={errors?.role && "d-block"}
                          >
                            {errors?.role}
                          </Form.Control.Feedback>
                        </Col>
                      </Form.Group>
                    )}

                    <Button type="submit" className="btn-primary">
                      <Trans>{editUser ? "Update" : "Add"}</Trans>
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
export default UserForm;
