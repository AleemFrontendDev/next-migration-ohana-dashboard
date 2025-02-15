"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, Redirect, useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import useInterval, { BASE_URL, ROUTES, PUSH_KEY } from "@/utils/common";
import Spinner from "react-bootstrap/Spinner";
import useCountry from "@/hooks/useCountry";
import useUser from "@/hooks/useUser";
import { toast } from "react-toastify";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
// import { Modal } from "react-bootstrap";

import db from "@/firebase/firebase-config";
import { sendPushNotification } from "@/utils/send-push-notification";
import Image from "next/image";


// Modal For Image displaying
const CustomModal = ({ show, onClose, imageSrc }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full relative"
      onClick={(e) => {e.stopPropagation()}}
      >
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Modal Title */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Image</h2>

        {/* Modal Image */}
        <div className="flex justify-center">
          <Image
            layout="intrinsic"
            width={500}
            height={300} 
            src={imageSrc}
            alt="Selected"
            className="max-w-full h-auto rounded-md"
          />
        </div>
      </div>
    </div>
  );
};


export function VerifyRequestDetails() {
  const history = useRouter();
  const [currentPage, setCurrentPage] = useState({ page: 1, sizePerPage: 10 });
  const [show, setShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { id } = useParams();
  const [userVerify, setUserVerify] = useState({});
  console.log("userVerify", userVerify);
  const [hideButton, setHideButton] = useState(false);
  const [permissions, setPermissions] = useState(0);
  const [users, setUsers] = useState([]);
  const { page, sizePerPage } = currentPage;
  const [sort, setSort] = useState({ field: "", order: "" });
  const [activeUsers, setActiveUsers] = useState([]);
  const [contributingUser, setContributingUser] = useState([0]);
  const [orphanUsers, setOrphanUsers] = useState([0]);
  const { field, order } = sort;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [totalNumUsers, setTotalNumUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const authToken = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("Auth Token") : null), []);
  const date = new Date();
  const { country } = useCountry();
  const { user } = useUser();
  const [authUser, setAuthUser] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const disableRightClick = (e) => {
    e.preventDefault();
    alert("Right-click is disabled on this page in live environment.");
  };

  useEffect(() => {
    if (BASE_URL === "https://ohana.africa/hook/api") {
      window.addEventListener("contextmenu", disableRightClick);
    }
    return () => {
      window.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  const handleShow = (image) => {
    setSelectedImage(image);
    setShow(true);
  };

  const handleClose = () => setShow(false);

  const fetchPermissionsAuthUserAndUsers = async () => {
    const response = await fetch(
      `${BASE_URL}/v1/get-all-verifications?page=${page}&size=${sizePerPage}`,
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

  useEffect(() => {
    fetchPermissionsAuthUserAndUsers();
  }, [country, page, sizePerPage, filter, search, field, order]);

  useInterval(fetchPermissionsAuthUserAndUsers, 20000, 5);

  const fetchUser = async () => {
    const response = await fetch(
      `${BASE_URL}/v1/get-all-verifications?user_id=${id}`,
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
    if (jsonData.status === "success") {
      setSpinner(false);
      setUserVerify(jsonData.data);
    }
    if (!user?.role_id) {
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

  const sendNotification = async (user, message) => {
    const data = {
      isSeen: false,
      message: message,
      receivename: user.first_name + " " + user.last_name,
      receiverUid: user.user_id,
      receiver_image: user.profile_url,
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
      user.user_id
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
      user.user_id,
      "chats",
      date.toISOString().replace("T", " ").replace("Z", "")
    );
    await setDoc(sendMessageSupportCol, data);
    // Update Receiver User Last Message Field.
    const receiverChatCol = doc(
      db.db,
      "chats",
      user.user_id,
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
      user.user_id,
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
      body: message,
      created_at: new Date(),
      created_by: authUser.user_id,
      id: date.toISOString().replace("T", " ").replace("Z", ""),
      isSeen: false,
      receiver: user.user_id,
      receivers: [user.user_id],
      sortingKey: Date.now(),
      status: "",
      title: authUser.first_name + " " + authUser.last_name,
      type: "notificationType.ohanaSupport",
      withdraw_req_id: "",
    };
    await setDoc(notificationsCol, notificationData);
    // Push Notification To A User From Support Chat
    await sendPushNotification({
      fcmToken: user.fcm_token,
      message: message,
      title: authUser.name
        ? authUser.name
        : authUser.first_name + " " + authUser.last_name,
    });
    // const requestOptions = {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //      Authorization: `key=${PUSH_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     to: user.fcm_token,
    //     notification: {
    //       body: message,
    // title: authUser.name
    //   ? authUser.name
    //   : authUser.first_name + " " + authUser.last_name,
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
    fetchPermissionsAuthUserAndUsers();
  };

  useEffect(() => {
    setSpinner(true);
    fetchUser();
  }, [id]);

  useInterval(fetchUser, 20000, 5);

  const rejectAccount = async () => {
    if (permissions.edit) {
      try {
        const response = await fetch(
          `${BASE_URL}/v1/reject-user-id-verification?user_id=${userVerify.user_id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
              "x-api-key": "Ohana-Agent-oo73",
            },
            body: JSON.stringify({}),
          }
        );
        const jsonData = await response.json();
        if (jsonData.status === "success") {
          console.log("277", userVerify?.phone.startsWith("+228"));
          const notificationMessage =
            userVerify?.language === "French" ||
            userVerify?.phone.startsWith("+228")
              ? `Vérification d'identité non réussie\nBonjour ${userVerify.first_name} ${userVerify.last_name},\nNous regrettons de vous informer que votre vérification d'identité n'a pas été réussie. Cela peut être dû à l'une des raisons suivantes :\n\n• Le document téléchargé est flou ou incomplet.\n• Les informations fournies ne correspondent pas à nos dossiers.\n• Le type de document n'est pas pris en charge.\n\nPour résoudre ce problème, veuillez vérifier votre soumission et réessayer en téléchargeant un document d'identité clair, complet et valide. Assurez-vous que tous les détails sont visibles et correspondent aux informations de votre profil.\nSi vous avez besoin d'aide ou si vous avez des questions, n'hésitez pas à contacter notre équipe d'assistance en répondant tout simplement à ce message.\n Nous sommes là pour vous aider !\nMerci de votre compréhension.\nCordialement,\nL'équipe Ohana
`
              : `ID Verification Unsuccessful\nHello ${userVerify.first_name} ${userVerify.last_name},\n\nWe regret to inform you that your ID verification was unsuccessful. This could be due to one or more of the following reasons:\n\n • The document uploaded was unclear or incomplete.\n • The information provided does not match our records.\n • The document type is not supported.\n\nTo resolve this, please review your submission and try again by uploading a clear, complete, and valid ID document. Make sure all details are visible and match the information on your profile.\n\nIf you need any assistance or have any questions, please do not hesitate to contact our support team by simply replying to this message. We're here to help!\n\nThank you for your understanding.\n\nBest regards,\nThe Ohana Team`;
          sendNotification(userVerify, notificationMessage);
          toast.success("Id verification has been rejected.");
          setHideButton(true);
          fetchUser();
          history.push(ROUTES.verify_request);
        } else {
          if (typeof jsonData.message === "string") {
            toast.error(jsonData.message);
          } else {
            toast.error("There was an error processing your request.");
          }
          console.log("Error rejecting account:", jsonData);
        }
      } catch (error) {
        console.error("Error verifying account:", error);
        toast.error("There was an error processing your request.");
      }
    }
  };

  const approveAccount = async () => {
    if (permissions.edit) {
      // await createSubWalletApi(userVerify);
      try {
        const response = await fetch(
          `${BASE_URL}/v1/approve-user-id-verification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
              "x-api-key": "Ohana-Agent-oo73",
            },
            body: JSON.stringify({ user_id: userVerify.user_id }),
          }
        );
        const jsonData = await response.json();
        if (jsonData.status === "success") {
          console.log("277", userVerify?.phone.startsWith("+228"));
          const notificationMessage =
            userVerify?.language === "French" ||
            userVerify?.phone?.startsWith("+228")
              ? `Vérification d'identité réussie ! 🎉\nBonjour ${userVerify.first_name} ${userVerify.last_name},\n\nBonne nouvelle ! Votre vérification d'identité est terminée, et vous avez maintenant un accès complet à toutes les fonctionnalités d'Ohana. \n\nVous pouvez désormais :\n• Rejoindre et créer des groupes pour commencer à épargner et gérer vos cotisations.\n• Faire une demande de prêt et explorer les autres outils financiers disponibles.\n• Retirer des fonds de manière sécurisée et facile.\n• Et bien plus encore !\n\nNous sommes ravis de vous accueillir pleinement ! Si vous avez des questions ou besoin d'aide, notre équipe de support est toujours là pour vous.\nBienvenue dans la communauté Ohana !\n\nCordialement,\nL'équipe Ohana`
              : `ID Verification Successful! 🎉\nHello ${userVerify.first_name} ${userVerify.last_name},\n\nGreat news! Your ID verification is complete, and you now have full access to all the features of Ohana.\n\nYou can now:\n• Join and create groups to start saving and managing contributions.\n• Apply for loans and explore other financial tools available to you.\n• Withdraw funds securely and easily.\n• And much more!\n\nWe're thrilled to have you fully onboard! If you have any questions or need help, our support team is always here for you.\nWelcome to the Ohana community!\n\nBest regards,\nThe Ohana Team`;

          sendNotification(userVerify, notificationMessage);
          toast.success("Id verification has been approved.");
          setHideButton(true);
          fetchUser();

          history.push(ROUTES.verify_request);
        } else {
          if (typeof jsonData.message === "string") {
            toast.error(jsonData.message);
          } else {
            toast.error("There was an error processing your request.");
          }
          console.log("Error approving account:", jsonData);
        }
      } catch (error) {
        console.log("Error approving account:", error);

        toast("There was an error processing your request.");
      }
    }
  };

  const createSubWalletApi = async (userData) => {
    console.log("Create Sub Wallet User Data", userData);
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/v1/create-user-sub-wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          country: userData.country,
          masterWalletNo: process.env.REACT_APP_MASTER_WALLET_NO,
          first_name: userData.first_name,
          middle_name: userData.middle_name ?? "",
          last_name: userData.last_name,
          gender: userData.gender,
          date_of_birth: userData.date_of_birth,
          email: userData.email ?? "",
          phone: userData.phone,
          city: userData.city,
          bvn: userData.bvn ?? "",
          account: "",
          identityNo: userData.identityNo,
          identityType: userData.id_type,
          idIssueDate: userData.idIssueDate,
          idExpiryDate: userData.idExpiryDate,
          document: "",
          password: "1234",
          kycLevel: userData.kycLevel ?? "TIER1",
          user_id: userData.user_id,
        }),
      });
      const jsonData = await response.json();
      console.log("Create Sub Wallet Response", jsonData);

      if (jsonData?.headerResponse?.responseMessage === "SUCCESS") {
        console.log("Sub wallet created successfully", response);
        toast.success("Sub Wallet Created successfully.");
      } else {
        console.log("Error creating sub wallet:", jsonData);
        toast.error("Error creating sub wallet.", jsonData);
      }
    } catch (error) {
      console.log("Error creating sub wallet:", error);
      toast.error("Error creating sub wallet catch.", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userVerify) {
    return <Redirect to={ROUTES.verify_request} />;
  } else {
    return (
      <>
        {permissions?.view && !spinner ? (
          <>
            <div className="d-flex flex-column justify-content-end mb-4 ml-2">
              <div className="page-header">
                <h3 className="page-title">ID Verification Request</h3>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  className="btn-lg d-flex align-items-center text-black justify-content-center w-20 mr-2 bg-transparent"
                  style={{ height: "33px", width: "200px" }}
                  onClick={() => rejectAccount(false)}
                  disabled={isLoading}
                >
                  Reject
                </button>
                <button
                  className="d-flex w-20 align-items-center justify-content-center border border-1 rounded bg-warning"
                  style={{ height: "33px", width: "200px" }}
                  onClick={() => approveAccount()}
                  disabled={isLoading}
                >
                  Approve
                </button>
              </div>
            </div>

            <div className="card p-4 mx-auto w-75 list-element">
              <div className="row">
                <div className="col-sm-12">
                  <div className="border p-4 w-100">
                    <div className="row">
                      <div className="col-sm-6 ">
                        <span style={{ fontWeight: 200 }}>First Name</span>

                        <div className="fw-bold" style={{ fontWeight: 500 }}>
                          {userVerify.first_name}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <span style={{ fontWeight: 200 }}>Middle Name</span>
                        <div className="fw-bold" style={{ fontWeight: 500 }}>
                          {userVerify.middle_name}
                        </div>
                      </div>

                      <div className=" bg-black border-bottom w-100 my-3  "></div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <span style={{ fontWeight: 200 }}>Last Name</span>
                        <div className="fw-bold" style={{ fontWeight: 500 }}>
                          {userVerify.last_name}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <span style={{ fontWeight: 200 }}>Date of Birth</span>
                        <div className="fw-bold" style={{ fontWeight: 500 }}>
                          {new Date(
                            userVerify.date_of_birth
                          ).toLocaleDateString("en-US")}
                        </div>
                      </div>

                      <div className=" bg-black border-bottom w-100 my-3 "></div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <span style={{ fontWeight: 200 }}>Gender</span>
                        <div className="fw-bold" style={{ fontWeight: 500 }}>
                          {userVerify.gender}
                        </div>
                      </div>
                      <div className="col-md-6 ">
                        <span style={{ fontWeight: 200 }}>
                          {" "}
                          Residentry Country{" "}
                        </span>
                        <div style={{ fontWeight: 500 }} className="fw-bold">
                          {userVerify.country}
                        </div>
                      </div>

                      <div className=" bg-black border-bottom w-100 my-3  "></div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <span style={{ fontWeight: 200 }}>City</span>
                        <div style={{ fontWeight: 500 }} className="fw-bold">
                          {userVerify?.city}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <span style={{ fontWeight: 200 }}>Phone No</span>
                        <div style={{ fontWeight: 500 }} className="fw-bold">
                          {userVerify.phone}
                        </div>
                      </div>

                      <div className=" bg-black border-bottom w-100 my-3 "></div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <span style={{ fontWeight: 200 }}>Occupation</span>
                        <div style={{ fontWeight: 500 }} className="fw-bold">
                          {userVerify?.occupation}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div>Identity Type</div>
                        <span className="font-weight-bold">
                          {userVerify.identityType ?? "National Id Card"}
                        </span>
                      </div>
                      <div className=" bg-black border-bottom w-100 my-3 "></div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div>{userVerify.identityType} Number:</div>
                        <span className="font-weight-bold">
                          {userVerify?.id_number}
                        </span>
                      </div>

                      <div className="bg-black border-bottom w-100 my-3 "></div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <Image
                          src={userVerify?.image_front_url}
                          alt="Front"
                          style={{ width: 200 }}
                          onClick={() =>
                            handleShow(userVerify?.image_front_url)
                          }
                          layout="intrinsic"
                          width={500}
                          height={300} 
                        ></Image>
                      </div>
                      {userVerify?.image_back_url && (
                        <div className="col-md-6">
                          <Image
                            src={userVerify?.image_back_url}
                            alt="Back"
                            style={{ width: 200 }}
                            onClick={() =>
                              handleShow(userVerify?.image_back_url)
                            }
                            layout="intrinsic"
                            width={500}
                            height={300} 
                          ></Image>
                        </div>
                      )}
                    </div>
                    <div />
                  </div>
                </div>
              </div>
            </div>
            <CustomModal show={show} onClose={handleClose} imageSrc={selectedImage} />
          </>
        ) : spinner ? (
          <Spinner
            animation="grow"
            style={{ left: "55%", bottom: "50%", position: "fixed" }}
          />
        ) : (
          <div className="text-center mt-5 pt-5">
            <h1>Permission Denied!</h1>
            <p>Sorry!, You don't have permission to access this module.</p>
          </div>
        )}
      </>
    );
  }
}
export default VerifyRequestDetails;
