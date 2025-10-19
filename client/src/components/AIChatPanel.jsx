import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageSquare, ChevronRight } from "lucide-react";

const AIChatPanel = ({ onExecuteCommand, isLoading }) => {
  const [command, setCommand] = useState("");
  const [messages, setMessages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!command.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: command.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCommand("");

    const result = await onExecuteCommand(userMessage.content);

    const aiMessage = {
      id: Date.now() + 1,
      type: "ai",
      content: result.message,
      success: result.success,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
  };

  const exampleCommands = [
    "Create a red circle",
    "Make 50 circles in a grid",
    "Arrange in a row",
    "Create a login form",
  ];

  if (!isExpanded) {
    return (
      <div
        style={{
          position: "fixed",
          top: "72px",
          right: "var(--spacing-xl)",
          zIndex: "var(--z-panel)",
        }}
      >
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "var(--border-radius-full)",
            background:
              "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)",
            color: "white",
            border: "none",
            cursor: "pointer",
            boxShadow: "var(--shadow-xl)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
          }}
          title="Open AI Assistant"
        >
          <MessageSquare size={24} />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "72px",
        right: 0,
        bottom: "100px",
        width: "380px",
        background: "white",
        borderLeft: "1px solid var(--gray-200)",
        boxShadow: "var(--shadow-xl)",
        zIndex: "var(--z-sidebar)",
        display: "flex",
        flexDirection: "column",
        animation: "slideInRight 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "var(--spacing-lg)",
          borderBottom: "1px solid var(--gray-200)",
          background:
            "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-sm)",
          }}
        >
          <MessageSquare size={20} />
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
            AI Canvas Assistant
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          style={{
            width: "32px",
            height: "32px",
            border: "none",
            background: "rgba(255, 255, 255, 0.2)",
            color: "white",
            borderRadius: "var(--border-radius)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          title="Collapse chat to the right"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--spacing-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-md)",
          background: "var(--gray-50)",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "var(--spacing-3xl) var(--spacing-lg)",
              color: "var(--gray-500)",
            }}
          >
            <MessageSquare
              size={48}
              color="var(--gray-300)"
              style={{ margin: "0 auto var(--spacing-lg)" }}
            />
            <p
              style={{
                margin: 0,
                marginBottom: "var(--spacing-sm)",
                fontSize: "15px",
                fontWeight: "500",
              }}
            >
              Welcome to AI Canvas Assistant
            </p>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6" }}>
              I can help you create, modify, and arrange objects on your canvas.
              Try one of these:
            </p>
            <div
              style={{
                marginTop: "var(--spacing-lg)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-sm)",
              }}
            >
              {exampleCommands.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setCommand(example)}
                  style={{
                    padding: "var(--spacing-sm) var(--spacing-md)",
                    background: "white",
                    border: "1px solid var(--gray-200)",
                    borderRadius: "var(--border-radius)",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "var(--gray-700)",
                    textAlign: "left",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "var(--primary-color)";
                    e.target.style.background = "var(--primary-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "var(--gray-200)";
                    e.target.style.background = "white";
                  }}
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.type === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "var(--spacing-md)",
                    borderRadius: "var(--border-radius-lg)",
                    background:
                      msg.type === "user"
                        ? "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)"
                        : msg.success
                        ? "white"
                        : "var(--error-color)",
                    color:
                      msg.type === "user" || !msg.success
                        ? "white"
                        : "var(--gray-800)",
                    boxShadow: "var(--shadow-sm)",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    border:
                      msg.type === "ai" && msg.success
                        ? "1px solid var(--gray-200)"
                        : "none",
                  }}
                >
                  {msg.content}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--gray-400)",
                    marginTop: "4px",
                    paddingLeft: msg.type === "user" ? 0 : "var(--spacing-sm)",
                    paddingRight: msg.type === "user" ? "var(--spacing-sm)" : 0,
                  }}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-sm)",
                  padding: "var(--spacing-md)",
                  background: "white",
                  borderRadius: "var(--border-radius-lg)",
                  maxWidth: "85%",
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid var(--gray-200)",
                }}
              >
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                  color="var(--primary-color)"
                />
                <span style={{ fontSize: "14px", color: "var(--gray-600)" }}>
                  AI is thinking...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "var(--spacing-lg)",
          borderTop: "1px solid var(--gray-200)",
          background: "white",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "var(--spacing-sm)" }}
        >
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Ask AI to create or modify..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "var(--spacing-md)",
              border: "2px solid var(--gray-200)",
              borderRadius: "var(--border-radius)",
              fontSize: "14px",
              outline: "none",
              transition: "all var(--transition-fast)",
              background: "var(--gray-50)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--primary-color)";
              e.target.style.background = "white";
              e.target.style.boxShadow = "0 0 0 3px var(--primary-light)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--gray-200)";
              e.target.style.background = "var(--gray-50)";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            type="submit"
            disabled={!command.trim() || isLoading}
            style={{
              padding: "var(--spacing-md)",
              background:
                !command.trim() || isLoading
                  ? "var(--gray-300)"
                  : "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)",
              color: "white",
              border: "none",
              borderRadius: "var(--border-radius)",
              cursor: !command.trim() || isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "44px",
              transition: "all var(--transition-fast)",
              boxShadow:
                !command.trim() || isLoading ? "none" : "var(--shadow-sm)",
            }}
            onMouseEnter={(e) => {
              if (command.trim() && !isLoading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "var(--shadow-md)";
              }
            }}
            onMouseLeave={(e) => {
              if (command.trim() && !isLoading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "var(--shadow-sm)";
              }
            }}
          >
            {isLoading ? (
              <Loader2
                size={18}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AIChatPanel;
