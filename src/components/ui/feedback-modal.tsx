import React from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { Button } from "./button";

type FeedbackType = "success" | "error" | "warning" | "info";

interface FeedbackModalProps {
  isOpen: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
  showCloseButton?: boolean;
}

const feedbackConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconColor: "text-green-600",
    iconBgColor: "bg-green-100",
    titleColor: "text-green-800",
    messageColor: "text-green-700",
    actionStyle: "bg-green-600 hover:bg-green-700 text-white",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    iconBgColor: "bg-red-100",
    titleColor: "text-red-800",
    messageColor: "text-red-700",
    actionStyle: "bg-red-600 hover:bg-red-700 text-white",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-600",
    iconBgColor: "bg-yellow-100",
    titleColor: "text-yellow-800",
    messageColor: "text-yellow-700",
    actionStyle: "bg-yellow-600 hover:bg-yellow-700 text-white",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    iconBgColor: "bg-blue-100",
    titleColor: "text-blue-800",
    messageColor: "text-blue-700",
    actionStyle: "bg-blue-600 hover:bg-blue-700 text-white",
  },
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  type,
  title,
  message,
  description,
  actionLabel,
  onAction,
  onClose,
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const config = feedbackConfig[type];
  const Icon = config.icon;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${config.iconBgColor} flex items-center justify-center`}>
              <Icon size={20} className={config.iconColor} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${config.titleColor}`}>{title}</h3>
              {description && (
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
            <p className={`text-sm ${config.messageColor} leading-relaxed`}>
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          {!showCloseButton && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${config.actionStyle}`}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Convenience hooks for different types
export const useSuccessModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const showSuccess = (title: string, message: string, options?: {
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  }) => {
    setIsOpen(true);
    return {
      title,
      message,
      type: "success" as const,
      ...options,
    };
  };

  const closeModal = () => setIsOpen(false);

  return { isOpen, showSuccess, closeModal };
};

export const useErrorModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const showError = (title: string, message: string, options?: {
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  }) => {
    setIsOpen(true);
    return {
      title,
      message,
      type: "error" as const,
      ...options,
    };
  };

  const closeModal = () => setIsOpen(false);

  return { isOpen, showError, closeModal };
};

export default FeedbackModal;