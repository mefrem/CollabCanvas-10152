import { useState } from "react";
import { Layers, Frame, ChevronLeft, ChevronRight } from "lucide-react";
import LayersPanel from "./LayersPanel";
import FramesPanel from "./FramesPanel";

const LeftSidebar = ({
  fabricCanvas,
  selectedObjects,
  onSelectObject,
  onDeleteObject,
  onToggleVisibility,
  onToggleLock,
  onRenameObject,
  onReorderLayers,
  frames,
  activeFrameId,
  onAddFrame,
  onUpdateFrame,
  onDeleteFrame,
  onDuplicateFrame,
  onSelectFrame,
}) => {
  const [activeTab, setActiveTab] = useState("layers");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    { id: "layers", label: "Layers", icon: Layers },
    { id: "frames", label: "Frames", icon: Frame },
  ];

  if (isCollapsed) {
    return (
      <div
        style={{
          position: "fixed",
          top: "72px",
          left: 0,
          bottom: 0,
          width: "48px",
          background: "white",
          borderRight: "1px solid var(--gray-200)",
          boxShadow: "var(--shadow-sm)",
          zIndex: "var(--z-sidebar)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "var(--spacing-md) 0",
          gap: "var(--spacing-md)",
        }}
      >
        {tabs.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              setIsCollapsed(false);
            }}
            style={{
              width: "36px",
              height: "36px",
              border: "none",
              background: "transparent",
              color: "var(--gray-500)",
              cursor: "pointer",
              borderRadius: "var(--border-radius)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--gray-100)";
              e.target.style.color = "var(--gray-700)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "var(--gray-500)";
            }}
            title={id.charAt(0).toUpperCase() + id.slice(1)}
          >
            <Icon size={20} />
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            width: "36px",
            height: "36px",
            border: "none",
            background: "transparent",
            color: "var(--gray-500)",
            cursor: "pointer",
            borderRadius: "var(--border-radius)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--gray-100)";
            e.target.style.color = "var(--gray-700)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "var(--gray-500)";
          }}
          title="Expand sidebar"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "72px",
        left: 0,
        bottom: 0,
        width: "320px",
        background: "white",
        borderRight: "1px solid var(--gray-200)",
        boxShadow: "var(--shadow-md)",
        zIndex: "var(--z-sidebar)",
        display: "flex",
        flexDirection: "column",
        animation: "slideInLeft 0.3s ease",
      }}
    >
      {/* Tab Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--gray-200)",
          background: "var(--gray-50)",
          height: "48px",
        }}
      >
        {/* Tabs */}
        <div style={{ flex: 1, display: "flex" }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1,
                height: "48px",
                border: "none",
                background: activeTab === id ? "white" : "transparent",
                color:
                  activeTab === id ? "var(--primary-color)" : "var(--gray-600)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--spacing-sm)",
                fontSize: "14px",
                fontWeight: activeTab === id ? "600" : "500",
                borderBottom:
                  activeTab === id
                    ? "2px solid var(--primary-color)"
                    : "2px solid transparent",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== id) {
                  e.target.style.background = "var(--gray-100)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== id) {
                  e.target.style.background = "transparent";
                }
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(true)}
          style={{
            width: "48px",
            height: "48px",
            border: "none",
            borderLeft: "1px solid var(--gray-200)",
            background: "transparent",
            color: "var(--gray-500)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--gray-100)";
            e.target.style.color = "var(--gray-700)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "var(--gray-500)";
          }}
          title="Collapse sidebar"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {activeTab === "layers" && (
          <LayersPanel
            fabricCanvas={fabricCanvas}
            selectedObjects={selectedObjects}
            onSelectObject={onSelectObject}
            onDeleteObject={onDeleteObject}
            onToggleVisibility={onToggleVisibility}
            onToggleLock={onToggleLock}
            onRenameObject={onRenameObject}
            onReorderLayers={onReorderLayers}
            embedded={true}
          />
        )}
        {activeTab === "frames" && (
          <FramesPanel
            frames={frames}
            activeFrameId={activeFrameId}
            onAddFrame={onAddFrame}
            onUpdateFrame={onUpdateFrame}
            onDeleteFrame={onDeleteFrame}
            onDuplicateFrame={onDuplicateFrame}
            onSelectFrame={onSelectFrame}
            embedded={true}
          />
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
