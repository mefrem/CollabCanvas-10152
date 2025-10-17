import { User, Clock } from "lucide-react";

const EditHistoryBadge = ({ selectedObjects }) => {
  if (!selectedObjects || selectedObjects.length === 0) return null;

  // Get the most recently edited object
  const mostRecentObject = selectedObjects.reduce((latest, obj) => {
    if (!latest) return obj;
    if (!obj.lastEditedAt) return latest;
    if (!latest.lastEditedAt) return obj;
    return new Date(obj.lastEditedAt) > new Date(latest.lastEditedAt)
      ? obj
      : latest;
  }, null);

  if (!mostRecentObject || !mostRecentObject.lastEditedBy) return null;

  // Calculate position - top right of the canvas
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        padding: "8px 12px",
        zIndex: 1500,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "12px",
        color: "#374151",
        animation: "fadeIn 0.2s ease",
        border: "1px solid #e5e7eb",
      }}
    >
      <User size={14} color="#3b82f6" />
      <div>
        <div style={{ fontWeight: "600", fontSize: "11px", color: "#6b7280" }}>
          Last edited by
        </div>
        <div style={{ fontWeight: "500", marginTop: "2px" }}>
          {mostRecentObject.lastEditedBy}
        </div>
      </div>
      {mostRecentObject.lastEditedAt && (
        <>
          <div
            style={{
              width: "1px",
              height: "24px",
              background: "#e5e7eb",
              margin: "0 4px",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={12} color="#9ca3af" />
            <span style={{ color: "#9ca3af", fontSize: "11px" }}>
              {formatTimestamp(mostRecentObject.lastEditedAt)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default EditHistoryBadge;
