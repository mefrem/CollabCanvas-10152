import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

// Generate random colors for new objects
export const getRandomColor = () => {
  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#F97316",
    "#EC4899",
    "#6B7280",
    "#14B8A6",
    "#F43F5E",
    "#8E4EC6",
    "#F97500",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Create fabric rectangle
export const createRectangle = (x = 100, y = 100) => {
  const rect = new fabric.Rect({
    left: x,
    top: y,
    width: 100,
    height: 100,
    fill: getRandomColor(),
    stroke: "#000",
    strokeWidth: 1,
    selectable: true,
    evented: true,
  });

  rect.uuid = uuidv4();
  return rect;
};

// Create fabric circle
export const createCircle = (x = 100, y = 100) => {
  const circle = new fabric.Circle({
    left: x,
    top: y,
    radius: 50,
    fill: getRandomColor(),
    stroke: "#000",
    strokeWidth: 1,
    selectable: true,
    evented: true,
  });

  circle.uuid = uuidv4();
  return circle;
};

// Create fabric triangle
export const createTriangle = (x = 100, y = 100) => {
  const triangle = new fabric.Triangle({
    left: x,
    top: y,
    width: 100,
    height: 100,
    fill: getRandomColor(),
    stroke: "#000",
    strokeWidth: 1,
    selectable: true,
    evented: true,
  });

  triangle.uuid = uuidv4();
  return triangle;
};

// Create fabric text
export const createText = (x = 100, y = 100, text = "Double click to edit") => {
  const textObj = new fabric.IText(text, {
    left: x,
    top: y,
    fontSize: 16,
    fill: "#000",
    fontFamily: "Arial",
    selectable: true,
    evented: true,
    editable: true,
  });

  textObj.uuid = uuidv4();
  return textObj;
};

// Serialize fabric object for Yjs
export const serializeFabricObject = (obj) => {
  try {
    const json = obj.toJSON(["uuid"]);
    const serialized = {
      ...json,
      uuid: obj.uuid,
    };
    return serialized;
  } catch (error) {
    console.error("Error serializing object:", error);
    throw error;
  }
};

// Deserialize fabric object from Yjs
export const deserializeFabricObject = (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure we have valid data
      if (!data || !data.type) {
        throw new Error("Invalid object data: missing type");
      }

      fabric.util.enlivenObjects([data], (objects) => {
        try {
          if (!objects || objects.length === 0) {
            throw new Error("Failed to enliven objects - no objects returned");
          }

          const obj = objects[0];
          if (!obj) {
            throw new Error("Failed to enliven objects - object is null");
          }

          obj.uuid = data.uuid;
          resolve(obj);
        } catch (error) {
          console.error("Error in enlivenObjects callback:", error);
          reject(error);
        }
      });
    } catch (error) {
      console.error("Error in deserializeFabricObject:", error);
      reject(error);
    }
  });
};

// Get canvas center point for positioning
export const getCanvasCenter = (canvas) => {
  return {
    x: canvas.width / 2,
    y: canvas.height / 2,
  };
};

// Duplicate selected object
export const duplicateObject = (obj) => {
  const clonedObj = fabric.util.object.clone(obj);
  clonedObj.uuid = uuidv4();
  clonedObj.left += 20;
  clonedObj.top += 20;
  return clonedObj;
};

// Set up canvas event handlers
export const setupCanvasEvents = (canvas, callbacks) => {
  const {
    onObjectAdded,
    onObjectModified,
    onObjectRemoved,
    onSelectionCreated,
    onSelectionUpdated,
    onSelectionCleared,
  } = callbacks;

  if (onObjectAdded) {
    canvas.on("object:added", onObjectAdded);
  }

  if (onObjectModified) {
    canvas.on("object:modified", onObjectModified);
    canvas.on("object:moved", onObjectModified);
    canvas.on("object:scaled", onObjectModified);
    canvas.on("object:rotated", onObjectModified);
  }

  if (onObjectRemoved) {
    canvas.on("object:removed", onObjectRemoved);
  }

  if (onSelectionCreated) {
    canvas.on("selection:created", onSelectionCreated);
  }

  if (onSelectionUpdated) {
    canvas.on("selection:updated", onSelectionUpdated);
  }

  if (onSelectionCleared) {
    canvas.on("selection:cleared", onSelectionCleared);
  }
};

// Clean up canvas events
export const cleanupCanvasEvents = (canvas) => {
  canvas.off("object:added");
  canvas.off("object:modified");
  canvas.off("object:moved");
  canvas.off("object:scaled");
  canvas.off("object:rotated");
  canvas.off("object:removed");
  canvas.off("selection:created");
  canvas.off("selection:updated");
  canvas.off("selection:cleared");
};

// Z-Index Management Functions

/**
 * Bring object to front (top of z-index)
 */
export const bringToFront = (object, canvas) => {
  if (!object || !canvas) return;
  canvas.bringToFront(object);
  canvas.renderAll();
};

/**
 * Send object to back (bottom of z-index)
 */
export const sendToBack = (object, canvas) => {
  if (!object || !canvas) return;
  canvas.sendToBack(object);
  canvas.renderAll();
};

/**
 * Bring object forward one level
 */
export const bringForward = (object, canvas) => {
  if (!object || !canvas) return;
  canvas.bringForward(object);
  canvas.renderAll();
};

/**
 * Send object backward one level
 */
export const sendBackward = (object, canvas) => {
  if (!object || !canvas) return;
  canvas.sendBackward(object);
  canvas.renderAll();
};

/**
 * Move object to specific z-index
 */
export const moveToIndex = (object, index, canvas) => {
  if (!object || !canvas) return;
  canvas.moveTo(object, index);
  canvas.renderAll();
};
