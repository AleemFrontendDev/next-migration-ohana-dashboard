"use client";
import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button, Table } from "react-bootstrap";
import * as Yup from "yup";
import { BASE_URL, ROUTES } from "@/utils/common";
import { Formik, Field, FieldArray, ErrorMessage } from "formik";
import db from "@/firebase/firebase-config";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Trans } from "react-i18next";
import makeAnimated from "react-select/animated";
import Select from "react-select";
import parsePhoneNumberFromString from "libphonenumber-js";
import Link from "next/link";

const authToken = localStorage.getItem("Auth Token");
const animatedComponents = makeAnimated();

function OrganizationEditForm({ initialData, isEditing, id }) {
  console.log("id 23", id);

  const [countries, setCountries] = useState([]);
  const history = useRouter();
  const [showPassword, setShowPassword] = useState("");
  const togglePasswordVisibility = (index) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const fetchCountriesAndPermissions = async () => {
    const response = await fetch(`${BASE_URL}/countries?page=1&size=1000`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-api-key": "Ohana-Agent-oo73",
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
            code: country.phonecode,
            iso: country.iso,
          };
        }
      });
      console.log("countryOptions", countryOptions);
      setCountries(countryOptions);
    }
  };
  useEffect(() => {
    fetchCountriesAndPermissions();
  }, []);

  const saveAdminToFirebase = async (adminData) => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        db.auth,
        adminData.email,
        adminData.password
      );
      return { ...adminData, uid: user.uid };
    } catch (error) {
      console.error("Error saving admin to Firebase:", error);
      if (error.code === "auth/email-already-in-use") {
        console.log("Admin already exist", adminData.email);
        const uid = await getUserUidByEmail(adminData.email);
        if (uid) {
          return { ...adminData, uid: uid, aleadyExist: true };
        } else {
          return { ...adminData, aleadyExist: false };
        }
      } else {
        throw error;
      }
    }
  };

  async function getUserUidByEmail(email) {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(db.auth, email);
      console.log("SignInMethods:", signInMethods);
      if (signInMethods.length === 0) {
        console.log("No user found with this email");
        return null;
      }
      const uid = signInMethods[0].localId;
      return uid;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return null;
    }
  }

  async function editOrganization(data) {
    try {
      const newadminData = [];

      data.new_admins.forEach((data) => {
        newadminData.push({ ...data, country: data.country.value });
      });

      console.log("newadminData", newadminData);

      const adminsWithUid = await Promise.all(
        newadminData.map((admin) => saveAdminToFirebase(admin))
      );
      console.log("Admins with Uid:", adminsWithUid);
      const newData = { ...data, new_admins: adminsWithUid };
      console.log("newData", newData);

      const response = await fetch(`${BASE_URL}/organization-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
        body: JSON.stringify(newData),
      });
      console.log("Response", response);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const responseData = await response.json();
      console.log("Response Data:", responseData);
      if (responseData.status !== "success") {
        throw new Error(`Organization Updating Error: ${responseData.message}`);
      }
      history.push("/organization");
      console.log("Organization Update successfully!");
    } catch (error) {
      console.error("Error in Update organization:", error);
      toast.error(`Error in Update organization: ${error.message}`);
    }
  }

  //FORMIKd
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Organization Name is required"),
    shortname: Yup.string().required("Short Name is required"),
    description: Yup.string().required("Description is required"),
    new_admins: Yup.array().of(
      Yup.object().shape({
        firstname: Yup.string().required("First Name is required"),
        lastname: Yup.string().required("Last Name is required"),
        email: Yup.string()
          .email("Invalid email")
          .required("Email is required"),
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
        password: Yup.string()
          .min(8, "Password must be at least 8 characters")
          .required("Password is required"),
        country: Yup.object().required("Country is required"),
      })
    ),
  });

  return (
    <div className="container-fluid" style={{ minHeight: "100vh" }}>
      <Formik
        initialValues={initialData}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          console.log("Org Data values", values);
          editOrganization(values);
          setSubmitting(false);
        }}
      >
        {({ values, errors, touched, handleSubmit, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <h2 className={"mb-4"}>
              <Trans>Edit Organization</Trans>:
            </h2>
            <section className="bg-white p-3 mb-3">
              <div className="row mb-3">
                <Form.Group as={Col} md="6">
                  <label htmlFor="name" className="pb-2">
                    <Trans>Organization Name</Trans>:
                  </label>
                  <Field
                    type="text"
                    name="name"
                    className={`form-control ${
                      errors.name && touched.name && "is-invalid"
                    } rounded-0`}
                    placeholder="Organization Name"
                    style={{ minHeight: "45px" }}
                  />
                  {errors.name && touched.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </Form.Group>
                <Form.Group as={Col} md="6">
                  <label htmlFor="shortname" className="pb-2">
                    <Trans>Organization Acronym / Short Name</Trans>:
                  </label>
                  <Field
                    type="text"
                    name="shortname"
                    className={`form-control ${
                      errors.shortname && touched.shortname && "is-invalid"
                    } rounded-0`}
                    placeholder="Organization Acronym"
                    style={{ minHeight: "45px" }}
                  />
                  {errors.shortname && touched.shortname && (
                    <div className="invalid-feedback">{errors.shortname}</div>
                  )}
                </Form.Group>
                <Form.Group
                  as={Col}
                  md="12"
                  controlId="validationFormik02"
                  className="pt-3"
                >
                  <label htmlFor="description" className="pb-2">
                    <Trans>Short Description</Trans>:
                  </label>
                  <Field
                    type="text"
                    name="description"
                    className={`form-control ${
                      errors.description && touched.description && "is-invalid"
                    } rounded-0 `}
                    style={{ minHeight: "80px" }}
                  />
                  {errors.description && touched.description && (
                    <div className="invalid-feedback">{errors.description}</div>
                  )}
                </Form.Group>
              </div>
            </section>

            <section className="bg-white p-3 mb-3">
              <FieldArray name="new_admins">
                {(arrayHelpers) => (
                  <>
                    <section className="mb-5">
                      <div className="d-flex justify-content-between align-items-center gap-4 mb-4">
                        <h4 className="font-weight-bold">
                          <Trans>Organization Admins</Trans>
                        </h4>
                        <Button
                          variant="primary"
                          type="button"
                          className=""
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
                      </div>
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
                                <Trans>Actions</Trans>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {values?.admins?.map(
                              (admin, index) => (
                                console.log("admin 301  ", admin),
                                (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{admin.firstname}</td>
                                    <td>{admin.lastname}</td>
                                    <td>{admin.email}</td>
                                    <td>{admin.phone}</td>
                                    {/* <td>
                                  <button
                                    type="button"
                                    className="btn btn-danger p-1 d-flex justify-content-center align-items-center"
                                    onClick={() => {
                                      toast.error("Admin can't be deleted");
                                    }}
                                  >
                                    <i className="mdi mdi-trash-can m-0"></i>
                                  </button>
                                </td> */}
                                    <td>
                                      {/* <Link to={ROUTES.edit_org_user.replace(":id",admin.app_id, admin.org_id)}>
                                    
                                    <div className="icon-holder bg-secondary text-center p-2 rounded">
                                      <i className="mdi mdi-square-edit-outline"></i>
                                    </div>
                                  </Link> */}
                                      <Link
                                        href={ROUTES.edit_org_userwithorgid
                                          .replace(":appId", admin.app_id)
                                          .replace(":orgId", admin.org_id)}
                                      >
                                        <div className="icon-holder bg-[#dde4eb] text-center p-2 rounded">
                                          <i className="mdi mdi-square-edit-outline"></i>
                                        </div>
                                      </Link>
                                    </td>
                                  </tr>
                                )
                              )
                            )}
                          </tbody>
                        </Table>
                      </section>
                    </section>

                    {values?.new_admins?.map((new_admin, index) => (
                      <div key={index} className="d-flex w-100 align-items-end">
                        <div className="flex-fill">
                          <Row xs={1} sm={2} md={3} xl={6}>
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
                                  <Trans>Email</Trans>:
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
                                  onChange={(option) => {
                                    console.log("option", option);
                                    setFieldValue(
                                      `new_admins.${index}.country`,
                                      option
                                    );
                                  }}
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

                            <Col className="mb-3">
                              <div className="mb-3">
                                <label htmlFor={`new_admins.${index}.password`}>
                                  <Trans>Password</Trans>:
                                </label>
                                <div className="input-group">
                                  <Field
                                    type={
                                      showPassword[index] ? "text" : "password"
                                    }
                                    name={`new_admins.${index}.password`}
                                    className={`form-control ${
                                      errors.new_admins &&
                                      errors.new_admins[index] &&
                                      errors.new_admins[index].password
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary px-2"
                                    onClick={() =>
                                      togglePasswordVisibility(index)
                                    }
                                  >
                                    {showPassword[index] ? (
                                      <i className="mdi mdi-eye"></i>
                                    ) : (
                                      <i className="mdi mdi-eye-off"></i>
                                    )}
                                  </button>
                                </div>
                                <ErrorMessage
                                  name={`new_admins.${index}.password`}
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </div>
                            </Col>
                          </Row>
                        </div>
                        {new_admin?.appended === true && (
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
                  </>
                )}
              </FieldArray>
            </section>

            <Row className="justify-content-end mb-3">
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
export default OrganizationEditForm;
