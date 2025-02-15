import React, { useState, useEffect, useMemo } from "react";
import { Table, Form, Button } from "react-bootstrap";
import db from "@/firebase/firebase-config";
import paginationFactory, {
  PaginationProvider,
  PaginationListStandalone,
  PaginationTotalStandalone,
  SizePerPageDropdownStandalone,
} from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import useInterval, { BASE_URL, PUSH_KEY, ROUTES } from "@/utils/common";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import Modal from "@/components/group/Modal";
import ToolkitProvider, {
  Search,
} from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit";
import useUser from "@/hooks/useUser";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Trans } from "react-i18next";
import { sendPushNotification } from "@/utils/send-push-notification";

export function OrganizationGroupTable({ org_id }) {
  const { id } = useParams();
  const [permissions, setPermissions] = useState(0);
  const [groupAdmin, setGroupAdmin] = useState({});
  const [groupAdmins, setGroupAdmins] = useState([]);
  const [group, setGroup] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [textGroupMessage, setTextGroupMessage] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);
  //   Modals
  const [deletegroupModal, setDeletegroupModal] = useState(false);
  const handleDeleteGroupModal = () => setDeletegroupModal(false);
  const [groupMemberModal, setGroupMemberModal] = useState(false);
  const handleGroupMemberModal = () => setGroupMemberModal(false);
  const [groupMessageModal, setGroupMessageModal] = useState(false);
  const handleGroupMessageModal = () => setGroupMessageModal(false);
  const [messageModal, setMessageModal] = useState(false);
  const handleMessageModal = () => setMessageModal(false);

  const [authUser, setAuthUser] = useState({});
  const [currentPage, setCurrentPage] = useState({ page: 1, sizePerPage: 10 });
  const [filter, setFilter] = useState("");
  const { page, sizePerPage } = currentPage;
  const [sort, setSort] = useState({ field: "", order: "" });
  const { field, order } = sort;
  const [search, setSearch] = useState("");
  const { user } = useUser();
  const date = new Date();
  const authToken = localStorage.getItem("Auth Token");

  const fetchOrganizationDataAndPermissions = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/get-organization-by-id?page=${page}&size=${sizePerPage}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            "x-api-key": "Ohana-Agent-oo73",
          },
          // body: JSON.stringify({ filter, search, field, order }),

          body: JSON.stringify({
            org_id: org_id || id,
            filter,
            search,
            field,
            order,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const jsonData = await response.json();
      console.log("Get Organization By Id json data", jsonData);
      setTotalGroups(jsonData.data.total_groups);
      setGroup(jsonData.data.groups);

      if (jsonData.status === "success") {
        // const { data } = jsonData;
        // setSpinner(false);
        // setGroups(data.groups);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchPermissions = async () => {
    console.log("Fetch Permissions");
    if (!user.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
      const supportUsersCol = doc(db.db, "users", "support_chat");
      const supportUserData = await getDoc(supportUsersCol);
      const supportUserList = supportUserData.data();
      console.log("supportUserList", supportUserList);
      setAuthUser(supportUserList);
    } else {
      var orgDetailPermission = user.role.permissions.filter(
        (permission) => permission.section === "Organization Group"
      );
      if (orgDetailPermission.length && orgDetailPermission[0].status) {
        setPermissions(...orgDetailPermission);
      }
      setAuthUser(user);
    }
  };

  const groupMessageSend = () => {
    if (
      textGroupMessage &&
      groupAdmin &&
      groupAdmin.admins.length > 0 &&
      permissions &&
      permissions.add
    ) {
      var last_message = `${textGroupMessage} (From Group ${
        groupAdmin.title ? groupAdmin.title : ""
      } as a admin)`;
      groupAdmin.admins.map(async (admin) => {
        // Chat Data
        const data = {
          isSeen: false,
          message: last_message,
          receivename: admin.first_name + " " + admin.last_name,
          receiverUid: admin.user_id,
          receiver_image: admin.profile_url,
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
          admin.user_id
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
          admin.user_id,
          "chats",
          date.toISOString().replace("T", " ").replace("Z", "")
        );
        await setDoc(sendMessageSupportCol, data);

        // Update Receiver User Last Message Field.
        const receiverChatCol = doc(
          db.db,
          "chats",
          admin.user_id,
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
          admin.user_id,
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
          body: last_message,
          created_at: new Date(),
          created_by: "Admin",
          id: date.toISOString().replace("T", " ").replace("Z", ""),
          isSeen: false,
          receiver: admin.user_id,
          receivers: [admin.user_id],
          sortingKey: Date.now(),
          status: "",
          title: `${
            authUser.first_name + " " + authUser.last_name
          } Group Admin. “${groupAdmin.title ? groupAdmin.title : ""}”`,
          type: "notificationType.ohanaSupport",
          withdraw_req_id: "",
        };
        await setDoc(notificationsCol, notificationData);

        // Push Notification To A User From Support Chat
        await sendPushNotification({
          fcmToken: admin.fcm_token,
          message: last_message,
          title: `${
            authUser.first_name + " " + authUser.last_name
          } Group Admin. “${groupAdmin.title ? groupAdmin.title : ""}”`,
        });
        //   const requestOptions = {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //       Authorization: `key=${PUSH_KEY}`,
        //     },
        //     body: JSON.stringify({
        //       to: admin.fcm_token,
        //       notification: {
        //         body: last_message,
        //         title: `${
        //           authUser.first_name + " " + authUser.last_name
        //         } Group Admin. “${groupAdmin.title ? groupAdmin.title : ""}”`,
        //       },
        //       data: {
        //         notification_type: "receiving_call",
        //         id: "",
        //       },
        //     }),
        //   };
        //   fetch("https://fcm.googleapis.com/fcm/send", requestOptions)
        //     .then((response) => response.json())
        //     .then((data) => console.log({ postId: data.id }));
      });
      // fetchGroupsAndPermissions();
      fetchOrganizationDataAndPermissions();
      fetchPermissions();
      setTextGroupMessage("");
      setGroupMessageModal(false);
    }
  };

  const messageSend = async () => {
    console.log("Auth User", authUser);
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
        title: authUser.first_name + " " + authUser.last_name,
      });
      // const requestOptions = {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `key=${PUSH_KEY}`,
      //   },
      //   body: JSON.stringify({
      //     to: selectedUser.fcm_token,
      //     notification: {
      //       body: textMessage,
      //       title: authUser.first_name + " " + authUser.last_name,
      //     },
      //     data: {
      //       notification_type: "receiving_call",
      //       id: "",
      //     },
      //   }),
      // };
      // fetch("https://fcm.googleapis.com/fcm/send", requestOptions)
      //   .then((response) => response.json())
      //   .then((data) => console.log({ postId: data.id }));
      // fetchGroupsAndPermissions();
      fetchOrganizationDataAndPermissions();
      fetchPermissions();
      setTextMessage("");
      setMessageModal(false);
    }
  };

  useEffect(() => {
    fetchOrganizationDataAndPermissions();
    fetchPermissions();
  }, [page, sizePerPage, filter, search, field, order]);

  useMemo(async () => {
    if (groupAdmin && groupMemberModal && groupAdmin.admins.length > 0) {
      setGroupAdmins(groupAdmin.admins);
    } else {
      setGroupAdmins([]);
    }
    if (groupAdmin && groupMemberModal && groupAdmin.users?.length > 0) {
      setGroupMembers(groupAdmin.users);
    } else {
      setGroupMembers([]);
    }
  }, [groupMemberModal]);

  function priceFormatter(cell, row) {
    return (
      <span>
        {" "}
        {parseFloat(cell).toFixed(2) + " " + (row.currency?.code ?? "")}
      </span>
    );
  }

  const SendGroupMessage = (value, row) => {
    const handleGroupMessage = () => {
      setGroupAdmin(row);
      setGroupMessageModal(permissions.add);
    };
    return (
      <div
        className="icon-holder bg-secondary text-center p-2 rounded"
        style={permissions.add ? { cursor: "pointer" } : {}}
        onClick={handleGroupMessage}
      >
        <i className="mdi mdi-comment-processing"></i>
      </div>
    );
  };

  const GroupAdminsMembers = (value, row) => {
    const handleGroupmember = () => {
      setGroupAdmin(row);
      setGroupMemberModal(permissions.view);
    };
    return (
      <div
        className="icon-holder bg-secondary text-center p-2 rounded"
        style={permissions.view ? { cursor: "pointer" } : {}}
        onClick={handleGroupmember}
      >
        <i className="mdi mdi-account"></i>
      </div>
    );
  };

  const SendGroupAdminMemberMessage = (data) => {
    setSelectedUser(data);
    setMessageModal(permissions.add);
  };

  const statusChange = async (check, row) => {
    // Update Group Status.
    if (permissions.edit) {
      const groupCol = doc(db.db, "groups", row.group_id);
      const groupData = await getDoc(groupCol);
      const getGroupData = groupData.data();
      getGroupData.status = check ? "Active" : "Inactive";
      await updateDoc(groupCol, getGroupData);
      const response = await fetch(`${BASE_URL}/group-status-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
        body: JSON.stringify({ id: row.id, check }),
      });
      const jsonData = await response.json();
      if (jsonData.success) {
        // fetchGroupsAndPermissions();
        fetchOrganizationDataAndPermissions();
        fetchPermissions();
      }
    }
  };

  const columns = [
    {
      dataField: "title",
      text: <Trans>Group Name</Trans>,
      sort: true,
      formatter: (cell, row) => {
        return (
          <Link href={ROUTES.group_detail.replace(":id", row.id)}>{cell}</Link>
        );
      },
    },
    {
      dataField: "created_at",
      text: <Trans>Creation Date</Trans>,
      sort: true,
      formatter: (cell, row) =>
        cell ? new Date(cell).toLocaleDateString("en-US") : "",
    },
    {
      dataField: "users_count",
      text: <Trans>Members</Trans>,
      sort: true,
      formatter: (cell, row) => {
        return (
          <Link href={ROUTES.group_users.replace(":id", row.id)}>{cell}</Link>
        );
      },
    },
    {
      dataField: "admins_count",
      text: <Trans>Admins</Trans>,
      sort: true,
    },
    {
      dataField: "pools_count",
      text: <Trans>Pools</Trans>,
      sort: true,
    },
    {
      dataField: "total_pool_amount",
      text: <Trans>Amount in pools</Trans>,
      sort: true,
      formatter: priceFormatter,
    },
    {
      dataField: "withdraw",
      text: <Trans>Withdrawal</Trans>,
      sort: true,
      formatter: priceFormatter,
    },
    {
      dataField: "status",
      text: <Trans>Status</Trans>,
      sort: true,
      formatter: (cell, row) => {
        return permissions && permissions.edit ? (
          <BootstrapSwitchButton
            checked={cell == 1}
            onChange={(check) => {
              statusChange(check, row);
            }}
            onlabel="On"
            offlabel="Off"
            size="sm"
            onstyle="secondary"
          />
        ) : (
          <span
            className={`py-1 px-2 rounded ${
              cell ? "alert-warning" : "alert-success"
            }`}
          >
            {cell}
          </span>
        );
      },
    },
    {
      dataField: "message",
      text: <Trans>Message</Trans>,
      formatter: SendGroupMessage,
    },

    {
      dataField: "group",
      text: <Trans>Admins</Trans>,
      formatter: GroupAdminsMembers,
    },
    {
      dataField: "edit",
      text: <Trans>Edit</Trans>,
      formatter: (cell, row) => {
        const html = (
          <div className="icon-holder bg-secondary text-center p-2 rounded">
            <i className="mdi mdi-square-edit-outline"></i>
          </div>
        );
        return permissions && permissions.edit ? (
          <Link
            className="nav-link p-0"
            href={ROUTES.edit_organization_group.replace(":id", row.id)}
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
      {permissions && (
        <>
          <PaginationProvider
            pagination={paginationFactory({
              custom: true,
              totalSize: totalGroups,
              page: page,
              sizePerPage: sizePerPage,
              paginationComponent: PaginationListStandalone,
            })}
            keyField="id"
            columns={columns}
            data={group}
          >
            {({ paginationProps, paginationTableProps }) => (
              <ToolkitProvider
                keyField="id"
                columns={columns}
                data={group}
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
                                  <Trans>Groups</Trans>
                                </h6>
                              </div>
                              {org_id && permissions && permissions.add && (
                                <div className="col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin pl-3 pr-0 ml-auto text-right">
                                  <Link
                                    className="text-white text-decoration-none"
                                    href={ROUTES.add_organization_group}
                                  >
                                    <Button variant="primary">
                                      <Trans>Add Group</Trans>
                                    </Button>
                                  </Link>
                                </div>
                              )}
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
                      <div className="flex items-center justify-between w-full px-3 mt-1">
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
            <Modal show={groupMessageModal} onHide={handleGroupMessageModal}>
              <div
                className="card bg-warning text-center p-2"
                style={{ borderRadius: "1rem" }}
              >
                <h4 className="font-weight-semibold">
                  Send message to Admins of group “
                  {groupAdmin.title ? groupAdmin.title : ""}”{" "}
                </h4>
                <div
                  className="card-body p-0"
                  style={{ padding: "0px !important" }}
                >
                  <textarea
                    className="card-text w-100 h-80 border-0"
                    style={{ borderRadius: ".5rem", height: "7rem" }}
                    onChange={(e) => {
                      setTextGroupMessage(e.target.value);
                    }}
                  ></textarea>
                  <button
                    className="btn btn-success"
                    onClick={groupMessageSend}
                  >
                    Send
                  </button>
                </div>
              </div>
            </Modal>
          </div>
          <div className="row">
            <Modal show={groupMemberModal} onHide={handleGroupMemberModal}>
              <div
                className="card bg-warning p-2"
                style={{ borderRadius: "1rem" }}
              >
                <h4 className="font-weight-semibold text-center text-dark">
                  {groupAdmin.title ? groupAdmin.title : "Group Members"}
                </h4>
                {groupAdmins.length > 0 ? (
                  <div
                    className="card-body m-3 bg-white"
                    style={{ borderRadius: "1rem" }}
                  >
                    <div className="card-text text-dark">
                      <h4>Group Admins</h4>
                      <div className="table-responsive">
                        <Table striped bordered hover>
                          <tbody>
                            {groupAdmins.map((admin, key) => (
                              <tr key={key}>
                                <td>
                                  <Form>
                                    {["checkbox"].map((type) => (
                                      <div key={`inline-${type}`}>
                                        <Form.Check
                                          inline
                                          name={
                                            groupAdmin.title
                                              ? groupAdmin.title
                                              : "Group Members"
                                          }
                                          type={type}
                                          id={`inline-${type}-1`}
                                        />
                                      </div>
                                    ))}
                                  </Form>
                                </td>
                                <td>
                                  {admin.first_name + " " + admin.last_name}
                                </td>
                                <td>
                                  <div
                                    className="icon-holder bg-secondary text-center p-2 rounded cursor-pointer"
                                    style={
                                      permissions.add
                                        ? { cursor: "pointer" }
                                        : {}
                                    }
                                    onClick={() =>
                                      SendGroupAdminMemberMessage(admin)
                                    }
                                  >
                                    <i className="mdi mdi-comment-processing"></i>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}
                {groupMembers.length > 0 ? (
                  <div
                    className="card-body m-3 bg-white"
                    style={{ borderRadius: "1rem" }}
                  >
                    <div className="card-text text-dark">
                      <h4>Group members</h4>
                      <div className="table-responsive">
                        <Table striped bordered hover>
                          <tbody>
                            {groupMembers.map((member, key) => (
                              <tr key={key}>
                                <td>
                                  <Form>
                                    {["checkbox"].map((type) => (
                                      <div key={`inline-${type}`}>
                                        <Form.Check
                                          inline
                                          name={
                                            groupAdmin.title
                                              ? groupAdmin.title
                                              : "Group Members"
                                          }
                                          type={type}
                                          id={`inline-${type}-1`}
                                        />
                                      </div>
                                    ))}
                                  </Form>
                                </td>
                                <td>
                                  {member.name
                                    ? member.name
                                    : member.first_name +
                                      " " +
                                      member.last_name}
                                </td>
                                <td>
                                  <div
                                    className="icon-holder bg-secondary text-center p-2 rounded cursor-pointer"
                                    style={
                                      permissions.add
                                        ? { cursor: "pointer" }
                                        : {}
                                    }
                                    onClick={() =>
                                      SendGroupAdminMemberMessage(member)
                                    }
                                  >
                                    <i className="mdi mdi-comment-processing"></i>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </Modal>
          </div>
          <div className="row">
            <Modal show={messageModal} onHide={handleMessageModal}>
              <div
                className="card bg-warning text-center p-2"
                style={{ borderRadius: "1rem" }}
              >
                <h4 className="font-weight-semibold">
                  Send message to{" "}
                  {selectedUser.first_name + " " + selectedUser.last_name}
                </h4>
                <div
                  className="card-body p-0"
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
          <div className="row">
            <Modal show={deletegroupModal} onHide={handleDeleteGroupModal}>
              <div
                className="card bg-warning text-center p-2"
                style={{ borderRadius: "1rem" }}
              >
                <h4 className="font-weight-semibold">
                  Are you sure you want to delete this Group?{" "}
                </h4>
                <div className="card-body">
                  <button
                    type="button"
                    className="btn btn-dark font-weight-bold"
                    style={{ borderRadius: "5px" }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </Modal>
          </div>
        </>
      )}
    </>
  );
}
export default OrganizationGroupTable;
