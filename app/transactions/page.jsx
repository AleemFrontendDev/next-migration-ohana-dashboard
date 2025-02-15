"use client";
import React, { useState, useEffect, useMemo } from "react";
import paginationFactory, {
  PaginationProvider,
  PaginationListStandalone,
  PaginationTotalStandalone,
  SizePerPageDropdownStandalone,
} from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import useInterval, { BASE_URL } from "@/utils/common";
import ToolkitProvider, {
  Search,
} from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { Trans } from "react-i18next";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

const transactionType = [
  "Pay For",
  "Deposit",
  "Extra Funds",
  "Money Sent",
  "Contribution",
  "Disbursement",
  "Money Received",
  "Withdraw Request",
];

export function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [totalAmount, setTotalAmount] = useState([0]);
  const [payFor, setPayFor] = useState([0]);
  const [walletDeposit, setWalletDeposit] = useState([0]);
  const [groupDeposit, setGroupDeposit] = useState([0]);
  const [walletWithdrawal, setWalletWithdrawal] = useState([0]);
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const [filter, setFilter] = useState("");
  const { country } = useCountry();
  const { user } = useUser();
  const authToken = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("Auth Token") : null), []);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState({ page: 1, sizePerPage: 10 });
  const { page, sizePerPage } = currentPage;
  const [sort, setSort] = useState({ field: "", order: "" });
  const { field, order } = sort;
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchPermissionsAndTransactions = async () => {
    setIsLoading(true);

    const response = await fetch(
      `${BASE_URL}/transactions?page=${page}&size=${sizePerPage}`,
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
      setTransactions(jsonData.transactions.data);
      setTotalTransactions(jsonData.transactions.total);
      var finalAmount = 0;
      var finalGroupDeposit = 0;
      var finalWalletDeposit = 0;
      var finalWithdrawRequest = 0;
      var finalPayfor = 0;
      const usdRate = localStorage.getItem("usd_rates");
    // const usdRate = '{"rates": {"USD": {"rate": 1.0}, "EUR": {"rate": 0.9}}}';
      jsonData.totalTransactions.forEach((type, index) => {
        var amount = type.amount;
        var currency = type.currency;
        var usd_rate = JSON.parse(usdRate).rates;
        var currentRate = JSON.parse(usd_rate)[currency].rate;
        // var currentRate = 0;
        var calculated = 0;
        if (currency !== "USD") {
          calculated = amount / currentRate;
        } else {
          calculated = amount;
        }
        if (type.title === "Contribution" && type.status === "Completed") {
          finalGroupDeposit += calculated;
        }
        if (type.title === "Deposit" && type.status === "Completed") {
          finalWalletDeposit += calculated;
        }
        if (type.title === "Withdraw Request" && type.status === "Completed") {
          finalWithdrawRequest += calculated;
        }
        if (type.title === "Pay For" && type.status === "Completed") {
          finalPayfor += calculated;
        }
        if (type.status === "Completed") {
          // console.log("type", type.status);
          finalAmount += calculated;
        }
      });
      setTotalAmount(finalAmount);
      setPayFor(finalPayfor);
      setWalletDeposit(finalWalletDeposit);
      setGroupDeposit(finalGroupDeposit);
      setWalletWithdrawal(finalWithdrawRequest);
    }
    if (user || !user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var transactionPermission = user.role.permissions.filter(
        (permission) => permission.section === "Transactions"
      );
      if (transactionPermission.length && transactionPermission[0].status) {
        setPermissions(...transactionPermission);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPermissionsAndTransactions();
  }, [country, page, sizePerPage, filter, search, field, order]);

  useInterval(fetchPermissionsAndTransactions, 20000, 5);

  function priceFormatter(cell, row) {
    if (cell < 0) {
      cell = 0;
    }
    return <span>{parseFloat(cell).toFixed(2) + " " + (row.code ?? "")}</span>;
  }

  function gatewayFormatter(cell, row) {
    if (cell === "Flooz") {
      cell = "Manual Payment";
    }
    return <span>{cell}</span>;
  }

  const transactionTypeChange = async (e) => {
    const check = e.target.value;
    setFilter(check);
    setCurrentPage({ page: 1, sizePerPage: sizePerPage });
  };

  const columns = [
    {
      dataField: "time",
      text: "Date",
      sort: true,
      formatter: (cell, row) =>
        cell ? new Date(cell).toLocaleDateString("en-US") : "",
    },
    {
      dataField: "title",
      text: "Type",
      sort: true,
    },
    {
      dataField: "user.first_name",
      text: "User Name",
      // sort: true,
      formatter: (cell, row) =>
        row.user !== null ? row.user.first_name + " " + row.user.last_name : "",
    },
    {
      dataField: "amount",
      text: "Amount",
      sort: true,
      formatter: priceFormatter,
    },
    {
      dataField: "gateway",
      text: "Gateway",
      sort: true,
      formatter: gatewayFormatter,
    },
    {
      dataField: "status",
      text: "Status",
      sort: true,
      formatter: (cell, row) => (
        <span
          className={`py-1 px-2 rounded ${
            cell === "Completed"
              ? "alert-success text-success"
              : cell === "Processing"
              ? "alert-info text-info"
              : cell === "pending"
              ? "alert-primary text-primary"
              : "alert-danger text-danger"
          }`}
        >
          {cell.toUpperCase()}
        </span>
      ),
    },
    {
      dataField: "",
      text: "Action (Mark As)",
      sort: true,
      formatter: (cell, row) => {
        return row.status === "pending" && row.gateway === "Tmoney" ? (
          <div>
            <Button
              variant="primary"
              onClick={() =>
                markAsComplete({ type: "completed", id: row.transaction_id })
              }
            >
              Complete
            </Button>
            <Button
              variant="danger"
              className="ml-2"
              onClick={() =>
                markAsComplete({ type: "rejected", id: row.transaction_id })
              }
            >
              Reject
            </Button>
          </div>
        ) : (
          <span>N/A</span>
        );
      },
    },
  ];
  //   if (!process.env.REACT_APP_BASE_URL.includes("https://ohana.africa")) {
      columns.unshift({
        dataField: "id",
        text: "ID",
        sort: true,
      });
  //   }

  const markAsComplete = async ({ type, id }) => {
    console.log("Mark as complete", type, id);
    try {
      const response = await fetch(
        `${BASE_URL}/change-status-of-transactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ idRequete: id, status: type }),
        }
      );
      const jsonData = await response.json();
      console.log("Mark as complete Api", jsonData);

      if (jsonData.status === "success") {
        await fetchPermissionsAndTransactions();
        toast.success(`Transaction marked as ${type}`);
      } else {
        console.log(`Error marking transaction as ${type} api`, jsonData);
        toast.error(`Error marking transaction as ${type}`);
      }
    } catch (error) {
      console.log("Error", error);
      toast.error(`Error marking transaction as ${type} api`);
    }
  };

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
        <>
          <div className="row" id="col-5">
            <div className="col grid-margin-xl-0 grid-margin">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                      <svg
                        width="17"
                        height="15"
                        viewBox="0 0 25 23"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.011218 8.9119C0.145867 8.62016 0.325402 8.38452 0.673246 8.32842C1.16696 8.26109 1.54847 8.62016 1.57091 9.14753C1.64945 11.2234 2.58077 12.8055 4.36488 13.8603C5.15033 14.3203 6.01433 14.5559 6.92321 14.5559C9.41422 14.5672 11.9164 14.5672 14.4075 14.5672C14.4523 14.5672 14.4972 14.5559 14.5758 14.5559C14.5758 14.455 14.5758 14.354 14.5758 14.2642C14.5758 13.2656 14.5758 12.2669 14.5758 11.2683C14.5758 10.6848 14.9909 10.3145 15.5183 10.4379C15.6978 10.4828 15.8662 10.6062 16.0008 10.7297C17.74 12.3791 19.468 14.0398 21.2072 15.6892C21.3194 15.8014 21.4429 15.9137 21.5551 16.0259C21.9703 16.4298 21.9703 16.8786 21.5551 17.2826C20.3432 18.4383 19.1314 19.5941 17.9196 20.7498C17.2575 21.3782 16.6067 22.0065 15.9447 22.6349C15.5408 23.0164 15.0022 22.994 14.7216 22.5676C14.6207 22.3993 14.5758 22.1748 14.5758 21.9729C14.5645 20.9967 14.5645 20.0205 14.5645 19.0442C14.5645 18.9545 14.5645 18.8647 14.5645 18.7413C14.4411 18.7413 14.3401 18.7413 14.2391 18.7413C12.0287 18.7301 9.81817 18.7749 7.60768 18.7076C5.38596 18.6291 3.53454 17.6865 2.0534 16.0483C0.89766 14.7691 0.224415 13.2543 0.0448824 11.5263C0.0336616 11.4702 0.0112208 11.4141 0 11.358C0.0112208 10.5389 0.011218 9.73101 0.011218 8.9119Z"
                          fill="black"
                        />
                        <path
                          d="M10.4235 8.34185C10.4235 8.44284 10.4235 8.5326 10.4235 8.63359C10.4235 9.63224 10.4235 10.6309 10.4235 11.6295C10.4235 12.213 10.0196 12.5833 9.49218 12.4599C9.32387 12.4262 9.15556 12.3028 9.02091 12.1906C7.6632 10.9114 6.3167 9.60979 4.95899 8.31941C4.45406 7.83691 3.94912 7.35442 3.44419 6.87193C3.02902 6.4792 3.02902 6.01915 3.44419 5.62642C5.30684 3.84232 7.16948 2.06944 9.03213 0.28534C9.30143 0.0272625 9.60439 -0.0849452 9.96345 0.0721455C10.3113 0.229236 10.4347 0.509755 10.4347 0.88004C10.4347 1.86747 10.4347 2.84367 10.4347 3.8311C10.4347 3.93209 10.4347 4.02185 10.4347 4.16772C10.5582 4.16772 10.6591 4.16772 10.7601 4.16772C12.9594 4.17894 15.1699 4.13406 17.3692 4.20139C19.6245 4.26871 21.5096 5.2337 22.9908 6.91681C24.3485 8.45406 25.0105 10.2718 24.9993 12.3364C24.9993 12.8077 24.9993 13.279 24.9993 13.7503C24.9993 14.2327 24.6739 14.5694 24.225 14.5694C23.7762 14.5694 23.4508 14.244 23.4396 13.7615C23.3723 11.1246 21.6555 9.01509 19.0859 8.45406C18.7269 8.37551 18.3566 8.34185 17.9975 8.33063C15.5402 8.31941 13.0828 8.33063 10.6367 8.33063C10.5694 8.33063 10.5133 8.34185 10.4235 8.34185Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="font-weight-semibold small mb-0 text-warning">
                        <Trans>Total Transaction</Trans>
                      </h6>
                      <span className="d-flex align-items-end">
                        <h6 className="font-weight-semibold mb-0">
                          $ {totalAmount.toFixed(2)}
                        </h6>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="mb-0 text-success font-weight-semibold ">
                      {/* &nbsp;<i className='mdi mdi-arrow-top-right'></i> 22.8% */}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col grid-margin-xl-0 grid-margin">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                      <svg
                        width="15"
                        height="17"
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
                        <Trans>Group Deposit</Trans>
                      </h6>
                      <span className="d-flex align-items-end">
                        <h6 className="font-weight-semibold mb-0">
                          $ {groupDeposit.toFixed(2)}
                        </h6>{" "}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="mb-0 text-success font-weight-semibold ">
                      {/* &nbsp;<i className='mdi mdi-arrow-top-right'></i> 22.8% */}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col grid-margin-xl-0 grid-margin">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                      <svg
                        width="17"
                        height="15"
                        viewBox="0 0 26 26"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M25.109 11.2293C24.9574 11.2293 24.8334 11.2293 24.7231 11.2293C22.8076 11.2293 20.892 11.2568 18.9903 11.2156C16.5372 11.1605 14.2634 12.9216 13.8913 15.4946C13.4779 18.3702 15.5037 20.7504 18.0394 21.1494C18.3563 21.2045 18.6871 21.2182 19.004 21.2182C20.9196 21.2182 22.8351 21.2182 24.7369 21.2182C24.8472 21.2182 24.9712 21.2182 25.1366 21.2182C25.0952 22.0163 25.2606 22.7868 24.9574 23.5297C24.6129 24.3965 23.9514 24.8781 23.0143 24.9744C22.8489 24.9882 22.6835 25.0019 22.5182 25.0019C15.8895 25.0019 9.2609 25.0019 2.63227 25.0019C1.35064 25.0019 0.372195 24.2865 0.0827948 23.117C0.0276711 22.8831 0.0138901 22.6354 0.0138901 22.3877C0.0138901 17.8611 0.0276744 13.3207 0.000112527 8.794C-0.0136684 7.26676 1.24039 6.16606 2.63227 6.17982C9.28847 6.20733 15.9309 6.19357 22.5871 6.19357C23.7998 6.19357 24.792 6.95031 25.0676 8.0923C25.1228 8.29868 25.1228 8.51882 25.1366 8.73896C25.1503 9.46818 25.1366 10.2112 25.1366 10.9404C25.1228 11.0229 25.109 11.1055 25.109 11.2293Z"
                          fill="black"
                        />
                        <path
                          d="M25.1074 13.7396C25.1074 15.4045 25.1074 17.0555 25.1074 18.7203C25.011 18.7341 24.9421 18.7341 24.8594 18.7341C22.8611 18.7341 20.8629 18.7478 18.8647 18.7341C17.6795 18.7341 16.6597 17.9223 16.3979 16.8078C16.0396 15.2669 17.1421 13.7534 18.7407 13.7259C20.8216 13.6846 22.9163 13.7121 24.9972 13.7121C25.0248 13.7121 25.0523 13.7259 25.1074 13.7396ZM20.0912 17.4683C20.8491 17.4683 21.3452 16.9867 21.3452 16.23C21.3452 15.487 20.8629 14.9917 20.1187 14.9917C19.4021 14.9917 18.8509 15.5283 18.8509 16.2437C18.8509 16.9867 19.3332 17.4683 20.0912 17.4683Z"
                          fill="black"
                        />
                        <path
                          d="M15.1032 0.015625C16.7155 1.62541 18.3693 3.27648 20.023 4.92755C16.7293 4.92755 13.4357 4.92755 10.2109 4.92755C11.8095 3.31776 13.4632 1.66669 15.1032 0.015625Z"
                          fill="black"
                        />
                        <path
                          d="M5.09961 4.95319C6.7671 3.28837 8.42082 1.6373 10.0608 0C10.488 0.426525 10.9289 0.880574 11.3975 1.34838C11.3562 1.38965 11.301 1.45844 11.2459 1.51347C10.1572 2.60042 9.06852 3.68737 7.97982 4.77432C7.86957 4.87063 7.70421 4.95319 7.55262 4.95319C6.73954 4.96695 5.92647 4.95319 5.09961 4.95319Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="font-weight-semibold small mb-0 text-warning">
                        <Trans>Wallet Deposit</Trans>
                      </h6>
                      <span className="d-flex align-items-end">
                        <h6 className="font-weight-semibold mb-0">
                          $ {(walletDeposit - walletWithdrawal).toFixed(2)}
                        </h6>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="mb-0 text-success font-weight-semibold ">
                      {/* &nbsp;<i className='mdi mdi-arrow-top-right'></i> 22.8% */}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col grid-margin-xl-0 grid-margin">
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
                          d="M4.37109 4.10938C5.08873 4.10938 5.76352 4.10938 6.48115 4.10938C6.48115 4.22701 6.48115 4.33394 6.48115 4.44088C6.48115 7.96982 6.48115 11.4988 6.48115 15.0277C6.48115 15.124 6.48115 15.2309 6.49186 15.3271C6.51328 15.6052 6.67395 15.7656 6.96314 15.7977C8.07708 15.9367 8.77329 16.6104 8.93395 17.7118C8.9875 18.1075 9.13746 18.2358 9.53377 18.2358C11.5153 18.2358 13.4968 18.2358 15.4676 18.2358C15.8639 18.2358 16.0139 18.1075 16.0674 17.7118C16.2174 16.6211 16.9243 15.9367 18.0382 15.7977C18.3167 15.7656 18.4774 15.6052 18.5095 15.3271C18.5202 15.2309 18.5202 15.124 18.5202 15.0277C18.5202 11.5095 18.5202 7.99122 18.5202 4.46227C18.5202 4.35534 18.5202 4.24839 18.5202 4.12007C19.2272 4.12007 19.902 4.12007 20.6303 4.12007C20.6303 4.20562 20.6303 4.29117 20.6303 4.37672C20.6303 9.48834 20.6303 14.5893 20.6303 19.7009C20.6303 20.1821 20.4589 20.3532 19.9662 20.3532C14.9963 20.3532 10.0158 20.3532 5.04588 20.3532C4.56389 20.3532 4.3818 20.1821 4.3818 19.7009C4.3818 14.5893 4.3818 9.48834 4.3818 4.37672C4.37109 4.29117 4.37109 4.20562 4.37109 4.10938Z"
                          fill="black"
                        />
                        <path
                          d="M21.6366 7.18027C21.6366 6.14297 21.6366 5.13777 21.6366 4.10047C21.8937 4.10047 22.1293 4.10047 22.3757 4.10047C22.697 4.08978 22.9005 3.90798 22.9112 3.61925C22.9219 3.31983 22.7291 3.12733 22.4078 3.10595C22.3328 3.09525 22.2578 3.10595 22.1829 3.10595C15.7242 3.10595 9.26547 3.10595 2.80678 3.10595C2.71038 3.10595 2.60327 3.10594 2.50687 3.11664C2.21768 3.15941 2.05701 3.37329 2.07843 3.65133C2.09986 3.90798 2.29265 4.10047 2.56043 4.11116C2.81749 4.12186 3.08526 4.11116 3.35304 4.11116C3.35304 5.14846 3.35304 6.15368 3.35304 7.19097C3.28877 7.20167 3.22451 7.21236 3.16024 7.21236C2.54972 7.21236 1.93919 7.24444 1.33938 7.20166C1.05018 7.18028 0.739568 7.09472 0.482505 6.94501C0.150466 6.76322 0.0112247 6.4424 0.0112247 6.05742C0.0219357 4.46405 0.0433569 2.87069 0.000513126 1.26662C-0.0209087 0.443203 0.63246 0.0475279 1.20014 0.00475279C1.28583 -0.00594098 1.37151 0.00475279 1.4572 0.00475279C8.81561 0.00475279 16.174 0.0047567 23.5324 0.0154505C23.7895 0.0154505 24.0573 0.0582242 24.2929 0.154468C24.7428 0.336262 24.9891 0.678464 24.9891 1.19177C24.9784 2.79583 24.9677 4.39989 24.9998 6.00395C25.0105 6.68836 24.4857 7.15888 23.9502 7.18027C23.179 7.21235 22.4185 7.18027 21.6366 7.18027Z"
                          fill="black"
                        />
                        <path
                          d="M12.6289 12.7309C10.3582 12.8057 8.28028 11.084 8.14104 8.571C8.01251 6.26115 9.87621 4.19726 12.2112 4.04754C14.6533 3.89783 16.7312 5.74785 16.8383 8.21811C16.9347 10.6563 15.0389 12.656 12.6289 12.7309ZM13.9678 9.62969C14.4176 9.6083 14.5569 9.35165 14.6854 9.08431C14.7497 8.94529 14.8247 8.85974 14.996 8.84905C15.2424 8.83835 15.4245 8.61378 15.4245 8.36783C15.4245 8.12187 15.2317 7.8973 14.9746 7.88661C14.8247 7.87591 14.7604 7.83313 14.6961 7.70481C14.4284 7.12734 13.8714 6.78515 13.3251 6.83861C12.6825 6.90278 12.1898 7.33052 12.0291 7.98284C11.9863 8.16464 11.9863 8.34644 11.9541 8.52823C11.9006 8.79558 11.7078 8.94529 11.5043 8.9239C11.3008 8.90251 11.1508 8.71002 11.1187 8.45337C11.0865 8.18603 11.2365 8.01492 11.3864 7.82244C11.5685 7.59787 11.5364 7.29844 11.3329 7.11665C11.1294 6.94555 10.8402 6.95625 10.6474 7.15943C10.4974 7.31983 10.3689 7.50163 10.2618 7.68342C10.1975 7.80106 10.1333 7.86522 9.98331 7.88661C9.72625 7.92938 9.55488 8.14326 9.55488 8.37852C9.55488 8.62448 9.73697 8.83835 10.0155 8.87043C10.1654 8.88112 10.2082 8.95599 10.2618 9.06292C10.5617 9.68316 11.1615 10.004 11.7935 9.88634C12.3933 9.7794 12.886 9.21263 12.961 8.571C12.9717 8.45337 12.9824 8.33574 13.0038 8.21811C13.0466 8.00424 13.1645 7.83313 13.3894 7.81174C13.625 7.80105 13.7429 7.96146 13.8178 8.17534C13.8928 8.4106 13.8178 8.60308 13.6786 8.78487C13.5501 8.95598 13.5179 9.15917 13.6465 9.33027C13.7429 9.50137 13.9035 9.57622 13.9678 9.62969Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="font-weight-semibold small mb-0 text-warning">
                        <Trans>Wallet Withdrawal</Trans>
                      </h6>
                      <span className="d-flex align-items-end">
                        <h6 className="font-weight-semibold mb-0">
                          $ {walletWithdrawal.toFixed(2)}
                        </h6>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="mb-0 text-success font-weight-semibold ">
                      {/* &nbsp;<i className='mdi mdi-arrow-top-right'></i> 22.8% */}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col grid-margin-xl-0 grid-margin">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                      <svg
                        width="17"
                        height="15"
                        viewBox="0 0 31 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.875 12.375C19.0208 12.375 19.9948 11.974 20.7969 11.1719C21.599 10.3698 22 9.39583 22 8.25C22 7.10417 21.599 6.13021 20.7969 5.32812C19.9948 4.52604 19.0208 4.125 17.875 4.125C16.7292 4.125 15.7552 4.52604 14.9531 5.32812C14.151 6.13021 13.75 7.10417 13.75 8.25C13.75 9.39583 14.151 10.3698 14.9531 11.1719C15.7552 11.974 16.7292 12.375 17.875 12.375ZM8.25 16.5C7.49375 16.5 6.84658 16.2305 6.3085 15.6915C5.7695 15.1534 5.5 14.5063 5.5 13.75V2.75C5.5 1.99375 5.7695 1.34658 6.3085 0.8085C6.84658 0.2695 7.49375 0 8.25 0H27.5C28.2563 0 28.9039 0.2695 29.4429 0.8085C29.981 1.34658 30.25 1.99375 30.25 2.75V13.75C30.25 14.5063 29.981 15.1534 29.4429 15.6915C28.9039 16.2305 28.2563 16.5 27.5 16.5H8.25ZM2.75 22C1.99375 22 1.34658 21.731 0.8085 21.1929C0.2695 20.6539 0 20.0063 0 19.25V5.5C0 5.11042 0.132 4.78363 0.396 4.51963C0.659083 4.25654 0.985417 4.125 1.375 4.125C1.76458 4.125 2.09138 4.25654 2.35538 4.51963C2.61846 4.78363 2.75 5.11042 2.75 5.5V19.25H24.75C25.1396 19.25 25.4659 19.382 25.729 19.646C25.993 19.9091 26.125 20.2354 26.125 20.625C26.125 21.0146 25.993 21.3409 25.729 21.604C25.4659 21.868 25.1396 22 24.75 22H2.75ZM8.25 5.5C9.00625 5.5 9.65342 5.2305 10.1915 4.6915C10.7305 4.15342 11 3.50625 11 2.75H8.25V5.5ZM27.5 5.5V2.75H24.75C24.75 3.50625 25.019 4.15342 25.5571 4.6915C26.0961 5.2305 26.7437 5.5 27.5 5.5ZM8.25 13.75H11C11 12.9937 10.7305 12.3461 10.1915 11.8071C9.65342 11.269 9.00625 11 8.25 11V13.75ZM24.75 13.75H27.5V11C26.7437 11 26.0961 11.269 25.5571 11.8071C25.019 12.3461 24.75 12.9937 24.75 13.75Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="font-weight-semibold small mb-0 text-warning">
                        <Trans>Pay For</Trans>
                      </h6>
                      <span className="d-flex align-items-end">
                        <h6 className="font-weight-semibold mb-0">
                          $ {payFor.toFixed(2)}
                        </h6>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="mb-0 text-success font-weight-semibold ">
                      {/* &nbsp;<i className='mdi mdi-arrow-top-right'></i> 22.8% */}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {
            <PaginationProvider
              pagination={paginationFactory({
                custom: true,
                totalSize: totalTransactions,
                page: page,
                sizePerPage: sizePerPage,
                paginationComponent: PaginationListStandalone,
              })}
              keyField="id"
              columns={columns}
              data={transactions}
            >
              {({ paginationProps, paginationTableProps }) => (
                <ToolkitProvider
                  keyField="id"
                  columns={columns}
                  data={transactions}
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
                              onChange={(e) => transactionTypeChange(e)}
                            >
                              {/* <option disabled selected value="">Filter</option> */}
                              <option value="">All</option>
                              {transactionType.map((type, index) => (
                                <option value={type} key={index}>
                                  {type}
                                </option>
                              ))}
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
                                    viewBox="0 0 25 23"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M0.011218 8.9119C0.145867 8.62016 0.325402 8.38452 0.673246 8.32842C1.16696 8.26109 1.54847 8.62016 1.57091 9.14753C1.64945 11.2234 2.58077 12.8055 4.36488 13.8603C5.15033 14.3203 6.01433 14.5559 6.92321 14.5559C9.41422 14.5672 11.9164 14.5672 14.4075 14.5672C14.4523 14.5672 14.4972 14.5559 14.5758 14.5559C14.5758 14.455 14.5758 14.354 14.5758 14.2642C14.5758 13.2656 14.5758 12.2669 14.5758 11.2683C14.5758 10.6848 14.9909 10.3145 15.5183 10.4379C15.6978 10.4828 15.8662 10.6062 16.0008 10.7297C17.74 12.3791 19.468 14.0398 21.2072 15.6892C21.3194 15.8014 21.4429 15.9137 21.5551 16.0259C21.9703 16.4298 21.9703 16.8786 21.5551 17.2826C20.3432 18.4383 19.1314 19.5941 17.9196 20.7498C17.2575 21.3782 16.6067 22.0065 15.9447 22.6349C15.5408 23.0164 15.0022 22.994 14.7216 22.5676C14.6207 22.3993 14.5758 22.1748 14.5758 21.9729C14.5645 20.9967 14.5645 20.0205 14.5645 19.0442C14.5645 18.9545 14.5645 18.8647 14.5645 18.7413C14.4411 18.7413 14.3401 18.7413 14.2391 18.7413C12.0287 18.7301 9.81817 18.7749 7.60768 18.7076C5.38596 18.6291 3.53454 17.6865 2.0534 16.0483C0.89766 14.7691 0.224415 13.2543 0.0448824 11.5263C0.0336616 11.4702 0.0112208 11.4141 0 11.358C0.0112208 10.5389 0.011218 9.73101 0.011218 8.9119Z"
                                      fill="black"
                                    />
                                    <path
                                      d="M10.4235 8.34185C10.4235 8.44284 10.4235 8.5326 10.4235 8.63359C10.4235 9.63224 10.4235 10.6309 10.4235 11.6295C10.4235 12.213 10.0196 12.5833 9.49218 12.4599C9.32387 12.4262 9.15556 12.3028 9.02091 12.1906C7.6632 10.9114 6.3167 9.60979 4.95899 8.31941C4.45406 7.83691 3.94912 7.35442 3.44419 6.87193C3.02902 6.4792 3.02902 6.01915 3.44419 5.62642C5.30684 3.84232 7.16948 2.06944 9.03213 0.28534C9.30143 0.0272625 9.60439 -0.0849452 9.96345 0.0721455C10.3113 0.229236 10.4347 0.509755 10.4347 0.88004C10.4347 1.86747 10.4347 2.84367 10.4347 3.8311C10.4347 3.93209 10.4347 4.02185 10.4347 4.16772C10.5582 4.16772 10.6591 4.16772 10.7601 4.16772C12.9594 4.17894 15.1699 4.13406 17.3692 4.20139C19.6245 4.26871 21.5096 5.2337 22.9908 6.91681C24.3485 8.45406 25.0105 10.2718 24.9993 12.3364C24.9993 12.8077 24.9993 13.279 24.9993 13.7503C24.9993 14.2327 24.6739 14.5694 24.225 14.5694C23.7762 14.5694 23.4508 14.244 23.4396 13.7615C23.3723 11.1246 21.6555 9.01509 19.0859 8.45406C18.7269 8.37551 18.3566 8.34185 17.9975 8.33063C15.5402 8.31941 13.0828 8.33063 10.6367 8.33063C10.5694 8.33063 10.5133 8.34185 10.4235 8.34185Z"
                                      fill="black"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <h6 className="font-weight-semibold mb-0 text-warning">
                                    Transactions
                                  </h6>
                                </div>
                              </div>
                              <div className="table-responsive">
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
                          <div className="col pl-0">
                            <SizePerPageDropdownStandalone
                              {...paginationProps}
                            />
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
          }
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
export default Transactions;
