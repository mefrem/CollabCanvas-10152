import {
  Square,
  Circle,
  Triangle,
  Type,
  MousePointer,
  Trash2,
} from "lucide-react";

const Toolbar = ({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDelete,
  hasSelection,
}) => {
  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "triangle", icon: Triangle, label: "Triangle" },
    { id: "text", icon: Type, label: "Text" },
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
    </div>
  );
};

export default Toolbar;
