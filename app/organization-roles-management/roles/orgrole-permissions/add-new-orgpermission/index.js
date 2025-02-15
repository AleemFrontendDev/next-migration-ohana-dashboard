import React, { useCallback, useState, useEffect } from "react";
import { useHistory, Link, useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Select from "react-select";
import { Formik } from "formik";
import * as yup from "yup";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import makeAnimated from "react-select/animated";
import useInterval, {
  BASE_URL,
  ROUTES,
  SECTIONS,
} from "../../../../basic-ui/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "../../../../hooks/useCountry";
import useUser from "../../../../hooks/useUser";
import { toast } from "react-toastify";
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
  const history = useHistory();
  const [sections, setSections] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const { country } = useCountry();
  const { user } = useUser();
  console.log("42", user.role_id);
  const authToken = localStorage.getItem("Auth Token");

  const fetchSections = async () => {
    const response = await fetch(`${BASE_URL}/get-all-org-permissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`, 
        "x-api-key": "Ohana-Agent-oo73",       
      },
    });
    const jsonData = await response.json();
    const { data } = jsonData;
    const admins = data.map((admin) => ({
      value: admin.id,
      label: admin.name,
    }));
    setSections({ admins });
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleSelectChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    console.log("Selected ID:", selectedOption.value);
    console.log("Selected Name:", selectedOption.label);
  };

  const initialValues = {
    status: true,
    section: [],
    add: true,
    view: true,
    edit: true,
    delete: true,
  };

  const onSubmit = useCallback(async (values) => {
    const data = {
      status: values.status,
      permission_id: selectedOption.value,

      add: values.add,
      view: values.view,
      edit: values.edit,
      delete: values.delete,
      role_id: id,
    };
    const response = await fetch(`${BASE_URL}/assign-permissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`, 
        "x-api-key": "Ohana-Agent-oo73",       
      },
      body: JSON.stringify(data),
    });
    const jsonData = await response.json();
    toast.success("Permission Assign Successfully!");

    history.push("/org-permissions/" + id);
  });

  return (
    <>
      <div className="page-header mb-0">
        <h3 className="page-title">
          <Trans>New Role Permission</Trans>
        </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link
                className="nav-link"
                to={ROUTES.orgpermissions.replace(":id", id)}
                // to={ROUTES.roles + "/" + id + ROUTES.permissions}
              >
                <Trans>Permissions</Trans>
              </Link>
            </li>
            <li className="breadcrumb-item pt-2" aria-current="page">
              <Trans>Add New Role Permission</Trans>
            </li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3>Add New Role Permission </h3>
            </div>
            <div className="card-body">
              <Formik
                // validationSchema={schema}
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
                    <Form.Group as={Row} className="mb-3" controlId="status">
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
                    <Form.Group as={Row} className="mb-3" controlId="section">
                      <Form.Label column sm="2">
                        <Trans>Section</Trans>:
                      </Form.Label>
                      <Col>
                        <Select
                          name="section"
                          defaultValue={values.section}
                          value={selectedOption}
                          options={sections.admins}
                          onChange={handleSelectChange}
                          placeholder="Section"
                          isMulti={false}
                          isSearchable={true}
                          isInvalid={!!errors.section}
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
                          <Trans>Create</Trans>:
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
                          <Trans>Update</Trans>:
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
                          <Trans>Delete</Trans>:
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
                    <Button type="submit">
                      <Trans>Add</Trans>
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
export default AddNewPermission;
