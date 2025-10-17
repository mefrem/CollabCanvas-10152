import { useState, useEffect } from "react";
import {
  Square,
  Circle,
  Triangle,
  Type,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";

const LayersPanel = ({
  fabricCanvas,
  selectedObjects,
  onSelectObject,
  onDeleteObject,
  onToggleVisibility,
  onToggleLock,
  onRenameObject,
  onReorderLayers,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [layers, setLayers] = useState([]);
  const [editingLayerId, setEditingLayerId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [draggedLayer, setDraggedLayer] = useState(null);
  const [dragOverLayer, setDragOverLayer] = useState(null);

  // Update layers list when canvas changes
  useEffect(() => {
    if (!fabricCanvas) return;

    const updateLayers = () => {
      const objects = fabricCanvas.getObjects();
      const layersData = objects.map((obj, index) => ({
        id: obj.uuid,
        name: obj.name || generateDefaultName(obj, index),
        type: obj.type,
        visible: obj.visible !== false,
        locked: obj.selectable === false,
        zIndex: index,
        lastEditedBy: obj.lastEditedBy,
        lastEditedAt: obj.lastEditedAt,
      }));
      setLayers(layersData.reverse()); // Reverse to show top layer first
    };

    updateLayers();

    // Listen for canvas changes
    fabricCanvas.on("object:added", updateLayers);
    fabricCanvas.on("object:removed", updateLayers);
    fabricCanvas.on("object:modified", updateLayers);

    return () => {
      fabricCanvas.off("object:added", updateLayers);
      fabricCanvas.off("object:removed", updateLayers);
      fabricCanvas.off("object:modified", updateLayers);
    };
  }, [fabricCanvas]);

  const generateDefaultName = (obj, index) => {
    const typeNames = {
      rect: "Rectangle",
      circle: "Circle",
      triangle: "Triangle",
      text: "Text",
      "i-text": "Text",
      textbox: "Text",
    };
    const baseName = typeNames[obj.type] || "Object";
    return `${baseName} ${index + 1}`;
  };

  const getIcon = (type) => {
    const iconMap = {
      rect: Square,
      circle: Circle,
      triangle: Triangle,
      text: Type,
      "i-text": Type,
      textbox: Type,
    };
    const Icon = iconMap[type] || Square;
    return <Icon size={16} />;
  };

  const handleLayerClick = (layerId) => {
    if (editingLayerId === layerId) return;
    onSelectObject(layerId);
  };

  const handleDoubleClick = (layer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const handleNameChange = (e) => {
    setEditingName(e.target.value);
  };

  const handleNameSubmit = () => {
    if (editingLayerId && editingName.trim()) {
      onRenameObject(editingLayerId, editingName.trim());
    }
    setEditingLayerId(null);
    setEditingName("");
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setEditingLayerId(null);
      setEditingName("");
    }
  };

  const handleDragStart = (e, layer) => {
    setDraggedLayer(layer);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, layer) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverLayer(layer.id);
  };

  const handleDragLeave = () => {
    setDragOverLayer(null);
  };

  const handleDrop = (e, targetLayer) => {
    e.preventDefault();
    setDragOverLayer(null);

    if (!draggedLayer || draggedLayer.id === targetLayer.id) {
      setDraggedLayer(null);
      return;
    }

    // Calculate new z-index positions
    const totalLayers = layers.length;
    const draggedIndex = layers.findIndex((l) => l.id === draggedLayer.id);
    const targetIndex = layers.findIndex((l) => l.id === targetLayer.id);

    // Remember: layers array is reversed (top first), but z-index is bottom first
    const draggedZIndex = totalLayers - 1 - draggedIndex;
    const targetZIndex = totalLayers - 1 - targetIndex;

    onReorderLayers(draggedLayer.id, targetZIndex);
    setDraggedLayer(null);
  };

  const handleDragEnd = () => {
    setDraggedLayer(null);
    setDragOverLayer(null);
  };

  const isSelected = (layerId) => {
    return selectedObjects.some((obj) => obj.uuid === layerId);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        left: "20px",
        width: "250px",
        maxHeight: "calc(100vh - 160px)",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        animation: "slideInLeft 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: isCollapsed ? "none" : "1px solid #e5e7eb",
          fontWeight: "600",
          fontSize: "14px",
          color: "#1f2937",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Layers size={18} color="#3b82f6" />
        <span>Layers</span>
        {isCollapsed ? (
          <ChevronDown size={16} color="#6b7280" />
        ) : (
          <ChevronUp size={16} color="#6b7280" />
        )}
      </div>

      {/* Layers List */}
      {!isCollapsed && (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {layers.length === 0 ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "13px",
              }}
            >
              No objects on canvas
            </div>
          ) : (
            layers.map((layer) => (
              <div
                key={layer.id}
                draggable
                onDragStart={(e) => handleDragStart(e, layer)}
                onDragOver={(e) => handleDragOver(e, layer)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, layer)}
                onDragEnd={handleDragEnd}
                onClick={() => handleLayerClick(layer.id)}
                onDoubleClick={() => handleDoubleClick(layer)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  backgroundColor: isSelected(layer.id)
                    ? "#eff6ff"
                    : dragOverLayer === layer.id
                    ? "#f3f4f6"
                    : "transparent",
                  borderLeft: isSelected(layer.id)
                    ? "3px solid #3b82f6"
                    : "3px solid transparent",
                  transition: "all 0.15s ease",
                  opacity: draggedLayer?.id === layer.id ? 0.5 : 1,
                  borderBottom: "1px solid #f3f4f6",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected(layer.id)) {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected(layer.id)) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {/* Drag Handle */}
                <div
                  style={{
                    cursor: "grab",
                    color: "#9ca3af",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <GripVertical size={14} />
                </div>

                {/* Type Icon */}
                <div style={{ color: "#6b7280", display: "flex" }}>
                  {getIcon(layer.type)}
                </div>

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingLayerId === layer.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={handleNameChange}
                      onBlur={handleNameSubmit}
                      onKeyDown={handleNameKeyDown}
                      autoFocus
                      style={{
                        width: "100%",
                        padding: "2px 4px",
                        border: "1px solid #3b82f6",
                        borderRadius: "3px",
                        fontSize: "13px",
                        outline: "none",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#374151",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={layer.name}
                      >
                        {layer.name}
                      </div>
                      {layer.lastEditedBy && (
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#9ca3af",
                            marginTop: "2px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={
                            layer.lastEditedAt
                              ? `Edited by ${layer.lastEditedBy} at ${new Date(
                                  layer.lastEditedAt
                                ).toLocaleString()}`
                              : `Edited by ${layer.lastEditedBy}`
                          }
                        >
                          by {layer.lastEditedBy}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Visibility Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.id, !layer.visible);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    color: layer.visible ? "#6b7280" : "#d1d5db",
                    transition: "color 0.15s ease",
                  }}
                  title={layer.visible ? "Hide" : "Show"}
                >
                  {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

                {/* Lock Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(layer.id, !layer.locked);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    color: layer.locked ? "#ef4444" : "#6b7280",
                    transition: "color 0.15s ease",
                  }}
                  title={layer.locked ? "Unlock" : "Lock"}
                >
                  {layer.locked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        `Delete "${layer.name}"? This cannot be undone.`
                      )
                    ) {
                      onDeleteObject(layer.id);
                    }
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    color: "#6b7280",
                    transition: "color 0.15s ease",
                  }}
                  title="Delete"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#ef4444")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#6b7280")
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LayersPanel;
