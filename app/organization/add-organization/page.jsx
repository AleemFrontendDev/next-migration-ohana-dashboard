"use client";
import React, { useEffect, useState } from "react";
import useUser from "@/hooks/useUser";
import PageLayout from "@/components/layout/PageLayout";
import { BASE_URL } from "@/utils/common";
import OrganizationAddForm from "./organizationAddForm";

const authToken = localStorage.getItem("Auth Token");
function AddOrganization() {
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const { user } = useUser();
  const [initalOrgData, setInitialOrgData] = useState();
  const [countries, setCountries] = useState([]);

  const fetchCountriesAndPermissions = async () => {
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
      console.log("countryOptions");
      setCountries(countryOptions);
    }
    setInitialOrgData({
      name: "",
      shortname: "",
      description: "",
      admins: [
        {
          firstname: "",
          lastname: "",
          country: "",
          email: "",
          phone: "",
          password: "",
        },
        {
          firstname: "",
          lastname: "",
          country: "",
          email: "",
          phone: "",
          password: "",
        },
      ],
    });
    setSpinner(false);

    if (!user.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      console.log("user", user.role.permissions);
      var addOrganizationPermission = user.role.permissions.filter(
        (permission) => permission.section === "Organizations"
      );
      if (
        addOrganizationPermission.length &&
        addOrganizationPermission[0].status
      ) {
        if (addOrganizationPermission[0].add) {
          setPermissions(...addOrganizationPermission);
        }
      }
    }
  };

  useEffect(() => {
    fetchCountriesAndPermissions();
  }, []);

  return (
    <PageLayout spinner={spinner} permissions={permissions}>
      {permissions && !spinner && (
        <OrganizationAddForm
          countries={countries}
          initialData={initalOrgData}
        />
      )}
    </PageLayout>
  );
}

export default AddOrganization;
