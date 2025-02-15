import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import useInterval, { BASE_URL, ROUTES } from "../basic-ui/common";
import useCountry from "../hooks/useCountry";
import useUser from "../hooks/useUser";
import PageLayout from "../layout/layout";

export function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState({});
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const authToken = localStorage.getItem("Auth Token");
  const { country } = useCountry();
  const { user } = useUser();

  const fetchCustomerAndPermissions = async () => {
    const response = await fetch(`${BASE_URL}/org-users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`, 
        "x-api-key": "Ohana-Agent-oo73",       
      },
    });

    const jsonData = await response.json();
    console.log("org-users by id Api Response", jsonData);
    if (jsonData.success) {
      setCustomer(jsonData.customerDetails);
      setSpinner(false);
    }
    if (!user.role_id) {
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

  // if (!customer) {
  //     return (<Redirect to={ ROUTES.customer } />);
  // } else {

  return (
    <PageLayout permissions={permissions} spinner={spinner}>
      {permissions && !spinner && (
        <>
          <div className="page-header">
            <h3 className="page-title">{id}</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link className="nav-link" to={ROUTES?.customer}>
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
                  {customer?.balance} {customer?.currency?.code}{" "}
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
                    <div className="col-sm-5 col-xs-6 tital">
                      Contributed Pools:
                    </div>
                    <div className="col-sm-7 col-xs-6 ">
                      {customer?.pools_count}
                    </div>
                  </div>
                  <div className="clearfix"></div>
                  <hr />
                  <div className="row">
                    <div className="col-sm-5 col-xs-6 tital">
                      Contributions:
                    </div>
                    <div className="col-sm-7">
                      {customer?.total_contributions} {customer?.currency?.code}{" "}
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
        </>
      )}
    </PageLayout>
  );
}
// }
export default CustomerDetails;
