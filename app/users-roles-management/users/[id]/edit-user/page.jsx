"use client";
import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import UserForm from "./user-form";
// import db from "../../../../firebase-config";
// import { doc, updateDoc } from "firebase/firestore";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";

export default function EditUser() {
  const { id } = useParams();
  const history = useRouter();
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const authToken = localStorage.getItem("Auth Token");
  const { country } = useCountry();
  const { user } = useUser();
  const [{ values }, setState] = useState({
    showUserSummary: false,
  });

  const fetchUser = async () => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-api-key": "Ohana-Agent-oo73",
      },
    });
    const jsonData = await response.json();
    if (jsonData.success) {
      const selectedUser = jsonData.user;
      setSelectedUser(selectedUser);
      const country = selectedUser?.countries?.map((country) => {
        return {
          label: country.nicename,
          value: country.id,
        };
      });
      const data = {
        account_rejected: selectedUser?.account_rejected === "1" ? false : true,
        first_name: selectedUser?.first_name,
        last_name: selectedUser?.last_name,
        email: selectedUser?.email,
        phone: selectedUser?.phone,
        country: country,
        role: {
          label: selectedUser?.role?.name,
          value: selectedUser?.role?.id,
        },
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
    if(!authToken) return;
    setSpinner(true);
    fetchPermissions();
    fetchUser();
  }, [authToken, country]);

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
          values.country.map((item) => {
            country.push(item.value);
          });
          const data = {
            account_rejected: values.account_rejected ? false : true,
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            phone: values.phone,
            country: country,
            role: values.role.value,
            updated_at: new Date(),
          };
          // const userCol = doc(db.db, 'users', selectedUser.user_id);
          // await updateDoc(userCol, data);
          const response = await fetch(`${BASE_URL}/users/${id}`, {
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
            history.push(ROUTES.users);
          } else {
            console.log("error in edit user api", jsonData);
          }
        }
      } catch (error) {
        console.log("error in edit user api: ", error);
        // Handle other errors
        alert("An error occurred:", error);
        setSpinner(false);
      }
    },
    [permissions, selectedUser]
  );

  return (
    <>
      {values && permissions && permissions.edit && !spinner ? (
        <UserForm
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
