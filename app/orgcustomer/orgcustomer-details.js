"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
// import { doc, updateDoc } from "firebase/firestore";
// import db from "../../firebase-config";
// import { Button } from "react-bootstrap";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";
import { useAuthToken } from "@/utils/useAuthToken";

export function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState({});
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const authToken = useAuthToken();
  const { country } = useCountry();
  const { user } = useUser();

  const fetchCustomerAndPermissions = async () => {
    const response = await fetch(`${BASE_URL}/org-group-users?id=${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-api-key": "Ohana-Agent-oo73",
      },
      // body: JSON.stringify({ id }),
    });

    const jsonData = await response.json();

    console.log("org-users GROUP   by id Api Response", jsonData);

    if (jsonData.success) {
      setCustomer(jsonData.customerDetails);
      setSpinner(false);
    }

    if (user || !user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var orgUserPermission = user.role.permissions.filter(
        (permission) => permission.section === "Organization Users"
      );
      if (orgUserPermission.length && orgUserPermission[0].status) {
        setPermissions(...orgUserPermission);
      }
    }
  };

  useEffect(() => {
    setSpinner(true);
    fetchCustomerAndPermissions();
  }, [country]);

  useInterval(fetchCustomerAndPermissions, 20000, 5);

  return (
    <PageLayout permissions={permissions} spinner={spinner}>
      {permissions && !spinner && (
        <>
          <div className="flex flex-col gap-16">
            <div className="page-header">
              {/* <h3 className="page-title">{id}</h3> */}
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link className="nav-link" href={ROUTES?.customer}>
                      Customers
                    </Link>
                  </li>
                  <li className="breadcrumb-item pt-2" aria-current="page">
                    {customer?.first_name + " " + customer?.last_name}
                  </li>
                </ol>
              </nav>
            </div>
            <div className="row">
              <div className="col-4 col-xs-12 col-sm-4">
                <figure>
                  <img
                    className="img-circle img-responsive"
                    height="300"
                    alt={customer?.first_name + " " + customer?.last_name}
                    src={
                      customer?.profile_url
                        ? customer?.profile_url
                        : "https://via.placeholder.com/300"
                    }
                  />
                </figure>
              </div>
              <div className="col-8 col-xs-12 col-sm-8">
                <ul className="list-group">
                  <li className="list-group-item">
                    {customer?.first_name + " " + customer?.last_name}
                  </li>
                  <li className="list-group-item">
                    <i className="mdi mdi-phone"></i> {customer?.phone}{" "}
                  </li>
                  <li className="list-group-item">
                    <i className="mdi mdi-email"></i> {customer?.email}{" "}
                  </li>
                  <li className="list-group-item">
                    <i className="mdi mdi-google-translate"></i>{" "}
                    {customer?.language}{" "}
                  </li>
                  <li className="list-group-item">
                    <i className="mdi mdi-flag-outline"></i>{" "}
                    {customer?.country ? customer?.country?.nicename : ""}{" "}
                  </li>
                  <li className="list-group-item">
                    <i className="mdi mdi-currency-usd"></i> {customer?.balance}{" "}
                    {customer?.currency}{" "}
                  </li>
                </ul>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-7">
                <div className="card">
                  <div className="card-header">Other Details</div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-sm-5 col-xs-6 tital ">
                        Contributed Pools:
                      </div>
                      <div className="col-sm-7 col-xs-6 ">
                        {customer?.pools_count}
                      </div>
                    </div>
                    <div className="clearfix"></div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-5 col-xs-6 tital ">
                        Contributions:
                      </div>
                      <div className="col-sm-7">
                        {" "}
                        {customer?.total_contributions} {customer?.currency}{" "}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-5">
                {customer?.id_card_url ? (
                  <img
                    className="img-circle img-responsive w-100"
                    src={customer?.id_card_url}
                    alt={customer?.first_name + " " + customer?.last_name}
                  />
                ) : (
                  "ID Card Isn't Uploaded yet..."
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
}
// }
export default CustomerDetails;
