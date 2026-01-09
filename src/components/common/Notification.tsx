import { useEffect, useState } from "react";
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from "react-icons/fi";

interface NotificationProps {
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Notification = ({ type, message, onClose, duration = 3000 }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: FiCheckCircle,
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/50",
      iconColor: "text-green-400",
      progressColor: "bg-green-500",
    },
    error: {
      icon: FiXCircle,
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/50",
      iconColor: "text-red-400",
      progressColor: "bg-red-500",
    },
    info: {
      icon: FiInfo,
      bgColor: "bg-cyan-500/20",
      borderColor: "border-cyan-500/50",
      iconColor: "text-cyan-400",
      progressColor: "bg-cyan-500",
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      className={`transition-all duration-300 transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`${config.bgColor} ${config.borderColor} border backdrop-blur-lg rounded-lg shadow-2xl p-4 pr-12 min-w-[300px] max-w-md relative`}
      >
        <div className="flex items-start gap-3">
          <Icon className={`${config.iconColor} text-xl flex-shrink-0 mt-0.5`} />
          <p className="text-white text-sm flex-1">{message}</p>
          <button
          title="submit"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.progressColor} rounded-full`}
            style={{
              animation: isVisible ? `progress ${duration}ms linear forwards` : 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};