"use client";
import React, { useEffect, useState } from "react";
import useUser from "@/hooks/useUser";
import { BASE_URL } from "@/utils/common";
import PageLayout from "@/components/layout/PageLayout";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import OrganizationGroupEditForm from "./organization_group_edit_form";
// import db from "../../firebase-config";
import { firestore } from "@/firebase/firebase-config"; // Adjust the path as necessary

import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";

const authToken = localStorage.getItem("Auth Token");
function EditOrganizationGroup() {
  const { user } = useUser();
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const [countries, setCountries] = useState([]);
  const [countryDataFetched, setCountryDataFetched] = useState(false);
  const [groupId, setgroupID] = useState("");
  const [initalGroupData, setInitialGroupData] = useState(null);
  const [regionData, setRegionData] = useState([]);
  const router = useRouter();
  const { id } = useParams();

  const fetchCountries = async () => {
    const response = await fetch(`${BASE_URL}/countries?page=1&size=1000`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-api-key": "Ohana-Agent-oo73",
      },
    });
    const jsonData = await response.json();
    if (jsonData.success) {
      const countriesList = jsonData.countries.data;
      const countryOptions = countriesList.map((country) => {
        if (country) {
          return {
            label: country.nicename,
            value: country.id,
            code: country.phonecode,
            iso: country.iso,
          };
        }
      });
      setCountries(countryOptions);
      setCountryDataFetched(true);
    }
  };

  const fetchGroupDataAndPermissions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/get-organization-group-by-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
        body: JSON.stringify({ id: id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not in JSON format");
      }

      const jsonData = await response.json();
      console.log("fetchGroupDataAndPermissions Response", jsonData);
      setgroupID(jsonData.data.group_id);

      if (jsonData.status === "success") {
        const { data } = jsonData;

        await getRegionOfCountry(data.country_id);

        const adminsArray = [];
        data.admins.forEach((admin) => {
          adminsArray.push({
            id: admin.id,
            firstname: admin.first_name,
            lastname: admin.last_name,
            email: admin.email || "",
            phone: admin.phone,
            rejected: admin.account_rejected,
          });
        });

        const defaultPools = [];
        const manualPools = [];
        data.pools.forEach((poolData) => {
          if (poolData.org_pool_type === "Manual Pool") {
            manualPools.push({
              ...poolData,
              currancy: data?.currency?.code,
              active: true,
            });
          } else {
            defaultPools.push({
              ...poolData,
              currancy: data?.currency?.code,
              active: true,
            });
          }
        });

        setInitialGroupData({
          admins: adminsArray,
          new_admins: [],
          new_default_pools: [],
          new_manual_pools: [],
          group_id: data.id,
          name: data.title,
          shortname: data.short_name ?? "",
          country: data?.country?.nicename || "",
          country_id: data.country_id,
          org_id: data.organization_id,
          region: data.region
            ? {
                label: data.region?.name || "",
                value: data.region?.id || "",
              }
            : "",
          city: data.city
            ? {
                label: data.city.city,
                value: data.city.id,
              }
            : "",
          default_pools: defaultPools,
          manual_pools: manualPools,
        });
        setSpinner(false);
      }

      if (!user.role_id) {
        setPermissions({ add: true, view: true, edit: true, delete: true });
      } else {
        var orgGroupPermission = user.role.permissions.filter(
          (permission) => permission.section === "Organization Group"
        );

        if (orgGroupPermission.length && orgGroupPermission[0].status) {
          if (orgGroupPermission[0].edit) {
            setPermissions(...orgGroupPermission);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching group data:", error);
    }
  };

  const handleUpdateGroup = async (data) => {
    console.log("data", data);

    const emails = data.new_admins
      .map((admin) => admin.email)
      .filter((email) => email);

    if (new Set(emails).size !== emails.length) {
      toast.error("Admin emails must not be empty");
      return;
    }

    const phones = data.new_admins.map((admin) => admin.phone);
    if (new Set(phones).size !== phones.length) {
      toast.error("Admin phone numbers must be unique");
      return;
    }

    const newAdminsData = data.new_admins.map((admin) => ({
      ...admin,
      phone: admin.phone.toString(),
      country: admin.country.value,
    }));

    const updatedGroupData = {
      ...data,
      city: data.city.value,
      region: data.region.value,
      new_admins: newAdminsData,
    };

    console.log("updatedGroupData", updatedGroupData);
    try {
      const response = await fetch(`${BASE_URL}/update-organization-group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
        body: JSON.stringify(updatedGroupData),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not in JSON format");
      }

      const jsonData = await response.json();
      console.log("Update Org Group Response jsonData", jsonData);

      if (jsonData.status === "success") {
        await handleUpdate(updatedGroupData.name);

        console.log("Group Updated Successfully");
        router.back();
        toast.success("Group Update Successfully");
      } else {
        console.log("Error in editing group Api", jsonData);
        toast.error(jsonData?.message || "Error in updating group");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      const errorMsg = error?.message || "Error in updating group";
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchGroupDataAndPermissions();
  }, []);

  const getRegionOfCountry = async (country_id) => {
    try {
      const response = await fetch(`${BASE_URL}/get-all-regions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
        body: JSON.stringify({ country_id: country_id }),
      });
      const jsonData = await response.json();
      console.log("Get Region of country api response", jsonData);
      if (jsonData.status === "success") {
        console.log("Region Data", jsonData);
        const { data } = jsonData;

        const regionOptions = data.region.map((item) => {
          if (item) {
            return {
              label: item.name,
              value: item.id,
            };
          }
        });

        setRegionData(regionOptions);
      }
    } catch (error) {
      console.log("Error in getting Region of country", error);
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      const groupRef = doc(firestore, "group_chats", groupId);

      await updateDoc(groupRef, {
        group_title: updatedData,
      });

      const querySnapshot = await getDocs(collection(firestore, "group_chats"));

      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <PageLayout
      spinner={spinner || !countryDataFetched}
      permissions={permissions}
    >
      {!spinner && permissions && (
        <>
          {initalGroupData !== null && (
            <OrganizationGroupEditForm
              initialValues={initalGroupData}
              handleSubmitFun={handleUpdateGroup}
              countries={countries}
              regions={regionData}
            />
          )}
        </>
      )}
    </PageLayout>
  );
}

export default EditOrganizationGroup;
