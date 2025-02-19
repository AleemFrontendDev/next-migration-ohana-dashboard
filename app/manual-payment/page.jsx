"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import paginationFactory, {
  PaginationProvider,
  PaginationListStandalone,
  PaginationTotalStandalone,
  SizePerPageDropdownStandalone,
} from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import useInterval, { BASE_URL, ROUTES } from "@/utils/common";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ToolkitProvider, {
  Search,
} from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { useAuthToken } from "@/utils/useAuthToken";

export function ManualPayment() {
  const [manualPayments, setManualPayments] = useState([]);
  const [permissions, setPermissions] = useState(0);
  console.log("permission", permissions);
  const [spinner, setSpinner] = useState(true);
  const [filter, setFilter] = useState("");
  const { country } = useCountry();
  const { user } = useUser();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const authToken = useAuthToken();
  const [totalManualPayments, setTotalManualPayments] = useState(0);
  const [currentPage, setCurrentPage] = useState({ page: 1, sizePerPage: 10 });
  const { page, sizePerPage } = currentPage;
  const [sort, setSort] = useState({ field: "", order: "" });
  const { field, order } = sort;
  const [search, setSearch] = useState("");

  const fetchPermissionsAndManualPayment = async () => {
    const response = await fetch(
      `${BASE_URL}/manual-payments?page=${page}&size=${sizePerPage}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
        body: JSON.stringify({ filter, search, field, order }),
      }
    );
    const jsonData = await response.json();

    if (jsonData.success) {
      setSpinner(false);
      setManualPayments(jsonData.manualPayments.data);
      setTotalManualPayments(jsonData.manualPayments.total);
    }

    if (user || !user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var manualPaymentPermission = user.role.permissions.filter(
        (permission) => permission.section === "Manual Payment"
      );
      console.log("maual payment permission 64", manualPaymentPermission);

      if (manualPaymentPermission.length && manualPaymentPermission[0].status) {
        setPermissions(...manualPaymentPermission);
      }
    }
  };

  useEffect(() => {
    fetchPermissionsAndManualPayment();
  }, [country, page, sizePerPage, filter, search, field, order]);

  useInterval(fetchPermissionsAndManualPayment, 20000, 5);

  function priceFormatter(cell, row) {
    return (
      <span>{parseFloat(cell).toFixed(2) + " " + (row.currency ?? "")}</span>
    );
  }

  const statusFilter = async (e) => {
    const check = e.target.value;
    setFilter(check);
    setCurrentPage({ page: 1, sizePerPage: sizePerPage });
  };

  const columns = [
    {
      dataField: "title",
      text: "Type",
      sort: true,
    },
    {
      dataField: "ref_number",
      text: "Ref. Number",
      sort: true,
    },
    {
      dataField: "phone_used",
      text: "Phone Used",
      sort: true,
    },
    {
      dataField: "amount",
      text: "Amount",
      sort: true,
      formatter: priceFormatter,
    },
    {
      dataField: "body",
      text: "Paid For",
      sort: true,
    },
    {
      dataField: "payed_by.first_name",
      text: "Payed By",
      sort: true,
      formatter: (cell, row) =>
        row.payed_by?.first_name
          ? row.payed_by?.first_name + " " + row.payed_by?.last_name
          : "",
    },
    {
      dataField: "created_at",
      text: "Creation Date",
      sort: true,
      formatter: (cell, row) => new Date(cell).toLocaleDateString("en-US"),
    },
    {
      dataField: "status",
      text: "Status",
      sort: true,
      formatter: (cell, row) => (
        <span
          className={`py-1 px-2 rounded ${
            cell === "pending"
              ? "alert-primary text-primary"
              : cell === "accepted"
              ? "alert-success text-success"
              : "alert-danger text-danger"
          }`}
        >
          {cell.toUpperCase()}
        </span>
      ),
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
            href={ROUTES.manual_payment + "/" + row.id}
          >
            {html}
          </Link>
        ) : (
          html
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
            totalSize: totalManualPayments,
            page: page,
            sizePerPage: sizePerPage,
            paginationComponent: PaginationListStandalone,
          })}
          keyField="id"
          columns={columns}
          data={manualPayments}
        >
          {({ paginationProps, paginationTableProps }) => (
            <ToolkitProvider
              keyField="id"
              columns={columns}
              data={manualPayments}
              search={{
                searchFormatted: true,
              }}
            >
              {(toolkitprops) => (
                <>
                  <div className="row">
                    <div className="col-lg-12 d-flex justify-content-between my-2">
                      <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin pl-0 pr-3">
                        <SearchBar
                          {...toolkitprops.searchProps}
                          style={{ border: "none", width: "100%" }}
                        />
                      </div>
                      <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin pl-3 pr-0">
                        <select
                          className="form-control"
                          aria-label="Default select example"
                          defaultValue={filter}
                          onChange={(e) => statusFilter(e)}
                        >
                          {/* <option disabled selected value="">Filter</option> */}
                          <option value="">All</option>
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                        </select>
                      </div>
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
                              <h6 className="font-weight-semibold mb-0 text-warning">
                                Manual Payments
                              </h6>
                            </div>
                          </div>
                          <div className="table-responsive w-[1150px]">
                            <BootstrapTable
                              // striped
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
                      <div className="">
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
      <div className="row">
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
export default ManualPayment;
