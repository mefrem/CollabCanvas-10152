import { useState, useEffect } from "react";

const ColorPicker = ({ selectedObjects, onColorChange, fabricCanvas }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState("#3B82F6");

  // Simplified color palette - just one palette
  const presetColors = [
    "#3B82F6", // blue
    "#EF4444", // red
    "#10B981", // green
    "#F59E0B", // amber
    "#8B5CF6", // violet
    "#F97316", // orange
    "#EC4899", // pink
    "#6B7280", // gray
    "#000000", // black
  ];

  // Update current color when selection changes
  useEffect(() => {
    if (selectedObjects.length === 1) {
      const obj = selectedObjects[0];
      if (obj.fill) {
        setCurrentColor(obj.fill);
      }
    }
  }, [selectedObjects]);

  // Handle color change
  const handleColorChange = (color) => {
    if (!fabricCanvas || selectedObjects.length === 0) return;

    setCurrentColor(color);

    // Apply color to selected objects
    selectedObjects.forEach((obj) => {
      obj.set("fill", color);
    });

    fabricCanvas.renderAll();

    // Notify parent component
    if (onColorChange) {
      onColorChange(color, selectedObjects);
    }

    setShowPicker(false);
  };

  // Handle custom color picker
  const handleCustomColor = (e) => {
    const color = e.target.value;
    handleColorChange(color);
  };

  if (selectedObjects.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "80px", // Moved below toolbar to avoid any overlap
        left: "20px",
        zIndex: 1000,
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        padding: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "500" }}>Color:</span>

        {/* Current color indicator */}
        <div
          onClick={() => setShowPicker(!showPicker)}
          style={{
            width: "30px",
            height: "30px",
            backgroundColor: currentColor,
            border: "2px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            position: "relative",
          }}
        />

        {/* Color palette */}
        <div style={{ display: "flex", gap: "5px" }}>
          {presetColors.map((color) => (
            <div
              key={color}
              onClick={() => handleColorChange(color)}
              style={{
                width: "24px",
                height: "24px",
                backgroundColor: color,
                border:
                  currentColor === color ? "3px solid #000" : "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "transform 0.1s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              title={color}
            />
          ))}
        </div>

        {/* Custom color picker */}
        <input
          type="color"
          value={currentColor}
          onChange={handleCustomColor}
          style={{
            width: "34px",
            height: "34px",
            border: "2px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            padding: "0",
          }}
          title="Custom color"
        />
      </div>

      {/* Color picker dropdown */}
      {showPicker && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: "0",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 1001,
            minWidth: "200px",
          }}
        >
          <div
            style={{
              marginBottom: "10px",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            Choose Color
          </div>

          {/* Extended color palette */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(8, 1fr)",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            {[
              "#000000",
              "#374151",
              "#6B7280",
              "#9CA3AF",
              "#D1D5DB",
              "#E5E7EB",
              "#F3F4F6",
              "#FFFFFF",
              "#7F1D1D",
              "#991B1B",
              "#DC2626",
              "#EF4444",
              "#F87171",
              "#FCA5A5",
              "#FECACA",
              "#FEE2E2",
              "#92400E",
              "#B45309",
              "#D97706",
              "#F59E0B",
              "#FBBF24",
              "#FCD34D",
              "#FDE68A",
              "#FEF3C7",
              "#365314",
              "#4D7C0F",
              "#65A30D",
              "#84CC16",
              "#A3E635",
              "#BEF264",
              "#D9F99D",
              "#ECFCCB",
              "#064E3B",
              "#065F46",
              "#047857",
              "#059669",
              "#10B981",
              "#34D399",
              "#6EE7B7",
              "#A7F3D0",
              "#0C4A6E",
              "#075985",
              "#0369A1",
              "#0284C7",
              "#0EA5E9",
              "#38BDF8",
              "#7DD3FC",
              "#BAE6FD",
              "#3730A3",
              "#4338CA",
              "#4F46E5",
              "#6366F1",
              "#818CF8",
              "#A5B4FC",
              "#C7D2FE",
              "#E0E7FF",
              "#581C87",
              "#6B21A8",
              "#7C2D12",
              "#8B5CF6",
              "#A78BFA",
              "#C4B5FD",
              "#DDD6FE",
              "#EDE9FE",
            ].map((color) => (
              <div
                key={color}
                onClick={() => handleColorChange(color)}
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: color,
                  border:
                    currentColor === color
                      ? "2px solid #000"
                      : "1px solid #ddd",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setShowPicker(false)}
            style={{
              width: "100%",
              padding: "6px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: "#f8f9fa",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
