"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { USER_FORMIK } from "@/utils/formik-data";
import UserForm from "./user-form";
import db from "@/firebase/firebase-config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { toast } from "react-toastify";

export default function AddUser() {
  const history = useRouter();
  const [permissions, setPermissions] = useState(0);
  console.log("permisiion", permissions);
  const [spinner, setSpinner] = useState(false);
  const [authUser, setAuthUser] = useState({});
  const { country } = useCountry();
  const { user } = useUser();

  const authToken = localStorage.getItem("Auth Token");
  const [{ values }, setState] = useState({
    showUserSummary: false,
    values: { ...USER_FORMIK.initialValues },
  });

  const fetchPermissions = async () => {
    console.log("Fetch Permissions");
    if (!user.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
      const supportUsersCol = doc(db.db, "users", "support_chat");
      const supportUserData = await getDoc(supportUsersCol);
      const supportUserList = supportUserData.data();
      console.log("supportUserList", supportUserList);
      setAuthUser(supportUserList);
    } else {
      var orgDetailPermission = user.role.permissions.filter(
        (permission) => permission.section === "Organization Group"
      );
      if (orgDetailPermission.length && orgDetailPermission[0].status) {
        setPermissions(...orgDetailPermission);
      }
      setAuthUser(user);
    }
  };

  useEffect(() => {
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
          const { user } = await createUserWithEmailAndPassword(
            db.auth,
            values.email,
            values.password
          );
          await updateProfile(user, {
            displayName: values.first_name + " " + values.last_name,
          });
          const country = [];
          values.country.map((item) => {
            country.push(item.value);
          });
          const data = {
            user_id: user.uid,
            account_rejected: values.account_rejected ? false : true,
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            phone: values.phone,
            password: values.password,
            country: country,
            language: country[0] === 213 ? "French" : "English",
            profile_url:
              "https://firebasestorage.googleapis.com/v0/b/ohana-3b6a9.appspot.com/o/profiles%2Fsupport_chat.png?alt=media&token=9b452711-5f54-4b65-b7a7-3d66049f78e5",
            role: values.role.value,
            time: new Date(),
          };
          // const userCol = doc(db.db, "users", user.uid);
          // await setDoc(userCol, data);
          const response = await fetch(`${BASE_URL}/add-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
              "x-api-key": "Ohana-Agent-oo73",
            },
            body: JSON.stringify(data),
          });
          const jsonData = await response.json();
          setSpinner(false);
          if (jsonData.success == true) {
            setSpinner(false);
            toast.success(`${jsonData.message}`);
            history.push("/users-roles-management/users");
          } else {
            setSpinner(false);
            toast.error(`error in adding user: ${jsonData.message}`);
          }
        }
      } catch (error) {
        // if (error.code === "auth/email-already-in-use") {
        //   alert("The email is already in use.");
        //   setSpinner(false);
        //   // Handle other errors
        //   alert("An error occurred: " + error);
        // }
        console.log("error in edit user api: ", error);
        setSpinner(false);
      }
    },
    [permissions]
  );

  return (
    <>
      {permissions && permissions.add && !spinner ? (
        <UserForm
          initialValues={values}
          setValues={setValues}
          toForm="addUser"
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
