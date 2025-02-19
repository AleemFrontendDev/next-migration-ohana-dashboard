"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PAYMENT_GATEWAY_FORMIK } from "@/utils/formik-data";
import PaymentGatewayForm from "./payment-gateway-form";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { useAuthToken } from "@/utils/useAuthToken";

export default function AddPaymentGateway() {
  const history = useRouter();
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const date = new Date();
  const { country } = useCountry();
  const { user } = useUser();
  const authToken = useAuthToken();
  const [{ values }, setState] = useState({
    showUserSummary: false,
    values: { ...PAYMENT_GATEWAY_FORMIK.initialValues },
  });

  const fetchPermissions = async () => {
    if (user ||!user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var rolePermission = user.role.permissions.filter(
        (permission) => permission.section === "Payment Gateway"
      );
      if (rolePermission.length && rolePermission[0].status) {
        setPermissions(...rolePermission);
      }
    }
    setSpinner(false);
  };

  useEffect(() => {
    setSpinner(true);
    fetchPermissions();
  }, [country]);

  useInterval(fetchPermissions, 20000, 5);

  const setValues = useCallback(
    async (values) => {
      try {
        if (permissions.add) {
          setSpinner(true);
          setState({
            showUserSummary: true,
            values,
          });
          const country = [];
          values.country.map((item) => {
            country.push(item.value);
          });
          const data = {
            id: date.toISOString().replace("T", " ").replace("Z", ""),
            activate: values.activate,
            title: values.title,
            country: country,
            deposite_service_fee: values.deposite_service_fee,
            withdraw_service_fee: values.withdraw_service_fee,
            deposite_processing_fee: values.deposite_processing_fee,
            withdraw_processing_fee: values.withdraw_processing_fee,
          };
          console.log("data 63", data);

          const response = await fetch(`${BASE_URL}/add-payment-gateway`, {
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
            history.push(ROUTES.payment_gateway);
          }
        }
      } catch (error) {
        console.log("An error occurred:", error);
        setSpinner(false);
      }
    },
    [permissions]
  );

  return (
    <>
      {permissions && permissions.add && !spinner ? (
        <PaymentGatewayForm
          initialValues={values}
          setValues={setValues}
          toForm="Add"
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
