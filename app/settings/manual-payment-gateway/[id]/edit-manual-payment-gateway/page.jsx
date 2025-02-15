"use client";
import { useCallback, useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import ManualPaymentGatewayForm from "./manual-payment-gateway-form";
// import db from "../../../../firebase-config";
// import { doc, updateDoc, getDoc } from "firebase/firestore";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";

export default function EditManualPaymentGateway() {
  const { id } = useParams();
  const history = useRouter();
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState({});
  const authToken = localStorage.getItem("Auth Token");
  const { country } = useCountry();
  const { user } = useUser();
  const [{ values }, setState] = useState({
    showUserSummary: false,
  });

  const fetchPaymentGateway = async () => {
    const response = await fetch(`${BASE_URL}/manual-payment-gateways/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-api-key": "Ohana-Agent-oo73",
      },
    });
    const jsonData = await response.json();
    if (jsonData.success) {
      const paymentGateway = jsonData.manualPaymentGateway;
      setPaymentGateway(paymentGateway);
      const data = {
        activate: paymentGateway.activate == 1,
        title: paymentGateway.title,
        mobile_number_1: paymentGateway.mobile_number_1,
        mobile_name_1: paymentGateway.mobile_name_1,
        mobile_number_2: paymentGateway.mobile_number_2,
        mobile_name_2: paymentGateway.mobile_name_2,
        account_number: paymentGateway.account_number,
        account_name: paymentGateway.account_name,
        country: {
          label: paymentGateway.country.nicename,
          value: paymentGateway.country.id,
        },
        deposit_service_fee: paymentGateway.deposit_service_fee,
        withdraw_service_fee: paymentGateway.withdraw_service_fee,
        deposit_processing_fee: paymentGateway.deposit_processing_fee,
        withdraw_processing_fee: paymentGateway.withdraw_processing_fee,
      };
      setState({ values: data });
    }
  };

  const fetchPermissions = async () => {
    if (user ||!user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var idVerificationPermission = user.role.permissions.filter(
        (permission) => permission.section === "Manual Payment Gateway"
      );
      if (
        idVerificationPermission.length &&
        idVerificationPermission[0].status
      ) {
        setPermissions(...idVerificationPermission);
      }
    }
    setSpinner(false);
  };

  useEffect(() => {
    setSpinner(true);
    fetchPermissions();
    fetchPaymentGateway();
  }, [country]);

  useInterval(fetchPermissions, 20000, 5);

  const setValues = useCallback(
    async (values) => {
      try {
        if (permissions.edit) {
          setSpinner(true);
          setState({
            showUserSummary: true,
            values,
          });
          const data = {
            activate: values.activate,
            title: values.title,
            mobile_number_1: values.mobile_number_1,
            mobile_name_1: values.mobile_name_1,
            mobile_number_2: values.mobile_number_2,
            mobile_name_2: values.mobile_name_2,
            account_number: values.account_number,
            account_name: values.account_name,
            country: values.country.value,
            deposit_service_fee: values.deposit_service_fee,
            withdraw_service_fee: values.withdraw_service_fee,
            deposit_processing_fee: values.deposit_processing_fee,
            withdraw_processing_fee: values.withdraw_processing_fee,
            id: paymentGateway.payment_gateway_id,
          };
          // const paymentGatewayCol = doc(db.db, 'app_settings', 'manual_payment_gateway', 'settings', paymentGateway.payment_gateway_id);
          // await updateDoc(paymentGatewayCol, data);
          const response = await fetch(
            `${BASE_URL}/manual-payment-gateways/${id}`,
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
        console.log("error: ", error);
        // Handle other errors
        alert("An error occurred:", error);
        setSpinner(false);
      }
    },
    [permissions, paymentGateway]
  );

  return (
    <>
      {values && permissions && permissions.edit && !spinner ? (
        <ManualPaymentGatewayForm
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
