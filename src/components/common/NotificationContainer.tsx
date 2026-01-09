import { createContext, useState, type ReactNode } from "react";
import { Notification } from "./Notification";

interface NotificationData {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface NotificationContextType {
  showNotification: (type: "success" | "error" | "info", message: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotifications((prev) => {
      // If it's an error, we only want one at a time.
      // Also check for duplicate messages regardless of type.
      const isDuplicate = prev.some((n) => n.message === message && n.type === type);
      if (isDuplicate) return prev;

      if (type === "error") {
        // Replace existing error or just add if no error.
        // The requirement is "Show only one error toast at a time".
        const filtered = prev.filter((n) => n.type !== "error");
        return [...filtered, { id: Date.now().toString(), type, message }];
      }

      return [...prev, { id: Date.now().toString(), type, message }];
    });
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};