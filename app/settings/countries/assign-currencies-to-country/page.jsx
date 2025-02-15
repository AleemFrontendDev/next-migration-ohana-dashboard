"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ASSIGN_CURRENCIES_TO_COUNTRY_FORMIK } from "@/utils/formik-data";
import AssignCurrenciesToCountryForm from "./form";
import db from "@/firebase/firebase-config";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import useInterval, { ROUTES } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";

export default function AssignCurrenciesToCountry() {
  const history = useRouter();
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const [{ values }, setState] = useState({
    showUserSummary: false,
    values: { ...ASSIGN_CURRENCIES_TO_COUNTRY_FORMIK.initialValues },
  });

  const fetchPermissions = async () => {
    if (db.auth.currentUser) {
      const authUsersCol = doc(db.db, "users", db.auth.currentUser.uid);
      const authUserData = await getDoc(authUsersCol);
      const user = authUserData.data();
      if (user?.role === "admin") {
        setPermissions({ add: true, view: true, edit: true, delete: true });
      } else {
        const permissionsCol = doc(
          db?.db,
          "roles",
          user?.role,
          "permissions",
          "Countries"
        );
        const permissionData = await getDoc(permissionsCol);
        const permissions = permissionData.data();
        if (permissions.status) {
          setPermissions(permissions);
        }
      }
      setSpinner(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  useInterval(fetchPermissions, 20000, 5);

  const setValues = useCallback(
    async (values) => {
      if (permissions.add) {
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
      {permissions && permissions.add && !spinner ? (
        <AssignCurrenciesToCountryForm
          initialValues={values}
          setValues={setValues}
          toForm="Assign"
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
