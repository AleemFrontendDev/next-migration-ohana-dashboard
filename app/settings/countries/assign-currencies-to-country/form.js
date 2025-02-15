import React, { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Select from "react-select";
import { Formik } from "formik";
import { query, getDocs, collection, where } from "firebase/firestore";
import db from "@/firebase/firebase-config";
import makeAnimated from "react-select/animated";
import { ROUTES } from "@/utils/common";
import { ASSIGN_CURRENCIES_TO_COUNTRY_FORMIK } from "@/utils/formik-data";

const animatedComponents = makeAnimated();

export function AssignCurrenciesToCountryForm(props) {
  const { initialValues, setValues, toForm } = props;
  const [currencies, setCurrencies] = useState([]);
  const [countries, setCountries] = useState([]);

  const fetchCurrencies = async () => {
    const currenciesCol = query(
      collection(db.db, "currencies"),
      where("status", "==", true)
    );
    const data = await getDocs(currenciesCol);
    const currenciesList = data.docs.map((doc) => doc.data()["id"]);
    const currenciesOptions = currenciesList.map((currency) => {
      if (currency) {
        return {
          label: currency,
          value: currency,
        };
      }
    });
    setCurrencies(currenciesOptions);
  };

  const fetchCountries = async () => {
    const countriesCol = query(collection(db.db, "countries"));
    const data = await getDocs(countriesCol);
    const countriesList = data.docs
      .filter((doc) => !doc.data().currenciesArray)
      .map((doc) => doc.data()["id"]);
    const countriesOptions = countriesList.map((country) => {
      if (country) {
        return {
          label: country,
          value: country,
        };
      }
    });
    setCountries(countriesOptions);
  };

  useEffect(() => {
    fetchCurrencies();
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
        <h3 className="page-title">{toForm} Currencies</h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link className="nav-link" href={ROUTES.countries}>
                Countries
              </Link>
            </li>
            <li className="breadcrumb-item pt-2" aria-current="page">
              {" "}
              {toForm} Currencies To Country{" "}
            </li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3>{toForm} Currencies To Country </h3>
            </div>
            <div className="card-body">
              <Formik
                validationSchema={
                  ASSIGN_CURRENCIES_TO_COUNTRY_FORMIK.validationSchema
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
                    <Form.Group as={Row} className="mb-3" controlId="country">
                      <Form.Label column sm="2">
                        Country:
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
                          isMulti={false}
                          isSearchable={true}
                          // closeMenuOnSelect={false}
                          components={animatedComponents}
                          error={errors.topics}
                          touched={touched.topics}
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {errors.country}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="currency">
                      <Form.Label column sm="2">
                        Currency:
                      </Form.Label>
                      <Col>
                        <Select
                          name="currency"
                          defaultValue={values.currency}
                          options={currencies}
                          onChange={(e) => {
                            setFieldValue("currency", e);
                          }}
                          isInvalid={!!errors.currency}
                          placeholder="Currency"
                          isMulti={true}
                          isSearchable={true}
                          closeMenuOnSelect={false}
                          components={animatedComponents}
                          error={errors.topics}
                          touched={touched.topics}
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {errors.currency}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                    <Form.Group
                      as={Row}
                      className="mb-3"
                      controlId="edit"
                    ></Form.Group>
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
export default AssignCurrenciesToCountryForm;
