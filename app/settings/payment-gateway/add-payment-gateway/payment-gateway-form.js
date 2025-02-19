import React, { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Select from "react-select";
import { Formik } from "formik";
import makeAnimated from "react-select/animated";
import { BASE_URL, ROUTES } from "@/utils/common";
import {
  PAYMENT_GATEWAY_FORMIK,
  PAYMENT_GATEWAY_TMONEY_FORMIK,
} from "@/utils/formik-data";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { Trans } from "react-i18next";
import { useAuthToken } from "@/utils/useAuthToken";

const animatedComponents = makeAnimated();

export function PaymentGatewayForm(props) {
  const { initialValues, setValues, toForm } = props;
  const [countries, setCountries] = useState([]);
  const authToken = useAuthToken();

  const fetchCountries = async () => {
    const response = await fetch(`${BASE_URL}/countries?page=1&size=1000`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`, 
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
          };
        }
      });
      setCountries(countryOptions);
    }
  };

  useEffect(() => {
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
      <div className="page-header">
        <h3 className="page-title">
          {toForm === "Add" ? "New" : toForm} Payment Gateway
        </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link className="nav-link" href={ROUTES.payment_gateway}>
                Payment Gateway
              </Link>
            </li>
            <li className="breadcrumb-item pt-2" aria-current="page">
              {" "}
              {toForm === "Add" ? toForm + "New" : toForm} Payment Gateway{" "}
            </li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3>
                {toForm === "Add" ? toForm + "New" : toForm} Payment Gateway{" "}
              </h3>
            </div>
            <div className="card-body">
              <Formik
                validationSchema={
                  initialValues.title === "Tmoney"
                    ? PAYMENT_GATEWAY_TMONEY_FORMIK.validationSchema
                    : PAYMENT_GATEWAY_FORMIK.validationSchema
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
                    <Form.Group as={Row} className="mb-3" controlId="activate">
                      <Form.Label column sm="2">
                        working as label
                        Activate:
                      </Form.Label>
                      <Col>
                        <BootstrapSwitchButton
                          name="activate"
                          value={values.activate}
                          onChange={(e) => {
                            setFieldValue("activate", e);
                          }}
                          onBlur={handleBlur}
                          checked={values.activate}
                          onlabel="On"
                          offlabel="Off"
                          size="sm"
                          onstyle="secondary"
                          isInvalid={!!errors.activate}
                        />
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="title">
                      <Form.Label column sm="2">
                        Title:
                      </Form.Label>
                      <Col>
                        <Form.Control
                          type="text"
                          name="title"
                          value={values.title}
                          onChange={handleChange}
                          placeholder="Title"
                          isInvalid={!!errors.title}
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {errors.title}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="country">
                      <Form.Label column sm="2">
                        <Trans>Country</Trans>:
                      </Form.Label>
                      <Col>
                        <Select
                          name="country"
                          defaultValue={values.country}
                          options={countries}
                          onChange={(e) => {
                            setFieldValue("country", e);
                          }}
                          isInvalid={!!errors.country}
                          placeholder="Country"
                          isMulti={true}
                          isSearchable={true}
                          closeMenuOnSelect={false}
                          components={animatedComponents}
                          error={errors.topics}
                          touched={touched.topics}
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {errors.country}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    <Form.Group
                      as={Row}
                      className="mb-3"
                      controlId="deposite_service_fee"
                    >
                      <Form.Label column sm="2">
                        Deposite Service Fee:
                      </Form.Label>
                      <Col>
                        <Form.Control
                          type="number"
                          name="deposite_service_fee"
                          value={values.deposite_service_fee}
                          onChange={handleChange}
                          placeholder="Descrption"
                          isInvalid={!!errors.deposite_service_fee}
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {errors.deposite_service_fee}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    <Form.Group
                      as={Row}
                      className="mb-3"
                      controlId="withdraw_service_fee"
                    >
                      <Form.Label column sm="2">
                        Withdraw Service Fee:
                      </Form.Label>
                      <Col>
                        <Form.Control
                          type="number"
                          name="withdraw_service_fee"
                          value={values.withdraw_service_fee}
                          onChange={handleChange}
                          placeholder="Descrption"
                          isInvalid={!!errors.withdraw_service_fee}
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {errors.withdraw_service_fee}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    <Form.Group
                      as={Row}
                      className="mb-3"
                      controlId="deposite_processing_fee"
                    >
                      <Form.Label column sm="2">
                        Deposite Processing Fee:
                      </Form.Label>
                      <Col>
                        <Form.Control
                          type="number"
                          name="deposite_processing_fee"
                          value={values.deposite_processing_fee}
                          onChange={handleChange}
                          placeholder="Descrption"
                          isInvalid={!!errors.deposite_processing_fee}
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {errors.deposite_processing_fee}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    <Form.Group
                      as={Row}
                      className="mb-3"
                      controlId="withdraw_processing_fee"
                    >
                      <Form.Label column sm="2">
                        Withdraw Processing Fee:
                      </Form.Label>
                      <Col>
                        <Form.Control
                          type="number"
                          name="withdraw_processing_fee"
                          value={values.withdraw_processing_fee}
                          onChange={handleChange}
                          placeholder="Descrption"
                          isInvalid={!!errors.withdraw_processing_fee}
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {errors.withdraw_processing_fee}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    <Button type="submit">{toForm}</Button>
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
export default PaymentGatewayForm;

