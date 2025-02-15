"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BASE_URL } from "@/utils/common";
import useUser from "@/hooks/useUser";
import PageLayout from "@/components/layout/PageLayout";
import OrganizationEditForm from "./OrganizationEditForm";

function EditOrganization() {
  const { id } = useParams();
  console.log("Organization id", id);
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const { user } = useUser();
  const [orgData, setOrgData] = useState(null);

  const fetchOrganizationDataAndPermissions = async () => {
    const authToken = localStorage.getItem("Auth Token");
    try {
      const response = await fetch(`${BASE_URL}/get-organization-by-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
        body: JSON.stringify({ org_id: id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const jsonData = await response.json();
      console.log("Get Organization By Id json data", jsonData);
      if (jsonData.status === "success") {
        const { data } = jsonData;
        const admins = [];
        data.admins.forEach((data) => {
          console.log("data 38", data);
          admins.push({
            app_id: data.app_admin_id,
            id: data.id,
            org_id: data.org_id,
            firstname: data.org_user.first_name,
            lastname: data.org_user.last_name,
            email: data.org_user.email,
            phone: data.org_user.phone,
          });
        });
        setOrgData({
          name: data.org_name,
          shortname: data.short_name,
          description: data.description,
          id: data.id,
          admins: admins,
          new_admins: [],
        });
        setSpinner(false);
      }

      if (user || !user?.role_id) {
        setPermissions({ add: true, view: true, edit: true, delete: true });
      } else {
        console.log("user", user.role.permissions);
        var editOrganizationPermission = user.role.permissions.filter(
          (permission) => permission.section === "Organizations"
        );
        if (
          editOrganizationPermission.length &&
          editOrganizationPermission[0].status
        ) {
          if (editOrganizationPermission[0].edit) {
            setPermissions(...editOrganizationPermission);
          }
        }
      }

      console.log("Response Data:", jsonData);
      // setadminsData(jsonData.admins.app_admin_id)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchOrganizationDataAndPermissions();
  }, [id]);

  return (
    <PageLayout permissions={permissions} spinner={spinner}>
      {orgData && !spinner && permissions && (
        <OrganizationEditForm initialData={orgData} id={id} />
      )}
    </PageLayout>
  );
}

export default EditOrganization;
