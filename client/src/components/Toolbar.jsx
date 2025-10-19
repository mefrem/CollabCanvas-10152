import {
  Square,
  Circle,
  Triangle,
  Type,
  MousePointer,
  Trash2,
  Download,
  Copy,
  AlignLeft,
  AlignCenter as AlignCenterHorizontal,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Maximize2,
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const Toolbar = ({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDelete,
  onDuplicate,
  hasSelection,
  selectedObjects,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignTop,
  onAlignMiddle,
  onAlignBottom,
  onDistributeHorizontally,
  onDistributeVertically,
  onAlignToCenter,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
}) => {
  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "triangle", icon: Triangle, label: "Triangle" },
    { id: "text", icon: Type, label: "Text" },
  ];

  const alignmentTools = [
    {
      id: "align-left",
      icon: AlignLeft,
      label: "Align Left Edges (Cmd+Shift+L)",
      onClick: onAlignLeft,
      requiresSelection: true,
    },
    {
      id: "align-center",
      icon: AlignCenterHorizontal,
      label: "Center Horizontally (Cmd+Shift+H)",
      onClick: onAlignCenter,
      requiresSelection: true,
    },
    {
      id: "align-right",
      icon: AlignRight,
      label: "Align Right Edges (Cmd+Shift+R)",
      onClick: onAlignRight,
      requiresSelection: true,
    },
    {
      id: "align-top",
      icon: AlignStartVertical,
      label: "Align Top Edges (Cmd+Shift+T)",
      onClick: onAlignTop,
      requiresSelection: true,
    },
    {
      id: "align-middle",
      icon: AlignCenterVertical,
      label: "Center Vertically (Cmd+Shift+M)",
      onClick: onAlignMiddle,
      requiresSelection: true,
    },
    {
      id: "align-bottom",
      icon: AlignEndVertical,
      label: "Align Bottom Edges (Cmd+Shift+B)",
      onClick: onAlignBottom,
      requiresSelection: true,
    },
    {
      id: "distribute-h",
      icon: AlignHorizontalDistributeCenter,
      label: "Distribute Horizontally",
      onClick: onDistributeHorizontally,
      requiresSelection: true,
      requiresMultiple: true,
    },
    {
      id: "distribute-v",
      icon: AlignVerticalDistributeCenter,
      label: "Distribute Vertically",
      onClick: onDistributeVertically,
      requiresSelection: true,
      requiresMultiple: true,
    },
    {
      id: "align-canvas-center",
      icon: Maximize2,
      label: "Center on Canvas (Cmd+Shift+C)",
      onClick: onAlignToCenter,
      requiresSelection: true,
    },
  ];

  const zIndexTools = [
    {
      id: "bring-front",
      icon: ChevronsUp,
      label: "Bring to Front (Cmd+])",
      onClick: onBringToFront,
      requiresSelection: true,
    },
    {
      id: "bring-forward",
      icon: ChevronUp,
      label: "Bring Forward",
      onClick: onBringForward,
      requiresSelection: true,
    },
    {
      id: "send-backward",
      icon: ChevronDown,
      label: "Send Backward",
      onClick: onSendBackward,
      requiresSelection: true,
    },
    {
      id: "send-back",
      icon: ChevronsDown,
      label: "Send to Back (Cmd+[)",
      onClick: onSendToBack,
      requiresSelection: true,
    },
  ];

  return (
    <div className="toolbar">
      {tools.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={activeTool === id ? "active" : ""}
          onClick={() => onToolChange(id)}
          title={label}
        >
          <Icon size={16} />
        </button>
      ))}

      <div
        style={{
          width: "1px",
          height: "30px",
          background: "#ddd",
          margin: "0 5px",
        }}
      />

      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Cmd+Z)"
        style={{ opacity: canUndo ? 1 : 0.5 }}
      >
        ↶
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Cmd+Shift+Z)"
        style={{ opacity: canRedo ? 1 : 0.5 }}
      >
        ↷
      </button>

      <div
        style={{
          width: "1px",
          height: "30px",
          background: "#ddd",
          margin: "0 5px",
        }}
      />

      <button
        onClick={onDuplicate}
        disabled={!hasSelection}
        title="Duplicate (Cmd+D)"
        style={{
          opacity: hasSelection ? 1 : 0.5,
        }}
      >
        <Copy size={16} />
      </button>

      <button
        onClick={onDelete}
        disabled={!hasSelection}
        title="Delete (Del/Backspace)"
        style={{
          opacity: hasSelection ? 1 : 0.5,
          color: hasSelection ? "#dc3545" : "#6c757d",
        }}
      >
        <Trash2 size={16} />
      </button>

      {/* Alignment Tools */}
      <div
        style={{
          width: "1px",
          height: "30px",
          background: "#ddd",
          margin: "0 5px",
        }}
      />

      {alignmentTools.map(
        ({
          id,
          icon: Icon,
          label,
          onClick,
          requiresSelection,
          requiresMultiple,
        }) => (
          <button
            key={id}
            onClick={onClick}
            disabled={
              (requiresSelection && !hasSelection) ||
              (requiresMultiple && hasSelection && selectedObjects?.length < 2)
            }
            title={label}
            style={{
              opacity:
                (requiresSelection && !hasSelection) ||
                (requiresMultiple &&
                  (!hasSelection || selectedObjects?.length < 2))
                  ? 0.5
                  : 1,
            }}
          >
            <Icon size={16} />
          </button>
        )
      )}

      {/* Z-Index Tools */}
      <div
        style={{
          width: "1px",
          height: "30px",
          background: "#ddd",
          margin: "0 5px",
        }}
      />

      {zIndexTools.map(
        ({ id, icon: Icon, label, onClick, requiresSelection }) => (
          <button
            key={id}
            onClick={onClick}
            disabled={requiresSelection && !hasSelection}
            title={label}
            style={{
              opacity: requiresSelection && !hasSelection ? 0.5 : 1,
            }}
          >
            <Icon size={16} />
          </button>
        )
      )}
    </div>
  );
};

export default Toolbar;
