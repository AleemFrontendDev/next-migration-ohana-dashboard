"use client";
import { useCallback, useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import AssignCurrenciesToCountryForm from "./form";
import db from "@/firebase/firebase-config";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import useInterval, { ROUTES } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";

export default function EditCurrenciesToCountry() {
  const { id } = useParams();
  const history = useRouter();
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const [country, setCountry] = useState({});
  const { user } = useUser();
  const [{ values }, setState] = useState({
    showUserSummary: false,
  });

  const fetchCountry = async () => {
    const countryCol = doc(db.db, "countries", id);
    const countryData = await getDoc(countryCol);
    const data = countryData.data();
    setCountry(data);
    setSpinner(false);
  };

  useMemo(() => {
    if (country.currenciesArray) {
      const currencies = country.currenciesArray.map((currency) => {
        return { label: currency, value: currency };
      });
      const data = {
        country: { label: country.id, value: country.id },
        currency: currencies,
      };
      setState({ values: data });
    }
    if (
      !country.currenciesArray &&
      country.currencies &&
      typeof country.currencies === "object"
    ) {
      const currencies = Object.keys(country.currencies).forEach((currency) => {
        return { label: currency, value: currency };
      });
      const data = {
        country: { label: country.id, value: country.id },
        currency: currencies,
      };
      setState({ values: data });
    }
  }, [country]);

  const fetchPermissions = async () => {
    const theUser = typeof user === "string" ? JSON.parse(user) : user;
    if (!theUser?.role_id || theUser.role_id === null) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var groupPermission = theUser.role.permissions.filter(
        (permission) => permission.section === "Dashboard"
      );
      if (groupPermission.length && groupPermission[0].status) {
        setPermissions(...groupPermission);
      }
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchCountry();
  }, []);

  useInterval(fetchPermissions, 20000, 5);

  const setValues = useCallback(
    async (values) => {
      if (permissions.edit) {
        setState({
          showUserSummary: true,
          values,
        });
        const currency = [];
        values.currency.map((item) => {
          currency.push(item.value);
        });
        const countryCol = doc(db.db, "countries", values.country.value);
        const countryData = await getDoc(countryCol);
        const getCountryData = countryData.data();
        getCountryData.currenciesArray = currency;
        await updateDoc(countryCol, getCountryData);
        history.push(ROUTES.countries);
      }
    },
    [permissions]
  );

  return (
    <>
      {values && permissions && permissions.edit && !spinner ? (
        <AssignCurrenciesToCountryForm
          initialValues={values}
          setValues={setValues}
          toForm="Edit"
        />
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
