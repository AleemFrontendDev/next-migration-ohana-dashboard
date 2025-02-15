import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import UserForm from "./user-form";
import db from "../../../../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { BASE_URL } from "../../../basic-ui/common";
import useUser from "../../../hooks/useUser";
import PageLayout from "../../../layout/layout";
import { toast } from "react-toastify";

export default function AddUser() {
  const history = useHistory();
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const { user } = useUser();
  const authToken = localStorage.getItem("Auth Token");

  const fetchPermissions = async () => {
    if (!user.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var rolePermission = user.role.permissions.filter(
        (permission) => permission.section === "Organization Users"
      );
      console.log("rolePermission", rolePermission);
      if (rolePermission.length && rolePermission[0].status) {
        if (rolePermission[0].add) {
          setPermissions(...rolePermission);
        }
      }
    }
    setSpinner(false);
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  async function saveUserToFirebase(userData) {
    try {
      const { user } = await createUserWithEmailAndPassword(
        db.auth,
        userData.email,
        userData.password
      );
      return { ...userData, uid: user.uid };
    } catch (error) {
      console.error("Error saving admin to Firebase:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email alreay exist");
        throw error;
      } else {
        throw error;
      }
    }
  }

  const handleAddUser = async (data) => {
    console.log("Update User Data:", data);

    const formData = {
      firstname: data.first_name,
      lastname: data.last_name,
      phone: data.phone.toString(),
      email: data.email,
      org_id: data.org_id,
      password: data.password,
      city: data.city.value,
      country: data.country.value,
      region: data.region.value,
      // role: data.role,
      role_id: data.role.value,
    };

    console.log("Update formData:", formData);

    try {
      const firebaseResponseData = await saveUserToFirebase(formData);

      console.log("firebaseResponseData", firebaseResponseData);

      const response = await fetch(`${BASE_URL}/create-org-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`, 
          "x-api-key": "Ohana-Agent-oo73",       
        },
        body: JSON.stringify(firebaseResponseData),
      });
      const jsonData = await response.json();
      if (jsonData.status === "success") {
        toast.success("Admin Added Successfully!");
        history.push("/organization-roles-management/users");
      } else {
        console.log("Error Adding Admin !", jsonData);
        toast.error("Error Adding Admin !", jsonData?.message);
      }
    } catch (error) {
      toast.error("Error Adding Admin !");
      console.log("Error Adding Admin !", error);
    }
  };

  return (
    <PageLayout permissions={permissions} spinner={spinner}>
      {permissions && !spinner && (
        <UserForm
          initialValues={{
            account_rejected: false,
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            password: "",
            country: "",
            city: "",
            region: "",
            role: "",
          }}
          onSubmit={handleAddUser}
        />
      )}
    </PageLayout>
  );
}
