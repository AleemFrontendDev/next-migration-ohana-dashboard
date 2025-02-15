"use client";
import React, { useState, useEffect } from "react";
import { Accordion } from "@/components/Organizations/Accordion";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import useUser from "@/hooks/useUser";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { Trans } from "react-i18next";
import OrganizationGroupTable from "./group-table";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import OrganizationAdminsAccordion from "@/components/Organizations/OrganizationAccordion";

export function OrganizationDetail({ org_id, org_dahboard }) {
  const { id } = useParams();
  const [groups, setGroups] = useState([]);
  //   const [activeGroups, setActiveGroups] = useState([]);
  //   const [orphanGroups, setOrphanGroups] = useState([]);
  //   const [poolAmount, setPoolAmount] = useState([0]);
  const [totalNumGroups, setTotalNumGroups] = useState(0);
  const [totalGroupMembers, setTotalGroupMembers] = useState(0);
  const [totalCalulationData, setTotalCalcultationData] = useState({});
  const [row, setrow] = useState(false);
  const [orgData, setOrgData] = useState();
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const [totalGroups, setTotalGroups] = useState(0);
  const { user } = useUser();
  const authToken = localStorage.getItem("Auth Token");
  const statusChange = async (check, row) => {
    // Update Group Status.
    // if (permissions.edit) {
    //   const groupCol = doc(db.db, "groups", row.group_id);
    //   const groupData = await getDoc(groupCol);
    //   const getGroupData = groupData.data();
    //   getGroupData.status = check ? "Active" : "Inactive";
    //   await updateDoc(groupCol, getGroupData);
    //   const response = await fetch(`${BASE_URL}/group-status-change`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: authToken,
    //     },
    //     body: JSON.stringify({ id: row.id, check }),
    //   });
    //   const jsonData = await response.json();
    //   if (jsonData.success) {
    //     // fetchGroupsAndPermissions();
    //     fetchOrganizationDataAndPermissions();
    //     fetchPermissions();
    //   }
    // }
  };

  const fetchOrganizationDataAndPermissions = async () => {
    {orgData,
    permissions,
    org_dahboard,
    statusChange,
    org_id,
    id }
  
    try {
      const response = await fetch(`${BASE_URL}/get-organization-by-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
        body: JSON.stringify({ org_id: org_id || id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const jsonData = await response.json();
      console.log("Get Organization By Id json data", jsonData);
      if (jsonData.status === "success") {
        const { data } = jsonData;
        setSpinner(false);
        setGroups(data.groups);
        setTotalGroups(data.total_groups);
        setTotalNumGroups(data.total_groups);
        setTotalGroupMembers(data.members);

        const currienciesCalculationList = {};
        data.groups.forEach((groupData) => {
          if (groupData?.currency?.code) {
            if (currienciesCalculationList[groupData?.currency?.code]) {
              currienciesCalculationList[groupData?.currency?.code] = {
                deposit:
                  currienciesCalculationList[groupData?.currency?.code]
                    .deposit + groupData.total_pool_amount,
                withdrawal:
                  currienciesCalculationList[groupData?.currency?.code]
                    .withdrawal + groupData.withdraw,
              };
            } else {
              currienciesCalculationList[groupData?.currency?.code] = {
                deposit: groupData.total_pool_amount,
                withdrawal: groupData.withdraw,
              };
            }
          } else {
            if (currienciesCalculationList["XOF"]) {
              currienciesCalculationList["XOF"] = {
                deposit:
                  currienciesCalculationList["XOF"].deposit +
                  groupData.total_pool_amount,
                withdrawal:
                  currienciesCalculationList["XOF"].withdrawal +
                  groupData.withdraw,
              };
            } else {
              currienciesCalculationList["XOF"] = {
                deposit: groupData.total_pool_amount,
                withdrawal: groupData.withdraw,
              };
            }
          }
        });

        console.log("currienciesCalculationList", currienciesCalculationList);
        setTotalCalcultationData(currienciesCalculationList);

        setOrgData({
          id: data?.id,
          org_name: data.org_name,
          short_name: data.short_name,
          description: data.description,
          admins: data.appAdmin,
        });
      }
      if (user || !user?.role_id) {
        setPermissions({ add: true, view: true, edit: true, delete: true });
      } else {
        var orgDetailPermission = user.role.permissions.filter(
          (permission) => permission.section === "Organization Dashboard"
        );
        if (orgDetailPermission.length && orgDetailPermission[0].status) {
          setPermissions(...orgDetailPermission);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchOrganizationDataAndPermissions();
    localStorage.setItem("org_id", org_id);
  }, []);

  useEffect(() => {
    localStorage.setItem("short_name", orgData?.short_name);
  }, [orgData?.short_name]);

  return (
    <PageLayout spinner={spinner} permissions={permissions}>
      {permissions && !spinner && (
        <>
          <section className="row mb-2">
            <div className="col-lg-12 grid-margin-xl-0 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="text-[1.25rem] mb-2">
                        {orgData.org_name} ({orgData.short_name})
                      </h4>
                      <p className="m-0">{orgData.description} </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="card mb-2">
          <OrganizationAdminsAccordion
        orgData={orgData}
        permissions={permissions}
        org_dahboard={org_dahboard}
        statusChange={statusChange}
        org_id={org_id}
        id={id}
        row={false} // or adjust as needed
      />
          </section>

          <section className="row">
            <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                      <svg
                        width="17"
                        height="15"
                        viewBox="0 0 25 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M24.9998 16.0737C23.37 16.8566 21.6325 17.1329 19.8028 17.225C19.8028 17.0715 19.8028 16.9334 19.8028 16.7952C19.8028 15.997 19.8028 15.1834 19.5568 14.4158C18.9725 12.6658 17.8194 11.4684 16.0819 10.8084C16.0204 10.7777 15.9589 10.7623 15.8974 10.747C15.8821 10.747 15.8667 10.7316 15.8359 10.7009C16.6816 9.84126 17.1582 8.81274 17.2044 7.58467C17.2812 7.56932 17.3427 7.56932 17.4042 7.56932C18.4344 7.56932 19.4492 7.55397 20.4793 7.56932C22.6781 7.60002 24.6461 9.35003 24.9536 11.5299C24.969 11.5913 24.9844 11.6527 24.9998 11.7141C24.9998 13.1878 24.9998 14.6307 24.9998 16.0737Z"
                          fill="black"
                        />
                        <path
                          d="M6.44286 17.6679C6.44286 17.0539 6.42749 16.4398 6.44286 15.8104C6.48899 14.0297 7.71903 12.2797 9.41034 11.6811C9.90236 11.5122 10.4405 11.374 10.9479 11.3587C12.1626 11.3126 13.3772 11.2973 14.5919 11.374C17.0366 11.5429 18.8663 13.4925 18.9278 15.9333C18.9586 17.1767 18.9278 18.4201 18.9432 19.6635C18.9432 19.817 18.8663 19.8631 18.7587 19.9091C17.8208 20.3543 16.8214 20.6153 15.8066 20.7841C14.1614 21.0605 12.5008 21.0605 10.8403 20.8762C9.39497 20.7074 7.98042 20.385 6.58124 19.9552C6.44286 19.9091 6.41211 19.8324 6.41211 19.7096C6.42748 19.0341 6.42749 18.3587 6.44286 17.6679Z"
                          fill="black"
                        />
                        <path
                          d="M9.45596 10.7324C6.51923 11.853 5.33531 14.0943 5.58132 17.2259C4.98167 17.1645 4.42815 17.1031 3.87463 17.0416C2.65997 16.8728 1.47605 16.5811 0.292134 16.228C0.0768768 16.1666 0 16.0899 0 15.8596C0.0153755 14.6776 9.38219e-07 13.4956 0.0153765 12.3289C0.0153765 10.0416 1.55293 8.15348 3.79776 7.69295C4.05914 7.63155 4.35128 7.6162 4.62804 7.6162C5.70433 7.60085 6.79599 7.6162 7.87227 7.6162C7.96453 7.6162 8.05678 7.6162 8.08753 7.63155C8.25667 8.21488 8.34892 8.79822 8.57955 9.32015C8.77943 9.81138 9.14845 10.2566 9.45596 10.7324Z"
                          fill="black"
                        />
                        <path
                          d="M12.7003 11.1112C10.6707 11.1265 9.01012 9.48397 9.0255 7.4423C9.0255 5.41598 10.6553 3.78879 12.6849 3.77344C14.6991 3.77344 16.3596 5.40063 16.3596 7.4116C16.3596 9.45327 14.7298 11.0958 12.7003 11.1112Z"
                          fill="black"
                        />
                        <path
                          d="M6.24184 0C8.17916 0.0460527 9.63983 1.36623 9.90121 3.25439C9.91659 3.42325 9.91659 3.59211 9.90121 3.76097C9.90121 3.83772 9.83971 3.92983 9.77821 3.97588C8.96331 4.68202 8.44054 5.54167 8.22528 6.61624C8.20991 6.69299 8.13303 6.80045 8.07153 6.83115C5.8882 8.13597 2.9976 6.75439 2.62859 4.2522C2.33645 2.19518 3.64337 0.383772 5.7037 0.0460526C5.8882 0.0153508 6.08808 0.0153509 6.24184 0Z"
                          fill="black"
                        />
                        <path
                          d="M18.6509 0C20.6189 0 22.2487 1.45834 22.4025 3.31579C22.5716 5.23465 21.2493 6.96931 19.3735 7.29167C18.7124 7.39913 18.0666 7.32238 17.4362 7.10746C17.2517 7.04606 17.1748 6.9386 17.1441 6.75439C17.0057 5.84869 16.6213 5.05044 15.9755 4.39036C15.7603 4.17544 15.5296 3.96053 15.2682 3.79167C15.0991 3.66886 15.0684 3.56141 15.0684 3.36185C15.176 1.8114 16.4522 0.383773 18.0051 0.0921057C18.2665 0.0307021 18.5125 0.0153509 18.6509 0Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="font-weight-semibold small mb-0 text-warning">
                        <Trans>Total No. of Groups</Trans>
                      </h6>
                      <span className="d-flex align-items-end">
                        <h6 className="font-weight-semibold mb-0">
                          {totalNumGroups}
                        </h6>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin">
              <div className="card h-100">
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
                          d="M8.69099 20.3012C6.11053 20.3012 3.54039 20.3012 0.95993 20.3012C0.309654 20.3012 0 19.9925 0 19.3547C0.0103218 15.3941 2.92108 11.8243 6.81241 11.0116C11.643 9.99319 16.2259 12.9765 17.2168 17.7807C17.32 18.2951 17.3613 18.8198 17.382 19.3547C17.4129 19.972 17.062 20.3012 16.453 20.3012C13.8622 20.3012 11.2818 20.3012 8.69099 20.3012Z"
                          fill="black"
                        />
                        <path
                          d="M13.4499 4.74283C13.4808 7.2941 11.3649 9.47503 8.8257 9.4956C6.11106 9.52647 3.94347 7.4587 3.9125 4.81484C3.88154 2.22242 6.00784 0.0312015 8.56765 0.000339318C11.2823 -0.0305229 13.4189 2.04753 13.4499 4.74283Z"
                          fill="black"
                        />
                        <path
                          d="M15.5977 11.7602C18.0439 10.2377 21.4295 10.7417 23.3803 12.9227C24.4435 14.1057 24.9905 15.4842 25.0009 17.0788C25.0009 17.5931 24.6602 17.9532 24.1441 17.9532C22.4823 17.9635 20.8102 17.9532 19.1484 17.9532C19.0039 17.9532 18.9419 17.9326 18.911 17.768C18.4981 15.4534 17.4556 13.4679 15.7009 11.8631C15.6596 11.8425 15.6286 11.8013 15.5977 11.7602Z"
                          fill="black"
                        />
                        <path
                          d="M18.7656 9.90871C16.7941 9.90871 15.2148 8.34503 15.2148 6.40071C15.2148 4.42553 16.7838 2.85156 18.7552 2.85156C20.7164 2.85156 22.2956 4.41525 22.2956 6.38014C22.2956 8.33474 20.7164 9.90871 18.7656 9.90871Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="font-weight-semibold small mb-0 text-warning">
                        <Trans>Members</Trans>
                      </h6>
                      <span className="d-flex align-items-end">
                        <h6 className="font-weight-semibold mb-0">
                          {totalGroupMembers}
                        </h6>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                      <svg
                        width="17"
                        height="15"
                        viewBox="0 0 25 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.09093 0C9.48745 0.0481942 9.88396 0.0867495 10.2708 0.154221C12.0019 0.424109 13.6363 0.925328 15 2.10127C15.5706 2.59285 16.0058 3.19045 16.1605 3.94228C16.3636 4.90617 16.0348 5.73511 15.3965 6.43874C14.5841 7.32551 13.5396 7.84601 12.4178 8.21228C10.677 8.78098 8.89751 8.9352 7.07934 8.80989C5.56098 8.70387 4.09097 8.39542 2.708 7.73998C1.85695 7.33515 1.07359 6.83393 0.551347 6.04355C0.30957 5.68691 0.183845 5.2628 0.00976562 4.86761C0.00976562 4.60736 0.00976562 4.34711 0.00976562 4.08686C0.299899 2.88201 1.1026 2.09163 2.10839 1.47474C3.23024 0.800023 4.4488 0.41447 5.73506 0.202415C6.23796 0.115666 6.73118 0.0674718 7.23408 0C7.85303 0 8.47198 0 9.09093 0Z"
                          fill="black"
                        />
                        <path
                          d="M0.00976562 7.6875C0.706085 8.29475 1.4701 8.79597 2.31149 9.17188C3.49136 9.69238 4.72926 10.0105 6.00585 10.1743C7.38882 10.3575 8.77179 10.3671 10.2128 10.1743C10.1451 10.2611 10.0967 10.3189 10.058 10.3671C9.31337 11.1575 8.70409 12.0443 8.26889 13.0371C8.20119 13.2009 8.11415 13.2491 7.94007 13.2395C6.03486 13.2009 4.19735 12.8828 2.48557 12.0153C1.72155 11.6298 1.02523 11.1575 0.551347 10.4249C0.319241 10.0683 0.183845 9.64418 0.00976562 9.24899C0.00976562 8.72849 0.00976562 8.208 0.00976562 7.6875Z"
                          fill="black"
                        />
                        <path
                          d="M0.00976562 16.4453C0.580361 16.8405 1.12194 17.2839 1.73122 17.6212C2.89175 18.2671 4.149 18.6333 5.46427 18.8261C6.14125 18.9225 6.83756 18.961 7.52421 19.0382C7.59191 19.0478 7.70796 19.1056 7.71764 19.1635C7.97875 20.137 8.3656 21.0623 8.91685 21.9394C8.82981 21.9587 8.77179 21.978 8.71376 21.978C6.6248 22.0455 4.59387 21.7659 2.68866 20.8695C1.84728 20.4743 1.07359 19.9731 0.561019 19.1827C0.328912 18.8261 0.203188 18.402 0.0194367 18.0068C0.00976562 17.4767 0.00976562 16.9658 0.00976562 16.4453Z"
                          fill="black"
                        />
                        <path
                          d="M0.0096711 12.0703C0.541582 12.4462 1.04448 12.8607 1.59573 13.1788C2.88199 13.9113 4.2843 14.2969 5.74464 14.4993C6.38293 14.586 7.02122 14.6342 7.67886 14.7017C7.50478 15.6367 7.35004 16.5716 7.46609 17.5837C7.13727 17.5644 6.8278 17.5548 6.51832 17.5163C5.087 17.3524 3.70403 17.0247 2.41778 16.3596C1.84718 16.0608 1.32494 15.6945 0.870399 15.2318C0.425529 14.7788 0.164409 14.239 0 13.6318C0.0096711 13.1017 0.0096711 12.5812 0.0096711 12.0703Z"
                          fill="black"
                        />
                        <path
                          d="M25.0008 16.8885C25.0008 21.3224 21.3935 24.9177 16.9351 24.908C12.4961 24.908 8.89844 21.3031 8.89844 16.8789C8.89844 12.445 12.5058 8.85938 16.9641 8.85938C21.4032 8.85938 25.0008 12.4547 25.0008 16.8885ZM14.7688 18.3536C14.7301 19.1344 15.233 19.9344 16.0067 20.291C16.1711 20.3681 16.2195 20.4549 16.2195 20.638C16.2098 21.0814 16.2195 21.5248 16.2195 21.9682C16.7224 21.9682 17.1962 21.9682 17.6895 21.9682C17.6895 21.5055 17.6991 21.0621 17.6895 20.6187C17.6895 20.4549 17.7282 20.3681 17.8926 20.291C18.937 19.7994 19.4303 18.6235 19.0047 17.5536C18.6372 16.6379 17.9312 16.1849 16.9545 16.1367C16.5676 16.1174 16.2678 15.8379 16.2388 15.4813C16.2098 15.0957 16.4709 14.7487 16.8384 14.6909C17.2156 14.6234 17.5637 14.8547 17.6798 15.2306C17.6991 15.2885 17.7088 15.3463 17.7185 15.4138C18.1827 15.4138 18.6276 15.4138 19.0724 15.4138C19.0918 15.4138 19.1208 15.4041 19.1401 15.3945C19.1691 14.6138 18.6759 13.8137 17.9022 13.4571C17.7378 13.38 17.6798 13.2932 17.6895 13.1101C17.6991 12.6667 17.6895 12.2233 17.6895 11.7799C17.1866 11.7799 16.7127 11.7799 16.2195 11.7799C16.2195 12.2426 16.2098 12.686 16.2195 13.1294C16.2195 13.2932 16.1808 13.38 16.0164 13.4571C14.9332 13.968 14.4593 15.2017 14.9429 16.2813C15.3297 17.1391 16.026 17.5632 16.9545 17.6114C17.3607 17.6307 17.6605 17.9199 17.6701 18.2958C17.6895 18.6717 17.4284 18.9994 17.0608 19.0669C16.6837 19.1344 16.3355 18.903 16.2195 18.5271C16.2001 18.4693 16.1904 18.4115 16.1808 18.3633C15.7069 18.3536 15.233 18.3536 14.7688 18.3536Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="font-weight-semibold small mb-0 text-warning">
                        <Trans>Deposit</Trans>
                      </h6>
                      <span className="d-flex align-items-end ">
                        <h6 className="font-weight-semibold mb-0">
                          {Object.keys(totalCalulationData).length > 0
                            ? Object.entries(totalCalulationData).map(
                                ([currency, sum], index) => (
                                  <span key={index}>
                                    {sum.deposit} {currency}
                                    {index !==
                                    Object.keys(totalCalulationData).length - 1
                                      ? " / "
                                      : ""}
                                  </span>
                                )
                              )
                            : 0}
                        </h6>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                      <svg
                        width="17"
                        height="15"
                        viewBox="0 0 25 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.09093 0C9.48745 0.0481942 9.88396 0.0867495 10.2708 0.154221C12.0019 0.424109 13.6363 0.925328 15 2.10127C15.5706 2.59285 16.0058 3.19045 16.1605 3.94228C16.3636 4.90617 16.0348 5.73511 15.3965 6.43874C14.5841 7.32551 13.5396 7.84601 12.4178 8.21228C10.677 8.78098 8.89751 8.9352 7.07934 8.80989C5.56098 8.70387 4.09097 8.39542 2.708 7.73998C1.85695 7.33515 1.07359 6.83393 0.551347 6.04355C0.30957 5.68691 0.183845 5.2628 0.00976562 4.86761C0.00976562 4.60736 0.00976562 4.34711 0.00976562 4.08686C0.299899 2.88201 1.1026 2.09163 2.10839 1.47474C3.23024 0.800023 4.4488 0.41447 5.73506 0.202415C6.23796 0.115666 6.73118 0.0674718 7.23408 0C7.85303 0 8.47198 0 9.09093 0Z"
                          fill="black"
                        />
                        <path
                          d="M0.00976562 7.6875C0.706085 8.29475 1.4701 8.79597 2.31149 9.17188C3.49136 9.69238 4.72926 10.0105 6.00585 10.1743C7.38882 10.3575 8.77179 10.3671 10.2128 10.1743C10.1451 10.2611 10.0967 10.3189 10.058 10.3671C9.31337 11.1575 8.70409 12.0443 8.26889 13.0371C8.20119 13.2009 8.11415 13.2491 7.94007 13.2395C6.03486 13.2009 4.19735 12.8828 2.48557 12.0153C1.72155 11.6298 1.02523 11.1575 0.551347 10.4249C0.319241 10.0683 0.183845 9.64418 0.00976562 9.24899C0.00976562 8.72849 0.00976562 8.208 0.00976562 7.6875Z"
                          fill="black"
                        />
                        <path
                          d="M0.00976562 16.4453C0.580361 16.8405 1.12194 17.2839 1.73122 17.6212C2.89175 18.2671 4.149 18.6333 5.46427 18.8261C6.14125 18.9225 6.83756 18.961 7.52421 19.0382C7.59191 19.0478 7.70796 19.1056 7.71764 19.1635C7.97875 20.137 8.3656 21.0623 8.91685 21.9394C8.82981 21.9587 8.77179 21.978 8.71376 21.978C6.6248 22.0455 4.59387 21.7659 2.68866 20.8695C1.84728 20.4743 1.07359 19.9731 0.561019 19.1827C0.328912 18.8261 0.203188 18.402 0.0194367 18.0068C0.00976562 17.4767 0.00976562 16.9658 0.00976562 16.4453Z"
                          fill="black"
                        />
                        <path
                          d="M0.0096711 12.0703C0.541582 12.4462 1.04448 12.8607 1.59573 13.1788C2.88199 13.9113 4.2843 14.2969 5.74464 14.4993C6.38293 14.586 7.02122 14.6342 7.67886 14.7017C7.50478 15.6367 7.35004 16.5716 7.46609 17.5837C7.13727 17.5644 6.8278 17.5548 6.51832 17.5163C5.087 17.3524 3.70403 17.0247 2.41778 16.3596C1.84718 16.0608 1.32494 15.6945 0.870399 15.2318C0.425529 14.7788 0.164409 14.239 0 13.6318C0.0096711 13.1017 0.0096711 12.5812 0.0096711 12.0703Z"
                          fill="black"
                        />
                        <path
                          d="M25.0008 16.8885C25.0008 21.3224 21.3935 24.9177 16.9351 24.908C12.4961 24.908 8.89844 21.3031 8.89844 16.8789C8.89844 12.445 12.5058 8.85938 16.9641 8.85938C21.4032 8.85938 25.0008 12.4547 25.0008 16.8885ZM14.7688 18.3536C14.7301 19.1344 15.233 19.9344 16.0067 20.291C16.1711 20.3681 16.2195 20.4549 16.2195 20.638C16.2098 21.0814 16.2195 21.5248 16.2195 21.9682C16.7224 21.9682 17.1962 21.9682 17.6895 21.9682C17.6895 21.5055 17.6991 21.0621 17.6895 20.6187C17.6895 20.4549 17.7282 20.3681 17.8926 20.291C18.937 19.7994 19.4303 18.6235 19.0047 17.5536C18.6372 16.6379 17.9312 16.1849 16.9545 16.1367C16.5676 16.1174 16.2678 15.8379 16.2388 15.4813C16.2098 15.0957 16.4709 14.7487 16.8384 14.6909C17.2156 14.6234 17.5637 14.8547 17.6798 15.2306C17.6991 15.2885 17.7088 15.3463 17.7185 15.4138C18.1827 15.4138 18.6276 15.4138 19.0724 15.4138C19.0918 15.4138 19.1208 15.4041 19.1401 15.3945C19.1691 14.6138 18.6759 13.8137 17.9022 13.4571C17.7378 13.38 17.6798 13.2932 17.6895 13.1101C17.6991 12.6667 17.6895 12.2233 17.6895 11.7799C17.1866 11.7799 16.7127 11.7799 16.2195 11.7799C16.2195 12.2426 16.2098 12.686 16.2195 13.1294C16.2195 13.2932 16.1808 13.38 16.0164 13.4571C14.9332 13.968 14.4593 15.2017 14.9429 16.2813C15.3297 17.1391 16.026 17.5632 16.9545 17.6114C17.3607 17.6307 17.6605 17.9199 17.6701 18.2958C17.6895 18.6717 17.4284 18.9994 17.0608 19.0669C16.6837 19.1344 16.3355 18.903 16.2195 18.5271C16.2001 18.4693 16.1904 18.4115 16.1808 18.3633C15.7069 18.3536 15.233 18.3536 14.7688 18.3536Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="font-weight-semibold small mb-0 text-warning">
                        <Trans>Withdrawal</Trans>
                      </h6>
                      <span className="d-flex align-items-end ">
                        <h6 className="font-weight-semibold mb-0">
                          {Object.keys(totalCalulationData).length > 0
                            ? Object.entries(totalCalulationData).map(
                                ([currency, sum], index) => (
                                  <span key={index}>
                                    {sum.withdrawal} {currency}
                                    {index !==
                                    Object.keys(totalCalulationData).length - 1
                                      ? " / "
                                      : ""}
                                  </span>
                                )
                              )
                            : 0}
                        </h6>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <OrganizationGroupTable
            org_id={org_id || ""}
            total_groups={totalGroups}
            org_groups={groups}
            org_dahboard={org_dahboard}
          />
        </>
      )}
    </PageLayout>
  );
}
export default OrganizationDetail;
