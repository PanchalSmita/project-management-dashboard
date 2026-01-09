import { useContext } from "react";
import { NotificationContext } from "../components/common/NotificationContainer";

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const useNotifications = () => {
  const { showNotification } = useNotification();

  return {
    success: (msg: string) => showNotification("success", msg),
    error: (msg: string) => showNotification("error", msg),
    info: (msg: string) => showNotification("info", msg),
  };
};