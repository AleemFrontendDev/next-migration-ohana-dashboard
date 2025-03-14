"use client";
import React, { useState, useEffect } from "react";
import { useParams, Redirect } from "next/navigation";
import Link from "next/link";
// import { doc, updateDoc } from "firebase/firestore";
// import db from "../../firebase-config";
// import { Button } from "react-bootstrap";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { useAuthToken } from "@/utils/useAuthToken";

export function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState({});
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const authToken = useAuthToken();
  const { country } = useCountry();
  const { user } = useUser();

  const fetchCustomer = async () => {
    const response = await fetch(`${BASE_URL}/customers/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    });
    const jsonData = await response.json();
    if (jsonData.success) {
      setSpinner(false);
      setCustomer(jsonData.customerDetails);
    }
    if (user || !user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var withdrawPermission = user.role.permissions.filter(
        (permission) => permission.section === "Customers"
      );
      if (withdrawPermission.length && withdrawPermission[0].status) {
        setPermissions(...withdrawPermission);
      }
    }
  };

  useEffect(() => {
    if(!authToken);
    setSpinner(true);
    fetchCustomer();
  }, [authToken, country]);

  useInterval(fetchCustomer, 20000, 5);

  if (!customer) {
    return <Redirect to={ROUTES.customer} />;
  } else {
    return (
      <>
        {permissions && permissions.view && !spinner ? (
          <>
            <div className="page-header">
              <h3 className="page-title">{id}</h3>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link className="nav-link" href={ROUTES.customer}>
                      Customers
                    </Link>
                  </li>
                  <li className="breadcrumb-item pt-2" aria-current="page">
                    {customer.first_name + " " + customer.last_name}
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
                    alt={customer.first_name + " " + customer.last_name}
                    src={
                      customer.profile_url
                        ? customer.profile_url
                        : "https://via.placeholder.com/300"
                    }
                  />
                </figure>
              </div>
              <div className="col-8 col-xs-12 col-sm-8">
                <ul className="list-group">
                  <li className="list-group-item">
                    {customer.first_name + " " + customer.last_name}
                  </li>
                  <li className="list-group-item">
                    <i className="mdi mdi-phone"></i> {customer.phone}{" "}
                  </li>
                  <li className="list-group-item">
                    <i className="mdi mdi-email"></i> {customer.email}{" "}
                  </li>
                  <li className="list-group-item">
                    <i className="mdi mdi-google-translate"></i>{" "}
                    {customer.language}{" "}
                  </li>
                  <li className="list-group-item">
                    <i className="mdi mdi-flag-outline"></i>{" "}
                    {customer.country ? customer.country.nicename : ""}{" "}
                  </li>
                  <li className="list-group-item">
                    {customer.balance} {customer.currency}{" "}
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
                      <div className="col-sm-5 col-xs-6 tital">Type</div>
                      <div className="col-sm-7 col-xs-6 ">
                        {customer?.user_type === "permanent"
                          ? "Real"
                          : "Offline"}
                      </div>
                    </div>

                    <div className="clearfix"></div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-5 col-xs-6 tital ">
                        Contributed Pools:
                      </div>
                      <div className="col-sm-7 col-xs-6 ">
                        {customer.pools_count}
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
                {customer.id_card_url ? (
                  <img
                    className="img-circle img-responsive w-100"
                    src={customer.id_card_url}
                    alt={customer.first_name + " " + customer.last_name}
                  />
                ) : (
                  "ID Card Isn't Uploaded yet..."
                )}
              </div>
            </div>
          </>
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
}
export default CustomerDetails;
