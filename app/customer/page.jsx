"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import db from "@/firebase/firebase-config";
import paginationFactory, {
  PaginationProvider,
  PaginationListStandalone,
  PaginationTotalStandalone,
  SizePerPageDropdownStandalone,
} from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import useInterval, { BASE_URL, ROUTES, PUSH_KEY } from "@/utils/common";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import Modal from "@/components/group/Modal";
import ToolkitProvider, {
  Search,
} from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { Trans } from "react-i18next";
import { toast } from "react-toastify";
import { sendPushNotification } from "@/utils/send-push-notification";

export function Customers() {
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [contributingUser, setContributingUser] = useState([0]);
  const [orphanUsers, setOrphanUsers] = useState([0]);
  const [message, setMessage] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [textMessage, setTextMessage] = useState("");
  const [authUser, setAuthUser] = useState(0);
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const [filter, setFilter] = useState("");
  const [totalNumUsers, setTotalNumUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const date = new Date();
  const { country } = useCountry();
  const { user } = useUser();
  const authToken = localStorage.getItem("Auth Token");
  const [currentPage, setCurrentPage] = useState({ page: 1, sizePerPage: 10 });
  const { page, sizePerPage } = currentPage;
  const [sort, setSort] = useState({ field: "", order: "" });
  const { field, order } = sort;
  const [search, setSearch] = useState("");

  const fetchPermissionsAuthUserAndUsers = async () => {
    const response = await fetch(
      `${BASE_URL}/customers?page=${page}&size=${sizePerPage}`,
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
    console.log("jsonData", jsonData);
    if (jsonData.success) {
      setSpinner(false);
      setUsers(jsonData.customers.data);
      setTotalUsers(jsonData.customers.total);
      setTotalNumUsers(jsonData.totalCustomers);
      setActiveUsers(jsonData.activeCustomers);
      setContributingUser(jsonData.contributingCustomers);
      setOrphanUsers(jsonData.orphanCustomers);
    }
    if (user || !user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
      const supportUsersCol = doc(db.db, "users", "support_chat");
      const supportUserData = await getDoc(supportUsersCol);
      const supportUserList = supportUserData.data();
      setAuthUser(supportUserList);
    } else {
      var groupPermission = user.role.permissions.filter(
        (permission) => permission.section === "Customers"
      );
      if (groupPermission.length && groupPermission[0].status) {
        setPermissions(...groupPermission);
      }
      setAuthUser(user);
    }
  };

  const handleClose = () => setMessage(false);

  const SendMessage = (value, row) => {
    const handleMessage = () => {
      setSelectedUser(row);
      setMessage(permissions.add);
    };
    return (
      <div
        className="icon-holder bg-[#dde4eb] text-center p-2 rounded"
        style={permissions.add ? { cursor: "pointer" } : {}}
        onClick={handleMessage}
      >
        <i className="mdi mdi-comment-processing"></i>
      </div>
    );
  };

  const messageSend = async () => {
    if (textMessage && selectedUser && permissions && permissions.add) {
      // Chat Data
      const data = {
        isSeen: false,
        message: textMessage,
        receivename: selectedUser.first_name + " " + selectedUser.last_name,
        receiverUid: selectedUser.user_id,
        receiver_image: selectedUser.profile_url,
        senderUid: authUser.user_id,
        sender_image: authUser.profile_url,
        sendername: authUser.first_name + " " + authUser.last_name,
        sortingKey: Date.now(),
        time: new Date(),
        type: "text",
      };

      // Update Support Chat Last Message Field.
      const supportChatCol = doc(
        db.db,
        "chats",
        "support_chat",
        "recent_chats",
        selectedUser.user_id
      );
      const supportChatSelecteUserData = await getDoc(supportChatCol);
      if (!supportChatSelecteUserData.data()) {
        // Created New Support Chat For Targeted User.
        await setDoc(supportChatCol, data);
      } else {
        await updateDoc(supportChatCol, data);
      }

      // Created New Message For Support.
      const sendMessageSupportCol = doc(
        db.db,
        "chats",
        "support_chat",
        "recent_chats",
        selectedUser.user_id,
        "chats",
        date.toISOString().replace("T", " ").replace("Z", "")
      );
      await setDoc(sendMessageSupportCol, data);

      // Update Receiver User Last Message Field.
      const receiverChatCol = doc(
        db.db,
        "chats",
        selectedUser.user_id,
        "recent_chats",
        "support_chat"
      );
      const receiverChatSelecteUserData = await getDoc(receiverChatCol);
      if (!receiverChatSelecteUserData.data()) {
        // Created New Support Chat For Targeted User.
        await setDoc(receiverChatCol, data);
      } else {
        await updateDoc(receiverChatCol, data);
      }

      // Created New Message For Receiver User.
      const sendMessageReceiverUserCol = doc(
        db.db,
        "chats",
        selectedUser.user_id,
        "recent_chats",
        "support_chat",
        "chats",
        date.toISOString().replace("T", " ").replace("Z", "")
      );
      await setDoc(sendMessageReceiverUserCol, data);

      // Create New Notification.
      const notificationsCol = doc(
        db.db,
        "notifications",
        date.toISOString().replace("T", " ").replace("Z", "")
      );
      const notificationData = {
        body: textMessage,
        created_at: new Date(),
        created_by: authUser.user_id,
        id: date.toISOString().replace("T", " ").replace("Z", ""),
        isSeen: false,
        receiver: selectedUser.user_id,
        receivers: [selectedUser.user_id],
        sortingKey: Date.now(),
        status: "",
        title: authUser.first_name + " " + authUser.last_name,
        type: "notificationType.ohanaSupport",
        withdraw_req_id: "",
      };
      await setDoc(notificationsCol, notificationData);

      // Push Notification To A User From Support Chat
      await sendPushNotification({
        fcmToken: selectedUser.fcm_token,
        message: textMessage,
        title: authUser.name
          ? authUser.name
          : authUser.first_name + " " + authUser.last_name,
      });

      fetchPermissionsAuthUserAndUsers();
      setTextMessage("");
      setMessage(false);
    }
  };

  useEffect(() => {
    fetchPermissionsAuthUserAndUsers();
  }, [country, page, sizePerPage, filter, search, field, order]);

  useInterval(fetchPermissionsAuthUserAndUsers, 20000, 5);

  function priceFormatter(cell, row) {
    console.log("row data", row);
    return (
      <span>
        {" "}
        {parseFloat(cell).toFixed(2) +
          " " +
          (row.country?.currency ??
            (row.currency?.code ? row.currency?.code : "123"))}
      </span>
    );
  }

  const statusChange = async (check, row) => {
    if (permissions.edit) {
      const response = await fetch(`${BASE_URL}/customer-status-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({ id: row.id, check }),
      });
      const jsonData = await response.json();

      if (jsonData.success === true) {
        toast.success(jsonData.message);
      }
      if (jsonData.success) {
        fetchPermissionsAuthUserAndUsers();
      }
    }
  };

  const orphanInactiveUsers = async (e) => {
    const check = e.target.value;
    setFilter(check);
    setCurrentPage({ page: 1, sizePerPage: sizePerPage });
  };

  const columns = [
    {
      dataField: "first_name",
      text: "User Name",
      sort: true,
      formatter: (cell, row) => row.first_name + " " + row.last_name,
    },
    {
      dataField: "phone",
      text: "User Phone",
      sort: true,
    },
    {
      dataField: "total_groups",
      text: "Groups",
      // sort: true,
      formatter: (cell, row) => row.group_admins_count + row.group_users_count,
    },
    {
      dataField: "country.nicename",
      text: "Country",
      // sort: true,
    },
    {
      dataField: "pools_count",
      text: "Pools",
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
      dataField: "user_type",
      text: "Type",
      formatter: (cell, row) => {
        return cell === "permanent" ? " Real" : "Offline";
      },
    },

    {
      dataField: "balance",
      text: "Wallet Amount",
      sort: true,
      formatter: priceFormatter,
    },
    {
      dataField: "account_rejected",
      text: "Status",
      sort: true,
      formatter: (cell, row) => {
        return permissions && permissions.edit ? (
          <BootstrapSwitchButton
            checked={cell === 0}
            onChange={(check) => {
              console.log("check  344", check);
              statusChange(check ? 0 : 1, row);
            }}
            onlabel="On"
            offlabel="Off"
            size="sm"
            onstyle="secondary"
          />
        ) : (
          <span
            className={`py-1 px-2 rounded ${
              cell === 1 ? "alert-warning" : "alert-success"
            }`}
          >
            {cell === 1 ? "Inactive" : "Active"}
          </span>
        );
      },
    },
    {
      dataField: "message",
      text: "Message",
      formatter: SendMessage,
    },
    {
      dataField: "view",
      text: "View",
      formatter: (cell, row) => {
        const html = (
          <div className="icon-holder bg-[#dde4eb] text-center p-2 rounded">
            <i className="mdi mdi-eye"></i>
          </div>
        );
        return permissions && permissions.view ? (
          <Link className="nav-link" href={ROUTES.customer + "/" + row.id}>
            {html}
          </Link>
        ) : (
          html
        );
      },
    },
    {
      dataField: "edit",
      text: "Edit",
      formatter: (cell, row) => {
        const html = (
          <div className="icon-holder bg-[#dde4eb] text-center p-2 rounded">
            <i className="mdi mdi-square-edit-outline"></i>
          </div>
        );
        return !row.role ? (
          ""
        ) : permissions && permissions.edit ? (
          <Link
            className="nav-link"
            href={`${ROUTES.edit_customer.replace(":id", row.id)}`}
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
        <>
          <div className="row">
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
                        Total No. of Users
                      </h6>
                      <span className="d-flex align-items-end">
                        <h6 className="font-weight-semibold mb-0">
                          {totalNumUsers}
                        </h6>
                        <p className="mb-0 text-success font-weight-semibold mx-5">
                          {/* &nbsp;<i className='mdi mdi-arrow-top-right'></i> 22.8% */}
                        </p>
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
                        viewBox="0 0 25 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.33465 12.528C9.30056 15.3323 14.3583 15.6951 17.7465 12.5182C19.1706 13.283 20.3883 14.2929 21.3999 15.5578C23.1382 17.7345 24.0319 20.225 24.0515 23.0097C24.0515 23.6274 23.6783 24 23.0695 24C15.7038 24 8.33812 24 0.982269 24C0.383195 24 -0.00964088 23.6176 0.000180008 23.0391C0.118031 18.4209 2.20988 14.9597 6.15788 12.5868C6.18734 12.5672 6.22662 12.5476 6.25609 12.5378C6.28555 12.5476 6.30519 12.5378 6.33465 12.528Z"
                          fill="black"
                        />
                        <path
                          d="M18.5022 6.45179C18.5022 9.94242 15.5166 12.933 12.0204 12.933C8.43576 12.933 5.54842 10.0405 5.54842 6.45179C5.54842 2.89252 8.44558 0 12.0204 0C15.605 0.00980515 18.5022 2.89252 18.5022 6.45179Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="font-weight-semibold small mb-0 text-warning">
                        Active Users
                      </h6>
                      <span className="d-flex align-items-end">
                        <h6 className="font-weight-semibold mb-0">
                          {activeUsers}
                        </h6>
                        <p className="mb-0 text-success font-weight-semibold mx-5">
                          {/* &nbsp;<i className='mdi mdi-arrow-top-right'></i> 22.8% */}
                        </p>
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
                        viewBox="0 0 28 28"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.31207 16.0933C10.3357 16.0513 11.3091 16.3115 12.2572 16.6639C13.7759 17.2344 15.3366 17.6036 16.9728 17.612C17.5769 17.612 18.1895 17.5785 18.7936 17.5365C19.2803 17.5029 19.7585 17.5281 20.2284 17.6372C20.8158 17.7714 20.9416 18.1155 20.5221 18.5518C19.4061 19.7013 18.0804 20.297 16.4358 20.1628C15.152 20.0537 13.8766 19.8775 12.5845 19.9362C12.2992 19.953 12.0223 19.9866 11.7538 20.0621C11.4265 20.1544 11.3007 20.3474 11.351 20.6327C11.4014 20.8928 11.6027 21.0354 11.93 20.9599C13.0376 20.7082 14.1367 20.918 15.2359 21.0019C16.1505 21.069 17.0735 21.1613 17.9881 21.0187C19.0621 20.8592 19.9263 20.2719 20.7486 19.609C22.3932 18.2917 24.0881 17.0414 25.8921 15.959C26.2781 15.7241 26.6809 15.5227 27.092 15.3465C27.2514 15.2794 27.4193 15.2374 27.5619 15.3801C27.7129 15.5227 27.6458 15.6905 27.5787 15.8416C27.0752 16.9911 26.3285 17.9728 25.523 18.9126C24.021 20.6578 22.3177 22.1682 20.2955 23.2758C18.9866 23.9974 17.6021 24.4924 16.0834 24.4421C15.2191 24.4169 14.3633 24.2323 13.499 24.1148C11.8041 23.8883 10.1344 23.9974 8.52334 24.5931C8.2045 24.7106 8.00312 24.6602 7.79335 24.4001C6.56831 22.873 5.33487 21.3459 4.10143 19.8272C3.81615 19.4748 3.81615 19.4076 4.05948 19.0217C5.07476 17.4274 6.45923 16.387 8.37231 16.152C8.68277 16.1101 8.99323 16.1101 9.31207 16.0933Z"
                          fill="black"
                        />
                        <path
                          d="M15.06 16.5057C14.481 16.4554 14.0279 16.3044 13.5748 16.1449C12.5596 15.7757 11.5611 15.3646 10.4787 15.2387C9.96682 15.18 9.46337 15.1045 8.94315 15.1716C8.58235 15.2219 8.532 15.1548 8.56557 14.7772C8.69982 13.3424 9.22843 12.0335 9.90808 10.7833C10.6297 9.45752 11.4604 8.19891 12.526 7.10812C13.3315 6.27743 14.1874 5.51388 15.2194 4.96848C16.1843 4.45665 17.0989 4.51538 18.0051 5.10273C18.8946 5.69008 19.6581 6.42008 20.3713 7.2088C21.8313 8.82822 22.9808 10.6406 23.6689 12.7299C23.9625 13.6109 24.1388 14.5087 24.1388 15.4401C24.1388 15.7841 24.0381 16.0358 23.7192 16.2456C23.0983 16.64 22.5193 17.0847 21.9236 17.5126C21.739 17.6469 21.6467 17.6636 21.5125 17.4371C21.3111 17.0847 20.9838 16.8833 20.5979 16.7658C19.8847 16.5477 19.1547 16.5561 18.4163 16.6148C18.1058 16.64 17.7954 16.6652 17.4849 16.6232C17.4765 16.4806 17.5856 16.4638 17.6611 16.4134C18.2149 16.0275 18.5505 15.524 18.4918 14.8276C18.4247 14.0389 17.938 13.5606 17.2416 13.2837C16.8976 13.141 16.5284 13.1243 16.1676 13.0655C15.9158 13.0236 15.6725 12.9816 15.4627 12.8222C15.0264 12.495 15.0096 11.9663 15.4124 11.6139C15.941 11.1441 16.822 11.1776 17.3339 11.6811C17.3842 11.7314 17.4262 11.7901 17.4849 11.8405C17.7031 12.0503 17.9212 12.0754 18.131 11.8992C18.3156 11.7482 18.3492 11.4629 18.1897 11.2447C17.9212 10.8756 17.5772 10.607 17.1409 10.4812C16.8976 10.4141 16.8137 10.2966 16.8137 10.0365C16.822 9.66729 16.6291 9.46591 16.327 9.46591C16.0417 9.4743 15.8487 9.6589 15.8655 10.0197C15.8739 10.3134 15.748 10.4057 15.4963 10.4896C14.8586 10.7077 14.3887 11.1273 14.2293 11.8069C14.0111 12.7215 14.5817 13.5941 15.5634 13.8878C15.8235 13.9633 16.092 14.0053 16.3689 14.0137C16.6794 14.0305 16.9647 14.1228 17.2164 14.3074C17.6863 14.6682 17.6779 15.2303 17.208 15.5744C16.6207 16.0107 15.7816 15.9184 15.2949 15.3814C15.2362 15.3226 15.1859 15.2471 15.1187 15.1968C14.9257 15.0625 14.716 15.0625 14.5398 15.2136C14.3636 15.3646 14.3216 15.5576 14.4307 15.7757C14.5649 16.061 14.7999 16.2288 15.06 16.5057Z"
                          fill="black"
                        />
                        <path
                          d="M7.75161 26.0017C7.75161 26.2115 7.63414 26.3625 7.46632 26.4967C6.95449 26.9079 6.44265 27.3274 5.93082 27.747C5.47772 28.1078 5.23439 28.091 4.87359 27.6379C3.88348 26.4128 2.90177 25.1962 1.91166 23.9711C1.34948 23.2747 0.787305 22.5867 0.233517 21.8902C-0.110503 21.4623 -0.0769396 21.2274 0.350987 20.8833C0.854431 20.4722 1.35787 20.0611 1.86132 19.6583C2.26407 19.3311 2.52419 19.3562 2.85142 19.759C4.42049 21.6972 5.98116 23.6355 7.55023 25.5738C7.65931 25.6996 7.74322 25.8255 7.75161 26.0017Z"
                          fill="black"
                        />
                        <path
                          d="M13.3727 7.98836e-05C13.7503 7.98836e-05 14.0272 0.134331 14.3041 0.251802C15.227 0.671338 16.1752 0.721682 17.1569 0.537086C18.1722 0.3441 19.1959 0.184676 20.2363 0.310537C20.2866 0.318927 20.337 0.318927 20.3957 0.327318C20.9915 0.436398 21.1257 0.730073 20.7397 1.19156C19.9762 2.10615 19.5315 3.16338 19.1875 4.28774C19.07 4.65693 19.0532 4.65693 18.7344 4.43877C17.2576 3.39832 15.6382 3.44028 14.0356 4.56463C13.6999 4.79957 13.658 4.79957 13.4986 4.42199C13.2468 3.83464 13.0371 3.23051 12.7937 2.64316C12.6091 2.18167 12.3658 1.76213 11.9211 1.48524C11.7701 1.39294 11.7281 1.2503 11.7952 1.08248C11.9714 0.646166 12.9532 -0.00831084 13.3727 7.98836e-05Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <div>
                      <h6 className="font-weight-semibold small mb-0 text-warning">
                        Contributing Users
                      </h6>
                      <span className="d-flex align-items-end">
                        <h6 className="font-weight-semibold mb-0">
                          {contributingUser}
                        </h6>
                        <p className="mb-0 text-success font-weight-semibold mx-5">
                          {/* &nbsp;<i className='mdi mdi-arrow-top-right'></i> 22.8% */}
                        </p>
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
                        Orphan Users
                      </h6>
                      <span className="d-flex align-items-end ">
                        <h6 className="font-weight-semibold mb-0">
                          {orphanUsers}
                        </h6>
                        <p className="mb-0 text-success font-weight-semibold mx-5">
                          {/* &nbsp;<i className='mdi mdi-arrow-top-right'></i> 22.8% */}
                        </p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                            onChange={(e) => orphanInactiveUsers(e)}
                          >
                            {/* <option disabled selected value="">Filter</option> */}
                            <option value="">All</option>
                            <option value="orphan_users">Orphan Users</option>
                            <option value="inactive_users">
                              Inactive Users
                            </option>
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
                                  <Trans>Customers</Trans>
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
                    <div className="flex items-center justify-between w-full">
                      <div className=" flex justify-between w-full">
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
          <div className="row">
            <Modal show={message} onHide={handleClose}>
              <div
                className="card bg-warning text-center p-2"
                style={{ borderRadius: "1rem" }}
              >
                <h4 className="font-weight-semibold">
                  Send message to{" "}
                  {selectedUser.first_name + " " + selectedUser.last_name}
                </h4>
                <div
                  className="card-body m-3 p-0"
                  style={{ padding: "0px !important" }}
                >
                  <textarea
                    className="card-text w-100 h-80 border-0"
                    style={{ borderRadius: ".5rem", height: "7rem" }}
                    onChange={(e) => {
                      setTextMessage(e.target.value);
                    }}
                  ></textarea>
                  <button className="btn btn-success" onClick={messageSend}>
                    Send
                  </button>
                </div>
              </div>
            </Modal>
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
export default Customers;
