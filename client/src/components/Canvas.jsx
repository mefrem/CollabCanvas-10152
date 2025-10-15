import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import Toolbar from "./Toolbar";
import CursorOverlay from "./CursorOverlay";
import ColorPicker from "./ColorPicker";
import AICommandInput from "./AICommandInput";
import { useYjs } from "../hooks/useYjs";
import { useSocketCursors } from "../hooks/useSocketCursors";
import {
  createRectangle,
  createCircle,
  createTriangle,
  createText,
  getCanvasCenter,
  duplicateObject,
  setupCanvasEvents,
  cleanupCanvasEvents,
} from "../utils/fabricHelpers";

const Canvas = ({ user, onLogout }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [activeTool, setActiveTool] = useState("select");
  const activeToolRef = useRef("select"); // Ref to track current tool for event handlers
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);

  // Fixed canvas ID for now - in production this would be dynamic
  const canvasId = "default-canvas";

  // Close users dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUsersDropdown && !e.target.closest(".connection-status")) {
        setShowUsersDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showUsersDropdown]);

  const [canvasReady, setCanvasReady] = useState(false);

  // Keep ref in sync with state
  useEffect(() => {
    activeToolRef.current = activeTool;
    console.log("🔧 Active tool changed to:", activeTool);
  }, [activeTool]);

  // Debug useEffect to track mounting and canvas ready state changes
  useEffect(() => {
    console.log("🎨 Canvas component mounted");
    return () => {
      console.log("🎨 Canvas component unmounting");
    };
  }, []);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    if (canvasReady) return;

    const timeoutId = setTimeout(() => {
      console.warn(
        "⚠️ Canvas initialization timeout after 5s - forcing canvas to show"
      );
      setCanvasReady(true);
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [canvasReady]);

  useEffect(() => {
    console.log("🎨 Canvas ready state changed:", canvasReady);
  }, [canvasReady]);

  // Initialize Yjs integration (only when canvas is ready)
  const {
    connectionStatus,
    addObjectToYjs,
    updateObjectInYjs,
    removeObjectFromYjs,
    getCanvasState,
    applyAICommand,
    isUpdatingFromYjs,
    saveNow,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useYjs(canvasId, user, canvasReady ? fabricCanvasRef.current : null);

  // Initialize cursor synchronization (only when canvas is ready)
  const { cursors, connectedUsers, userCount } = useSocketCursors(
    canvasId,
    user,
    canvasReady ? fabricCanvasRef.current : null
  );

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    let canvas;
    try {
      canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
        selection: true,
        preserveObjectStacking: true,
        // Uncomment these lines to disable object resizing:
        // uniformScaling: false,
        // uniScaleKey: null,
      });

      fabricCanvasRef.current = canvas;

      // Mark canvas as ready after successful initialization
      setCanvasReady(true);
    } catch (error) {
      console.error("Error initializing Fabric.js canvas:", error);
      setCanvasReady(false);
      return;
    }

    // Set up canvas events
    setupCanvasEvents(canvas, {
      onObjectAdded: handleObjectAdded,
      onObjectModified: handleObjectModified,
      onObjectRemoved: handleObjectRemoved,
      onSelectionCreated: handleSelectionCreated,
      onSelectionUpdated: handleSelectionUpdated,
      onSelectionCleared: handleSelectionCleared,
    });

    // Set up keyboard event handlers
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      const activeObjects = canvas.getActiveObjects();

      // Delete selected objects (Delete or Backspace key)
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        activeObjects.length > 0
      ) {
        e.preventDefault(); // Prevent browser back navigation on Backspace
        activeObjects.forEach((obj) => {
          canvas.remove(obj);
        });
        canvas.discardActiveObject();
        canvas.renderAll();
      }

      // Arrow keys for nudging
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        activeObjects.length > 0
      ) {
        e.preventDefault();
        const distance = e.shiftKey ? 50 : 10;

        activeObjects.forEach((obj) => {
          switch (e.key) {
            case "ArrowUp":
              obj.top -= distance;
              break;
            case "ArrowDown":
              obj.top += distance;
              break;
            case "ArrowLeft":
              obj.left -= distance;
              break;
            case "ArrowRight":
              obj.left += distance;
              break;
          }
          obj.setCoords();
        });

        canvas.renderAll();
        handleObjectModified({ target: activeObjects[0] });
      }

      // Duplicate (Cmd/Ctrl + D)
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "d" &&
        activeObjects.length > 0
      ) {
        e.preventDefault();
        handleDuplicate();
      }

      // Undo (Cmd/Ctrl + Z)
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Redo (Cmd/Ctrl + Shift + Z)
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
    };

    // Set up mouse event handlers for creating objects
    const handleMouseDown = (options) => {
      const currentTool = activeToolRef.current; // Use ref to get current tool
      console.log("🖱️ Mouse down with tool:", currentTool);

      if (currentTool === "select") return;

      const pointer = canvas.getPointer(options.e);
      let newObj = null;

      switch (currentTool) {
        case "rectangle":
          newObj = createRectangle(pointer.x - 50, pointer.y - 50);
          break;
        case "circle":
          newObj = createCircle(pointer.x - 50, pointer.y - 50);
          break;
        case "triangle":
          newObj = createTriangle(pointer.x - 50, pointer.y - 50);
          break;
        case "text":
          newObj = createText(pointer.x, pointer.y);
          break;
      }

      if (newObj) {
        // Optional: Disable resizing for fixed-size objects
        // Uncomment these lines if you want fixed-size objects:
        // newObj.lockScalingX = true;
        // newObj.lockScalingY = true;
        // newObj.setControlsVisibility({
        //   mt: false, // middle top
        //   mb: false, // middle bottom
        //   ml: false, // middle left
        //   mr: false, // middle right
        //   bl: false, // bottom left
        //   br: false, // bottom right
        //   tl: false, // top left
        //   tr: false, // top right
        // });

        canvas.add(newObj);
        canvas.setActiveObject(newObj);
        canvas.renderAll();

        // Switch back to select tool after creating object
        setActiveTool("select");
      }
    };

    // Set up pan and zoom
    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleMouseDown2 = (opt) => {
      const evt = opt.e;
      if (evt.ctrlKey || evt.metaKey || evt.spaceKey || evt.code === "Space") {
        isPanning = true;
        canvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        canvas.setCursor("grab");
      }
    };

    const handleMouseMove = (opt) => {
      if (isPanning) {
        const evt = opt.e;
        const vpt = canvas.viewportTransform;
        vpt[4] += evt.clientX - lastPosX;
        vpt[5] += evt.clientY - lastPosY;
        canvas.requestRenderAll();
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    };

    const handleMouseUp = () => {
      if (isPanning) {
        canvas.setCursor("default");
        canvas.selection = true;
        isPanning = false;
      }
    };

    // Mouse wheel zoom
    const handleMouseWheel = (opt) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;

      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;

      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    };

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:down", handleMouseDown2);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("mouse:wheel", handleMouseWheel);

    // Space key handling for panning
    const handleDocKeyDown = (e) => {
      if (e.code === "Space" && !e.repeat && e.target === document.body) {
        e.preventDefault();
        canvas.defaultCursor = "grab";
        canvas.setCursor("grab");
      }
    };

    const handleDocKeyUp = (e) => {
      if (e.code === "Space") {
        canvas.defaultCursor = "default";
        canvas.setCursor("default");
      }
    };

    document.addEventListener("keydown", handleDocKeyDown);
    document.addEventListener("keyup", handleDocKeyUp);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleDocKeyDown);
      document.removeEventListener("keyup", handleDocKeyUp);
      setCanvasReady(false);
      if (canvas) {
        cleanupCanvasEvents(canvas);
        canvas.dispose();
      }
      fabricCanvasRef.current = null;
    };
  }, []); // FIXED: Canvas should only initialize once, not when tool changes!

  // Canvas event handlers
  const handleObjectAdded = useCallback(
    (e) => {
      console.log(
        "🎯 Canvas object added:",
        e.target.type,
        e.target.uuid,
        "isUpdatingFromYjs:",
        isUpdatingFromYjs
      );

      if (!isUpdatingFromYjs && e.target.uuid) {
        // Add to Yjs only if it's a user action, not from Yjs sync
        console.log("📤 Adding object to Yjs (user action):", e.target.uuid);
        addObjectToYjs(e.target);
      } else if (isUpdatingFromYjs) {
        console.log("📥 Object added from Yjs sync, skipping Yjs add");
      } else if (!e.target.uuid) {
        console.warn("⚠️ Object added without UUID:", e.target);
      }
    },
    [addObjectToYjs, isUpdatingFromYjs]
  );

  const handleObjectModified = useCallback(
    (e) => {
      console.log("Object modified:", e.target.uuid);
      if (!isUpdatingFromYjs && e.target.uuid) {
        // Throttle updates to prevent too many network calls
        setTimeout(() => {
          updateObjectInYjs(e.target);
        }, 100);
      }
    },
    [updateObjectInYjs, isUpdatingFromYjs]
  );

  const handleObjectRemoved = useCallback(
    (e) => {
      console.log("Object removed:", e.target.uuid);
      if (!isUpdatingFromYjs && e.target.uuid) {
        removeObjectFromYjs(e.target.uuid);
      }
    },
    [removeObjectFromYjs, isUpdatingFromYjs]
  );

  const handleSelectionCreated = useCallback((e) => {
    setSelectedObjects(e.selected || []);
  }, []);

  const handleSelectionUpdated = useCallback((e) => {
    setSelectedObjects(e.selected || []);
  }, []);

  const handleSelectionCleared = useCallback(() => {
    setSelectedObjects([]);
  }, []);

  // Tool handlers
  const handleToolChange = (tool) => {
    setActiveTool(tool);
  };

  // Color change handler
  const handleColorChange = (color, objects) => {
    // Update objects in Yjs
    objects.forEach((obj) => {
      if (obj.uuid && !isUpdatingFromYjs) {
        updateObjectInYjs(obj);
      }
    });
  };

  // AI command execution
  const handleAICommand = async (command) => {
    if (!command.trim())
      return { success: false, message: "Please enter a command" };

    setIsAILoading(true);

    try {
      // Get current canvas state
      const canvasState = getCanvasState();

      console.log("Executing AI command:", command);
      console.log("Canvas state:", canvasState);

      // Send command to server
      const response = await fetch("/api/ai/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          command,
          canvasState,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "AI command failed");
      }

      const result = await response.json();
      console.log("AI result:", result);

      // Apply the AI command result to the canvas
      await applyAICommand(result);

      return {
        success: true,
        message: result.explanation || "AI command executed successfully",
      };
    } catch (error) {
      console.error("AI command error:", error);
      return {
        success: false,
        message: error.message || "Failed to execute AI command",
      };
    } finally {
      setIsAILoading(false);
    }
  };

  const handleDuplicate = () => {
    const canvas = fabricCanvasRef.current;
    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length > 0) {
      const duplicates = activeObjects.map((obj) => duplicateObject(obj));

      duplicates.forEach((duplicate) => {
        canvas.add(duplicate);
        // The object:added event will handle adding to Yjs
      });

      // Select the duplicated objects
      if (duplicates.length === 1) {
        canvas.setActiveObject(duplicates[0]);
      } else {
        const selection = new fabric.ActiveSelection(duplicates, { canvas });
        canvas.setActiveObject(selection);
      }

      canvas.renderAll();
    }
  };

  const handleUndo = () => {
    undo();
  };

  const handleRedo = () => {
    redo();
  };

  // Handle delete via button click
  const handleDelete = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        canvas.remove(obj);
      });
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const handleFitToScreen = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    if (objects.length === 0) {
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvas.renderAll();
      return;
    }

    const group = new fabric.Group(objects);
    const groupWidth = group.width;
    const groupHeight = group.height;
    const groupLeft = group.left;
    const groupTop = group.top;

    canvas.remove(group);
    objects.forEach((obj) => canvas.add(obj));

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const scaleX = (canvasWidth - 100) / groupWidth;
    const scaleY = (canvasHeight - 100) / groupHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const objectCenterX = groupLeft + groupWidth / 2;
    const objectCenterY = groupTop + groupHeight / 2;

    const deltaX = centerX - objectCenterX * scale;
    const deltaY = centerY - objectCenterY * scale;

    canvas.setViewportTransform([scale, 0, 0, scale, deltaX, deltaY]);
    canvas.renderAll();
  };

  return (
    <div className="canvas-container">
      {/* Connection Status with Users Dropdown */}
      <div style={{ position: "relative" }}>
        <div
          className="connection-status"
          onClick={() =>
            userCount >= 2 && setShowUsersDropdown(!showUsersDropdown)
          }
          style={{
            cursor: userCount >= 2 ? "pointer" : "default",
            userSelect: "none",
          }}
        >
          <div className={`status-dot status-${connectionStatus}`}></div>
          <span>
            {connectionStatus === "connected" && "Connected"}
            {connectionStatus === "reconnecting" && "Reconnecting..."}
            {connectionStatus === "disconnected" && "Disconnected"}
          </span>
          <span style={{ marginLeft: "10px", fontSize: "12px", color: "#666" }}>
            {userCount} user{userCount !== 1 ? "s" : ""} online
            {userCount >= 2 && <span style={{ marginLeft: "5px" }}>▼</span>}
          </span>
        </div>

        {/* Users Dropdown */}
        {showUsersDropdown && userCount >= 2 && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              right: "0",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              padding: "12px",
              minWidth: "200px",
              zIndex: 1001,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#333",
              }}
            >
              Connected Users
            </div>

            {/* Current User */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 8px",
                borderRadius: "4px",
                backgroundColor: "#f0f9ff",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: user.color,
                  border: "2px solid white",
                  boxShadow: "0 0 0 1px #ddd",
                }}
              />
              <span style={{ fontSize: "13px", fontWeight: "500" }}>
                {user.username} (you)
              </span>
            </div>

            {/* Other Connected Users */}
            {connectedUsers.map((connectedUser) => (
              <div
                key={connectedUser.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  marginBottom: "2px",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: connectedUser.color,
                    border: "2px solid white",
                    boxShadow: "0 0 0 1px #ddd",
                  }}
                />
                <span style={{ fontSize: "13px" }}>
                  {connectedUser.username}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Info & Logout */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          background: "white",
          padding: "8px 12px",
          borderRadius: "6px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "14px" }}>Welcome, {user.username}!</span>
        <button
          onClick={onLogout}
          style={{
            padding: "4px 8px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Toolbar */}
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onDelete={handleDelete}
        hasSelection={selectedObjects.length > 0}
      />

      {/* Color Picker */}
      <ColorPicker
        selectedObjects={selectedObjects}
        onColorChange={handleColorChange}
        fabricCanvas={fabricCanvasRef.current}
      />

      {/* Zoom Controls */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        <button
          onClick={() => {
            const canvas = fabricCanvasRef.current;
            const zoom = canvas.getZoom();
            canvas.setZoom(Math.min(zoom * 1.2, 3));
          }}
          style={{
            padding: "5px 10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            background: "white",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Zoom In
        </button>
        <button
          onClick={() => {
            const canvas = fabricCanvasRef.current;
            const zoom = canvas.getZoom();
            canvas.setZoom(Math.max(zoom * 0.8, 0.1));
          }}
          style={{
            padding: "5px 10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            background: "white",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Zoom Out
        </button>
        <button
          onClick={handleFitToScreen}
          style={{
            padding: "5px 10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            background: "white",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Fit Screen
        </button>
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "#ddd",
            margin: "5px 0",
          }}
        />
        <button
          onClick={async () => {
            const success = await saveNow();
            if (success) {
              // Show temporary success message
              const button = event.target;
              const originalText = button.textContent;
              button.textContent = "Saved!";
              button.style.background = "#22c55e";
              setTimeout(() => {
                button.textContent = originalText;
                button.style.background = "white";
              }, 2000);
            }
          }}
          style={{
            padding: "5px 10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            background: "white",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Save Now
        </button>
      </div>

      {/* Object Info */}
      {selectedObjects.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            zIndex: 1000,
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            padding: "10px",
            fontSize: "12px",
            minWidth: "200px",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
            Selected: {selectedObjects.length} object
            {selectedObjects.length > 1 ? "s" : ""}
          </div>
          {selectedObjects.length === 1 && (
            <div>
              <div>Type: {selectedObjects[0].type}</div>
              <div>
                Position: ({Math.round(selectedObjects[0].left)},{" "}
                {Math.round(selectedObjects[0].top)})
              </div>
              {selectedObjects[0].type === "rect" && (
                <div>
                  Size: {Math.round(selectedObjects[0].width)} ×{" "}
                  {Math.round(selectedObjects[0].height)}
                </div>
              )}
              {selectedObjects[0].type === "circle" && (
                <div>Radius: {Math.round(selectedObjects[0].radius)}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI Command Input */}
      <AICommandInput
        onExecuteCommand={handleAICommand}
        isLoading={isAILoading}
      />

      {/* Canvas */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f8f9fa",
          position: "relative",
        }}
      >
        <div style={{ position: "relative" }}>
          {!canvasReady && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
                background: "rgba(248, 249, 250, 0.95)",
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid #e3e6ea",
                  borderTop: "4px solid #007bff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 16px",
                }}
              ></div>
              <p
                style={{
                  color: "#495057",
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                🎨 Initializing canvas...
              </p>
              <p
                style={{
                  color: "#6c757d",
                  margin: "8px 0 0 0",
                  fontSize: "14px",
                }}
              >
                Setting up Fabric.js and collaborative features
              </p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            style={{
              border: "1px solid #ddd",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              borderRadius: "4px",
            }}
          />
          {/* Cursor Overlay */}
          <CursorOverlay cursors={cursors} />
        </div>
      </div>

      {/* Collapsible Help Panel */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "20px",
          transform: "translateY(-50%)",
          zIndex: 1000,
        }}
        onMouseEnter={() => setShowHelp(true)}
        onMouseLeave={() => setShowHelp(false)}
      >
        {/* Help Button */}
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: showHelp ? "#3B82F6" : "#ffffff",
            color: showHelp ? "#ffffff" : "#3B82F6",
            border: "2px solid #3B82F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            transition: "all 0.2s ease",
          }}
        >
          ?
        </div>

        {/* Expandable Panel */}
        {showHelp && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              left: "0",
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              padding: "12px",
              fontSize: "11px",
              width: "200px",
              lineHeight: "1.3",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "6px",
                fontSize: "12px",
              }}
            >
              ⌨️ Shortcuts
            </div>
            <div>• Space + Drag: Pan</div>
            <div>• Delete/Backspace: Remove</div>
            <div>• Arrows: Nudge (+ Shift)</div>
            <div>• Cmd/Ctrl+D: Duplicate</div>
            <div>• Shift+Click: Multi-select</div>

            <div
              style={{
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid #eee",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "4px",
                  fontSize: "12px",
                }}
              >
                🤖 AI Commands
              </div>
              <div style={{ opacity: 0.8 }}>
                <div>• "Create red circle"</div>
                <div>• "Move to center"</div>
                <div>• "Create login form"</div>
              </div>
            </div>

            <div
              style={{
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid #eee",
                fontSize: "10px",
                opacity: 0.7,
              }}
            >
              Real-time sync • Auto-save
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
