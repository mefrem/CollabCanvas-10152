import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <XCircle size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      case "info":
        return <Info size={20} />;
      default:
        return <CheckCircle size={20} />;
    }
  };

  const getStyles = () => {
    const baseStyles = {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      fontSize: "14px",
      fontWeight: "500",
      animation:
        "slideInDown 0.3s ease, fadeOut 0.3s ease " + (duration - 300) + "ms",
      minWidth: "250px",
      maxWidth: "400px",
    };

    const typeStyles = {
      success: {
        background: "#10b981",
        color: "white",
      },
      error: {
        background: "#ef4444",
        color: "white",
      },
      warning: {
        background: "#f59e0b",
        color: "white",
      },
      info: {
        background: "#3b82f6",
        color: "white",
      },
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  return (
    <div style={getStyles()}>
      <div style={{ display: "flex", alignItems: "center" }}>{getIcon()}</div>
      <div style={{ flex: 1 }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: "bold",
          padding: "0",
          marginLeft: "8px",
          opacity: 0.8,
          transition: "opacity 0.15s ease",
        }}
        onMouseEnter={(e) => (e.target.style.opacity = "1")}
        onMouseLeave={(e) => (e.target.style.opacity = "0.8")}
      >
        ×
      </button>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "50%",
        transform: "translateX(50%)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: "auto" }}>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemoveToast(toast.id)}
          />
        </div>
      ))}

      <style>{`
        @keyframes slideInDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Custom hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};

export default Toast;
