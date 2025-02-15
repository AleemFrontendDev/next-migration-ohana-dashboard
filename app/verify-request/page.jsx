"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import paginationFactory, {
  PaginationProvider,
  PaginationListStandalone,
  PaginationTotalStandalone,
  SizePerPageDropdownStandalone,
} from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
// import BootstrapSwitchButton from 'bootstrap-switch-button-react';
import ToolkitProvider, {
  Search,
} from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";

export function VerifyRequests() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const [filter, setFilter] = useState("");
  const { country } = useCountry();
  const { user } = useUser();
  const [totalUsers, setTotalUsers] = useState(0);
  const authToken = useMemo(
    () =>
      typeof window !== "undefined" ? localStorage.getItem("Auth Token") : null,
    []
  );
  const [currentPage, setCurrentPage] = useState({ page: 1, sizePerPage: 10 });
  const { page, sizePerPage } = currentPage;
  const [sort, setSort] = useState({ field: "", order: "" });
  const { field, order } = sort;
  const [search, setSearch] = useState("");

  const fetchPermissionsAndUsers = async () => {
    const response = await fetch(
      `${BASE_URL}/v1/get-all-verifications?page=${page}&size=${sizePerPage}&search=${search}`,
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
    console.log("jsonData", jsonData);
    if (jsonData.status === "success") {
      setSpinner(false);
      setUsers(jsonData.data.data);
      setTotalUsers(jsonData.data.total);
    }
    if (user || !user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var idVerificationPermission = user.role.permissions.filter(
        (permission) => permission.section === "ID Verification"
      );
      if (
        idVerificationPermission.length &&
        idVerificationPermission[0].status
      ) {
        setPermissions(...idVerificationPermission);
      }
    }
  };

  useEffect(() => {
    fetchPermissionsAndUsers();
  }, [country, page, sizePerPage, filter, search, field, order, totalUsers]);

  useInterval(fetchPermissionsAndUsers, 20000, 5);

  const columns = [
    {
      dataField: "name",
      text: "Name",
      sort: true,
      formatter: (cell, row) =>
        row.name ? row.name : row.first_name + " " + row.last_name,
    },

    {
      dataField: "phone",
      text: "Phone",
      sort: true,
    },

    {
      dataField: "gender",
      text: "Gender",
      sort: true,
    },

    {
      dataField: "city",
      text: "City",
      sort: true,
    },

    {
      dataField: "country",
      text: "Country",
      sort: true,
    },

    {
      dataField: "submit_date",
      text: "date",
      sort: true,
    },

    {
      dataField: "account_verified",
      text: "Verify",
      sort: true,
      formatter: (cell, row) => (
        <span
          className={`py-1 px-2 rounded ${
            cell ? "alert-success" : "alert-warning"
          }`}
        >
          {cell ? "Yes" : "No"}
        </span>
      ),
    },

    {
      dataField: "status",
      text: "Status",
      sort: true,
    },

    {
      dataField: "view",
      text: "View",
      formatter: (cell, row) => {
        const html = (
          <div className="icon-holder bg-secondary text-center p-2 rounded">
            <i className="mdi mdi-eye"></i>
          </div>
        );
        return permissions && permissions.view ? (
          <Link
            className="nav-link"
            href={ROUTES.verify_request + "/" + row.user_id}
          >
            {html}
          </Link>
        ) : (
          html
        );
      },
    },
  ];

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
            totalSize: totalUsers,
            page: page,
            sizePerPage: sizePerPage,
            paginationComponent: PaginationListStandalone,
          })}
          keyField="id"
          columns={columns}
          data={users}
        >
          {({ paginationProps, paginationTableProps }) => (
            <ToolkitProvider
              keyField="id"
              columns={columns}
              data={users}
              search={{
                searchFormatted: true,
              }}
            >
              {(toolkitprops) => (
                <>
                  <div className="row">
                    <div className="col-lg-12 d-flex justify-content-between my-2 ">
                      <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin pl-0 pr-3">
                        <SearchBar
                          {...toolkitprops.searchProps}
                          style={{ border: "none", width: "100%" }}
                        />
                      </div>
                      {/* <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin pl-3 pr-0">
                        <select
                          className="form-control"
                          aria-label="Default select example"
                          defaultValue={filter}
                          onChange={(e) => orphanInactiveUsers(e)}
                        >
                          <option value="">All</option>
                          <option value="orphan_users">Orphan Users</option>
                          <option value="inactive_users">Inactive Users</option>
                        </select>
                      </div> */}
                    </div>
                  </div>
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
                                ID Verifications
                              </h6>
                            </div>
                          </div>
                          <div className="table-responsive">
                            <BootstrapTable
                              // hover
                              // selectRow={selectRow}
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
                      <div className="col pl-0">
                        <SizePerPageDropdownStandalone {...paginationProps} />
                        <PaginationTotalStandalone {...paginationProps} />
                      </div>
                      <div className="col pr-0">
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
export default VerifyRequests;
