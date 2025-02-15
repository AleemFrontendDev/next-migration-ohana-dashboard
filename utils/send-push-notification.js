import { toast } from "react-toastify";
import { BASE_URL } from "@/utils/common";

const authToken = localStorage.getItem("Auth Token");

const getAccessToken = async () => {
  const response = await fetch(
    `${BASE_URL}/v1/get-firebase-notification-token`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-api-key": "Ohana-Agent-oo73",
      },
    }
  );
  const jsonData = await response.json();
  console.log("json data 17", jsonData);
  if (jsonData.status === "success") {
    return jsonData.token;
  } else {
    console.log(jsonData.message);
    throw new Error(jsonData.message);
  }
};

export const sendPushNotification = async ({ fcmToken, message, title }) => {
  const myotificationToken = await getAccessToken();
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${myotificationToken}`,
    },
    body: JSON.stringify({
      message: {
        token: fcmToken,
        notification: {
          body: message ?? "",
          title: title ?? "",
        },
      },
    }),
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
  };
  await fetch(
    `https://fcm.googleapis.com/v1/projects/${process.env.REACT_APP_FIREBASE_PROJECT_ID}/messages:send`,
    requestOptions
  )
    .then((response) => response.json())
    .then((data) => console.log({ postId: data.id }))
    .catch((error) => {
      console.log("Error in sending notification", error);
      toast.error("Error sending notification");
    });
};
