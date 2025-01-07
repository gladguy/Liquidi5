import { notification } from "antd";

const Notify = (toastType, toastContent, toastDuration = 4) => {
  notification.open({
    placement: "bottom",
    type: toastType, //error, info, success, warning
    message: toastContent, //Message to be notified
    duration: toastDuration, //Duration of the toast
  });
};

export default Notify;
