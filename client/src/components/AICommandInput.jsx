import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

const AICommandInput = ({ onExecuteCommand, isLoading }) => {
  const [command, setCommand] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!command.trim() || isLoading) return;

    const result = await onExecuteCommand(command.trim());
    setLastResult(result);
    setCommand("");
  };

  const exampleCommands = [
    "Create a red circle at 200, 300",
    "Add text that says 'Hello World'",
    "Move the circle to the center",
    "Make the rectangle twice as wide",
    "Arrange all rectangles in a horizontal row",
    "Space these three circles evenly",
    "Create a login form",
    "Make a navigation bar with Home, About, Contact",
  ];

  return (
    <div className="ai-command-input">
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "10px", alignItems: "center" }}
      >
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Tell the AI what to create or modify... (e.g., 'Create a red circle')"
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#007bff")}
          onBlur={(e) => (e.target.style.borderColor = "#ddd")}
        />

        <button
          type="submit"
          disabled={!command.trim() || isLoading}
          style={{
            padding: "12px 16px",
            background: isLoading || !command.trim() ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isLoading || !command.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "80px",
            justifyContent: "center",
          }}
        >
          {isLoading ? (
            <>
              <Loader2
                size={16}
                className="animate-spin"
                style={{ animation: "spin 1s linear infinite" }}
              />
              <span>AI...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Send</span>
            </>
          )}
        </button>
      </form>

      {/* Result message */}
      {lastResult && (
        <div
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            backgroundColor: lastResult.success ? "#d4edda" : "#f8d7da",
            color: lastResult.success ? "#155724" : "#721c24",
            border: `1px solid ${lastResult.success ? "#c3e6cb" : "#f5c6cb"}`,
          }}
        >
          {lastResult.message}
        </div>
      )}

      {/* Example commands dropdown */}
      <details style={{ marginTop: "10px" }}>
        <summary
          style={{
            fontSize: "12px",
            color: "#666",
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          Example commands
        </summary>
        <div
          style={{
            marginTop: "8px",
            padding: "12px",
            background: "#f8f9fa",
            borderRadius: "4px",
            border: "1px solid #e9ecef",
          }}
        >
          {exampleCommands.map((example, index) => (
            <div
              key={index}
              onClick={() => setCommand(example)}
              style={{
                fontSize: "12px",
                padding: "4px 8px",
                margin: "2px 0",
                cursor: "pointer",
                borderRadius: "3px",
                color: "#495057",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#e9ecef")}
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              "{example}"
            </div>
          ))}
        </div>
      </details>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AICommandInput;
