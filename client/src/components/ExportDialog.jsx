import { useState } from "react";
import { Download, X, FileImage, FileCode, FileJson } from "lucide-react";

const ExportDialog = ({ isOpen, onClose, onExport, hasSelection }) => {
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(2);
  const [scope, setScope] = useState("canvas");
  const [fileName, setFileName] = useState("canvas-export");

  if (!isOpen) return null;

  const handleExport = () => {
    onExport({
      format,
      quality,
      selectionOnly: scope === "selection",
      fileName,
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9998,
          animation: "fadeIn 0.2s ease",
        }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          width: "480px",
          maxWidth: "90vw",
          zIndex: 9999,
          animation: "slideInDown 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Download size={24} color="#3b82f6" />
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
              Export Canvas
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {/* File Name */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              File Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>

          {/* Format */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Format
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                {
                  value: "png",
                  label: "PNG",
                  icon: FileImage,
                  desc: "Raster image",
                },
                {
                  value: "svg",
                  label: "SVG",
                  icon: FileCode,
                  desc: "Vector graphics",
                },
                {
                  value: "json",
                  label: "JSON",
                  icon: FileJson,
                  desc: "Canvas backup",
                },
              ].map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setFormat(fmt.value)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: `2px solid ${
                      format === fmt.value ? "#3b82f6" : "#d1d5db"
                    }`,
                    borderRadius: "8px",
                    background: format === fmt.value ? "#eff6ff" : "white",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <fmt.icon
                    size={24}
                    color={format === fmt.value ? "#3b82f6" : "#6b7280"}
                  />
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: format === fmt.value ? "#3b82f6" : "#374151",
                    }}
                  >
                    {fmt.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                    {fmt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality (only for PNG) */}
          {format === "png" && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#374151",
                }}
              >
                Quality / Resolution
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { value: 1, label: "1×", desc: "Standard" },
                  { value: 2, label: "2×", desc: "High" },
                  { value: 3, label: "3×", desc: "Ultra" },
                ].map((q) => (
                  <button
                    key={q.value}
                    onClick={() => setQuality(q.value)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: `2px solid ${
                        quality === q.value ? "#3b82f6" : "#d1d5db"
                      }`,
                      borderRadius: "8px",
                      background: quality === q.value ? "#eff6ff" : "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: quality === q.value ? "#3b82f6" : "#374151",
                      }}
                    >
                      {q.label}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {q.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scope */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Export Scope
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setScope("canvas")}
                disabled={false}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: `2px solid ${
                    scope === "canvas" ? "#3b82f6" : "#d1d5db"
                  }`,
                  borderRadius: "8px",
                  background: scope === "canvas" ? "#eff6ff" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: scope === "canvas" ? "#3b82f6" : "#374151",
                  }}
                >
                  Entire Canvas
                </div>
              </button>
              <button
                onClick={() => setScope("selection")}
                disabled={!hasSelection}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: `2px solid ${
                    scope === "selection" ? "#3b82f6" : "#d1d5db"
                  }`,
                  borderRadius: "8px",
                  background: scope === "selection" ? "#eff6ff" : "white",
                  cursor: hasSelection ? "pointer" : "not-allowed",
                  opacity: hasSelection ? 1 : 0.5,
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: scope === "selection" ? "#3b82f6" : "#374151",
                  }}
                >
                  Selection Only
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              background: "#3b82f6",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
    </>
  );
};

export default ExportDialog;
