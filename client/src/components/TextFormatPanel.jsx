import { useState, useEffect } from "react";
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from "lucide-react";

const FONTS = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Comic Sans MS",
  "Impact",
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

const TextFormatPanel = ({ textObject, fabricCanvas, position }) => {
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(16);
  const [textAlign, setTextAlign] = useState("left");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [underline, setUnderline] = useState(false);

  // Update state when text object changes
  useEffect(() => {
    if (!textObject) return;

    setFontFamily(textObject.fontFamily || "Arial");
    setFontSize(textObject.fontSize || 16);
    setTextAlign(textObject.textAlign || "left");
    setFontWeight(textObject.fontWeight || "normal");
    setFontStyle(textObject.fontStyle || "normal");
    setUnderline(textObject.underline || false);
  }, [textObject]);

  const updateTextObject = (updates) => {
    if (!textObject || !fabricCanvas) return;

    Object.keys(updates).forEach((key) => {
      textObject.set(key, updates[key]);
    });

    textObject.setCoords();
    fabricCanvas.renderAll();

    // Trigger object modified event for Yjs sync
    fabricCanvas.fire("object:modified", { target: textObject });
  };

  const handleFontChange = (e) => {
    const newFont = e.target.value;
    setFontFamily(newFont);
    updateTextObject({ fontFamily: newFont });
  };

  const handleFontSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setFontSize(newSize);
    updateTextObject({ fontSize: newSize });
  };

  const handleAlignChange = (align) => {
    setTextAlign(align);
    updateTextObject({ textAlign: align });
  };

  const toggleBold = () => {
    const newWeight = fontWeight === "bold" ? "normal" : "bold";
    setFontWeight(newWeight);
    updateTextObject({ fontWeight: newWeight });
  };

  const toggleItalic = () => {
    const newStyle = fontStyle === "italic" ? "normal" : "italic";
    setFontStyle(newStyle);
    updateTextObject({ fontStyle: newStyle });
  };

  const toggleUnderline = () => {
    const newUnderline = !underline;
    setUnderline(newUnderline);
    updateTextObject({ underline: newUnderline });
  };

  if (!textObject) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
        padding: "12px",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        minWidth: "280px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          paddingBottom: "8px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Type size={16} color="#3b82f6" />
        <span style={{ fontSize: "13px", fontWeight: "600", color: "#1f2937" }}>
          Text Format
        </span>
      </div>

      {/* Font Family */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label
          style={{ fontSize: "11px", fontWeight: "500", color: "#6b7280" }}
        >
          Font
        </label>
        <select
          value={fontFamily}
          onChange={handleFontChange}
          style={{
            padding: "6px 8px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "12px",
            outline: "none",
            cursor: "pointer",
            background: "white",
          }}
        >
          {FONTS.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label
          style={{ fontSize: "11px", fontWeight: "500", color: "#6b7280" }}
        >
          Size
        </label>
        <select
          value={fontSize}
          onChange={handleFontSizeChange}
          style={{
            padding: "6px 8px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "12px",
            outline: "none",
            cursor: "pointer",
            background: "white",
          }}
        >
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </div>

      {/* Text Alignment */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label
          style={{ fontSize: "11px", fontWeight: "500", color: "#6b7280" }}
        >
          Alignment
        </label>
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => handleAlignChange("left")}
            style={{
              flex: 1,
              padding: "6px",
              border: `1px solid ${
                textAlign === "left" ? "#3b82f6" : "#d1d5db"
              }`,
              borderRadius: "4px",
              background: textAlign === "left" ? "#eff6ff" : "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            title="Align Left"
          >
            <AlignLeft
              size={16}
              color={textAlign === "left" ? "#3b82f6" : "#6b7280"}
            />
          </button>
          <button
            onClick={() => handleAlignChange("center")}
            style={{
              flex: 1,
              padding: "6px",
              border: `1px solid ${
                textAlign === "center" ? "#3b82f6" : "#d1d5db"
              }`,
              borderRadius: "4px",
              background: textAlign === "center" ? "#eff6ff" : "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            title="Align Center"
          >
            <AlignCenter
              size={16}
              color={textAlign === "center" ? "#3b82f6" : "#6b7280"}
            />
          </button>
          <button
            onClick={() => handleAlignChange("right")}
            style={{
              flex: 1,
              padding: "6px",
              border: `1px solid ${
                textAlign === "right" ? "#3b82f6" : "#d1d5db"
              }`,
              borderRadius: "4px",
              background: textAlign === "right" ? "#eff6ff" : "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            title="Align Right"
          >
            <AlignRight
              size={16}
              color={textAlign === "right" ? "#3b82f6" : "#6b7280"}
            />
          </button>
        </div>
      </div>

      {/* Text Style */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label
          style={{ fontSize: "11px", fontWeight: "500", color: "#6b7280" }}
        >
          Style
        </label>
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={toggleBold}
            style={{
              flex: 1,
              padding: "6px",
              border: `1px solid ${
                fontWeight === "bold" ? "#3b82f6" : "#d1d5db"
              }`,
              borderRadius: "4px",
              background: fontWeight === "bold" ? "#eff6ff" : "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            title="Bold"
          >
            <Bold
              size={16}
              color={fontWeight === "bold" ? "#3b82f6" : "#6b7280"}
            />
          </button>
          <button
            onClick={toggleItalic}
            style={{
              flex: 1,
              padding: "6px",
              border: `1px solid ${
                fontStyle === "italic" ? "#3b82f6" : "#d1d5db"
              }`,
              borderRadius: "4px",
              background: fontStyle === "italic" ? "#eff6ff" : "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            title="Italic"
          >
            <Italic
              size={16}
              color={fontStyle === "italic" ? "#3b82f6" : "#6b7280"}
            />
          </button>
          <button
            onClick={toggleUnderline}
            style={{
              flex: 1,
              padding: "6px",
              border: `1px solid ${underline ? "#3b82f6" : "#d1d5db"}`,
              borderRadius: "4px",
              background: underline ? "#eff6ff" : "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            title="Underline"
          >
            <Underline size={16} color={underline ? "#3b82f6" : "#6b7280"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextFormatPanel;
