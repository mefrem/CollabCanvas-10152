import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import {
  serializeFabricObject,
  deserializeFabricObject,
} from "../utils/fabricHelpers";
import { usePersistence } from "./usePersistence";
import { executePattern } from "../utils/patternGenerator";
import { executeArrangement, filterObjects } from "../utils/arrangementHelper";

export const useYjs = (canvasId, user, fabricCanvas) => {
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const objectsMapRef = useRef(null);
  const undoManagerRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isUpdatingFromYjs, setIsUpdatingFromYjs] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Initialize persistence
  const { loadCanvas, saveNow } = usePersistence(
    canvasId,
    ydocRef.current,
    user
  );

  // Initialize Yjs document and provider
  useEffect(() => {
    if (!canvasId || !user || !fabricCanvas) {
      return;
    }

    // Create Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Create WebSocket provider
    // In production, use same host with wss protocol
    // In development, use env var or localhost
    const wsUrl = import.meta.env.VITE_YJS_WS_URL || 
      (import.meta.env.PROD 
        ? `wss://${window.location.host}` 
        : "ws://localhost:1234");
    const provider = new WebsocketProvider(wsUrl, canvasId, ydoc, {
      connect: true,
    });
    providerRef.current = provider;

    // Set awareness info after provider is created
    if (provider.awareness) {
      provider.awareness.setLocalStateField("user", {
        id: user.id,
        username: user.username,
        color: user.color,
      });
    }

    // Get objects map
    const objectsMap = ydoc.getMap("objects");
    objectsMapRef.current = objectsMap;

    // Set up UndoManager
    const undoManager = new Y.UndoManager(objectsMap);
    undoManagerRef.current = undoManager;

    // Update undo/redo state when stack changes
    const updateUndoRedoState = () => {
      setCanUndo(undoManager.undoStack.length > 0);
      setCanRedo(undoManager.redoStack.length > 0);
    };

    undoManager.on("stack-item-added", updateUndoRedoState);
    undoManager.on("stack-item-popped", updateUndoRedoState);
    updateUndoRedoState();

    // Set up connection status handlers
    provider.on("status", (event) => {
      setConnectionStatus(event.status);
    });

    provider.on("connection-close", () => {
      setConnectionStatus("disconnected");
    });

    provider.on("connection-error", (error) => {
      console.error("Yjs connection error:", error);
      setConnectionStatus("disconnected");
    });

    // Add sync handlers
    provider.on("sync", (isSynced) => {
      // Yjs synced
    });

    // Handle WebSocket errors gracefully
    provider.ws?.addEventListener("error", (error) => {
      console.error("Yjs WebSocket error:", error);
    });

    // Set up Yjs map observer
    const handleYjsChanges = (event) => {
      if (isUpdatingFromYjs) return; // Prevent infinite loops

      setIsUpdatingFromYjs(true);

      event.changes.keys.forEach(async (change, key) => {
        const fabricObject = fabricCanvas
          .getObjects()
          .find((obj) => obj.uuid === key);

        if (change.action === "add") {
          // Object added remotely
          if (!fabricObject) {
            const objectData = objectsMap.get(key);
            if (objectData) {
              try {
                const newObject = await deserializeFabricObject(objectData);
                newObject.uuid = key;

                // Double-check the object is valid before adding
                if (!newObject || typeof newObject.render !== "function") {
                  throw new Error(
                    "Deserialized object is not a valid Fabric object"
                  );
                }

                fabricCanvas.add(newObject);
                fabricCanvas.renderAll();
              } catch (error) {
                console.error("Error deserializing object:", error);
              }
            }
          }
        } else if (change.action === "update") {
          // Object updated remotely
          if (fabricObject) {
            const objectData = objectsMap.get(key);
            if (objectData) {
              try {
                // Update existing object properties
                fabricObject.set(objectData);
                fabricObject.setCoords();
                fabricCanvas.renderAll();
              } catch (error) {
                console.error("Error updating object:", error);
              }
            }
          }
        } else if (change.action === "delete") {
          // Object deleted remotely
          if (fabricObject) {
            fabricCanvas.remove(fabricObject);
            fabricCanvas.renderAll();
          }
        }
      });

      setIsUpdatingFromYjs(false);
    };

    objectsMap.observe(handleYjsChanges);

    // Load existing canvas state from database
    loadCanvasFromDatabase();

    // Cleanup
    return () => {
      objectsMap.unobserve(handleYjsChanges);
      if (undoManager) {
        undoManager.off("stack-item-added", updateUndoRedoState);
        undoManager.off("stack-item-popped", updateUndoRedoState);
        undoManager.destroy();
      }
      provider.disconnect();
      ydoc.destroy();
    };
  }, [canvasId, user, fabricCanvas]);

  // Load canvas state from database then render from Yjs
  const loadCanvasFromDatabase = async () => {
    if (!fabricCanvas) return;

    // First load from database into Yjs
    await loadCanvas();

    // Then render from Yjs to Fabric canvas
    await loadCanvasFromYjs();
  };

  // Load canvas state from Yjs to Fabric
  const loadCanvasFromYjs = async () => {
    if (!objectsMapRef.current || !fabricCanvas) return;

    // Safety check: ensure canvas is fully initialized
    if (!fabricCanvas.getContext || !fabricCanvas.getContext()) {
      console.warn("Canvas context not ready, skipping Yjs load");
      return;
    }

    const objectsMap = objectsMapRef.current;

    // Clear current canvas
    try {
      fabricCanvas.clear();
    } catch (error) {
      console.error("Error clearing canvas:", error);
      return;
    }

    // Load objects from Yjs
    for (const [uuid, objectData] of objectsMap.entries()) {
      try {
        const fabricObject = await deserializeFabricObject(objectData);
        fabricObject.uuid = uuid;
        fabricCanvas.add(fabricObject);
      } catch (error) {
        console.error("Error loading object from Yjs:", error);
      }
    }

    fabricCanvas.renderAll();
  };

  // Add object to Yjs
  const addObjectToYjs = (fabricObject) => {
    if (!objectsMapRef.current || isUpdatingFromYjs) return;

    try {
      // Add edit metadata to fabric object
      fabricObject.lastEditedBy = user?.username || "Unknown";
      fabricObject.lastEditedAt = new Date().toISOString();

      const serialized = serializeFabricObject(fabricObject);
      // Ensure metadata is in serialized form
      serialized.lastEditedBy = fabricObject.lastEditedBy;
      serialized.lastEditedAt = fabricObject.lastEditedAt;
      objectsMapRef.current.set(fabricObject.uuid, serialized);
    } catch (error) {
      console.error("Error adding object to Yjs:", error);
    }
  };

  // Update object in Yjs
  const updateObjectInYjs = (fabricObject) => {
    if (!objectsMapRef.current || isUpdatingFromYjs) return;

    try {
      // Add edit metadata to fabric object
      fabricObject.lastEditedBy = user?.username || "Unknown";
      fabricObject.lastEditedAt = new Date().toISOString();

      const serialized = serializeFabricObject(fabricObject);
      // Ensure metadata is in serialized form
      serialized.lastEditedBy = fabricObject.lastEditedBy;
      serialized.lastEditedAt = fabricObject.lastEditedAt;
      objectsMapRef.current.set(fabricObject.uuid, serialized);
    } catch (error) {
      console.error("Error updating object in Yjs:", error);
    }
  };

  // Remove object from Yjs
  const removeObjectFromYjs = (uuid) => {
    if (!objectsMapRef.current || isUpdatingFromYjs) return;

    try {
      objectsMapRef.current.delete(uuid);
    } catch (error) {
      console.error("Error removing object from Yjs:", error);
    }
  };

  // Get current canvas state for AI commands
  const getCanvasState = () => {
    if (!objectsMapRef.current) return [];

    const state = [];
    for (const [uuid, objectData] of objectsMapRef.current.entries()) {
      state.push({
        id: uuid,
        ...objectData,
      });
    }
    return state;
  };

  // Apply AI command results to Yjs
  const applyAICommand = async (aiResult) => {
    if (!objectsMapRef.current) return;

    try {
      const {
        action,
        pattern,
        targetObjects,
        arrangement,
        objects,
        modifications,
        deletions,
      } = aiResult;

      // Handle pattern-based creation
      if (action === "create_pattern" && pattern) {
        console.log(
          `Executing pattern: ${pattern.count} ${pattern.shape}s with ${pattern.distribution} distribution`
        );

        // Generate objects from pattern
        const generatedObjects = executePattern(pattern);
        console.log(
          `Generated ${generatedObjects.length} objects from pattern`
        );

        // Add all generated objects to Yjs
        for (const objData of generatedObjects) {
          const fabricFormat = {
            ...objData,
            left: objData.x,
            top: objData.y,
          };
          delete fabricFormat.x;
          delete fabricFormat.y;

          objectsMapRef.current.set(objData.id, fabricFormat);
        }

        return; // Pattern handled, exit early
      }

      // Handle arrangement actions
      if (action === "arrange" && arrangement) {
        console.log(`Executing arrangement: ${arrangement.type}`);

        // Get all current objects from Yjs
        const allObjects = [];
        for (const [uuid, objectData] of objectsMapRef.current.entries()) {
          allObjects.push({ id: uuid, ...objectData });
        }

        // Filter objects based on target criteria
        const targetedObjects = filterObjects(
          allObjects,
          targetObjects || "all"
        );
        console.log(`Arranging ${targetedObjects.length} objects`);

        // Execute arrangement and get modifications
        const arrangementMods = executeArrangement(
          targetedObjects,
          arrangement
        );

        // Apply modifications to Yjs
        for (const [uuid, updates] of Object.entries(arrangementMods)) {
          const existing = objectsMapRef.current.get(uuid);
          if (existing) {
            const updated = { ...existing, ...updates };
            objectsMapRef.current.set(uuid, updated);
          }
        }

        return; // Arrangement handled, exit early
      }

      // Handle traditional new objects
      if (objects && objects.length > 0) {
        for (const objData of objects) {
          // Transform AI format to Fabric.js format
          const fabricFormat = {
            ...objData,
            left: objData.x, // AI uses 'x', Fabric uses 'left'
            top: objData.y, // AI uses 'y', Fabric uses 'top'
          };

          // Remove the AI properties that Fabric doesn't need
          delete fabricFormat.x;
          delete fabricFormat.y;

          objectsMapRef.current.set(objData.id, fabricFormat);
        }
      }

      // Handle modifications
      if (modifications) {
        for (const [uuid, updates] of Object.entries(modifications)) {
          const existing = objectsMapRef.current.get(uuid);
          if (existing) {
            // Transform AI format to Fabric.js format for modifications
            const fabricUpdates = { ...updates };

            // Transform position properties
            if (fabricUpdates.x !== undefined) {
              fabricUpdates.left = fabricUpdates.x;
              delete fabricUpdates.x;
            }
            if (fabricUpdates.y !== undefined) {
              fabricUpdates.top = fabricUpdates.y;
              delete fabricUpdates.y;
            }

            // All other properties (angle, scaleX, scaleY, width, height, radius, fill, etc.)
            // are passed through directly - Fabric.js will handle them

            const updated = { ...existing, ...fabricUpdates };
            objectsMapRef.current.set(uuid, updated);
          }
        }
      }

      // Handle deletions
      if (deletions && deletions.length > 0) {
        deletions.forEach((uuid) => {
          objectsMapRef.current.delete(uuid);
        });
      }
    } catch (error) {
      console.error("Error applying AI command:", error);
    }
  };

  // Undo function
  const undo = () => {
    if (undoManagerRef.current && undoManagerRef.current.canUndo()) {
      undoManagerRef.current.undo();
    }
  };

  // Redo function
  const redo = () => {
    if (undoManagerRef.current && undoManagerRef.current.canRedo()) {
      undoManagerRef.current.redo();
    }
  };

  return {
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
  };
};
