"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Redirect } from "next/navigation";
import Spinner from "react-bootstrap/Spinner";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";

export function Reports() {
  const { id } = useParams();
  const [withdrawRequest, setWithdrawRequest] = useState({});
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const { country } = useCountry();
  const { user } = useUser();
  const authToken = useMemo(
    () =>
      typeof window !== "undefined" ? localStorage.getItem("Auth Token") : null,
    []
  );

  const fetchWithdrawRequests = async () => {
    const response = await fetch(`${BASE_URL}/withdraw-request/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-api-key": "Ohana-Agent-oo73",
      },
    });
    const jsonData = await response.json();
    if (jsonData.success) {
      setSpinner(false);
      setWithdrawRequest(jsonData.withdrawRequestDetails);
    }
    if (!user.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var withdrawPermission = user.role.permissions.filter(
        (permission) => permission.section === "Withdraw"
      );
      if (withdrawPermission.length && withdrawPermission[0].status) {
        setPermissions(...withdrawPermission);
      }
    }
  };

  useEffect(() => {
    setSpinner(true);
    fetchWithdrawRequests();
  }, [country]);

  useInterval(fetchWithdrawRequests, 20000, 5);

  if (!withdrawRequest) {
    return <Redirect to={ROUTES.withdraw_request} />;
  } else {
    return (
      <>
        {permissions && !spinner ? (
          <div className="row">
            <div className="col-md-4 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                      <svg
                        width="17"
                        height="15"
                        viewBox="0 0 25 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.37109 4.10938C5.08873 4.10938 5.76352 4.10938 6.48115 4.10938C6.48115 4.22701 6.48115 4.33394 6.48115 4.44088C6.48115 7.96982 6.48115 11.4988 6.48115 15.0277C6.48115 15.124 6.48115 15.2309 6.49186 15.3271C6.51328 15.6052 6.67395 15.7656 6.96314 15.7977C8.07708 15.9367 8.77329 16.6104 8.93395 17.7118C8.9875 18.1075 9.13746 18.2358 9.53377 18.2358C11.5153 18.2358 13.4968 18.2358 15.4676 18.2358C15.8639 18.2358 16.0139 18.1075 16.0674 17.7118C16.2174 16.6211 16.9243 15.9367 18.0382 15.7977C18.3167 15.7656 18.4774 15.6052 18.5095 15.3271C18.5202 15.2309 18.5202 15.124 18.5202 15.0277C18.5202 11.5095 18.5202 7.99122 18.5202 4.46227C18.5202 4.35534 18.5202 4.24839 18.5202 4.12007C19.2272 4.12007 19.902 4.12007 20.6303 4.12007C20.6303 4.20562 20.6303 4.29117 20.6303 4.37672C20.6303 9.48834 20.6303 14.5893 20.6303 19.7009C20.6303 20.1821 20.4589 20.3532 19.9662 20.3532C14.9963 20.3532 10.0158 20.3532 5.04588 20.3532C4.56389 20.3532 4.3818 20.1821 4.3818 19.7009C4.3818 14.5893 4.3818 9.48834 4.3818 4.37672C4.37109 4.29117 4.37109 4.20562 4.37109 4.10938Z"
                          fill="black"
                        />
                        <path
                          d="M21.6366 7.18027C2 1.6366 6.14297 21.6366 5.13777 21.6366 4.10047C21.8937 4.10047 22.1293 4.10047 22.3757 4.10047C22.697 4.08978 22.9005 3.90798 22.9112 3.61925C22.9219 3.31983 22.7291 3.12733 22.4078 3.10595C22.3328 3.09525 22.2578 3.10595 22.1829 3.10595C15.7242 3.10595 9.26547 3.10595 2.80678 3.10595C2.71038 3.10595 2.60327 3.10594 2.50687 3.11664C2.21768 3.15941 2.05701 3.37329 2.07843 3.65133C2.09986 3.90798 2.29265 4.10047 2.56043 4.11116C2.81749 4.12186 3.08526 4.11116 3.35304 4.11116C3.35304 5.14846 3.35304 6.15368 3.35304 7.19097C3.28877 7.20167 3.22451 7.21236 3.16024 7.21236C2.54972 7.21236 1.93919 7.24444 1.33938 7.20166C1.05018 7.18028 0.739568 7.09472 0.482505 6.94501C0.150466 6.76322 0.0112247 6.4424 0.0112247 6.05742C0.0219357 4.46405 0.0433569 2.87069 0.000513126 1.26662C-0.0209087 0.443203 0.63246 0.0475279 1.20014 0.00475279C1.28583 -0.00594098 1.37151 0.00475279 1.4572 0.00475279C8.81561 0.00475279 16.174 0.0047567 23.5324 0.0154505C23.7895 0.0154505 24.0573 0.0582242 24.2929 0.154468C24.7428 0.336262 24.9891 0.678464 24.9891 1.19177C24.9784 2.79583 24.9677 4.39989 24.9998 6.00395C25.0105 6.68836 24.4857 7.15888 23.9502 7.18027C23.179 7.21235 22.4185 7.18027 21.6366 7.18027Z"
                          fill="black"
                        />
                        <path
                          d="M12.6289 12.7309C10.3582 12.8057 8.28028 11.084 8.14104 8.571C8.01251 6.26115 9.87621 4.19726 12.2112 4.04754C14.6533 3.89783 16.7312 5.74785 16.8383 8.21811C16.9347 10.6563 15.0389 12.656 12.6289 12.7309ZM13.9678 9.62969C14.4176 9.6083 14.5569 9.35165 14.6854 9.08431C14.7497 8.94529 14.8247 8.85974 14.996 8.84905C15.2424 8.83835 15.4245 8.61379 15.4245 8.36783C15.4245 8.12187 15.2317 7.8973 14.9746 7.88661C14.8247 7.87591 14.7604 7.83313 14.6961 7.70481C14.4284 7.12734 13.8714 6.78515 13.3251 6.83861C12.6825 6.90278 12.1898 7.33052 12.0291 7.98284C11.9863 8.16464 11.9863 8.34644 11.9541 8.52823C11.9006 8.79558 11.7078 8.94529 11.5043 8.9239C11.3008 8.90251 11.1508 8.71002 11.1187 8.45337C11.0865 8.18603 11.2365 8.01492 11.3864 7.82244C11.5685 7.59787 11.5364 7.29844 11.3329 7.11665C11.1294 6.94555 10.8402 6.95625 10.6474 7.15943C10.4974 7.31983 10.3689 7.50163 10.2618 7.68342C10.1975 7.80106 10.1333 7.86522 9.98331 7.88661C9.72625 7.92938 9.55488 8.14326 9.55488 8.37852C9.55488 8.62448 9.73697 8.83835 10.0155 8.87043C10.1654 8.88112 10.2082 8.95599 10.2618 9.06292C10.5617 9.68316 11.1615 10.004 11.7935 9.88634C12.3933 9.7794 12.886 9.21263 12.961 8.571C12.9717 8.45337 12.9824 8.33574 13.0038 8.21811C13.0466 8.00424 13.1645 7.83313 13.3894 7.81174C13.625 7.80105 13.7429 7.96146 13.8178 8.17534C13.8928 8.4106 13.8178 8.60308 13.6786 8.78487C13.5501 8.95598 13.5179 9.15917 13.6465 9.33027C13.7429 9.50137 13.9035 9.57622 13.9678 9.62969Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="font-weight-semibold mb-0 ">
                        Withdrawal Request
                      </h6>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <div className="wrapper d-flex">
                      <p className="font-weight-semibold text-gray mb-0 ">
                        Requester:
                      </p>
                      <small className="text-muted px-2">
                        {withdrawRequest.user.first_name +
                          " " +
                          withdrawRequest.user.last_name}
                      </small>
                    </div>
                    <div className="d-flex">
                      <p className="font-weight-semibold text-gray mb-0 ">
                        Amount:
                      </p>
                      <small className="text-muted ml-auto px-2">
                        {withdrawRequest.total_amount +
                          " " +
                          (withdrawRequest.currency ?? "")}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <div className="wrapper d-flex">
                      <p className="font-weight-semibold text-gray mb-0 ">
                        Group:
                      </p>
                      <small className="text-muted px-2">
                        {withdrawRequest.group
                          ? withdrawRequest.group.title
                          : ""}
                      </small>
                    </div>
                    <div className="d-flex">
                      <p className="font-weight-semibold text-gray mb-0 ">
                        Pool:
                      </p>
                      <small className="text-muted ml-auto px-2">
                        {withdrawRequest.pool ? withdrawRequest.pool.title : ""}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <div className="wrapper d-flex">
                      <p className="font-weight-semibold text-gray mb-0 ">
                        Payment Gateway:
                      </p>
                      <small className="text-muted px-2">
                        {withdrawRequest.method}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex py-2 border-bottom">
                    <div className="wrapper">
                      <p className="font-weight-semibold text-gray mb-0">
                        Reason:
                      </p>
                      <p className="text-muted">{withdrawRequest.body}</p>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <div className="wrapper d-flex">
                      <p className="font-weight-semibold text-gray mb-0 ">
                        Group Notification:
                      </p>
                      <small className="text-muted px-2">Done</small>
                    </div>
                  </div>
                  <div className="d-flex py-2 border-bottom">
                    <div className="wrapper">
                      <p className="font-weight-semibold text-gray mb-3">
                        Second Admin Approval:{" "}
                      </p>
                      {withdrawRequest.status === "pending" ? (
                        <span className="alert-primary py-1 px-2 mr-1 text-primary rounded">
                          {withdrawRequest.status.toUpperCase()}
                        </span>
                      ) : withdrawRequest.status === "Completed" ? (
                        <span className="alert-success py-1 px-3 mr-1 text-success rounded">
                          {withdrawRequest.status.toUpperCase()}
                        </span>
                      ) : (
                        <span className="alert-danger py-1 px-3 mr-1 text-danger rounded">
                          {withdrawRequest.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 grid-margin stretch-card d-inline-block">
              <div className="card mt-2">
                <div className="card-body">
                  <div className="justify-content-between">
                    <div className="d-flex align-items-center mb-2">
                      <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                        <svg
                          width="17"
                          height="15"
                          viewBox="0 0 28 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M16.25 11.25C17.2917 11.25 18.1771 10.8854 18.9062 10.1562C19.6354 9.42708 20 8.54167 20 7.5C20 6.45833 19.6354 5.57292 18.9062 4.84375C18.1771 4.11458 17.2917 3.75 16.25 3.75C15.2083 3.75 14.3229 4.11458 13.5938 4.84375C12.8646 5.57292 12.5 6.45833 12.5 7.5C12.5 8.54167 12.8646 9.42708 13.5938 10.1562C14.3229 10.8854 15.2083 11.25 16.25 11.25ZM7.5 15C6.8125 15 6.22417 14.755 5.735 14.265C5.245 13.7758 5 13.1875 5 12.5V2.5C5 1.8125 5.245 1.22417 5.735 0.735C6.22417 0.245 6.8125 0 7.5 0H25C25.6875 0 26.2763 0.245 26.7663 0.735C27.2554 1.22417 27.5 1.8125 27.5 2.5V12.5C27.5 13.1875 27.2554 13.7758 26.7663 14.265C26.2763 14.755 25.6875 15 25 15H7.5ZM2.5 20C1.8125 20 1.22417 19.7554 0.735 19.2663C0.245 18.7763 0 18.1875 0 17.5V5C0 4.64583 0.12 4.34875 0.36 4.10875C0.599167 3.86958 0.895833 3.75 1.25 3.75C1.60417 3.75 1.90125 3.86958 2.14125 4.10875C2.38042 4.34875 2.5 4.64583 2.5 5V17.5H22.5C22.8542 17.5 23.1508 17.62 23.39 17.86C23.63 18.0992 23.75 18.3958 23.75 18.75C23.75 19.1042 23.63 19.4008 23.39 19.64C23.1508 19.88 22.8542 20 22.5 20H2.5ZM7.5 5C8.1875 5 8.77583 4.755 9.265 4.265C9.755 3.77583 10 3.1875 10 2.5H7.5V5ZM25 5V2.5H22.5C22.5 3.1875 22.7446 3.77583 23.2337 4.265C23.7237 4.755 24.3125 5 25 5ZM7.5 12.5H10C10 11.8125 9.755 11.2238 9.265 10.7337C8.77583 10.2446 8.1875 10 7.5 10V12.5ZM22.5 12.5H25V10C24.3125 10 23.7237 10.2446 23.2337 10.7337C22.7446 11.2238 22.5 11.8125 22.5 12.5Z"
                            fill="black"
                          />
                        </svg>
                      </div>
                      <div>
                        <h6 className="font-weight-semibold mb-0 ">
                          Amount Request
                        </h6>
                      </div>
                    </div>
                    <div className="d-flex text-muted">
                      <h6>
                        {" "}
                        {withdrawRequest.total_amount}{" "}
                        {withdrawRequest.currency}{" "}
                      </h6>
                      <p className="text-muted px-2"> ( Total Amount )</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default Reports;
