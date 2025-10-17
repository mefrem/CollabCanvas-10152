import { fabric } from "fabric";

/**
 * Render a frame on the canvas
 * @param {fabric.Canvas} canvas - The Fabric.js canvas instance
 * @param {Object} frame - Frame data
 * @param {boolean} isActive - Whether this frame is currently active
 */
export const renderFrame = (
  canvas,
  frame,
  isActive = false,
  onFrameMove = null
) => {
  // Remove existing frame and labels if they exist
  const existingObjects = canvas
    .getObjects()
    .filter((obj) => obj.frameId === frame.id);
  existingObjects.forEach((obj) => canvas.remove(obj));

  // Create frame background
  const frameRect = new fabric.Rect({
    left: frame.x,
    top: frame.y,
    width: frame.width,
    height: frame.height,
    fill: frame.backgroundColor || "#ffffff",
    stroke: isActive ? "#3b82f6" : "#d1d5db",
    strokeWidth: isActive ? 3 : 1,
    selectable: true, // Make selectable
    hasControls: false, // No resize handles
    hasBorders: true, // Show selection border
    lockRotation: true, // Can't rotate
    lockScalingX: true, // Can't resize
    lockScalingY: true, // Can't resize
    frameId: frame.id,
    isFrame: true,
    shadow: {
      color: "rgba(0, 0, 0, 0.1)",
      blur: 10,
      offsetX: 0,
      offsetY: 2,
    },
  });

  // Add frame label (moves with frame)
  const frameLabel = new fabric.Text(frame.name, {
    left: frame.x,
    top: frame.y - 25,
    fontSize: 12,
    fontWeight: "600",
    fill: isActive ? "#3b82f6" : "#6b7280",
    selectable: false,
    evented: false,
    frameId: frame.id,
    isFrameLabel: true,
    parentFrameId: frame.id,
  });

  // Add dimension label (moves with frame)
  const dimensionLabel = new fabric.Text(`${frame.width} × ${frame.height}`, {
    left: frame.x,
    top: frame.y + frame.height + 5,
    fontSize: 10,
    fill: "#9ca3af",
    selectable: false,
    evented: false,
    frameId: frame.id,
    isFrameLabel: true,
    parentFrameId: frame.id,
  });

  // Handle frame movement - update labels too
  frameRect.on("moving", function () {
    frameLabel.set({
      left: this.left,
      top: this.top - 25,
    });
    dimensionLabel.set({
      left: this.left,
      top: this.top + this.height + 5,
    });
  });

  // Handle frame moved - call callback and update labels
  frameRect.on("modified", function () {
    // Update labels position
    frameLabel.set({
      left: this.left,
      top: this.top - 25,
    });
    dimensionLabel.set({
      left: this.left,
      top: this.top + this.height + 5,
    });
    canvas.renderAll();

    if (onFrameMove) {
      onFrameMove(frame.id, {
        x: this.left,
        y: this.top,
      });
    }
  });

  canvas.add(frameRect, frameLabel, dimensionLabel);
  canvas.sendToBack(frameRect);
  canvas.sendToBack(frameLabel);
  canvas.sendToBack(dimensionLabel);
  canvas.renderAll();

  return { frameRect, frameLabel, dimensionLabel };
};

/**
 * Render all frames on the canvas
 */
export const renderAllFrames = (
  canvas,
  frames,
  activeFrameId,
  onFrameMove = null
) => {
  // Remove all existing frames
  const framesToRemove = canvas
    .getObjects()
    .filter((obj) => obj.isFrame || obj.isFrameLabel);
  framesToRemove.forEach((frame) => canvas.remove(frame));

  // Render each frame
  frames.forEach((frame) => {
    renderFrame(canvas, frame, frame.id === activeFrameId, onFrameMove);
  });
};

/**
 * Check if a point is inside a frame
 */
export const isPointInFrame = (point, frame) => {
  return (
    point.x >= frame.x &&
    point.x <= frame.x + frame.width &&
    point.y >= frame.y &&
    point.y <= frame.y + frame.height
  );
};

/**
 * Get all objects within a frame
 */
export const getObjectsInFrame = (canvas, frame) => {
  return canvas.getObjects().filter((obj) => {
    if (obj.isFrame || obj.isFrameLabel) return false;

    const objCenter = {
      x: obj.left + (obj.width * obj.scaleX) / 2,
      y: obj.top + (obj.height * obj.scaleY) / 2,
    };

    return isPointInFrame(objCenter, frame);
  });
};

/**
 * Fit frame to viewport
 * Returns the zoom level that was set
 */
export const fitFrameToViewport = (canvas, frame) => {
  const vpt = canvas.viewportTransform;
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  // Calculate zoom to fit frame with padding
  const padding = 100;
  const zoomX = (canvasWidth - padding * 2) / frame.width;
  const zoomY = (canvasHeight - padding * 2) / frame.height;
  const zoom = Math.min(zoomX, zoomY, 2); // Cap at 2x zoom

  // Calculate center position
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const frameCenterX = frame.x + frame.width / 2;
  const frameCenterY = frame.y + frame.height / 2;

  // Set zoom and pan
  canvas.setZoom(zoom);
  vpt[4] = centerX - frameCenterX * zoom;
  vpt[5] = centerY - frameCenterY * zoom;
  canvas.setViewportTransform(vpt);
  canvas.renderAll();

  return zoom; // Return zoom level for state update
};
