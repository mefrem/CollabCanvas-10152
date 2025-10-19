import { useState } from "react";
import {
  Plus,
  Copy,
  Trash2,
  Edit2,
  Check,
  X,
  Smartphone,
  Tablet,
  Monitor,
  Share2,
  Frame,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FRAME_PRESETS } from "../hooks/useFrames";

const FramesPanel = ({
  frames,
  activeFrameId,
  onAddFrame,
  onUpdateFrame,
  onDeleteFrame,
  onDuplicateFrame,
  onSelectFrame,
  embedded = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAddingFrame, setIsAddingFrame] = useState(false);
  const [editingFrameId, setEditingFrameId] = useState(null);
  const [editName, setEditName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("phone");

  const categoryIcons = {
    phone: Smartphone,
    tablet: Tablet,
    desktop: Monitor,
    social: Share2,
    custom: Frame,
  };

  const handleStartEdit = (frame) => {
    setEditingFrameId(frame.id);
    setEditName(frame.name);
  };

  const handleFinishEdit = () => {
    if (editName.trim() && editingFrameId) {
      onUpdateFrame(editingFrameId, { name: editName.trim() });
    }
    setEditingFrameId(null);
    setEditName("");
  };

  const handleCancelEdit = () => {
    setEditingFrameId(null);
    setEditName("");
  };

  const handleAddFrame = (presetName, dimensions) => {
    onAddFrame({ name: presetName, ...dimensions });
    setIsAddingFrame(false);
  };

  const containerStyle = embedded
    ? {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "white",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }
    : {
        position: "fixed",
        bottom: "20px",
        left: "340px",
        width: "320px",
        maxHeight: "500px",
        background: "white",
        borderRadius: "var(--border-radius-lg)",
        boxShadow: "var(--shadow-xl)",
        zIndex: "var(--z-panel)",
        display: "flex",
        flexDirection: "column",
        animation: "slideInLeft 0.3s ease",
      };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div
        style={{
          padding: embedded ? "var(--spacing-lg)" : "var(--spacing-lg) var(--spacing-xl)",
          borderBottom: isCollapsed ? "none" : "1px solid var(--gray-200)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: embedded ? "transparent" : "var(--gray-50)",
        }}
      >
        {!embedded ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
              cursor: "pointer",
            }}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Frame size={20} color="var(--primary-color)" />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--gray-800)" }}>
              Frames
            </h3>
            {isCollapsed ? (
              <ChevronDown size={16} color="var(--gray-500)" />
            ) : (
              <ChevronUp size={16} color="var(--gray-500)" />
            )}
          </div>
        ) : (
          <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--gray-700)" }}>
            {frames.length} Frame{frames.length !== 1 ? "s" : ""}
          </div>
        )}
        {(!isCollapsed || embedded) && (
          <button
            onClick={() => setIsAddingFrame(!isAddingFrame)}
            style={{
              background: isAddingFrame ? "#ef4444" : "#3b82f6",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              color: "white",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = isAddingFrame
                ? "#dc2626"
                : "#2563eb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = isAddingFrame
                ? "#ef4444"
                : "#3b82f6")
            }
          >
            {isAddingFrame ? (
              <>
                <X size={14} />
                Cancel
              </>
            ) : (
              <>
                <Plus size={14} />
                New Frame
              </>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {(!isCollapsed || embedded) && (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
          }}
        >
          {/* Add Frame UI */}
          {isAddingFrame && (
            <div
              style={{
                marginBottom: "16px",
                padding: "16px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "12px",
                }}
              >
                Choose Preset
              </div>

              {/* Category Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  marginBottom: "12px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                }}
              >
                {Object.keys(FRAME_PRESETS).map((category) => {
                  const Icon = categoryIcons[category];
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      style={{
                        padding: "6px 12px",
                        border: `1px solid ${
                          selectedCategory === category ? "#3b82f6" : "#d1d5db"
                        }`,
                        borderRadius: "6px",
                        background:
                          selectedCategory === category ? "#eff6ff" : "white",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "500",
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Icon
                        size={12}
                        color={
                          selectedCategory === category ? "#3b82f6" : "#6b7280"
                        }
                      />
                      {category}
                    </button>
                  );
                })}
              </div>

              {/* Presets */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {Object.entries(FRAME_PRESETS[selectedCategory]).map(
                  ([name, dimensions]) => (
                    <button
                      key={name}
                      onClick={() => handleAddFrame(name, dimensions)}
                      style={{
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        background: "white",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#3b82f6";
                        e.currentTarget.style.background = "#f0f9ff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.background = "white";
                      }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: "500" }}>
                        {name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                        {dimensions.width} × {dimensions.height}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Frames List */}
          {frames.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 16px",
                color: "#9ca3af",
              }}
            >
              <Frame
                size={48}
                color="#d1d5db"
                style={{ margin: "0 auto 12px" }}
              />
              <div style={{ fontSize: "14px", fontWeight: "500" }}>
                No frames yet
              </div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                Click "New Frame" to add an artboard
              </div>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {frames.map((frame) => (
                <div
                  key={frame.id}
                  onClick={() => onSelectFrame(frame.id)}
                  style={{
                    padding: "12px",
                    border: `2px solid ${
                      activeFrameId === frame.id ? "#3b82f6" : "#e5e7eb"
                    }`,
                    borderRadius: "8px",
                    background:
                      activeFrameId === frame.id ? "#eff6ff" : "#f9fafb",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (activeFrameId !== frame.id) {
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFrameId !== frame.id) {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }
                  }}
                >
                  {editingFrameId === frame.id ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        marginBottom: "8px",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleFinishEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        style={{
                          flex: 1,
                          padding: "4px 8px",
                          border: "1px solid #3b82f6",
                          borderRadius: "4px",
                          fontSize: "13px",
                          outline: "none",
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleFinishEdit}
                        style={{
                          background: "#10b981",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Check size={14} color="white" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          background: "#ef4444",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <X size={14} color="white" />
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <div style={{ fontSize: "14px", fontWeight: "600" }}>
                        {frame.name}
                      </div>
                      <div
                        style={{ display: "flex", gap: "4px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleStartEdit(frame)}
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
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#e5e7eb")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "none")
                          }
                        >
                          <Edit2 size={14} color="#6b7280" />
                        </button>
                        <button
                          onClick={() => onDuplicateFrame(frame.id)}
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
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#e5e7eb")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "none")
                          }
                        >
                          <Copy size={14} color="#6b7280" />
                        </button>
                        <button
                          onClick={() => onDeleteFrame(frame.id)}
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
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#fee2e2";
                          }}
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "none")
                          }
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {frame.width} × {frame.height}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FramesPanel;
