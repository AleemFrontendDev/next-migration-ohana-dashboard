"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MANUAL_PAYMENT_GATEWAY_FORMIK } from "@/utils/formik-data";
import ManualPaymentGatewayForm from "./manual-payment-gateway-form";
// import db from "../../../../firebase-config";
// import { doc, setDoc } from "firebase/firestore";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { useAuthToken } from "@/utils/useAuthToken";

export default function AddManualPaymentGateway() {
  const history = useRouter();
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const date = new Date();
  const { country } = useCountry();
  const { user } = useUser();
  const authToken = useAuthToken();
  const [{ values }, setState] = useState({
    showUserSummary: false,
    values: { ...MANUAL_PAYMENT_GATEWAY_FORMIK.initialValues },
  });

  const fetchPermissions = async () => {
    if (user ||!user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var rolePermission = user.role.permissions.filter(
        (permission) => permission.section === "Manual Payment Gateway"
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
          const data = {
            id: date.toISOString().replace("T", " ").replace("Z", ""),
            activate: values.activate,
            title: values.title,
            mobile_number_1: String(values.mobile_number_1),
            mobile_name_1: values.mobile_name_1,
            mobile_number_2: String(values.mobile_number_2),
            mobile_name_2: values.mobile_name_2,
            account_number: String(values.account_number),
            account_name: values.account_name,
            country: values.country.value,
            deposit_service_fee: values.deposit_service_fee,
            withdraw_service_fee: values.withdraw_service_fee,
            deposit_processing_fee: values.deposit_processing_fee,
            withdraw_processing_fee: values.withdraw_processing_fee,
          };
          // const paymentGatewayCol = doc(db.db, 'app_settings', 'manual_payment_gateway', 'settings', date.toISOString().replace('T', ' ').replace('Z', ''));
          // await setDoc(paymentGatewayCol, data);
          const response = await fetch(
            `${BASE_URL}/add-manual-payment-gateway`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
                "x-api-key": "Ohana-Agent-oo73",
              },
              body: JSON.stringify(data),
            }
          );
          const jsonData = await response.json();
          if (jsonData.success) {
            history.push(ROUTES.manual_payment_gateway);
          }
        }
      } catch (error) {
        // Handle other errors
        alert("An error occurred:", error);
        setSpinner(false);
      }
    },
    [permissions]
  );

  return (
    <>
      {permissions && permissions.add && !spinner ? (
        <ManualPaymentGatewayForm
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
