"use client"
import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import PaymentGatewayForm from "./payment-gateway-form";
// import db from "../../../../firebase-config";
// import { doc, updateDoc } from "firebase/firestore";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { useAuthToken } from "@/utils/useAuthToken";

export default function EditPaymentGateway() {
  const { id } = useParams();
  const history = useRouter();
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState({});
  const authToken = useAuthToken();
  const { country } = useCountry();
  const { user } = useUser();
  const [{ values }, setState] = useState({
    showUserSummary: false,
  });

  const fetchPaymentGateway = async () => {
    const response = await fetch(`${BASE_URL}/payment-gateways/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`, 
        "x-api-key": "Ohana-Agent-oo73",       
      },
    });
    const jsonData = await response.json();
    if (jsonData.success) {
      const paymentGateway = jsonData.paymentGateway;
      setPaymentGateway(paymentGateway);
      const country = paymentGateway.countries.map((country) => {
        return {
          label: country.nicename,
          value: country.id,
        };
      });
      var data = {
        activate: paymentGateway.activate == 1,
        title: paymentGateway.title,
        country: country,
        deposite_service_fee: paymentGateway.deposit_service_fee,
        withdraw_service_fee: paymentGateway.withdraw_service_fee,
        deposite_processing_fee: paymentGateway.deposit_processing_fee,
        withdraw_processing_fee: paymentGateway.withdraw_processing_fee,
      };
      console.log("data => ", data);

      if (paymentGateway.title === "Tmoney") {
        data = Object.assign(data, {
          username: paymentGateway.username ?? "",
          password: paymentGateway.password ?? "",
          base_url: paymentGateway.base_url ?? "",
        });
      }
      setState({ values: data });
    }
  };

  const fetchPermissions = async () => {
    if (user||!user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var idVerificationPermission = user.role.permissions.filter(
        (permission) => permission.section === "Payment Gateway"
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
          const country = [];
          //  const country2 = [];
          values.country.map((item) => {
            country.push(item.value);
            //    country2.push(item.label);
          });
          // const data2 = {
          //     activate : values.activate,
          //     title : values.title,
          //     country : country2,
          //     deposite_service_fee : values.deposite_service_fee,
          //     withdraw_service_fee : values.withdraw_service_fee,
          //     deposite_processing_fee : values.deposite_processing_fee,
          //     withdraw_processing_fee : values.withdraw_processing_fee,
          //     id: paymentGateway.payment_gateway_id,
          // };
          const data = {
            activate: values.activate,
            title: values.title,
            country: country,
            deposite_service_fee: values.deposite_service_fee,
            withdraw_service_fee: values.withdraw_service_fee,
            deposite_processing_fee: values.deposite_processing_fee,
            withdraw_processing_fee: values.withdraw_processing_fee,
            id: paymentGateway.payment_gateway_id,
          };
          // if (values.title === "Tmoney") {
          //     data = Object.assign(data, {
          //         username : values.username,
          //         password : values.password,
          //         base_url : values.base_url,
          //     });
          // }
          // const countryCol = doc(db.db, 'app_settings', 'payment_gateway', 'settings', paymentGateway.payment_gateway_id);
          // await updateDoc(countryCol, data2);
          const response = await fetch(`${BASE_URL}/payment-gateways/${id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`, 
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
        console.log("error: ", error);
        // Handle other errors
        setSpinner(false);
      }
    },
    [permissions, paymentGateway]
  );

  return (
    <>
      {values && permissions && permissions.edit && !spinner ? (
        <PaymentGatewayForm
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
