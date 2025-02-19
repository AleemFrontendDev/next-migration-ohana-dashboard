"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
// import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
// import db from "../../firebase/firebase-config";
import paginationFactory, {
  PaginationProvider,
  PaginationListStandalone,
  PaginationTotalStandalone,
  SizePerPageDropdownStandalone,
} from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import useInterval, { BASE_URL, ROUTES } from "../../utils/common";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import Modal from "react-bootstrap/Modal";
import ToolkitProvider, {
  Search,
} from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "../../hooks/useCountry";
import useUser from "../../hooks/useUser";
import { Trans } from "react-i18next";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { useAuthToken } from "@/utils/useAuthToken";

export function DeviceUpdate() {
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [contributingUser, setContributingUser] = useState([0]);
  const [orphanUsers, setOrphanUsers] = useState([0]);
  const [message, setMessage] = useState(false);
  const [device, setDevice] = useState([]); 
  console.log(device, "DEVICE 31");
  const [userData, setUser] = useState([]);
  console.log(userData, "userData 33");
  const [authUser, setAuthUser] = useState(0);
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const [filter, setFilter] = useState("");
  const [totalNumUsers, setTotalNumUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const date = new Date();
  const { country } = useCountry();
  const { user } = useUser();
  const authToken = useAuthToken();
  const [currentPage, setCurrentPage] = useState({ page: 1, sizePerPage: 10 });
  const { page, sizePerPage } = currentPage;
  const [sort, setSort] = useState({ field: "", order: "" });
  const { field, order } = sort;
  const [search, setSearch] = useState("");

  const fetchPermissionsAuthUserAndUsers = async () => {
    const response = await fetch(`${BASE_URL}/v1/get-all-user-new-device-ids`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-api-key": "Ohana-Agent-oo73",
      },
    });
    const jsonData = await response.json();
    if (jsonData && jsonData.data && jsonData.data) {
      const mappedData = jsonData.data.data.map((item) => ({
        id: item.id,
        first_name: item.user.first_name,
        last_name: item.user.last_name,
        phone: item.user.phone,
        device_id: item.user.device_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_updated: item.is_updated,
        new_device_id: item.new_device_id,
        phone_no: item.phone_no,
      }));

      setDevice(mappedData);
      setTotalNumUsers(jsonData.data.total);
    }
    if (user || !user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var deviceUpdatePermission = user.role.permissions.filter(
        (permission) => permission.section === "Update Device"
      );
      if (deviceUpdatePermission.length && deviceUpdatePermission[0].status) {
        setPermissions(...deviceUpdatePermission);
      }
    }
    setSpinner(false);
  };

  useEffect(() => {
    if (!authToken) return;
    fetchPermissionsAuthUserAndUsers();
  }, [authToken]);

  useInterval(fetchPermissionsAuthUserAndUsers, 20000, 5);

  //   const handleDataUpdate =async (id,phone)=>{
  //     console.log("id",id)
  //     console.log("phone",phone)
  //     const response = await fetch(`${BASE_URL}/v1/update-user-new-device`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: authToken,
  //         },
  //         body: JSON.stringify({ id: id, phone:phone }),
  //       });
  //       const jsonData = await response.json();
  //       if (jsonData.success === true) {
  //         toast.success(jsonData.message);
  //       }

  //   }

  const handleDataUpdate = async (id, phone) => {
    console.log("fetcching data call");
    try {
      const response = await fetch(`${BASE_URL}/v1/update-user-new-device`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
        body: JSON.stringify({ record_id: phone, phone: id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not in JSON format");
      }

      const jsonData = await response.json();
      console.log("json data", jsonData);
      if (jsonData.status === "success") {
        fetchPermissionsAuthUserAndUsers();
        toast.success(jsonData.message);
      } else {
        if (typeof jsonData.message === "string") {
          toast.error(jsonData.message);
        } else {
          toast.error("Error in updating device");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error in updating device");
    }
  };

  const columns = [
    {
      dataField: "first_name",
      text: "Name",
      sort: true,
      formatter: (cell, row) => row.first_name + " " + row.last_name,
    },
    {
      dataField: "phone",
      text: "Phone",
      sort: true,
    },
    {
      dataField: "created_at",
      text: "Date",
      sort: true,
      formatter: (cell, row) => {
        const date = new Date(row.created_at);
        return date.toLocaleDateString();
      },
    },
    {
      dataField: "view",
      text: <Trans>View</Trans>,
      formatter: (cell, row) => {
        console.log("row 168", row);
        return (
          <Link
            className="nav-link icon-holder bg-[#dde4eb] flex items-center justify-center text-center p-2 rounded"
            href={`device-update/device-update-form/${row?.new_device_id}/${row?.id}`}
          >
            <i className="mdi mdi-eye"></i>
          </Link>
        );
      },
    },
  ];

  const selectRow = {
    mode: "checkbox",
    clickToSelect: false,
    bgColor: "#f3f3f3",
  };

  const { SearchBar } = Search;

  const handleTableChange = (type, newState) => {
    if (type === "pagination") {
      setCurrentPage({
        page: newState.page,
        sizePerPage: newState.sizePerPage,
      });
    } else if (type === "search") {
      setSearch(newState.searchText);
    } else if (type === "sort") {
      setSort({ field: newState.sortField, order: newState.sortOrder });
    }
  };

  return (
    <>
      {permissions && !spinner ? (
        <PaginationProvider
          pagination={paginationFactory({
            custom: true,
            totalSize: totalNumUsers,
            page: page,
            sizePerPage: sizePerPage,
            paginationComponent: PaginationListStandalone,
          })}
          keyField="id"
          columns={columns}
          data={device || []} // Provide fallback empty array
        >
          {({ paginationProps, paginationTableProps }) => (
            <ToolkitProvider
              keyField="id"
              columns={columns}
              data={device || []} // Provide fallback empty array
              search={{
                searchFormatted: true,
              }}
            >
              {(toolkitprops) => (
                <>
                  <div className="row mb-2">
                    <div className="col-lg-12 grid-margin-xl-0 grid-margin stretch-card">
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
                              <h6 className="font-weight-semibold mb-0 text-warning">
                                <Trans>Device Update</Trans>
                              </h6>
                            </div>
                          </div>
                          <div className="table-responsive">
                            <BootstrapTable
                              hover
                              selectRow={selectRow}
                              noDataIndication={"No results found"}
                              bordered={false}
                              {...toolkitprops.baseProps}
                              {...paginationTableProps}
                              remote={{ search: true, pagination: true }}
                              onTableChange={handleTableChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="flex items-center justify-between w-full px-3">
                      <div>
                        <SizePerPageDropdownStandalone {...paginationProps} />
                        <PaginationTotalStandalone {...paginationProps} />
                      </div>
                      <div className="">
                        <PaginationListStandalone {...paginationProps} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </ToolkitProvider>
          )}
        </PaginationProvider>
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
export default DeviceUpdate;
