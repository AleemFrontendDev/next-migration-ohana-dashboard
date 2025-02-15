"use client";
import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
// import { useParams } from "next/navigation";
import CustomerForm from "../../customer-form";
// import db from "../../../firebase-config";
// import { doc, updateDoc } from "firebase/firestore";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";

export default function EditCustomer() {
  const { id } = useParams();
  const history = useRouter();
  const [permissions, setPermissions] = useState(0);
  const [userId, setUserId] = useState("");
  const [spinner, setSpinner] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const authToken = localStorage.getItem("Auth Token");
  const { country } = useCountry();
  const { user } = useUser();
  const [{ values }, setState] = useState({
    showUserSummary: false,
  });

  const fetchUser = async () => {
    const response = await fetch(`${BASE_URL}/customers/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    });

    const jsonData = await response.json();
    if (jsonData.success) {
      const selectedUser = jsonData.customerDetails;
      setUserId(selectedUser?.user_id);
      setSelectedUser(selectedUser);
      const country = {
        id: selectedUser.country?.id,
        nicename: selectedUser?.country?.nicename,
      };

      const data = {
        account_rejected: selectedUser?.account_rejected,
        first_name: selectedUser?.first_name,
        last_name: selectedUser?.last_name,
        email: selectedUser?.email,
        phone: selectedUser?.phone,
        country: country,
        role: selectedUser?.role,
      };
      setState({ values: data });
    }
  };

  const fetchPermissions = async () => {
    if (!user?.role_id) {
      console.log("user 60", user?.role_id);
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var idVerificationPermission = user.role.permissions.filter(
        (permission) => permission.section === "Users"
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
    fetchUser();
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
            user_id: userId,
            account_rejected: values.account_rejected,
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            phone: values.phone,
            country_id: values.country.id || values.country.value,
            role: values.role,
            updated_at: new Date(),
          };

          const response = await fetch(`${BASE_URL}/update-customer-info`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
            body: JSON.stringify(data),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const jsonData = await response.json();
          if (jsonData.status === "success") {
            history.push(ROUTES.customer);
          }
        }
      } catch (error) {
        console.log("error: ", error);
        console.log("An error occurred:", error);
        setSpinner(false);
      }
    },
    [permissions, selectedUser]
  );

  return (
    <>
      {values && permissions && permissions.edit && !spinner ? (
        <CustomerForm
          initialValues={values}
          setValues={setValues}
          toForm="editUser"
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
