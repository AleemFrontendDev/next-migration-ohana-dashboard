'use client'
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "./stylesheet.css";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Chart from "react-apexcharts";
import SemiCircleProgressBar from "react-progressbar-semicircle";
import Link from "next/link";
import { Trans } from "react-i18next";
import moment from "moment";
import useInterval, { ROUTES, BASE_URL } from "@/utils/common";
import Spinner from "@/components/Spinner/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import TopGroups from "../../components/Dashboard/TopGroup/TopGroup";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { useAuthToken } from "@/utils/useAuthToken";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const Dashboard = () => {
  const authToken = useAuthToken();
  const [totalGroups, setTotalGroups] = useState([]);
  const [totalAmount, setTotalAmount] = useState([0]);
  const [feeCalculated, setTotalCalculated] = useState([0]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [pools, setPools] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [transactionsType, setTransactionsType] = useState([]);
  const [transactionsGateway, setTransactionsGateway] = useState([]);
  const [transactionsGatewayGroups, setTransactionsGatewayGroups] = useState(
    []
  );
  const [deposit, setDeposit] = useState(0);
  const [withdraw, setWithdraw] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [depositPercentage, setDepositPercentage] = useState({
    decrement: 0,
    increment: 0,
  });
  const [withdrawPercentage, setWithdrawPercentage] = useState({
    decrement: 0,
    increment: 0,
  });
  const [revenuePercentage, setRevenuePercentage] = useState({
    decrement: 0,
    increment: 0,
  });
  const [previousSixMonthsDepositTotal, setPreviousSixMonthsDepositTotal] =
    useState();
  const [previousSixMonthsWithdrawTotal, setPreviousSixMonthsWithdrawTotal] =
    useState();
  const [previousSixMonthsRevenueTotal, setPreviousSixMonthsRevenueTotal] =
    useState();
  const [depositGradient, setDepositGradient] = useState([]);
  const [withdrawalGradient, setWithdrawalGradient] = useState([]);
  const [revenueGradient, setRevenueGradient] = useState([]);
  const [previousSixMonths, setPreviousSixMonths] = useState([]);
  const [key, setKey] = useState("all");
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const { country } = useCountry();
  const [areaOptions, setAreaOptions] = useState({
    responsive: true,
    animation: {
      animateScale: true,
      animateRotate: true,
    },
    elements: {
      point: {
        radius: 3,
      },
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    plugins: {
      legend: {
        display: false, // Legend display setting
      },
      filler: {
        propagate: true,
      },
    },
    scales: {
      x: {
        display: true,
        ticks: {
          display: true,
          beginAtZero: false,
        },
        grid: {
          drawBorder: false,
          color: "#f8f8f8",
          zeroLineColor: "#f8f8f8",
        },
      },
      y: {
        ticks: {
          callback: function (value) {
            if (value >= 1_000_000_000) return value / 1_000_000_000 + "B";
            if (value >= 1_000_000) return value / 1_000_000 + "M";
            if (value >= 1_000) return value / 1_000 + "K";
            return value;
          },
          min: 0,
          fontColor: "#8b9298",
          beginAtZero: true,
        },
        grid: {
          color: "#f8f8f8",
          zeroLineColor: "#f8f8f8",
          display: true,
          drawBorder: true,
        },
      },
    },
  });

  const { user } = useUser();
  const fetchPermissions = async () => {
    const response = await fetch(`${BASE_URL}/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`, 
        "x-api-key": "Ohana-Agent-oo73",       
      },
    });

    const jsonData = await response.json();
    if (jsonData.success) {
      setDeposit(jsonData.depositGraph.grandTotal);
      setWithdraw(jsonData.withdrawGraph.grandTotal);
      setPreviousSixMonthsWithdrawTotal(jsonData.withdrawGraph.datasets);
      setGroups(jsonData.topGroups);
      setPreviousSixMonthsDepositTotal(jsonData.depositGraph.datasets);
      setUsers(jsonData.totalUsers);
      setActiveUsers(jsonData.totalActiveUsers);
      setPools(jsonData.totalPools);
      setTransactions(jsonData.transactions);
      setTransactionsType(jsonData.transactionType);
      setTransactionsGateway(
        jsonData.transactionChannels.map((channel) => channel.gateway)
      );
      setTransactionsGatewayGroups(
        jsonData.transactionChannels.map((channel) => channel.count)
      );
      setTotalGroups(jsonData.totalGroups);
      setCountries(jsonData.topCountries);
      const transactionList = jsonData.allTransactions;

      const row = [];
      const rows = [];
      const rowsss = [0];
      let groupedDeposit = [];
      transactionList.map((type, index) => {
        if (index > 0) {
          if (!row.includes(type.title) && index < 10) {
            row.push(type.title);
          }
          if (type.gateway) {
            if (
              !rows.includes(
                type.gateway.charAt(0).toUpperCase() + type.gateway.slice(1)
              )
            ) {
              rows.push(
                type.gateway.charAt(0).toUpperCase() + type.gateway.slice(1)
              );
            }
          }
        } else {
          row.push(type.title);
          if (type.gateway) {
            rows.push(
              type.gateway.charAt(0).toUpperCase() + type.gateway.slice(1)
            );
          }
        }
        if (type.status == "Completed") {
          rowsss.push(
            // type.amount * (type.rates ? JSON.parse(type.rates).USD.rate : 1)
            totalAmount
          );
          const date = new Date(type.time);
          const mes = date.getMonth() + 1;

          if (typeof groupedDeposit[+mes] == "undefined") {
            groupedDeposit[+mes] = 0;
          } else {
            try {
              groupedDeposit[+mes] =
                parseFloat(groupedDeposit[+mes]) +
                parseFloat(
                  type.amount *
                    (type.rates ? JSON.parse(type.rates).USD.rate : 1)
                  // totalAmount
                );
            } catch (error) {
              groupedDeposit[+mes] = 0;
            }
          }
        }
      });
      setTransactionsType(row);
      // setTransactionsGateway(rows);
      const currentWeekDepositAmount =
        groupedDeposit[groupedDeposit.length - 1] ?? 0;
      const previousWeekDepositAmount =
        groupedDeposit[groupedDeposit.length - 2] ?? 0;
      var decrement = 0;
      var increment = 0;
      if (previousWeekDepositAmount != 0 || currentWeekDepositAmount != 0) {
        if (previousWeekDepositAmount > currentWeekDepositAmount) {
          decrement = (
            ((previousWeekDepositAmount - currentWeekDepositAmount) * 100) /
            previousWeekDepositAmount
          ).toFixed(1);
        } else {
          increment = (
            ((currentWeekDepositAmount - previousWeekDepositAmount) * 100) /
            currentWeekDepositAmount
          ).toFixed(1);
        }
      }


      const arraygroups = transactionList
        .filter((doc) => doc.status == "Completed")
        .reduce((group, trans) => {
          const { gateway } = trans;
          group[gateway.charAt(0).toUpperCase() + gateway.slice(1)] =
            group[gateway.charAt(0).toUpperCase() + gateway.slice(1)] ?? [];
          group[gateway.charAt(0).toUpperCase() + gateway.slice(1)].push(trans);
          return group;
        }, {});

      const rowss = [];
      rows.map((val) => {
        rowss.push(arraygroups[val]?.length);
      });
      // setTransactionsGatewayGroups(rowss);

      const rowssss = [0];
      let groupedRevenue = [];
      transactionList.map((deposit) => {
        if (deposit.status == "Completed") {
          rowssss.push(
            (deposit.processing_fee ? deposit.processing_fee : 0) *
              (Object.keys(JSON.parse(deposit.rates)).length
                ? JSON.parse(deposit.rates).USD.rate
                : 1)
          );
          const date = new Date(deposit.time);
          const mes = date.getMonth() + 1;
          if (typeof groupedRevenue[+mes] == "undefined")
            groupedRevenue[+mes] = 0;
          groupedRevenue[+mes] =
            groupedRevenue[+mes] +
            (deposit.processing_fee ? deposit.processing_fee : 0) *
              (Object.keys(JSON.parse(deposit.rates)).length
                ? JSON.parse(deposit.rates).USD.rate
                : 1);
        }
      });
      const currentWeekRevenueAmount =
        groupedRevenue[groupedRevenue.length - 1] ?? 0;
      const previousWeekRevenueAmount =
        groupedRevenue[groupedRevenue.length - 2] ?? 0;
      var decrement = 0;
      var increment = 0;
      if (previousWeekRevenueAmount != 0 || currentWeekRevenueAmount != 0) {
        if (previousWeekRevenueAmount > currentWeekRevenueAmount) {
          decrement = (
            ((previousWeekRevenueAmount - currentWeekRevenueAmount) * 100) /
            previousWeekRevenueAmount
          ).toFixed(1);
        } else {
          increment = (
            ((currentWeekRevenueAmount - previousWeekRevenueAmount) * 100) /
            currentWeekRevenueAmount
          ).toFixed(1);
        }
      }
      setRevenuePercentage({ decrement: decrement, increment: increment });
      setRevenue(rowssss.reduce((a, b) => a + b));
      var arrayGroupedRevenue = Array.from(groupedRevenue, (item) =>
        typeof item === "undefined" || item < 0 ? 0 : item
      ).slice(-6);
      setPreviousSixMonthsRevenueTotal(
        // typeof feeCalculated === 'number' ? feeCalculated.toFixed
        // arrayGroupedRevenue.map((item) => item.toFixed(2))
        arrayGroupedRevenue.map((item) => item.toFixed(2))
      );

      const rowsssss = [0];
      let groupedWithdraw = [];
      transactionList.map((withdraw) => {
        if (withdraw.status == "Completed" && withdraw?.type == "withdraw") {
          rowsssss.push(
            withdraw?.amount *
              (withdraw?.rates ? JSON.parse(withdraw?.rates)?.USD?.rate : 1)
          );
          const date = new Date(withdraw.time);
          const mes = date.getMonth() + 1;
          if (typeof groupedWithdraw[+mes] == "undefined")
            groupedWithdraw[+mes] = 0;
          groupedWithdraw[+mes] =
            parseFloat(groupedWithdraw[+mes]) +
            parseFloat(
              withdraw.amount *
                (withdraw?.rates ? JSON.parse(withdraw?.rates)?.USD?.rate : 1)
            );
        }
      });
      const currentWeekWithdrawalAmount =
        groupedWithdraw[groupedWithdraw.length - 1] ?? 0;
      const previousWeekWithdrawalAmount =
        groupedWithdraw[groupedWithdraw.length - 2] ?? 0;
      var decrement = 0;
      var increment = 0;
      if (
        previousWeekWithdrawalAmount != 0 ||
        currentWeekWithdrawalAmount != 0
      ) {
        if (previousWeekWithdrawalAmount > currentWeekWithdrawalAmount) {
          decrement = (
            ((previousWeekWithdrawalAmount - currentWeekWithdrawalAmount) *
              100) /
            previousWeekWithdrawalAmount
          ).toFixed(1);
        } else {
          increment = (
            ((currentWeekWithdrawalAmount - previousWeekWithdrawalAmount) *
              100) /
            currentWeekWithdrawalAmount
          ).toFixed(1);
        }
      }
      setSpinner(false);
    }
    if (user || !user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
    } else {
      var groupPermission = user.role.permissions.filter(
        (permission) => permission.section === "Dashboard"
      );
      if (groupPermission.length && groupPermission[0].status) {
        setPermissions(...groupPermission);
      }
    }
  };

  useEffect(() => {
    if (!authToken) return;
    fetchPermissions();

    const previousSixMonths = (function () {
      let n = 0;
      let arRet = [];
      for (; n < 6; n++)
        arRet.push(moment().subtract(n, "months").format("MMMM"));
      return arRet;
    })();
    setPreviousSixMonths(previousSixMonths.reverse());
  }, [authToken, country]);

  useInterval(fetchPermissions, 20000, 5);

  const fetchPermissionsAndTransactions = async () => {
    const response = await fetch(`${BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`, 
        "x-api-key": "Ohana-Agent-oo73",       
      },
      body: JSON.stringify(),
    });
    const jsonData = await response.json();
    if (jsonData.success) {
      setSpinner(false);
      // setTotalTransactions(jsonData.transactions.total);
      var finalAmount = 0;
      const usdRate = localStorage.getItem("usd_rates");
      var feeCalculated = 0;
      jsonData.totalTransactions.forEach((type, index) => {
        var amount = type.amount;
        var service_fee = type.service_fee;
        var processing_fee = type.processing_fee;
        var currency = type.currency;
        let parsedUsdRate = usdRate ? JSON.parse(usdRate) : null;
        var currentRate = parsedUsdRate?.rates?.[currency]?.rate || 1;
        var calculated = 0;
        if (type.status == "Completed") {
          if (currency !== "USD") {
            calculated = amount / currentRate;
          } else {
            calculated = amount;
          }
        }

        if (type.status == "Completed") {

          let transactionTotal =
            parseFloat(service_fee) + parseFloat(processing_fee);
          let calAmount = transactionTotal / currentRate;
          feeCalculated += calAmount;
        }
        finalAmount += calculated;
      });
      setTotalAmount(finalAmount);
      setTotalCalculated(feeCalculated);
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
  };

  useEffect(() => {
    fetchPermissionsAndTransactions();
  }, [country]);

  useInterval(fetchPermissionsAndTransactions, 20000, 5);

  useEffect(() => {
    if (permissions) {
      setTimeout(function async() {
        const ctx = document.getElementById("deposit")?.getContext("2d");
        const gradientBar = ctx?.createLinearGradient(0, 0, 0, 450);
        gradientBar?.addColorStop(0.5, "rgba(255,255,255, 0.2)");
        gradientBar?.addColorStop(0, "rgba(153, 198, 93, 0.8)");
        setDepositGradient(gradientBar);

        const ctx1 = document.getElementById("withdrawal")?.getContext("2d");
        const gradientBar1 = ctx1?.createLinearGradient(0, 0, 0, 450);
        gradientBar1?.addColorStop(0.5, "rgba(255,255,255, 0.2)");
        gradientBar1?.addColorStop(0, "rgba(98, 146, 173, 0.8");
        setWithdrawalGradient(gradientBar1);

        const ctx2 = document.getElementById("revenue")?.getContext("2d");
        const gradientBar2 = ctx2?.createLinearGradient(0, 0, 0, 450);
        gradientBar2?.addColorStop(0.5, "rgba(255,255,255, 0.2)");
        gradientBar2?.addColorStop(0, "rgba(244, 91, 80, 0.8)");
        setRevenueGradient(gradientBar2);
      }, 2000);
    }
  }, [permissions]);

  const areaData = (border, background, data) => {
    return {
      labels: previousSixMonths,
      datasets: [
        {
          label: "$",
          data: data,
          backgroundColor: background,
          borderColor: border,
          borderWidth: 1,
        },
      ],
    };
  };

  const runCallback = (cb) => {
    return cb();
  };


  return (
    <>
    { permissions && !spinner ? (
      <div className="dashboard md:px-3">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="row">
              <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin mb-3 mt-m-0">
                <div className="card">
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
                        <h6 className="font-weight-semibold mb-0 text-warning">
                          <Trans>Deposit</Trans>
                        </h6>
                        <span className="d-flex align-items-end">
                          <h6 className="font-weight-semibold mb-0">
                            $ {Number(totalAmount).toFixed(2)}
                            {/* $ {totalAmount.toFixed(2)} */}
                            {/* $ {deposit.toFixed(2)} */}
                          </h6>
                          <p
                            className={
                              depositPercentage.decrement !== 0
                                ? "mb-0 font-weight-semibold text-danger"
                                : "mb-0 font-weight-semibold text-success"
                            }
                          >
                            &nbsp;
                            <i
                              className={
                                depositPercentage.decrement !== 0
                                  ? "mdi mdi-arrow-bottom-left"
                                  : "mdi mdi-arrow-top-right"
                              }
                            ></i>{" "}
                            {depositPercentage.decrement !== 0
                              ? depositPercentage.decrement
                              : depositPercentage.increment}
                            %
                          </p>
                        </span>
                      </div>
                    </div>
                    <Line
                      data={areaData(
                        "rgba(153, 198, 93, 1)",
                        depositGradient,
                        previousSixMonthsDepositTotal
                      )}
                      options={areaOptions}
                      width={200}
                      id="deposit"
                    />
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin mb-3 mt-m-0">
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
                        <h6 className="font-weight-semibold mb-0 text-warning">
                          <Trans>Withdrawal</Trans>
                        </h6>
                        <span className="d-flex align-items-end">
                          <h6 className="font-weight-semibold mb-0">
                            $ {withdraw.toFixed(2)}
                          </h6>
                          <p
                            className={
                              withdrawPercentage.decrement !== 0
                                ? "mb-0 font-weight-semibold text-danger"
                                : "mb-0 font-weight-semibold text-success"
                            }
                          >
                            &nbsp;
                            <i
                              className={
                                withdrawPercentage.decrement !== 0
                                  ? "mdi mdi-arrow-bottom-left"
                                  : "mdi mdi-arrow-top-right"
                              }
                            ></i>{" "}
                            {withdrawPercentage.decrement !== 0
                              ? withdrawPercentage.decrement
                              : withdrawPercentage.increment}
                            %
                          </p>
                        </span>
                      </div>
                    </div>
                    <Line
                      data={areaData(
                        "rgba(98, 146, 173, 1)",
                        withdrawalGradient,
                        previousSixMonthsWithdrawTotal
                      )}
                      options={areaOptions}
                      width={200}
                      id="withdrawal"
                    />
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin mb-3 mt-m-0">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                        <svg
                          width="17"
                          height="15"
                          viewBox="0 0 25 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M24.9935 16.9271C24.987 16.9336 24.9739 16.9336 24.9739 16.9401C24.5238 17.8598 23.7868 17.9837 23.0562 17.2532C22.6648 16.8618 22.28 16.4705 21.8756 16.0726C21.7973 16.1508 21.7321 16.203 21.6669 16.2682C20.1144 17.8207 18.562 19.3731 17.0096 20.9255C16.4226 21.5126 15.8616 21.5126 15.2811 20.932C14.1852 19.8362 13.0894 18.7469 12.0066 17.6511C11.8631 17.5011 11.7653 17.5011 11.6022 17.6054C8.30822 19.6536 5.01422 21.6887 1.72021 23.7303C1.43321 23.9064 1.13316 24.0173 0.800502 23.9325C0.363476 23.8216 0.0895192 23.5281 0.0177687 23.0911C-0.0605046 22.628 0.122133 22.2627 0.520023 22.0148C1.38755 21.4734 2.2616 20.9386 3.12913 20.3972C5.82956 18.7273 8.52999 17.051 11.2304 15.3812C11.9023 14.9637 12.3132 15.0094 12.8742 15.5703C13.9569 16.6531 15.0332 17.7359 16.0964 18.7926C17.5053 17.3836 18.9143 15.9747 20.3427 14.5528C20.3297 14.5397 20.2906 14.4875 20.2384 14.4353C19.8601 14.057 19.4752 13.6787 19.1034 13.2939C18.7447 12.9286 18.6468 12.5046 18.836 12.0937C19.0382 11.6566 19.3839 11.461 19.8666 11.461C21.1255 11.4675 22.3909 11.4871 23.6498 11.4544C24.289 11.4349 24.7521 11.6306 25 12.2437C24.9935 13.8026 24.9935 15.3616 24.9935 16.9271Z"
                            fill="black"
                          />
                          <path
                            d="M15.098 15.9773C14.6219 15.4947 14.1522 15.0185 13.6761 14.5358C13.3108 14.164 12.8803 13.9292 12.365 13.8444C11.7323 13.7335 11.1583 13.89 10.6234 14.2292C9.25362 15.0968 7.88384 15.9512 6.52058 16.8188C6.36404 16.9166 6.24663 16.9231 6.07703 16.8383C3.3766 15.5012 1.70677 13.3552 1.18495 10.4004C0.4544 6.30406 2.55473 2.4491 6.35099 0.740131C9.80154 -0.812289 14.0674 0.140036 16.533 3.01006C18.0985 4.82339 18.8617 6.93025 18.7247 9.31758C18.5747 12.0376 17.3614 14.2292 15.222 15.9056C15.1959 15.9252 15.1633 15.9382 15.098 15.9773ZM9.11665 12.4942C9.11665 12.7812 9.11012 13.0421 9.11665 13.2965C9.12317 13.7074 9.43626 14.0335 9.82763 14.0531C10.2581 14.0727 10.6038 13.7922 10.6495 13.3617C10.6691 13.1595 10.6756 12.9573 10.656 12.7551C10.6365 12.5398 10.7017 12.4485 10.9235 12.3898C11.8888 12.1093 12.5411 11.1766 12.4889 10.1982C12.4367 9.17408 11.7192 8.3196 10.7212 8.14348C10.3495 8.07825 9.95808 8.09782 9.57976 8.0913C9.14274 8.07825 8.83617 7.8043 8.83617 7.41945C8.84269 7.04113 9.13621 6.78022 9.57324 6.78022C10.2581 6.78022 10.943 6.78022 11.6214 6.78022C11.8758 6.78022 12.1041 6.71499 12.2802 6.51931C12.4889 6.27797 12.5541 6.00401 12.4237 5.70396C12.2867 5.39087 12.0323 5.2278 11.6931 5.22128C11.354 5.21476 11.0148 5.22128 10.6495 5.22128C10.6495 4.92123 10.6625 4.6538 10.643 4.38636C10.6104 3.95586 10.2451 3.63624 9.84067 3.66234C9.42322 3.68843 9.11012 4.02109 9.1036 4.45159C9.09708 4.71903 9.1036 4.98646 9.1036 5.25389C9.00576 5.27998 8.92749 5.29955 8.84921 5.32564C7.80557 5.63874 7.17938 6.61715 7.29679 7.75864C7.40116 8.73705 8.28173 9.55892 9.30581 9.63068C9.65151 9.65677 10.0037 9.6372 10.356 9.66329C10.6821 9.68938 10.9104 9.96986 10.9104 10.296C10.9104 10.6287 10.6886 10.8961 10.3625 10.9352C10.2516 10.9483 10.1342 10.9483 10.0233 10.9548C9.34494 10.9613 8.6731 10.9418 7.99473 10.9678C7.5577 10.9809 7.25766 11.3396 7.2707 11.7636C7.28375 12.1876 7.60989 12.5007 8.04691 12.5072C8.40566 12.4942 8.73833 12.4942 9.11665 12.4942Z"
                            fill="black"
                          />
                        </svg>
                      </div>
                      <div>
                        <h6 className="font-weight-semibold mb-0 text-warning">
                          Revenue
                        </h6>
                        <span className="d-flex align-items-end">
                          <h6 className="font-weight-semibold mb-0">
                            $ {Number(feeCalculated).toFixed(2)}
                            {/* $ {feeCalculated.toFixed(2)} */}
                            {/* $ {revenue.toFixed(2)} */}
                          </h6>
                          <p
                            className={
                              revenuePercentage.decrement !== 0
                                ? "mb-0 font-weight-semibold text-danger"
                                : "mb-0 font-weight-semibold text-success"
                            }
                          >
                            &nbsp;
                            <i
                              className={
                                revenuePercentage.decrement !== 0
                                  ? "mdi mdi-arrow-bottom-left"
                                  : "mdi mdi-arrow-top-right"
                              }
                            ></i>{" "}
                            {revenuePercentage.decrement !== 0
                              ? revenuePercentage.decrement
                              : revenuePercentage.increment}
                            %
                          </p>
                        </span>
                      </div>
                    </div>
                    <Line
                      data={areaData(
                        "rgba(244, 91, 80, 1)",
                        revenueGradient,
                        previousSixMonthsRevenueTotal
                      )}
                      options={areaOptions}
                      width={200}
                      id="revenue"
                    />
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin mb-3 mt-m-0">
                <div className="card" style={{ height: "100%" }}>
                  <div className="card-body">
                    <div className="d-flex mb-2">
                      <div className="d-flex" style={{ width: "150px" }}>
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
                              d="M13.4499 4.74283C13.4809 7.2941 11.3649 9.47503 8.82576 9.4956C6.11112 9.52647 3.94353 7.4587 3.91257 4.81484C3.8816 2.22242 6.0079 0.0312015 8.56771 0.000339318C11.2824 -0.0305229 13.419 2.04753 13.4499 4.74283Z"
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
                        <div className="wrapper">
                          <p className="mb-n1 small">Total Users</p>
                          <p className="mb-0 text-success small">
                            {/* &nbsp;<i className='mdi mdi-arrow-top-right'></i> 22.8% */}
                          </p>
                        </div>
                      </div>
                      <span className="mr-2">:</span>
                      <small className="font-weight-bold">{users}</small>
                    </div>
                    <div className="d-flex pt-2 mb-2">
                      <div className="d-flex" style={{ width: "150px" }}>
                        <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                          <svg
                            width="17"
                            height="15"
                            viewBox="0 0 26 25"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.59825 13.0493C9.68757 15.9702 14.9558 16.3481 18.485 13.0391C19.9683 13.8357 21.2367 14.8876 22.2904 16.2051C24.101 18.4725 25.0319 21.0666 25.0524 23.9671C25.0524 24.6106 24.6636 24.9987 24.0294 24.9987C16.3572 24.9987 8.68507 24.9987 1.02314 24.9987C0.39914 24.9987 -0.010042 24.6003 0.000187499 23.9978C0.122942 19.1874 2.30184 15.5821 6.41411 13.1106C6.4448 13.0901 6.48572 13.0697 6.51641 13.0595C6.5471 13.0697 6.56756 13.0595 6.59825 13.0493Z"
                              fill="black"
                            />
                            <path
                              d="M19.2721 6.72026C19.2721 10.3561 16.1623 13.4711 12.5206 13.4711C8.78679 13.4711 5.7793 10.4583 5.7793 6.72026C5.7793 3.01288 8.79702 0 12.5206 0C16.2544 0.0102132 19.2721 3.01288 19.2721 6.72026Z"
                              fill="black"
                            />
                          </svg>
                        </div>
                        <div className="wrapper">
                          <p className="mb-n1 small">Activate Users</p>
                          <p className="mb-0 text-success small">
                            {/* &nbsp;<i className='mdi mdi-arrow-top-right'></i> 22.8% */}
                          </p>
                        </div>
                      </div>
                      <span className="mr-2">:</span>
                      <small className="font-weight-bold">
                        {activeUsers}
                      </small>
                    </div>
                    <div className="d-flex pt-2 mb-2">
                      <div className="d-flex" style={{ width: "150px" }}>
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
                        <div className="wrapper">
                          <p className="mb-n1 small">Groups</p>
                          <p className="mb-0 text-success small">
                            {/* &nbsp;<i className='mdi mdi-arrow-top-right'></i> 22.8% */}
                          </p>
                        </div>
                      </div>
                      <span className="mr-2">:</span>
                      <small className="font-weight-bold">
                        {totalGroups}
                      </small>
                    </div>
                    <div className="d-flex pt-2 mb-2">
                      <div className="d-flex" style={{ width: "150px" }}>
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
                        <div className="wrapper">
                          <p className="mb-n1 small">Pools</p>
                          <p className="mb-0 text-success small">
                            {/* &nbsp;<i className='mdi mdi-arrow-top-right'></i> 22.8% */}
                          </p>
                        </div>
                      </div>
                      <span className="mr-2">:</span>
                      <small className="font-weight-bold">{pools}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          {/* Transaction Section */}
          <div className="col-md-5 grid-margin stretch-card mb-3 mt-m-0">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between">
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
                          d="M0.011218 8.9119C0.145867 8.62016 0.325402 8.38452 0.673246 8.32842C1.16696 8.26109 1.54847 8.62016 1.57091 9.14753C1.64945 11.2234 2.58077 12.8055 4.36488 13.8603C5.15033 14.3203 6.01433 14.5559 6.92321 14.5559C9.41422 14.5672 11.9164 14.5672 14.4075 14.5672C14.4523 14.5672 14.4972 14.5559 14.5758 14.5559C14.5758 14.455 14.5758 14.354 14.5758 14.2642C14.5758 13.2656 14.5758 12.2669 14.5758 11.2683C14.5758 10.6848 14.9909 10.3145 15.5183 10.4379C15.6978 10.4828 15.8662 10.6062 16.0008 10.7297C17.74 12.3791 19.468 14.0398 21.2072 15.6892C21.3195 15.8014 21.4429 15.9137 21.5551 16.0259C21.9703 16.4298 21.9703 16.8786 21.5551 17.2826C20.3432 18.4383 19.1314 19.5941 17.9196 20.7498C17.2575 21.3782 16.6067 22.0065 15.9447 22.6349C15.5408 23.0164 15.0022 22.994 14.7216 22.5676C14.6207 22.3993 14.5758 22.1748 14.5758 21.9729C14.5645 20.9967 14.5645 20.0205 14.5645 19.0442C14.5645 18.9545 14.5645 18.8647 14.5645 18.7413C14.4411 18.7413 14.3401 18.7413 14.2391 18.7413C12.0287 18.7301 9.81817 18.7749 7.60768 18.7076C5.38596 18.6291 3.53454 17.6865 2.0534 16.0483C0.89766 14.7691 0.224415 13.2543 0.0448824 11.5263C0.0336616 11.4702 0.0112208 11.4141 0 11.358C0.0112208 10.5389 0.011218 9.73101 0.011218 8.9119Z"
                          fill="black"
                        />
                        <path
                          d="M10.4235 8.34185C10.4235 8.44283 10.4235 8.5326 10.4235 8.63359C10.4235 9.63224 10.4235 10.6309 10.4235 11.6295C10.4235 12.213 10.0196 12.5833 9.49218 12.4599C9.32387 12.4262 9.15556 12.3028 9.02091 12.1906C7.6632 10.9114 6.3167 9.60979 4.95899 8.31941C4.45406 7.83691 3.94912 7.35442 3.44419 6.87193C3.02902 6.4792 3.02902 6.01915 3.44419 5.62642C5.30684 3.84232 7.16948 2.06944 9.03213 0.28534C9.30143 0.0272625 9.60439 -0.0849452 9.96345 0.0721455C10.3113 0.229236 10.4347 0.509755 10.4347 0.88004C10.4347 1.86747 10.4347 2.84367 10.4347 3.8311C10.4347 3.93209 10.4347 4.02185 10.4347 4.16772C10.5582 4.16772 10.6591 4.16772 10.7601 4.16772C12.9594 4.17895 15.1699 4.13406 17.3692 4.20139C19.6245 4.26871 21.5096 5.2337 22.9908 6.91681C24.3485 8.45406 25.0105 10.2718 24.9993 12.3364C24.9993 12.8077 24.9993 13.279 24.9993 13.7503C24.9993 14.2327 24.6739 14.5694 24.225 14.5694C23.7762 14.5694 23.4508 14.244 23.4396 13.7615C23.3723 11.1246 21.6555 9.01509 19.0859 8.45406C18.7269 8.37551 18.3566 8.34185 17.9975 8.33063C15.5402 8.31941 13.0828 8.33063 10.6367 8.33063C10.5694 8.33063 10.5133 8.34185 10.4235 8.34185Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="font-weight-semibold mb-0 text-dark">
                        Transactions
                      </h6>
                    </div>
                  </div>
                  <Link className="nav-link" href={ROUTES.transactions}>
                    <small>
                      <Trans>See All</Trans>
                    </small>
                  </Link>
                </div>
                <Tabs
                  id="controlled-tab-example"
                  activeKey={key}
                  onSelect={(k) => setKey(k)}
                  className="mb-3"
                >
                  <Tab eventKey="all" title="All">
                    <div className="table-responsive boderless">
                      <table className="table">
                        <tbody>
                          {runCallback(() => {
                            const row = [];
                            transactions.map((titleContent) => {
                              row.push(
                                <tr key={titleContent.time}>
                                  <td style={{ padding: "4px 13px 2px 8px" }}>
                                    <div className="icon-holder alert-success text-success py-2 px-2 rounded mr-2">
                                      <i className="mdi mdi-arrow-top-right icon-sm"></i>
                                    </div>
                                  </td>
                                  <td style={{ padding: "4px 13px 2px 8px" }}>
                                    <p className="mb-n1 small text-muted">
                                      {titleContent.title}
                                    </p>
                                    <p className="mt-2 small font-weight-bold">
                                      {titleContent.amount}{" "}
                                      {titleContent.currency}
                                    </p>
                                  </td>
                                  <td style={{ padding: "4px 13px 2px 8px" }}>
                                    <p className="mb-n1 small text-muted">
                                      Date
                                    </p>
                                    <p className="mt-2 small font-weight-bold">
                                      {new Date(
                                        titleContent.time
                                      ).toLocaleDateString("en-US")}
                                    </p>
                                  </td>
                                  <td style={{ padding: "4px 13px 2px 8px" }}>
                                    <p className="mb-n1 small text-muted">
                                      Payment Type
                                    </p>
                                    <p className="mt-2 small font-weight-bold">
                                      {titleContent.gateway}
                                    </p>
                                  </td>
                                  <td style={{ padding: "4px 13px 2px 8px" }}>
                                    <span
                                      className={`py-1 px-2 rounded ${
                                        titleContent.status === "Completed"
                                          ? "alert-success text-success"
                                          : titleContent.status ===
                                            "Processing"
                                          ? "alert-info text-info"
                                          : titleContent.status === "pending"
                                          ? "alert-primary text-primary"
                                          : "alert-danger text-danger"
                                      }`}
                                    >
                                      {titleContent.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            });
                            return row;
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Tab>
                  {runCallback(() => {
                    const row = [];
                    transactionsType.map((title, index) => {
                      row.push(
                        <Tab key={index} eventKey={title} title={title}>
                          <div className="table-responsive boderless">
                            <table className="table">
                              <tbody>
                                {transactions.map((transaction) => {
                                  if (transaction.title == title) {
                                    return (
                                      <tr key={transaction.id}>
                                        <td
                                          style={{
                                            padding: "4px 13px 2px 8px",
                                          }}
                                        >
                                          <div className="icon-holder alert-success text-success py-2 px-2 rounded mr-2">
                                            <i className="mdi mdi-arrow-top-right icon-sm"></i>
                                          </div>
                                        </td>
                                        <td
                                          style={{
                                            padding: "4px 13px 2px 8px",
                                          }}
                                        >
                                          <p className="mb-n1 small text-muted">
                                            {transaction.title}
                                          </p>
                                          <p className="mt-2 small font-weight-bold">
                                            {transaction.amount}{" "}
                                            {transaction.currency}
                                          </p>
                                        </td>
                                        <td
                                          style={{
                                            padding: "4px 13px 2px 8px",
                                          }}
                                        >
                                          <p className="mb-n1 small text-muted">
                                            Date
                                          </p>
                                          <p className="mt-2 small font-weight-bold">
                                            {new Date(
                                              transaction.time
                                            ).toLocaleDateString("en-US")}
                                          </p>
                                        </td>
                                        <td
                                          style={{
                                            padding: "4px 13px 2px 8px",
                                          }}
                                        >
                                          <p className="mb-n1 small text-muted">
                                            Payment Type
                                          </p>
                                          <p className="mt-2 small font-weight-bold">
                                            {transaction.gateway}
                                          </p>
                                        </td>
                                        <td
                                          style={{
                                            padding: "4px 13px 2px 8px",
                                          }}
                                        >
                                          <label
                                            className={
                                              transaction.status ===
                                              "Completed"
                                                ? "badge badge-success"
                                                : "badge badge-warning"
                                            }
                                          >
                                            {transaction.status}
                                          </label>
                                        </td>
                                      </tr>
                                    );
                                  }
                                })}
                              </tbody>
                            </table>
                          </div>
                        </Tab>
                      );
                    });
                    return row;
                  })}
                </Tabs>
              </div>
            </div>
          </div>
          <div className="col-md-7 grid-margin d-md-flex stretch-card px-0 shani w-full">
            {/* Top Group */}
            <div className="col mb-3 mt-m-0">
              <div className="card mb-4">
                <div className="card-body position-relative">
                  <div className="d-flex justify-content-between">
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
                        <p className="font-weight-semibold mb-0 text-dark small">
                          Top Groups
                        </p>
                      </div>
                    </div>
                    <Link className="nav-link" href={ROUTES.group}>
                      <small>
                        <Trans>See All</Trans>
                      </small>
                    </Link>
                  </div>
                  <div
                    className="table-responsive"
                    style={{ minHeight: "150px" }}
                  >
                    <TopGroups groups={groups} permissions={permissions} />
                  </div>
                </div>
              </div>
              <div className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
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
                            d="M12.4916 5.82812C16.1752 5.82812 19.1551 8.79701 19.1551 12.4806C19.1551 16.1642 16.1752 19.1441 12.4916 19.1441C8.80801 19.1441 5.82812 16.1642 5.82812 12.4806C5.83912 8.80801 8.80801 5.82812 12.4916 5.82812ZM12.9095 16.2082C12.9974 16.1752 13.0854 16.1532 13.1624 16.1203C14.119 15.7904 14.6908 14.8227 14.5369 13.8221C14.3719 12.7995 13.5582 12.1178 12.4586 12.0628C11.7549 12.0298 11.2381 11.502 11.2491 10.7983C11.2491 10.1275 11.7769 9.58871 12.4366 9.56672C13.1514 9.54473 13.7012 10.0505 13.7452 10.7653C13.7671 11.0842 13.9101 11.2381 14.185 11.2271C14.4489 11.2161 14.5918 11.0292 14.5808 10.7213C14.5479 9.8856 13.9981 9.14888 13.2174 8.86299C13.1184 8.83 13.0304 8.79701 12.9425 8.76402C12.9315 8.74203 12.9315 8.73104 12.9315 8.72004C12.9315 8.47813 12.9315 8.23622 12.9205 7.99431C12.9205 7.65344 12.7775 7.47751 12.5026 7.47751C12.2387 7.47751 12.0848 7.65344 12.0848 7.99431C12.0848 8.24722 12.0848 8.51112 12.0848 8.76402C12.0188 8.78601 11.9638 8.80801 11.9198 8.83C10.9852 9.12689 10.3584 10.0066 10.4244 10.9302C10.5014 11.9308 11.1941 12.6895 12.1837 12.8655C12.3707 12.8985 12.5686 12.8875 12.7555 12.9205C13.4153 13.0634 13.8331 13.6682 13.7452 14.3279C13.6572 14.9657 13.1184 15.4055 12.4476 15.3945C11.8099 15.3835 11.3041 14.8777 11.2601 14.218C11.2381 13.9101 11.0732 13.7342 10.8203 13.7561C10.5673 13.7671 10.4024 13.9651 10.4354 14.273C10.5124 15.0866 10.9082 15.6914 11.6559 16.0433C11.7989 16.1093 11.9418 16.1532 12.0738 16.2082C12.0848 16.2302 12.0848 16.2412 12.0848 16.2412C12.0848 16.4941 12.0848 16.747 12.0848 16.9999C12.0848 17.3078 12.2497 17.4947 12.5026 17.4837C12.7555 17.4837 12.9095 17.3078 12.9205 16.9889C12.9205 16.736 12.9095 16.4721 12.9095 16.2082Z"
                            fill="black"
                          />
                          <path
                            d="M2.40762 5.06925C1.95679 4.61842 1.49497 4.16759 1.04414 3.71676C0.879199 3.56282 0.780236 3.39788 0.868203 3.16697C0.95617 2.94705 1.1431 2.91406 1.36302 2.91406C2.82547 2.91406 4.27692 2.91406 5.73937 2.91406C6.11323 2.91406 6.25618 3.04601 6.25618 3.43087C6.25618 4.89332 6.25618 6.34477 6.25618 7.80723C6.25618 8.02714 6.2122 8.20308 6.00327 8.30204C5.78336 8.39001 5.61842 8.30204 5.47547 8.1481C5.07962 7.74125 4.67277 7.3344 4.23294 6.89457C4.03501 7.23544 3.83709 7.53233 3.67215 7.85121C0.780236 13.3601 3.56219 20.1446 9.48897 22.0139C11.7981 22.7396 14.0852 22.6407 16.3284 21.717C16.4054 21.684 16.4823 21.651 16.5703 21.618C16.8232 21.5301 17.0211 21.596 17.1421 21.838C17.384 22.3108 17.6259 22.7946 17.8678 23.2784C17.9998 23.5643 17.9118 23.7622 17.6039 23.9052C16.5373 24.389 15.4157 24.7079 14.2502 24.8728C12.2379 25.1477 10.2697 24.9608 8.36739 24.279C5.33253 23.1795 3.03439 21.2002 1.49497 18.3633C0.362393 16.307 -0.110429 14.1079 0.021521 11.7987C0.153471 9.42362 0.912187 7.25743 2.28667 5.31116C2.31966 5.25618 2.35265 5.2122 2.38563 5.15722C2.39663 5.14622 2.39663 5.12423 2.40762 5.06925Z"
                            fill="black"
                          />
                          <path
                            d="M20.7483 18.0869C21.2541 17.3612 21.617 16.6135 21.9029 15.8218C23.9261 10.1479 20.4404 3.93524 14.5466 2.7257C12.5124 2.30785 10.5331 2.49478 8.60887 3.29748C8.13605 3.49541 8.0041 3.44043 7.77319 2.9786C7.57526 2.58275 7.37734 2.1869 7.17941 1.79105C7.00348 1.42818 7.06945 1.23026 7.43231 1.06532C9.38958 0.207641 11.4348 -0.144226 13.557 0.0536993C16.7458 0.339592 19.4508 1.6591 21.639 3.99022C23.4643 5.93649 24.5529 8.24562 24.8938 10.8956C25.3006 14.1394 24.5309 17.0973 22.6506 19.7693C22.6286 19.8023 22.6176 19.8243 22.5846 19.8793C22.6396 19.9342 22.6946 20.0002 22.7496 20.0552C23.1674 20.473 23.5852 20.8909 24.0031 21.3087C24.146 21.4517 24.212 21.6166 24.135 21.8035C24.0581 22.0125 23.8931 22.0674 23.6732 22.0674C22.1888 22.0674 20.7043 22.0674 19.2199 22.0674C18.89 22.0674 18.7471 21.9245 18.7471 21.5946C18.7471 20.1102 18.7471 18.6257 18.7471 17.1413C18.7471 16.9434 18.802 16.7784 18.989 16.6905C19.1869 16.6025 19.3518 16.6685 19.5058 16.8114C19.9016 17.2292 20.3195 17.6361 20.7483 18.0869Z"
                            fill="black"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-weight-semibold mb-0 text-dark small">
                          Transactions Channels
                        </p>
                      </div>
                    </div>
                    <Link className="nav-link" href={ROUTES.transactions}>
                      <small>
                        <Trans>See All</Trans>
                      </small>
                    </Link>
                  </div>
                  <Chart
                    type="pie"
                    width={400}
                    height={600}
                    series={transactionsGatewayGroups}
                    options={{
                      // colors:["#f90000","#f0f"],
                      labels: transactionsGateway,
                    }}
                  ></Chart>
                </div>
              </div>
            </div>
            {/* Top Countries */}
            <div className="col overflow-hidden mb-3 mt-m-0">
              <div className="card mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div className="d-flex align-items-center mb-2">
                      <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                        <svg
                          width="17"
                          height="15"
                          viewBox="0 0 25 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 11.6911C0.0673006 11.2368 0.117773 10.7994 0.201899 10.3451C0.454276 8.91496 0.942208 7.58578 1.66569 6.34072C1.69934 6.27342 1.76664 6.20611 1.83394 6.18929C2.06949 6.12199 2.30504 6.07151 2.55742 6.05469C2.28822 6.27341 2.01902 6.49214 1.73299 6.71087C2.10314 6.98007 2.43965 7.1988 2.92758 7.1988C3.88661 7.21562 4.812 6.98007 5.75421 6.82865C5.90563 6.81182 5.9561 6.84547 6.0234 6.96325C6.39356 7.58578 6.78054 8.19148 7.15069 8.81401C7.20117 8.89814 7.23482 9.01592 7.23482 9.11687C7.23482 9.65527 7.23482 10.2105 7.23482 10.7489C7.23482 10.8667 7.26846 10.9845 7.33576 11.0854C7.84052 11.7921 8.37893 12.4819 8.88368 13.1886C9.00146 13.34 9.11923 13.4073 9.32113 13.34C9.32113 13.1044 9.32113 12.8689 9.32113 12.6333C9.33796 12.6333 9.35479 12.6165 9.37161 12.6165C9.50622 12.8857 9.65763 13.1381 9.74176 13.4073C9.87636 13.8447 10.1624 14.0466 10.6167 14.0971C11.0541 14.1476 11.4916 14.2822 11.929 14.3831C12.03 14.4168 12.1309 14.4841 12.2151 14.5346C12.2487 14.5514 12.2655 14.585 12.2824 14.6019C12.7198 15.0561 13.1236 15.5777 13.8976 15.5609C13.7461 15.8806 13.6284 16.133 13.5106 16.3853C13.3592 16.705 13.09 17.0415 13.09 17.3612C13.09 17.6809 13.3592 18.0005 13.5611 18.3034C14.0827 19.1278 14.2341 20.07 14.5033 20.9786C14.5201 21.0627 14.5033 21.1637 14.4865 21.2478C14.3519 21.803 14.2341 22.3583 14.0658 22.8967C13.8976 23.4351 14.0154 23.9398 14.049 24.4614C14.049 24.6128 14.0658 24.7474 14.0827 24.8989C13.8135 24.9493 13.5443 24.983 13.2919 25.0166C12.7535 25.0166 12.2151 25.0166 11.6767 25.0166C11.3738 24.983 11.071 24.9493 10.7681 24.8989C8.34528 24.5455 6.19166 23.5865 4.34089 21.9713C2.01902 19.9523 0.62253 17.4117 0.151425 14.3663C0.10095 14.013 0.0504755 13.6428 0 13.2895C0 12.7679 0 12.2295 0 11.6911Z"
                            fill="black"
                          />
                          <path
                            d="M15.4458 24.6473C15.5131 24.4118 15.5635 24.2099 15.6308 24.008C15.6645 23.907 15.7318 23.8061 15.8159 23.7388C16.4216 23.3181 17.0442 22.9143 17.6499 22.4937C17.7508 22.4264 17.8181 22.3254 17.8686 22.2245C18.02 21.8375 18.1546 21.4337 18.3229 21.0467C18.3565 20.9458 18.4575 20.8448 18.5584 20.7944C18.9454 20.5925 19.3324 20.4242 19.7194 20.2391C19.8035 20.2055 19.8876 20.1213 19.9213 20.054C20.3755 19.2128 20.813 18.3715 21.2504 17.5135C21.1495 17.4462 21.0485 17.3788 20.9476 17.3284C20.7793 17.2274 20.6279 17.1265 20.4597 17.0423C19.5175 16.5712 18.7098 15.9487 18.0873 15.1075C18.02 15.0233 17.9022 14.956 17.7845 14.9392C17.347 14.8383 16.9096 14.7541 16.4721 14.67C15.9505 14.569 15.4289 14.4344 14.8905 14.3671C14.6382 14.3335 14.369 14.4513 14.1166 14.5522C13.8978 14.6195 13.7296 14.6195 13.595 14.4008C13.3594 14.0306 13.0229 13.8119 12.5687 13.7614C12.5855 13.4418 12.6023 13.1557 12.6191 12.8192C12.3836 12.8361 12.148 12.7856 11.963 12.8697C11.7779 12.937 11.6433 13.1389 11.4582 13.2903C11.3741 12.9538 11.3068 12.6342 11.2227 12.2977C11.5255 12.1462 11.8115 12.0116 12.1144 11.877C12.1817 11.8434 12.2658 11.877 12.3331 11.8938C12.5518 11.978 12.7537 12.1126 12.9725 12.1799C13.1744 12.2472 13.3931 12.264 13.6118 12.2808C13.6455 12.2808 13.7296 12.2135 13.7464 12.1799C13.7969 11.5237 14.268 11.1031 14.6382 10.632C14.8569 10.3628 15.0756 10.1104 15.2943 9.84118C15.3616 9.75705 15.4626 9.68975 15.5635 9.63928C16.1524 9.33642 16.7413 9.03357 17.3302 8.74754C17.4311 8.69707 17.5657 8.68024 17.6667 8.69707C18.0032 8.73072 18.3229 8.76437 18.6762 8.81485C18.7098 8.64659 18.7603 8.47834 18.7771 8.32692C18.7771 8.27644 18.7435 8.19231 18.693 8.14184C18.4911 7.92311 18.2892 7.70439 18.0705 7.51931C17.5321 7.03138 17.0946 6.47615 16.8423 5.78632C16.7918 5.63489 16.6908 5.60124 16.5394 5.60124C16.1524 5.63489 15.8159 5.55076 15.4794 5.34886C15.2439 5.21426 14.9242 5.23109 14.655 5.18061C14.554 5.16379 14.4699 5.16379 14.3353 5.14696C14.2512 5.56759 14.1839 5.98822 14.0998 6.4425C13.6791 6.35837 13.2753 6.29107 12.8715 6.20695C12.821 6.19012 12.7537 6.13965 12.7537 6.08917C12.7201 5.85362 12.7033 5.61807 12.6696 5.36569C12.9556 5.29839 13.208 5.24791 13.4772 5.18061C13.6118 5.14696 13.6959 5.09649 13.7296 4.94506C13.8137 4.52443 13.9147 4.1038 14.0156 3.66635C14.3185 3.78412 14.6213 3.9019 14.9074 4.0365C14.9747 4.07015 15.0251 4.20475 15.0251 4.28888C15.042 4.70951 15.0251 4.70951 15.4121 4.87776C15.4962 4.91141 15.5804 4.94506 15.6645 4.97871C16.2534 5.21426 16.3543 5.21426 16.9264 4.84411C16.7245 4.60856 16.5226 4.35618 16.3038 4.13745C16.0515 3.86825 15.7991 3.59905 15.5131 3.38032C15.227 3.16159 15.1934 2.89239 15.2607 2.53906C15.7486 2.69049 16.2534 2.64001 16.7077 2.99334C17.347 3.4981 17.6835 4.12063 17.8686 4.87776C17.9191 5.09649 18.0368 5.26474 18.2051 5.41616C18.5921 5.75267 18.9454 6.106 19.3324 6.42567C19.5006 6.5771 19.7194 6.66122 19.9213 6.79583C20.1063 6.49297 20.2578 6.2406 20.426 6.00504C20.4765 5.93774 20.5774 5.85362 20.6616 5.83679C21.2336 5.76949 21.7888 5.73584 22.3609 5.68537C22.4114 5.68537 22.4619 5.68537 22.5123 5.66854C22.9161 5.58442 22.9161 5.58442 23.1349 5.93774C24.5145 8.20914 25.1539 10.6656 24.9688 13.324C24.7501 16.689 23.3536 19.4988 20.8803 21.787C19.366 23.1835 17.5826 24.1089 15.5804 24.6305C15.5635 24.6473 15.5299 24.6473 15.4458 24.6473Z"
                            fill="black"
                          />
                          <path
                            d="M17.7665 1.20672C17.3627 1.35815 16.9589 1.20672 16.5719 1.15624C16.3027 1.12259 16.084 1.13942 15.8484 1.30767C15.4614 1.56005 15.1249 1.84608 14.8221 2.1994C14.7548 2.28353 14.6202 2.35083 14.5192 2.36766C13.863 2.43496 13.2068 2.51908 12.5507 2.55273C12.2815 2.56956 12.0123 2.50226 11.7599 2.45178C11.5916 2.41813 11.4907 2.45178 11.4066 2.60321C11.2888 2.83876 11.1374 3.05749 10.9859 3.25939C10.9354 3.32669 10.8345 3.41082 10.7335 3.41082C10.212 3.44447 9.67356 3.51177 9.15198 3.49494C8.8323 3.47812 8.51263 3.36034 8.20977 3.25939C7.99105 3.19209 7.80597 3.19209 7.62089 3.32669C7.06566 3.74732 6.40948 3.83145 5.7533 3.88192C4.84475 3.96605 3.96983 4.21842 3.09493 4.48763C3.02763 4.50445 2.97715 4.52128 2.85938 4.5381C4.71014 2.33401 6.99836 0.920693 9.74086 0.298162C12.9713 -0.42532 15.9998 0.281337 17.7665 1.20672ZM15.1249 1.03847C15.0071 0.971168 14.9062 0.920693 14.8389 0.870218C14.4856 0.567365 14.1659 0.601015 13.7789 0.853393C13.3246 1.17307 12.8199 1.40862 12.3319 1.69465C12.6684 2.01433 12.8199 2.0648 13.2068 2.01433C13.476 1.98068 13.7789 1.9975 14.0145 1.8629C14.4014 1.64417 14.7379 1.3245 15.1249 1.03847ZM10.9523 2.04798C10.8513 1.8629 10.7335 1.69465 10.6494 1.5264C10.5821 1.3918 10.498 1.35815 10.3634 1.42545C10.0269 1.57687 9.70722 1.62735 9.37071 1.42545C9.33706 1.40862 9.26975 1.3918 9.2361 1.40862C8.98373 1.61052 8.73135 1.82925 8.46215 2.04798C8.6977 2.18258 8.91642 2.31718 9.15198 2.45178C9.20245 2.48543 9.26976 2.50226 9.33706 2.48543C9.87546 2.33401 10.397 2.1994 10.9523 2.04798Z"
                            fill="black"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-weight-semibold mb-0 text-dark small">
                          Top Countries
                        </p>
                      </div>
                    </div>
                    <Link className="nav-link" href={ROUTES.countries}>
                      <small>
                        <Trans>See All</Trans>
                      </small>
                    </Link>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-stretched">
                      <tbody>
                        {runCallback(() => {
                          const row = [];
                          countries.map((country, key) => {
                            if (countries) {
                              row.push(
                                <tr key={key}>
                                  <td>
                                    <div className="icon-holder">
                                      <i
                                        className={
                                          `flag-icon flag-icon-${country.country.iso.toLowerCase()}`
                                        }
                                      ></i>
                                    </div>
                                  </td>
                                  <td>{country.country.iso3}</td>
                                  <td className="font-weight-bold fs-sm">
                                    $ {country.group_balance.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            }
                          });
                          return row;
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="card mt-2">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div className="d-flex align-items-center mb-2">
                      <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                        <svg
                          width="17"
                          height="15"
                          viewBox="0 0 21 25"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.69336 24.9992C8.1088 24.9473 7.52425 24.9084 6.94619 24.85C5.40037 24.6814 3.87403 24.4026 2.43863 23.7736C1.66571 23.4364 0.951258 23.0019 0.386189 22.3599C0.0809217 22.0162 -0.0749591 21.6661 0.0354568 21.1668C0.308249 19.9541 0.600526 18.748 1.23055 17.6586C1.47086 17.2435 1.79562 16.9063 2.21779 16.6729C3.67268 15.8623 5.12757 15.0517 6.58247 14.2412C6.77082 14.1374 6.95269 14.1374 7.12805 14.2736C7.68663 14.6951 8.29716 15.0063 8.97914 15.1685C9.18698 15.2203 9.31039 15.3435 9.38833 15.5446C9.59617 16.1152 9.817 16.6729 10.0638 17.3084C10.1547 17.0749 10.2197 16.9063 10.2846 16.7377C10.4405 16.3357 10.5964 15.9336 10.7458 15.5316C10.8172 15.3371 10.9342 15.2139 11.1355 15.1685C11.824 14.9999 12.441 14.6886 13.0061 14.2606C13.1749 14.1309 13.3503 14.1244 13.5322 14.2282C14.9416 15.0063 16.338 15.7975 17.754 16.5627C18.4749 16.9517 18.9231 17.5548 19.2478 18.2746C19.7025 19.2797 19.9493 20.3432 20.1376 21.4261C20.1831 21.679 20.0922 21.8865 19.9558 22.0876C19.5271 22.7036 18.9361 23.1316 18.2865 23.4818C17.1304 24.1043 15.8834 24.4609 14.5909 24.649C13.6686 24.7852 12.7333 24.8565 11.8045 24.9538C11.6811 24.9668 11.5642 24.9862 11.4408 24.9992C10.5185 24.9992 9.60266 24.9992 8.69336 24.9992ZM12.5709 18.8582C12.5709 19.1111 12.5709 19.3316 12.5709 19.5586C13.727 19.5586 14.8701 19.5586 16.0198 19.5586C16.0198 19.3186 16.0198 19.0917 16.0198 18.8582C14.8637 18.8582 13.7205 18.8582 12.5709 18.8582Z"
                            fill="black"
                          />
                          <path
                            d="M14.7397 10.9451C14.3435 11.0034 13.9473 11.0877 13.5446 11.1201C13.012 11.1655 12.473 11.172 11.9339 11.1785C11.8299 11.1785 11.726 11.1201 11.6221 11.0812C11.4143 10.9969 11.2129 10.8543 10.9986 10.8348C10.5569 10.7894 10.1023 10.7765 9.6606 10.8154C8.88119 10.8867 8.37458 11.4703 8.38757 12.2161C8.40056 12.9423 8.92666 13.5065 9.69308 13.5649C10.0893 13.5973 10.492 13.5778 10.8882 13.5649C11.0375 13.5584 11.2064 13.526 11.3298 13.4481C11.5896 13.2795 11.8624 13.2795 12.1482 13.286C12.5184 13.2925 12.8951 13.286 13.3108 13.286C13.0705 13.4741 12.8432 13.6621 12.6029 13.8242C11.8754 14.3171 11.096 14.6932 10.1997 14.7515C9.49173 14.7969 8.84872 14.557 8.23818 14.2522C6.94567 13.6038 5.97791 12.6246 5.3349 11.3341C5.28943 11.2369 5.30892 11.0942 5.3284 10.9775C5.36088 10.757 5.4583 10.5365 5.4583 10.3161C5.47129 9.16827 5.4648 8.02697 5.4648 6.87919C5.4648 6.52902 5.37387 6.20479 5.15953 5.91947C5.12056 5.86759 5.08809 5.80274 5.09458 5.74438C5.205 4.94677 5.37387 4.16213 5.83501 3.47476C6.3741 2.67066 7.17949 2.2751 8.09529 2.07408C9.12151 1.84711 10.1607 1.80821 11.1999 1.95087C11.752 2.02868 12.3106 2.14541 12.8302 2.33346C13.9084 2.73551 14.4994 3.57851 14.7852 4.66145C14.8307 4.84302 14.8761 5.02459 14.9151 5.20616C14.9865 5.53687 15.0385 5.84814 14.8112 6.17237C14.6878 6.34745 14.6553 6.61981 14.6488 6.84677C14.6358 8.00103 14.6358 9.1553 14.6423 10.3096C14.6553 10.5106 14.7073 10.7116 14.7397 10.9451Z"
                            fill="black"
                          />
                          <path
                            d="M15.9943 11.1763C15.4617 10.9688 15.3188 10.6122 15.3253 10.1453C15.3383 9.10773 15.3318 8.0637 15.3253 7.02616C15.3253 6.68895 15.3708 6.37769 15.663 6.15722C15.6955 6.13128 15.728 6.07291 15.7215 6.03401C15.5851 5.00295 15.4097 3.97838 14.8187 3.0835C14.2536 2.23401 13.4352 1.73469 12.4675 1.49476C10.9152 1.11216 9.34337 1.10568 7.77806 1.46882C5.99841 1.89032 4.97219 3.04459 4.58899 4.79544C4.50455 5.16507 4.45259 5.54766 4.40063 5.92377C4.38764 6.00807 4.46558 6.10534 4.50455 6.18964C4.59548 6.38418 4.76436 6.57223 4.77085 6.76677C4.79683 7.9794 4.79033 9.19203 4.77734 10.3982C4.77085 10.8456 4.42012 11.1634 3.96546 11.1763C3.54978 11.1893 3.1341 11.1893 2.71841 11.1763C2.24427 11.1634 1.89354 10.8067 1.89354 10.3268C1.88705 9.17257 1.88705 8.01831 1.89354 6.86404C1.89354 6.33878 2.23128 5.9951 2.75738 5.97564C2.82233 5.97564 2.88728 5.96916 2.95224 5.97564C3.14059 6.00158 3.19905 5.93025 3.21853 5.7422C3.34194 4.65278 3.57576 3.59578 4.14732 2.64254C4.92024 1.3521 6.08935 0.619332 7.53125 0.2951C9.37584 -0.119917 11.2204 -0.113433 13.0326 0.418308C15.007 1.00193 16.1567 2.38315 16.6373 4.348C16.7542 4.82138 16.8127 5.30124 16.8906 5.78759C16.9101 5.92377 16.9491 5.98862 17.0985 5.98213C17.2413 5.97565 17.3907 5.97564 17.5336 6.00807C17.9363 6.08588 18.2091 6.40363 18.2091 6.81865C18.2156 7.99885 18.2156 9.17906 18.2091 10.3528C18.2091 10.8326 17.8454 11.1893 17.3453 11.1828C17.0985 11.1763 16.9491 11.2606 16.7867 11.4357C16.2801 11.9869 15.5916 12.2009 14.8901 12.3565C13.812 12.6029 12.7143 12.6224 11.6166 12.6159C11.4932 12.6159 11.3698 12.6937 11.2464 12.7391C11.097 12.791 10.9476 12.8883 10.7983 12.8948C10.4475 12.9207 10.0968 12.9077 9.74606 12.9012C9.34986 12.8883 9.05109 12.5835 9.04459 12.2009C9.0381 11.8118 9.34986 11.4941 9.75255 11.4876C10.0968 11.4811 10.441 11.4552 10.7788 11.5006C10.9736 11.5265 11.149 11.6627 11.3309 11.7535C11.3958 11.7859 11.4608 11.8702 11.5257 11.8702C12.8052 11.8767 14.0848 11.8702 15.3188 11.4617C15.5331 11.3838 15.728 11.2866 15.9943 11.1763Z"
                            fill="black"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-weight-semibold mb-0 text-dark small">
                          Support
                        </p>
                      </div>
                    </div>
                    <Link className="nav-link" href={ROUTES.support}>
                      <small>
                        <Trans>See All</Trans>
                      </small>
                    </Link>
                  </div>
                  <div className="flex items-center justify-center w-full">
                    <SemiCircleProgressBar percentage={50} showPercentValue />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : spinner ? (
      <Spinner/>
    ) : (
      <>
        <h1 className="text-center mt-5 pt-5">Permission Denied!</h1>
        <p className="text-center mt-3">
          Sorry!, You don't have permission to access this module.
        </p>
      </>
    )}
  </>
  )
}

export default Dashboard