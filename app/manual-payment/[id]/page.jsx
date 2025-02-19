"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useParams, Link, Redirect } from "react-router-dom";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { Trans } from "react-i18next";
import { useAuthToken } from "@/utils/useAuthToken";

export function ManualPaymentDetails() {
  //   const router = useRouter();
  const { id } = useParams();
  const [manualPayment, setManualPayment] = useState({});
  const [payedByUser, setPayedByUser] = useState({});
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const authToken = useAuthToken();
  const { country } = useCountry();
  const { user } = useUser();

  const fetchManualPayment = async () => {
    const response = await fetch(`${BASE_URL}/manual-payments/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-api-key": "Ohana-Agent-oo73",
      },
    });
    const jsonData = await response.json();
    if (jsonData.success) {
      setSpinner(false);
      setManualPayment(jsonData.manualPaymentDetails);
    }
    if (user || !user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var manualPaymentPermission = user.role.permissions.filter(
        (permission) => permission.section === "Manual Payment"
      );
      if (manualPaymentPermission.length && manualPaymentPermission[0].status) {
        setPermissions(...manualPaymentPermission);
      }
    }
  };

  useEffect(() => {
    // setSpinner(true);
    fetchManualPayment();
  }, [country]);

  useInterval(fetchManualPayment, 20000, 5);

  const manualPaymentAction = useCallback(
    async (param) => {
      setSpinner(true);
      if (permissions.edit) {
        const response = await fetch(
          `${BASE_URL}/manual-payment-${param}/${id}`,
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
        if (jsonData.success) {
          fetchManualPayment();
        }
      }
    },
    [permissions]
  );

  if (!manualPayment) {
    return useEffect(() => {
      router.push(ROUTES.manual_payment); // e.g., "/manual-payment"
    }, [router]);
  } else if (manualPayment) {
    return (
      <>
        {permissions && permissions.view && !spinner ? (
          <>
            <div className="page-header">
              <h3 className="page-title">{id}</h3>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link className="nav-link" href={ROUTES.manual_payment}>
                      Manual Payment
                    </Link>
                  </li>
                  <li className="breadcrumb-item pt-2" aria-current="page">
                    {" "}
                    {manualPayment.title}{" "}
                  </li>
                </ol>
              </nav>
            </div>
            <div className="row mb-3">
              <div className="col-8"></div>
              <div className="col-4">
                {manualPayment.status === "pending" &&
                permissions &&
                permissions.edit ? (
                  <>
                    <Button
                      className="btn btn-lg btn-success ml-5"
                      onClick={() => manualPaymentAction("approved")}
                    >
                      Approved
                    </Button>
                    <Button
                      className="btn btn-lg btn-danger ml-5"
                      onClick={() => manualPaymentAction("rejected")}
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">Flooz Details</div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-sm-5 col-xs-6 tital">Amount:</div>
                      <div className="col-sm-7 col-xs-6 ">
                        {" "}
                        $ {manualPayment.amount}{" "}
                      </div>
                    </div>
                    <div className="clearfix"></div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-5 col-xs-6 tital">Body:</div>
                      <div className="col-sm-7"> {manualPayment.body} </div>
                    </div>
                    <div className="clearfix"></div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-5 col-xs-6 tital">
                        <Trans>Created At</Trans>:
                      </div>
                      <div className="col-sm-7 col-xs-6 ">
                        {" "}
                        {manualPayment.created_at}{" "}
                      </div>
                    </div>
                    <div className="clearfix"></div>
                    <hr />
                    {payedByUser ? (
                      <>
                        <div className="row">
                          <div className="col-sm-5 col-xs-6 tital">
                            Payed By:
                          </div>
                          <div className="col-sm-7">
                            {" "}
                            {manualPayment.payed_by.first_name +
                              " " +
                              manualPayment.payed_by.last_name}{" "}
                          </div>
                        </div>
                        <div className="clearfix"></div>
                        <hr />
                      </>
                    ) : (
                      ""
                    )}
                    <div className="row">
                      <div className="col-sm-5 col-xs-6 tital">
                        Ref. Number:
                      </div>
                      <div className="col-sm-7 col-xs-6 ">
                        {" "}
                        {manualPayment.ref_number}{" "}
                      </div>
                    </div>
                    <div className="clearfix"></div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-5 col-xs-6 tital">Phone Used:</div>
                      <div className="col-sm-7 col-xs-6 ">
                        {" "}
                        {manualPayment.phone_used}{" "}
                      </div>
                    </div>
                    <div className="clearfix"></div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-5 col-xs-6 tital">Status:</div>
                      <div className="col-sm-7">
                        <span
                          className={`py-1 px-2 rounded ${
                            manualPayment.status === "pending"
                              ? "alert-primary"
                              : manualPayment.status === "accepted"
                              ? "alert-success"
                              : "alert-danger"
                          }`}
                        >
                          {" "}
                          {manualPayment.status}{" "}
                        </span>
                      </div>
                    </div>
                    <div className="clearfix"></div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-5 col-xs-6 tital">Title:</div>
                      <div className="col-sm-7 col-xs-6 ">
                        {" "}
                        {manualPayment.title}{" "}
                      </div>
                    </div>
                    <div className="clearfix"></div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-5 col-xs-6 tital">
                        Transaction Type:
                      </div>
                      <div className="col-sm-7">
                        {" "}
                        {manualPayment.transaction_type}{" "}
                      </div>
                    </div>
                    <div className="clearfix"></div>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            {manualPayment.user ? (
              <>
                <h3 className="page-title mb-3"> User Details: </h3>
                <div className="row">
                  <div className="col-4 col-xs-12 col-sm-4">
                    <figure>
                      <img
                        className="img-circle img-responsive"
                        height="300"
                        alt={
                          manualPayment.user.first_name +
                          " " +
                          manualPayment.user.last_name
                        }
                        src={
                          manualPayment.user.profile_url
                            ? manualPayment.user.profile_url
                            : "https://via.placeholder.com/300"
                        }
                      />
                    </figure>
                  </div>
                  <div className="col-8 col-xs-12 col-sm-8">
                    <ul className="list-group">
                      <li className="list-group-item">
                        {manualPayment.user.first_name +
                          " " +
                          manualPayment.user.last_name}
                      </li>
                      <li className="list-group-item">
                        <i className="mdi mdi-phone"></i>{" "}
                        {manualPayment.user.phone}{" "}
                      </li>
                      <li className="list-group-item">
                        <i className="mdi mdi-email"></i>{" "}
                        {manualPayment.user.email}{" "}
                      </li>
                      <li className="list-group-item">
                        <i className="mdi mdi-google-translate"></i>{" "}
                        {manualPayment.user.language}{" "}
                      </li>
                      <li className="list-group-item">
                        <i className="mdi mdi-flag-outline"></i>{" "}
                        {manualPayment.user.country.nicename}{" "}
                      </li>
                      <li className="list-group-item">
                        <i className="mdi mdi-currency-usd"></i>{" "}
                        {manualPayment.user.balance}{" "}
                        {manualPayment.user.currency}{" "}
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              ""
            )}
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
export default ManualPaymentDetails;
