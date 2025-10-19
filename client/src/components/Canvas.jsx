import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import Toolbar from "./Toolbar";
import CursorOverlay from "./CursorOverlay";
import ColorPicker from "./ColorPicker";
import AICommandInput from "./AICommandInput";
import LeftSidebar from "./LeftSidebar";
import ExportDialog from "./ExportDialog";
import TextFormatPanel from "./TextFormatPanel";
import EditHistoryBadge from "./EditHistoryBadge";
import { useYjs } from "../hooks/useYjs";
import { useSocketCursors } from "../hooks/useSocketCursors";
import { useFrames } from "../hooks/useFrames";
import { exportAsPNG, exportAsSVG, exportAsJSON } from "../utils/exportHelpers";
import { renderAllFrames, fitFrameToViewport } from "../utils/frameHelpers";
import {
  createRectangle,
  createCircle,
  createTriangle,
  createText,
  getCanvasCenter,
  duplicateObject,
  setupCanvasEvents,
  cleanupCanvasEvents,
  bringToFront,
  sendToBack,
  bringForward,
  sendBackward,
  moveToIndex,
} from "../utils/fabricHelpers";
import {
  alignLeft,
  alignCenter,
  alignRight,
  alignTop,
  alignMiddle,
  alignBottom,
  distributeHorizontally,
  distributeVertically,
  alignToCanvasCenter,
} from "../utils/alignmentHelpers";

const Canvas = ({ user, onLogout }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [activeTool, setActiveTool] = useState("select");
  const activeToolRef = useRef("select"); // Ref to track current tool for event handlers
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(50); // Track zoom percentage (50% = 0.5 zoom)
  const [selectedTextObject, setSelectedTextObject] = useState(null);
  const [textFormatPanelPosition, setTextFormatPanelPosition] = useState({
    x: 0,
    y: 0,
  });
  const [clipboard, setClipboard] = useState(null); // For copy/paste

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

  // Initialize frames management
  const {
    frames,
    activeFrameId,
    addFrame,
    updateFrame,
    deleteFrame,
    duplicateFrame,
    selectFrame,
    getActiveFrame,
  } = useFrames();

  // Frame handlers
  const handleFrameMove = (frameId, newPosition) => {
    updateFrame(frameId, newPosition);
  };

  const handleAddFrame = (preset) => {
    const newFrame = addFrame(preset);
    // Auto-fit the newly created frame to viewport after a brief delay
    // to ensure it's rendered
    setTimeout(() => {
      if (newFrame && fabricCanvasRef.current) {
        const zoom = fitFrameToViewport(fabricCanvasRef.current, newFrame);
        setZoomLevel(Math.round(zoom * 100));
      }
    }, 100);
    return newFrame;
  };

  const handleSelectFrame = (frameId) => {
    selectFrame(frameId);
    // Fit frame to viewport when selected
    const frame = frames.find((f) => f.id === frameId);
    if (frame && fabricCanvasRef.current) {
      const zoom = fitFrameToViewport(fabricCanvasRef.current, frame);
      setZoomLevel(Math.round(zoom * 100));
    }
  };

  // Render frames whenever they change or active frame changes
  useEffect(() => {
    if (fabricCanvasRef.current && canvasReady) {
      renderAllFrames(
        fabricCanvasRef.current,
        frames,
        activeFrameId,
        handleFrameMove
      );
    }
  }, [frames, activeFrameId, canvasReady]);

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

      // Set initial zoom to 50% (0.5) so frames fit better
      canvas.setZoom(0.5);
      setZoomLevel(50);

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

      // Copy (Cmd/Ctrl + C)
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "c" &&
        activeObjects.length > 0
      ) {
        e.preventDefault();
        handleCopy();
      }

      // Paste (Cmd/Ctrl + V)
      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        e.preventDefault();
        handlePaste();
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

      // Alignment shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && activeObjects.length > 0) {
        switch (e.key.toLowerCase()) {
          case "l":
            e.preventDefault();
            handleAlignLeft();
            break;
          case "h":
            e.preventDefault();
            handleAlignCenter();
            break;
          case "r":
            e.preventDefault();
            handleAlignRight();
            break;
          case "t":
            e.preventDefault();
            handleAlignTop();
            break;
          case "m":
            e.preventDefault();
            handleAlignMiddle();
            break;
          case "b":
            e.preventDefault();
            handleAlignBottom();
            break;
          case "c":
            e.preventDefault();
            handleAlignToCenter();
            break;
          default:
            break;
        }
      }

      // Z-index shortcuts
      if ((e.metaKey || e.ctrlKey) && activeObjects.length === 1) {
        if (e.key === "]") {
          e.preventDefault();
          if (e.shiftKey) {
            handleBringForward();
          } else {
            handleBringToFront();
          }
        } else if (e.key === "[") {
          e.preventDefault();
          if (e.shiftKey) {
            handleSendBackward();
          } else {
            handleSendToBack();
          }
        }
      }

      // Export shortcut (Cmd/Ctrl + E)
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        setShowExportDialog(true);
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
      setZoomLevel(Math.round(zoom * 100)); // Update zoom level display
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
    const selected = e.selected || [];
    setSelectedObjects(selected);

    // Check if single text object is selected
    if (
      selected.length === 1 &&
      (selected[0].type === "i-text" ||
        selected[0].type === "text" ||
        selected[0].type === "textbox")
    ) {
      const textObj = selected[0];
      setSelectedTextObject(textObj);

      // Calculate position near the text object
      const boundingRect = textObj.getBoundingRect();
      setTextFormatPanelPosition({
        x: boundingRect.left + boundingRect.width + 20,
        y: boundingRect.top,
      });
    } else {
      setSelectedTextObject(null);
    }
  }, []);

  const handleSelectionUpdated = useCallback((e) => {
    const selected = e.selected || [];
    setSelectedObjects(selected);

    // Check if single text object is selected
    if (
      selected.length === 1 &&
      (selected[0].type === "i-text" ||
        selected[0].type === "text" ||
        selected[0].type === "textbox")
    ) {
      const textObj = selected[0];
      setSelectedTextObject(textObj);

      // Calculate position near the text object
      const boundingRect = textObj.getBoundingRect();
      setTextFormatPanelPosition({
        x: boundingRect.left + boundingRect.width + 20,
        y: boundingRect.top,
      });
    } else {
      setSelectedTextObject(null);
    }
  }, []);

  const handleSelectionCleared = useCallback(() => {
    setSelectedObjects([]);
    setSelectedTextObject(null);
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
      const fullCanvasState = getCanvasState();

      // Optimize canvas state to reduce token usage
      let canvasState;

      // Check if command is purely creative (doesn't need canvas context)
      const isCreativeCommand = /^(create|add|make|draw|generate)/i.test(
        command.trim()
      );
      const hasNoObjects =
        !fullCanvasState.objects || fullCanvasState.objects.length === 0;

      if (isCreativeCommand && hasNoObjects) {
        // For creative commands on empty canvas, send minimal state
        canvasState = { objects: [] };
      } else if (
        fullCanvasState.objects &&
        fullCanvasState.objects.length > 20
      ) {
        // For large canvases, send only essential info about recent objects
        const recentObjects = fullCanvasState.objects.slice(-10).map((obj) => ({
          type: obj.type,
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height,
          radius: obj.radius,
          fill: obj.fill,
          text: obj.text,
        }));

        canvasState = {
          objects: recentObjects,
          objectCount: fullCanvasState.objects.length,
          summary: `Canvas has ${fullCanvasState.objects.length} total objects. Showing essential info for last 10 objects only.`,
        };
      } else {
        // For smaller canvases, send full state
        canvasState = fullCanvasState;
      }

      console.log("Executing AI command:", command);
      console.log("Canvas state (optimized):", canvasState);

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

  const handleCopy = () => {
    const canvas = fabricCanvasRef.current;
    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length > 0) {
      // Store the objects in clipboard
      setClipboard(activeObjects.map((obj) => obj.toObject(["uuid"])));
      console.log("Copied", activeObjects.length, "object(s)");
    }
  };

  const handlePaste = () => {
    const canvas = fabricCanvasRef.current;

    if (clipboard && clipboard.length > 0) {
      const pastedObjects = [];

      clipboard.forEach((objData) => {
        // Create new object from clipboard data
        fabric.util.enlivenObjects([objData], (objects) => {
          objects.forEach((obj) => {
            // Offset position slightly
            obj.set({
              left: obj.left + 20,
              top: obj.top + 20,
              uuid: crypto.randomUUID(), // Generate new UUID
            });

            canvas.add(obj);
            pastedObjects.push(obj);

            // The object:added event will handle adding to Yjs
          });

          // Select the pasted objects
          if (pastedObjects.length === 1) {
            canvas.setActiveObject(pastedObjects[0]);
          } else if (pastedObjects.length > 1) {
            const selection = new fabric.ActiveSelection(pastedObjects, {
              canvas,
            });
            canvas.setActiveObject(selection);
          }

          canvas.renderAll();
        });
      });

      console.log("Pasted", clipboard.length, "object(s)");
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
      setZoomLevel(100);
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
    setZoomLevel(Math.round(scale * 100)); // Update zoom level display
    canvas.renderAll();
  };

  // Alignment handlers
  const handleAlignLeft = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      alignLeft(activeObjects);
      canvas.renderAll();
      // Sync all modified objects to Yjs in one batch
      activeObjects.forEach((obj) => {
        if (obj.uuid && !isUpdatingFromYjs) {
          updateObjectInYjs(obj);
        }
      });
      // Force save to create proper undo point
      saveNow();
    }
  };

  const handleAlignCenter = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      alignCenter(activeObjects);
      canvas.renderAll();
      activeObjects.forEach((obj) => {
        if (obj.uuid && !isUpdatingFromYjs) {
          updateObjectInYjs(obj);
        }
      });
      saveNow();
    }
  };

  const handleAlignRight = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      alignRight(activeObjects);
      canvas.renderAll();
      activeObjects.forEach((obj) => {
        if (obj.uuid && !isUpdatingFromYjs) {
          updateObjectInYjs(obj);
        }
      });
      saveNow();
    }
  };

  const handleAlignTop = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      alignTop(activeObjects);
      canvas.renderAll();
      activeObjects.forEach((obj) => {
        if (obj.uuid && !isUpdatingFromYjs) {
          updateObjectInYjs(obj);
        }
      });
      saveNow();
    }
  };

  const handleAlignMiddle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      alignMiddle(activeObjects);
      canvas.renderAll();
      activeObjects.forEach((obj) => {
        if (obj.uuid && !isUpdatingFromYjs) {
          updateObjectInYjs(obj);
        }
      });
      saveNow();
    }
  };

  const handleAlignBottom = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      alignBottom(activeObjects);
      canvas.renderAll();
      activeObjects.forEach((obj) => {
        if (obj.uuid && !isUpdatingFromYjs) {
          updateObjectInYjs(obj);
        }
      });
      saveNow();
    }
  };

  const handleDistributeHorizontally = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length >= 2) {
      distributeHorizontally(activeObjects);
      canvas.renderAll();
      activeObjects.forEach((obj) => {
        if (obj.uuid && !isUpdatingFromYjs) {
          updateObjectInYjs(obj);
        }
      });
      saveNow();
    }
  };

  const handleDistributeVertically = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length >= 2) {
      distributeVertically(activeObjects);
      canvas.renderAll();
      activeObjects.forEach((obj) => {
        if (obj.uuid && !isUpdatingFromYjs) {
          updateObjectInYjs(obj);
        }
      });
      saveNow();
    }
  };

  const handleAlignToCenter = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      alignToCanvasCenter(activeObjects, canvas);
      canvas.renderAll();
      activeObjects.forEach((obj) => {
        if (obj.uuid && !isUpdatingFromYjs) {
          updateObjectInYjs(obj);
        }
      });
      saveNow();
    }
  };

  // Z-Index handlers
  const handleBringToFront = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      bringToFront(activeObject, canvas);
      handleObjectModified({ target: activeObject });
    }
  };

  const handleSendToBack = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      sendToBack(activeObject, canvas);
      handleObjectModified({ target: activeObject });
    }
  };

  const handleBringForward = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      bringForward(activeObject, canvas);
      handleObjectModified({ target: activeObject });
    }
  };

  const handleSendBackward = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      sendBackward(activeObject, canvas);
      handleObjectModified({ target: activeObject });
    }
  };

  // Layer Panel handlers
  const handleSelectObject = (objectId) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const obj = canvas.getObjects().find((o) => o.uuid === objectId);
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  };

  const handleDeleteObject = (objectId) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const obj = canvas.getObjects().find((o) => o.uuid === objectId);
    if (obj) {
      canvas.remove(obj);
      canvas.renderAll();
    }
  };

  const handleToggleVisibility = (objectId, visible) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const obj = canvas.getObjects().find((o) => o.uuid === objectId);
    if (obj) {
      obj.set({ visible });
      canvas.renderAll();
      // Sync visibility change to Yjs
      updateObjectInYjs(obj);
    }
  };

  const handleToggleLock = (objectId, locked) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const obj = canvas.getObjects().find((o) => o.uuid === objectId);
    if (obj) {
      obj.set({
        selectable: !locked,
        evented: !locked,
      });
      canvas.renderAll();
      // Sync lock state to Yjs
      updateObjectInYjs(obj);
    }
  };

  const handleRenameObject = (objectId, newName) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const obj = canvas.getObjects().find((o) => o.uuid === objectId);
    if (obj) {
      obj.name = newName;
      canvas.renderAll();
      // Sync name change to Yjs
      updateObjectInYjs(obj);
    }
  };

  const handleReorderLayers = (objectId, newZIndex) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const obj = canvas.getObjects().find((o) => o.uuid === objectId);
    if (obj) {
      moveToIndex(obj, newZIndex, canvas);
      // Sync z-index change to Yjs
      handleObjectModified({ target: obj });
    }
  };

  // Export handler
  const handleExport = ({ format, quality, selectionOnly, fileName }) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      if (format === "png") {
        exportAsPNG(canvas, fileName, { quality, selectionOnly });
      } else if (format === "svg") {
        exportAsSVG(canvas, fileName, selectionOnly);
      } else if (format === "json") {
        exportAsJSON(canvas, fileName);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Export failed: ${error.message}`);
    }
  };

  return (
    <div className="canvas-container">
      {/* Unified Top Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "56px",
          background: "white",
          borderBottom: "1px solid var(--gray-200)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 var(--spacing-xl)",
          zIndex: "var(--z-toolbar)",
        }}
      >
        {/* Left: User Info & Logout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-lg)",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "var(--primary-color)",
              letterSpacing: "-0.5px",
            }}
          >
            CollabCanvas
          </div>
          <div
            style={{
              height: "24px",
              width: "1px",
              background: "var(--gray-200)",
            }}
          />
          <span style={{ fontSize: "14px", color: "var(--gray-700)" }}>
            {user.username}
          </span>
          <button
            onClick={onLogout}
            style={{
              padding: "6px 12px",
              background: "var(--gray-100)",
              color: "var(--gray-700)",
              border: "1px solid var(--gray-200)",
              borderRadius: "var(--border-radius)",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--error-color)";
              e.target.style.color = "white";
              e.target.style.borderColor = "var(--error-color)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "var(--gray-100)";
              e.target.style.color = "var(--gray-700)";
              e.target.style.borderColor = "var(--gray-200)";
            }}
          >
            Logout
          </button>
        </div>

        {/* Right: Connection Status with Dropdown */}
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
            <span style={{ color: "var(--gray-700)" }}>
              {connectionStatus === "connected" && "Connected"}
              {connectionStatus === "reconnecting" && "Reconnecting..."}
              {connectionStatus === "disconnected" && "Disconnected"}
            </span>
            <span
              style={{
                marginLeft: "var(--spacing-md)",
                fontSize: "12px",
                color: "var(--gray-500)",
              }}
            >
              {userCount} user{userCount !== 1 ? "s" : ""}
              {userCount >= 2 && <span style={{ marginLeft: "4px" }}>▼</span>}
            </span>
          </div>

          {/* Users Dropdown */}
          {showUsersDropdown && userCount >= 2 && (
            <div
              style={{
                position: "absolute",
                top: "48px",
                right: "0",
                background: "white",
                border: "1px solid var(--gray-200)",
                borderRadius: "var(--border-radius-lg)",
                boxShadow: "var(--shadow-xl)",
                padding: "var(--spacing-md)",
                minWidth: "220px",
                zIndex: "var(--z-dropdown)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "var(--spacing-sm)",
                  color: "var(--gray-700)",
                }}
              >
                Connected Users
              </div>

              {/* Current User */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-sm)",
                  padding: "var(--spacing-sm)",
                  borderRadius: "var(--border-radius)",
                  backgroundColor: "var(--primary-light)",
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
                    boxShadow: "0 0 0 1px var(--gray-300)",
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
                    gap: "var(--spacing-sm)",
                    padding: "var(--spacing-sm)",
                    borderRadius: "var(--border-radius)",
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
                      boxShadow: "0 0 0 1px var(--gray-300)",
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
        onDuplicate={handleDuplicate}
        hasSelection={selectedObjects.length > 0}
        selectedObjects={selectedObjects}
        onAlignLeft={handleAlignLeft}
        onAlignCenter={handleAlignCenter}
        onAlignRight={handleAlignRight}
        onAlignTop={handleAlignTop}
        onAlignMiddle={handleAlignMiddle}
        onAlignBottom={handleAlignBottom}
        onDistributeHorizontally={handleDistributeHorizontally}
        onDistributeVertically={handleDistributeVertically}
        onAlignToCenter={handleAlignToCenter}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onExport={() => setShowExportDialog(true)}
      />

      {/* Left Sidebar - Layers & Frames */}
      <LeftSidebar
        fabricCanvas={fabricCanvasRef.current}
        selectedObjects={selectedObjects}
        onSelectObject={handleSelectObject}
        onDeleteObject={handleDeleteObject}
        onToggleVisibility={handleToggleVisibility}
        onToggleLock={handleToggleLock}
        onRenameObject={handleRenameObject}
        onReorderLayers={handleReorderLayers}
        frames={frames}
        activeFrameId={activeFrameId}
        onAddFrame={handleAddFrame}
        onUpdateFrame={updateFrame}
        onDeleteFrame={deleteFrame}
        onDuplicateFrame={duplicateFrame}
        onSelectFrame={handleSelectFrame}
      />

      {/* Color Picker */}
      <ColorPicker
        selectedObjects={selectedObjects}
        onColorChange={handleColorChange}
        fabricCanvas={fabricCanvasRef.current}
      />

      {/* Zoom Controls - Compact pill style */}
      <div
        style={{
          position: "absolute",
          bottom: "var(--spacing-xl)",
          right: "var(--spacing-xl)",
          zIndex: "var(--z-panel)",
          background: "white",
          borderRadius: "var(--border-radius-full)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          alignItems: "center",
          gap: "2px",
          padding: "6px",
          border: "1px solid var(--gray-200)",
        }}
      >
        <button
          onClick={() => {
            const canvas = fabricCanvasRef.current;
            const zoom = canvas.getZoom();
            const newZoom = Math.max(zoom * 0.8, 0.1);
            canvas.setZoom(newZoom);
            setZoomLevel(Math.round(newZoom * 100));
          }}
          style={{
            width: "32px",
            height: "32px",
            border: "none",
            borderRadius: "50%",
            background: "var(--gray-50)",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "600",
            color: "var(--gray-700)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--gray-100)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "var(--gray-50)";
          }}
          title="Zoom out"
        >
          −
        </button>
        <div
          style={{
            padding: "0 var(--spacing-md)",
            fontSize: "13px",
            fontWeight: "600",
            color: "var(--primary-color)",
            minWidth: "50px",
            textAlign: "center",
          }}
        >
          {zoomLevel}%
        </div>
        <button
          onClick={() => {
            const canvas = fabricCanvasRef.current;
            const zoom = canvas.getZoom();
            const newZoom = Math.min(zoom * 1.2, 3);
            canvas.setZoom(newZoom);
            setZoomLevel(Math.round(newZoom * 100));
          }}
          style={{
            width: "32px",
            height: "32px",
            border: "none",
            borderRadius: "50%",
            background: "var(--gray-50)",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "600",
            color: "var(--gray-700)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--gray-100)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "var(--gray-50)";
          }}
          title="Zoom in"
        >
          +
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

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        hasSelection={selectedObjects.length > 0}
      />

      {/* Text Format Panel */}
      {selectedTextObject && (
        <TextFormatPanel
          textObject={selectedTextObject}
          fabricCanvas={fabricCanvasRef.current}
          position={textFormatPanelPosition}
        />
      )}

      {/* Edit History Badge */}
      <EditHistoryBadge selectedObjects={selectedObjects} />

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

      {/* Help Button - Bottom Right */}
      <div
        style={{
          position: "absolute",
          bottom: "var(--spacing-xl)",
          right: "calc(var(--spacing-xl) + 160px)",
          zIndex: "var(--z-panel)",
        }}
        onMouseEnter={() => setShowHelp(true)}
        onMouseLeave={() => setShowHelp(false)}
      >
        {/* Help Button */}
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "var(--border-radius-full)",
            background: showHelp ? "var(--primary-color)" : "white",
            color: showHelp ? "white" : "var(--primary-color)",
            border: `2px solid ${showHelp ? "var(--primary-color)" : "var(--gray-200)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: showHelp ? "var(--shadow-xl)" : "var(--shadow-md)",
            transition: "all var(--transition-normal)",
          }}
        >
          ?
        </div>

        {/* Expandable Panel */}
        {showHelp && (
          <div
            style={{
              position: "absolute",
              bottom: "56px",
              right: "0",
              background: "white",
              border: "1px solid var(--gray-200)",
              borderRadius: "var(--border-radius-lg)",
              boxShadow: "var(--shadow-2xl)",
              padding: "var(--spacing-lg)",
              fontSize: "12px",
              width: "280px",
              lineHeight: "1.5",
              animation: "slideInUp 0.2s ease",
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                fontWeight: "700",
                marginBottom: "var(--spacing-md)",
                fontSize: "14px",
                color: "var(--gray-900)",
              }}
            >
              ⌨️ Keyboard Shortcuts
            </div>
            <div style={{ color: "var(--gray-700)", marginBottom: "6px" }}>• <strong>Space + Drag:</strong> Pan canvas</div>
            <div style={{ color: "var(--gray-700)", marginBottom: "6px" }}>• <strong>Delete/Backspace:</strong> Remove</div>
            <div style={{ color: "var(--gray-700)", marginBottom: "6px" }}>• <strong>Arrows:</strong> Nudge (+ Shift)</div>
            <div style={{ color: "var(--gray-700)", marginBottom: "6px" }}>• <strong>⌘/Ctrl+D:</strong> Duplicate</div>
            <div style={{ color: "var(--gray-700)", marginBottom: "6px" }}>• <strong>⌘/Ctrl+Z:</strong> Undo/Redo</div>

            <div
              style={{
                marginTop: "var(--spacing-lg)",
                paddingTop: "var(--spacing-lg)",
                borderTop: "1px solid var(--gray-200)",
              }}
            >
              <div
                style={{
                  fontWeight: "700",
                  marginBottom: "var(--spacing-sm)",
                  fontSize: "14px",
                  color: "var(--gray-900)",
                }}
              >
                🤖 AI Canvas Agent
              </div>
              <div style={{ color: "var(--gray-600)", fontSize: "11px", fontStyle: "italic" }}>
                Try commands like:
              </div>
              <div style={{ color: "var(--gray-700)", marginTop: "6px" }}>• "Create a red circle"</div>
              <div style={{ color: "var(--gray-700)" }}>• "Arrange in a row"</div>
              <div style={{ color: "var(--gray-700)" }}>• "Create login form"</div>
            </div>

            <div
              style={{
                marginTop: "var(--spacing-lg)",
                paddingTop: "var(--spacing-lg)",
                borderTop: "1px solid var(--gray-200)",
                fontSize: "11px",
                color: "var(--gray-500)",
                textAlign: "center",
              }}
            >
              Real-time collaboration • AI-powered • Production-ready
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
