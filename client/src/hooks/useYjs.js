import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import {
  serializeFabricObject,
  deserializeFabricObject,
} from "../utils/fabricHelpers";
import { usePersistence } from "./usePersistence";

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
    if (!canvasId || !user || !fabricCanvas) return;

    console.log("Initializing Yjs for canvas:", canvasId);

    // Create Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Create WebSocket provider
    const provider = new WebsocketProvider(
      "ws://localhost:1234",
      canvasId,
      ydoc,
      {
        connect: true,
        awareness: {
          user: {
            id: user.id,
            username: user.username,
            color: user.color,
          },
        },
      }
    );
    providerRef.current = provider;

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
      console.log("Yjs connection status:", event.status);
      setConnectionStatus(event.status);
    });

    provider.on("connection-close", () => {
      console.log("Yjs connection closed");
      setConnectionStatus("disconnected");
    });

    provider.on("connection-error", (error) => {
      console.error("Yjs connection error:", error);
      setConnectionStatus("disconnected");
    });

    // Set up Yjs map observer
    const handleYjsChanges = (event) => {
      if (isUpdatingFromYjs) return; // Prevent infinite loops

      console.log("Yjs map changed:", event);
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
                fabricCanvas.add(newObject);
                fabricCanvas.renderAll();
                console.log("Added object from Yjs:", key);
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
                console.log("Updated object from Yjs:", key);
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
            console.log("Removed object from Yjs:", key);
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

    console.log("Loading canvas from database...");

    // First load from database into Yjs
    await loadCanvas();

    // Then render from Yjs to Fabric canvas
    await loadCanvasFromYjs();
  };

  // Load canvas state from Yjs to Fabric
  const loadCanvasFromYjs = async () => {
    if (!objectsMapRef.current || !fabricCanvas) return;

    console.log("Rendering canvas from Yjs...");
    const objectsMap = objectsMapRef.current;

    // Clear current canvas
    fabricCanvas.clear();

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
    console.log("Canvas rendered from Yjs");
  };

  // Add object to Yjs
  const addObjectToYjs = (fabricObject) => {
    if (!objectsMapRef.current || isUpdatingFromYjs) return;

    try {
      const serialized = serializeFabricObject(fabricObject);
      objectsMapRef.current.set(fabricObject.uuid, serialized);
      console.log("Added object to Yjs:", fabricObject.uuid);
    } catch (error) {
      console.error("Error adding object to Yjs:", error);
    }
  };

  // Update object in Yjs
  const updateObjectInYjs = (fabricObject) => {
    if (!objectsMapRef.current || isUpdatingFromYjs) return;

    try {
      const serialized = serializeFabricObject(fabricObject);
      objectsMapRef.current.set(fabricObject.uuid, serialized);
      console.log("Updated object in Yjs:", fabricObject.uuid);
    } catch (error) {
      console.error("Error updating object in Yjs:", error);
    }
  };

  // Remove object from Yjs
  const removeObjectFromYjs = (uuid) => {
    if (!objectsMapRef.current || isUpdatingFromYjs) return;

    try {
      objectsMapRef.current.delete(uuid);
      console.log("Removed object from Yjs:", uuid);
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
      const { objects, modifications, deletions } = aiResult;

      // Handle new objects
      if (objects && objects.length > 0) {
        for (const objData of objects) {
          objectsMapRef.current.set(objData.id, objData);
        }
      }

      // Handle modifications
      if (modifications) {
        for (const [uuid, updates] of Object.entries(modifications)) {
          const existing = objectsMapRef.current.get(uuid);
          if (existing) {
            const updated = { ...existing, ...updates };
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

      console.log("Applied AI command to Yjs");
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
