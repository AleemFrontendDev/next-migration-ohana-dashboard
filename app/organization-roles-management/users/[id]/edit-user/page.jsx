"use client";
import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import UserForm from "./user-form";
// import db from "../../../../firebase-config";
// import { doc, updateDoc } from "firebase/firestore";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
// import useCountry from "../../../hooks/useCountry";
import useUser from "@/hooks/useUser";
import PageLayout from "@/components/layout/PageLayout";
// import { createUserWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";
import { useAuthToken } from "@/utils/useAuthToken";

export default function EditUser() {
  const { appId, orgId, id } = useParams();
  console.log("app id", appId);
  console.log("orgId", orgId);
  console.log("id", id);

  const history = useRouter();
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  //   const [selectedUser, setSelectedUser] = useState({});

  const authToken = useAuthToken();
  //   const { country } = useCountry();
  const { user } = useUser();
  const [initalData, setInitialData] = useState(null);

  const fetchUserByIdAndPermissions = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/get-edit-org-users/${appId ?? id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            "x-api-key": "Ohana-Agent-oo73",
          },
        }
      );
      const jsonData = await response.json();
      console.log("Fetch user by id api response", jsonData);
      if (jsonData.success) {
        const selectedUser = jsonData.customerDetails;
        const userData = jsonData.user;

        let phoneNumber = "";
        if (selectedUser?.country) {
          phoneNumber = selectedUser?.phone.replace(
            `+${selectedUser?.country.phonecode}`,
            ""
          );
        } else {
          phoneNumber = selectedUser?.phone;
        }

        const data = {
          account_rejected:
            selectedUser?.account_rejected === "0" ? false : true,
          first_name: selectedUser?.first_name,
          last_name: selectedUser?.last_name,
          email: selectedUser?.email,
          phone: phoneNumber,
          app_user_id: selectedUser.id,
          user_id: userData?.id,
          country: selectedUser?.country
            ? {
                label: selectedUser?.country.nicename,
                value: selectedUser?.country.id,
              }
            : "", //country.length > 0 ? country[0] : "",
          city: selectedUser?.city
            ? {
                label: selectedUser?.city.city,
                value: selectedUser?.city.id,
              }
            : "",
          region: selectedUser?.region
            ? {
                label: selectedUser?.region?.name || "",
                value: selectedUser?.region?.id || "",
              }
            : "",
          role: userData?.org_roles
            ? {
                label: userData.org_roles?.name,
                value: userData?.org_roles?.id,
              }
            : "",
        };
        console.log("User Data:", data);
        setInitialData(data);
        setSpinner(false);
      }
      if (!user.role_id) {
        setPermissions({ add: true, view: true, edit: true, delete: true });
      } else {
        var orgUserPermission = user.role.permissions.filter(
          (permission) => permission.section === "Organization Users"
        );
        if (orgUserPermission.length && orgUserPermission[0].status) {
          if (orgUserPermission[0].edit) {
            setPermissions(...orgUserPermission);
          }
        }
      }
    } catch (error) {
      console.log("Error fetching user by id: ", error);
    }
  };

  useEffect(() => {
    fetchUserByIdAndPermissions();
  }, []);

  const handleUpdateUser = async (data) => {
    console.log("Update User Data:", data);
    const editUserData = {
      ...data,
      account_rejected: !data.account_rejected,
      phone: data.phone.toString(),
      city: data.city.value,
      country: data.country.value,
      region: data.region.value,
      role_id: data.role.value,
    };
    console.log("Updated editUserData", editUserData);

    try {
      const response = await fetch(`${BASE_URL}/update-org-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
        body: JSON.stringify(editUserData),
      });
      const jsonData = await response.json();
      if (jsonData.status === "success") {
        toast.success("Admin updated Successfully!");
        // history.push("/organization-roles-management/users");
        history.goBack();
      } else {
        console.log("Error in Updating User!", jsonData);
        toast.error("Error in Updating User!", jsonData?.message);
      }
    } catch (error) {
      toast.error("Error in Updating User!");
      console.log("Error in Updating User!", error);
    }
  };

  return (
    <PageLayout permissions={permissions} spinner={spinner}>
      {permissions && !spinner && initalData !== null && (
        <UserForm
          initialValues={initalData}
          orgId={orgId}
          editUser={true}
          onSubmit={handleUpdateUser}
        />
      )}
    </PageLayout>
  );
}
