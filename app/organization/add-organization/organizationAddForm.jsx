"use client";
import React, { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import * as Yup from "yup";
import { BASE_URL } from "@/utils/common";
import { Formik, Field, ErrorMessage, FieldArray } from "formik";
import db from "@/firebase/firebase-config";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Trans } from "react-i18next";
import makeAnimated from "react-select/animated";
import Select from "react-select";

const authToken = localStorage.getItem("Auth Token");
const animatedComponents = makeAnimated();

function OrganizationAddForm({ initialData, countries }) {
  const history = useRouter();
  const [showPassword, setShowPassword] = useState("");
  const togglePasswordVisibility = (index) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

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
          return { ...adminData, aleadyExist: true };
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

  async function createOrganization(data) {
    const emails = data.admins.map((admin) => admin.email);
    if (new Set(emails).size !== emails.length) {
      toast.error("Admin emails must be unique");
      return;
    }

    const phones = data.admins.map((admin) => admin.phone);
    if (new Set(phones).size !== phones.length) {
      toast.error("Admin phone numbers must be unique");
      return;
    }

    const adminData = [];
    data.admins.forEach((data) => {
      adminData.push({ ...data, country: data.country.value });
    });

    console.log("adminData", adminData);

    const adminsWithUid = await Promise.all(
      adminData.map((admin) => saveAdminToFirebase(admin))
    );
    console.log("Admins with Uid:", adminsWithUid);
    try {
      const adminsList = adminsWithUid.map((admin) => ({
        ...admin,
        phone: admin.phone.toString(),
      }));
      const dataWithAdminsUid = { ...data, admins: adminsList };
      const response = await fetch(`${BASE_URL}/create-organization`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
        body: JSON.stringify(dataWithAdminsUid),
      });

      const responseData = await response.json();
      console.log("Create Org Response:", responseData);
      if (responseData.status !== "success") {
        throw new Error(`Organization creation error: ${responseData.message}`);
      }
      if (responseData.status === "success") {
        history.push("/organization");
        console.log("Organization created successfully!");
      } else {
        toast.error(`Error creating organization: ${responseData.message}`);
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error(`Error creating organization: ${error.message}`);
    }
  }

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Organization Name is required"),
    shortname: Yup.string().required("Short Name is required"),
    description: Yup.string().required("Description is required"),
    admins: Yup.array().of(
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
          createOrganization(values);
          setSubmitting(false);
        }}
      >
        {({ values, errors, touched, handleSubmit, setFieldValue, index }) => (
          <Form onSubmit={handleSubmit}>
            <h2 className={"mb-4"}>
              <Trans>Add Organization</Trans>:
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
              <h5 className="mb-4 font-weight-bold">
                <Trans>Add Minimum Two Admins</Trans> *
              </h5>
              <FieldArray name="admins">
                {(arrayHelpers) => (
                  <>
                    {values?.admins?.map((admin, index) => (
                      <div key={index} className="d-flex w-100 align-items-end">
                        <div className="flex-fill">
                          <Row xs={1} sm={2} md={3} xl={6}>
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
                                  <Trans>Email</Trans>:
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

                            <Col className="mb-3">
                              <div className="mb-3">
                                <label htmlFor={`admins.${index}.password`}>
                                  <Trans>Password</Trans>:
                                </label>
                                <div className="input-group">
                                  <Field
                                    type={
                                      showPassword[index] ? "text" : "password"
                                    }
                                    name={`admins.${index}.password`}
                                    className={`form-control ${
                                      errors.admins &&
                                      errors.admins[index] &&
                                      errors.admins[index].password
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
                                  name={`admins.${index}.password`}
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

            <Row className="justify-content-end">
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
export default OrganizationAddForm;
