"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import {
  getDoc,
  getDocs,
  doc,
  query,
  collection,
  setDoc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import db from "@/firebase/firebase-config";
import useInterval, { BASE_URL, PUSH_KEY } from "@/utils/common";
import { formatAMPM, formatDate } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { sendPushNotification } from "@/utils/send-push-notification";
import { useAuthToken } from "@/utils/useAuthToken";

export function Support() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(0);
  const [authUser, setAuthUser] = useState(0);
  const [userIds, setUserIds] = useState([]);
  const [supportChats, setSupportChats] = useState([]);
  const [chatField, setChatField] = useState("");
  const [permissions, setPermissions] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const [search, setSearch] = useState("");
  const { country } = useCountry();
  const { user } = useUser();
  const date = new Date();
  const authToken = useAuthToken();

  const fetchUsersIds = async () => {
    // if (db.auth.currentUser) {
    const supportChatsCol = query(
      collection(db.db, "chats", "support_chat", "recent_chats"),
      orderBy("time", "desc")
    );
    const supportChatData = await getDocs(supportChatsCol);
    const user_ids = supportChatData.docs.map((doc) => {
      return doc.id;
    });
    setUserIds(user_ids);
    if (!user?.role_id) {
      setPermissions({ add: true, view: true, edit: true, delete: true });
      // const supportUsersCol = doc(db.db, "users", "support_chat");
      // const supportUserData = await getDoc(supportUsersCol);
      // const supportUserList = supportUserData.data();
      // if (supportUserList) {
      //   setAuthUser(supportUserList);
      // }
      const response = await fetch(`${BASE_URL}/users-by-ids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({ userIds: ["support_chat"] }),
      });
      const jsonData = await response.json();
      if (jsonData.success) {
        setSpinner(false);
        if (jsonData.users.length > 0) {
          const supportChatUser = jsonData.users[0];
          setAuthUser(supportChatUser);
        }
      }
    } else {
      var groupPermission = user.role.permissions.filter(
        (permission) => permission.section === "Support"
      );
      if (groupPermission.length && groupPermission[0].status) {
        setPermissions(...groupPermission);
      }
      setAuthUser(user);
    }
    // }
  };

  useEffect(() => {
    if (!authToken) return;
    fetchUsersIds();
  }, [authToken]);

  useMemo(async () => {
    if (userIds.length) {
      const response = await fetch(`${BASE_URL}/users-by-ids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-api-key": "Ohana-Agent-oo73",
        },
        body: JSON.stringify({ userIds, search }),
      });
      const jsonData = await response.json();
      if (jsonData.success) {
        setUsers(jsonData.users);
        if (!selectedUser && jsonData.users.length) {
          setSelectedUser(jsonData.users[0]);
        }
        if (!search && !jsonData.users.length) {
          setSelectedUser(0);
          setSupportChats([]);
        }
      }
    }
  }, [search, userIds, country]);

  useMemo(async () => {
    if (selectedUser) {
      const supportChatsCol = query(
        collection(
          db.db,
          "chats",
          "support_chat",
          "recent_chats",
          selectedUser.user_id,
          "chats"
        ),
        orderBy("sortingKey", "asc")
      );
      const supportChatData = await getDocs(supportChatsCol);
      const supportChatList = supportChatData.docs.map((doc) => doc.data());
      setSupportChats(supportChatList);
      setSpinner(false);
    }
  }, [selectedUser]);

  async function refreshMessages() {
    if (selectedUser) {
      const supportChatsCol = query(
        collection(
          db.db,
          "chats",
          "support_chat",
          "recent_chats",
          selectedUser.user_id,
          "chats"
        ),
        orderBy("sortingKey", "asc")
      );
      const supportChatData = await getDocs(supportChatsCol);
      const supportChatList = supportChatData.docs.map((doc) => doc.data());
      setSupportChats(supportChatList);
      setSpinner(false);
    }
  }

  useInterval(fetchUsersIds, 20000, 5);

  useInterval(refreshMessages, 20000, 5);

  const sendMessage = useCallback(async () => {
    if (chatField && permissions.add && selectedUser) {
      // Chat Data
      const data = {
        isSeen: false,
        message: chatField,
        receivername: selectedUser.name
          ? selectedUser.name
          : selectedUser.first_name + " " + selectedUser.last_name,
        receiverUid: selectedUser.user_id,
        receiver_image: selectedUser.profile_url,
        senderUid: authUser.user_id,
        sender_image: authUser.profile_url,
        sendername:
          (authUser.name
            ? authUser.name
            : authUser.first_name === "Ohana" &&
              authUser.last_name === "Support"
            ? authUser.first_name
            : authUser.first_name + " " + authUser.last_name) + " - Support",
        sortingKey: Date.now(),
        time: new Date(),
        type: "text",
      };

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

      // Update Support Chat Last Message Field.
      const supportChatCol = doc(
        db.db,
        "chats",
        "support_chat",
        "recent_chats",
        selectedUser.user_id
      );
      await updateDoc(supportChatCol, data);

      // Created New Message For Receiver selectedUser.
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

      // Update Receiver User Last Message Field.
      const receiverUserChatCol = doc(
        db.db,
        "chats",
        selectedUser.user_id,
        "recent_chats",
        "support_chat"
      );
      await updateDoc(receiverUserChatCol, data);

      // Create New Notification.
      const notificationsCol = doc(
        db.db,
        "notifications",
        date.toISOString().replace("T", " ").replace("Z", "")
      );
      const notificationData = {
        body: chatField,
        created_at: new Date(),
        created_by: authUser.user_id,
        id: date.toISOString().replace("T", " ").replace("Z", ""),
        isSeen: false,
        receiver: selectedUser.user_id,
        receivers: [selectedUser.user_id],
        sortingKey: Date.now(),
        status: "",
        title: authUser.name
          ? authUser.name
          : authUser.first_name + " " + authUser.last_name,
        type: "notificationType.ohanaSupport",
        withdraw_req_id: "",
      };

      await setDoc(notificationsCol, notificationData);
      // Push Notification To A User From Support Chat
      await sendPushNotification({
        fcmToken: selectedUser.fcm_token,
        message: chatField,
        title: authUser.name
          ? authUser.name
          : authUser.first_name + " " + authUser.last_name,
      });
      // const requestOptions = {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `key=${PUSH_KEY}`,
      //   },

      // body: JSON.stringify({
      //   to: selectedUser.fcm_token,
      //   notification: {
      //     body: chatField,
      // title: authUser.name
      //   ? authUser.name
      //   : authUser.first_name + " " + authUser.last_name,
      //   },
      //   data: {
      //     notification_type: "db_notification",
      //     id: "",
      //   },
      // }),
      // };
      // fetch(
      //   `https://fcm.googleapis.com/fcm/send`,
      //   requestOptions
      // )
      //   .then((response) => response.json())
      //   .then((data) => console.log({ postId: data.id }));
      fetchUsersIds();
      setChatField("");
    }
    if (selectedUser) {
      const supportChatsCol = query(
        collection(
          db.db,
          "chats",
          "support_chat",
          "recent_chats",
          selectedUser.user_id,
          "chats"
        ),
        orderBy("sortingKey", "asc")
      );
      const supportChatData = await getDocs(supportChatsCol);
      const supportChatList = supportChatData.docs.map((doc) => doc.data());
      setSupportChats(supportChatList);
      setSpinner(false);
    }
  }, [authUser, chatField]);

  const runCallback = (cb) => {
    return cb();
  };

  return (
    <>
      {permissions && !spinner ? (
        <main className="content">
            <div className="container p-0">
              <div className="card">
                <div className="row g-0">
                  <>
                    <div className="col-12 col-lg-5 col-xl-3 border-right">
                      <div className="px-4 d-none d-md-block">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <input
                              type="text"
                              className="form-control my-3"
                              placeholder="Search..."
                              onChange={(e) => setSearch(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className="d-flex flex-column"
                        style={{
                          maxHeight: "100vh",
                          overflowY: "auto",
                          paddingRight: "1rem",
                          paddingLeft: "0.5rem",
                        }}
                      >
                        {runCallback(() => {
                          const row = [];
                          users?.map((user) => {
                            row.push(
                              <a
                                key={user?.user_id}
                                href="#"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setChatField("");
                                }}
                                className="list-group-item list-group-item-action border-0 p" // Adds margin bottom
                                style={{ cursor: "pointer" }} // Adds cursor pointer
                              >
                                <div className="d-flex align-items-center">
                                  <div
                                    className="rounded-circle overflow-hidden  border"
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      lineHeight: "40px",
                                      marginRight: "10px",
                                      flexShrink: 0, // Prevents the image from shrinking
                                    }}
                                  >
                                    <img
                                      src={
                                        user.profile_url
                                          ? user.profile_url
                                          : "https://bootdey.com/img/Content/avatar/avatar1.png"
                                      }
                                      alt={`${user.first_name} ${user.last_name}`}
                                      style={{
                                        verticalAlign: "initial",
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </div>
                                  <div className="flex-grow-1 max-line-2">
                                    {" "}
                                    {/* Prevents text overflow */}
                                    {user.first_name + " " + user.last_name}
                                  </div>
                                </div>
                              </a>
                            );
                          });
                          return row;
                        })}
                      </div>
                      <hr className="d-block d-lg-none mt-1 mb-0" />
                    </div>
                    <div className="col-12 col-lg-7 col-xl-9">
                      <div className="py-2 px-4 border-bottom d-none d-lg-block">
                        <div className="d-flex align-items-center py-1 pb-3">
                          <div
                            className="position-relative rounded-circle overflow-hidden border"
                            style={{
                              width: "40px",
                              height: "40px",
                              lineHeight: "40px",
                            }}
                          >
                            <img
                              src={
                                selectedUser.profile_url
                                  ? selectedUser.profile_url
                                  : "https://bootdey.com/img/Content/avatar/avatar1.png"
                              }
                              alt={
                                selectedUser.first_name +
                                " " +
                                selectedUser.last_name
                              }
                              width="40"
                            />
                          </div>
                          <div className="flex-grow-1 pl-3">
                            <strong>
                              {selectedUser.first_name +
                                " " +
                                selectedUser.last_name}
                            </strong>
                            {selectedUser.email && (
                              <div className="d-flex">
                                <p className="text-muted small m-0">
                                  {selectedUser.email}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Tabs
                            defaultActiveKey="conversation"
                            transition={false}
                            id="noanim-tab-example"
                            className="mb-3"
                          >
                            <Tab eventKey="conversation" title="Conversation">
                              <div className="position-relative">
                                <div className="chat-messages p-4 ">
                                  {runCallback(() => {
                                    const row = [];
                                    supportChats.map((chat) => {
                                      row.push(
                                        <div
                                          key={chat.sortingKey}
                                          className={`${
                                            chat.senderUid == authUser.user_id
                                              ? "chat-message-right"
                                              : "chat-message-left"
                                          } pb-4`}
                                        >
                                          <div>
                                            <div
                                              className="rounded-circle overflow-hidden border"
                                              style={{
                                                width: "40px",
                                                height: "40px",
                                                lineHeight: "40px",
                                              }}
                                            >
                                              <img
                                                src={
                                                  chat.senderUid ===
                                                  selectedUser?.user_id
                                                    ? selectedUser?.profile_url ||
                                                      "https://bootdey.com/img/Content/avatar/avatar1.png"
                                                    : chat?.sender_image &&
                                                      chat?.sender_image.trim() !==
                                                        ""
                                                    ? chat.sender_image
                                                    : "https://bootdey.com/img/Content/avatar/avatar1.png"
                                                }
                                                alt={chat.sendername}
                                                width="40"
                                                style={{
                                                  borderRadius: "50%",
                                                  marginTop: "0px",
                                                }}
                                              />
                                            </div>
                                            <div className="text-muted small text-nowrap mt-2">
                                              {formatAMPM(
                                                new Date(
                                                  chat.time.seconds * 1000
                                                )
                                              )}
                                            </div>
                                          </div>
                                          <div
                                            className={`flex-shrink-1 bg-light rounded py-2 px-3 ${
                                              chat.senderUid == authUser.user_id
                                                ? "mr-3"
                                                : "ml-3"
                                            }`}
                                          >
                                            <div className="font-weight-bold mb-1">
                                              {chat.sendername}
                                            </div>
                                            {chat.type === "audio" ? (
                                              <audio controls>
                                                <source
                                                  src={chat.message}
                                                  type="audio/mpeg"
                                                ></source>
                                              </audio>
                                            ) : (
                                              chat.message
                                            )}
                                            <br />
                                            <small className="text-sm text-muted">
                                              {formatDate(
                                                new Date(
                                                  chat.time.seconds * 1000
                                                )
                                              )}
                                            </small>
                                          </div>
                                        </div>
                                      );
                                    });
                                    return row;
                                  })}
                                </div>
                              </div>
                              {permissions && permissions.add ? (
                                <div className="flex-grow-0 py-3 px-4 border-top">
                                  <div className="input-group">
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Type your message"
                                      value={chatField}
                                      onChange={(e) =>
                                        setChatField(e.target.value)
                                      }
                                    />
                                    <button
                                      className="btn btn-primary"
                                      onClick={sendMessage}
                                    >
                                      Send
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                            </Tab>
                            {permissions && permissions.view ? (
                              <Tab eventKey="profile" title="Profile">
                                <h1>Profile</h1>
                              </Tab>
                            ) : (
                              ""
                            )}
                          </Tabs>
                        </div>
                      </div>
                    </div>
                  </>
                </div>
              </div>
            </div>
        </main>
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
export default Support;
