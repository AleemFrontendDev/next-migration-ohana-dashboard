"use client";
import React, { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Select from "react-select";
import { Formik } from "formik";
import * as yup from "yup";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import makeAnimated from "react-select/animated";
import useInterval, { BASE_URL, ROUTES, SECTIONS } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { Trans } from "react-i18next";

const animatedComponents = makeAnimated();

const schema = yup.object().shape({
  status: yup.bool().required(),
  section: yup.object().required(),
  add: yup.bool(),
  view: yup.bool(),
  edit: yup.bool(),
  delete: yup.bool(),
});

export function AddNewPermission() {
  const { id } = useParams();
  const history = useRouter();
  const [sections, setSections] = useState([]);
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const { country } = useCountry();
  const { user } = useUser();
  const authToken = localStorage.getItem("Auth Token");

  const fetchSections = async () => {
    const response = await fetch(`${BASE_URL}/roles/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-api-key": "Ohana-Agent-oo73",
      },
    });
    const jsonData = await response.json();
    console.log("jsonData: ", jsonData);
    if (jsonData.success) {
      const sectionsList = jsonData.permissions.data.map((doc) => doc.section);
      const sectionOptions = SECTIONS.filter(
        (section) => !sectionsList.includes(section)
      ).map((section) => {
        if (!sectionsList.includes(section)) {
          return {
            label: section,
            value: section,
          };
        }
      });
      setSections(sectionOptions);
    }
  };

  const fetchPermissions = async () => {
    if (!user.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var rolePermission = user.role.permissions.filter(
        (permission) => permission.section === "Roles"
      );
      if (rolePermission.length && rolePermission[0].status) {
        setPermissions(...rolePermission);
      }
    }
    setSpinner(false);
  };

  useEffect(() => {
    fetchPermissions();
    fetchSections();
  }, [country]);

  useInterval(fetchPermissions, 20000, 5);

  const initialValues = {
    status: true,
    section: [],
    add: true,
    view: true,
    edit: true,
    delete: true,
  };

  const onSubmit = useCallback(
    async (values) => {
      if (permissions.add) {
        const data = {
          status: values.status,
          section: values.section.value,
          add: values.add,
          view: values.view,
          edit: values.edit,
          delete: values.delete,
          role_id: id,
        };
        const response = await fetch(`${BASE_URL}/add-role-permission`, {
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
          history.push(ROUTES.roles + "/" + id + ROUTES.permissions);
        }
      }
    },
    [permissions]
  );

  return (
    <>
      {permissions && permissions.add && !spinner ? (
        <>
          <div className="page-header mb-0">
            <h3 className="page-title">New Role Permission</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link
                    className="nav-link"
                    href={ROUTES.roles + "/" + id + ROUTES.permissions}
                  >
                    <Trans>Permissions</Trans>
                  </Link>
                </li>
                <li className="breadcrumb-item pt-2" aria-current="page">
                  {" "}
                  <Trans>Add New Role Permission</Trans>{" "}
                </li>
              </ol>
            </nav>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3>
                    <Trans>Add New Role Permission</Trans>
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
                      touched,
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
                        <Form.Group
                          as={Row}
                          className="mb-3"
                          controlId="section"
                        >
                          <Form.Label column sm="2">
                            Section:
                          </Form.Label>
                          <Col>
                            <Select
                              name="section"
                              defaultValue={values.section}
                              options={sections}
                              onChange={(e) => {
                                setFieldValue("section", e);
                              }}
                              isInvalid={!!errors.section}
                              placeholder="Section"
                              isMulti={false}
                              isSearchable={true}
                              // closeMenuOnSelect={false}
                              components={animatedComponents}
                              error={errors.topics}
                              touched={touched.topics}
                            />
                            <Form.Control.Feedback type="invalid" tooltip>
                              {errors.section}
                            </Form.Control.Feedback>
                          </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="add">
                          <Col>
                            <Form.Label column sm="2">
                              Create:
                            </Form.Label>
                            <BootstrapSwitchButton
                              name="add"
                              value={values.add}
                              onChange={(e) => {
                                setFieldValue("add", e);
                              }}
                              onBlur={handleBlur}
                              checked={values.add}
                              onlabel="On"
                              offlabel="Off"
                              size="sm"
                              onstyle="secondary"
                              isInvalid={!!errors.add}
                            />
                            <Form.Label column sm="2">
                              <Trans>View</Trans>:
                            </Form.Label>
                            <BootstrapSwitchButton
                              name="view"
                              value={values.view}
                              onChange={(e) => {
                                setFieldValue("view", e);
                              }}
                              onBlur={handleBlur}
                              checked={values.view}
                              onlabel="On"
                              offlabel="Off"
                              size="sm"
                              onstyle="secondary"
                              isInvalid={!!errors.view}
                            />
                            <Form.Label className="ml-5 pl-5" column sm="2">
                              Update:
                            </Form.Label>
                            <BootstrapSwitchButton
                              name="edit"
                              value={values.edit}
                              onChange={(e) => {
                                setFieldValue("edit", e);
                              }}
                              onBlur={handleBlur}
                              checked={values.edit}
                              onlabel="On"
                              offlabel="Off"
                              size="sm"
                              onstyle="secondary"
                              isInvalid={!!errors.edit}
                            />
                            <Form.Label className="ml-5 pl-5" column sm="2">
                              Delete:
                            </Form.Label>
                            <BootstrapSwitchButton
                              name="delete"
                              value={values.delete}
                              onChange={(e) => {
                                setFieldValue("delete", e);
                              }}
                              onBlur={handleBlur}
                              checked={values.delete}
                              onlabel="On"
                              offlabel="Off"
                              size="sm"
                              onstyle="secondary"
                              isInvalid={!!errors.delete}
                            />
                          </Col>
                        </Form.Group>
                        <Form.Group
                          as={Row}
                          className="mb-3"
                          controlId="edit"
                        ></Form.Group>
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
export default AddNewPermission;
