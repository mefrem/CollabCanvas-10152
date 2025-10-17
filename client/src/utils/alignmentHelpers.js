/**
 * Alignment and distribution helper functions for Fabric.js objects
 */

// Get accurate bounding box using Fabric's built-in method
const getBounds = (obj) => {
  const rect = obj.getBoundingRect(true); // true = absolute coordinates
  return {
    left: rect.left,
    top: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
  };
};

/**
 * Align objects to the left edge
 */
export const alignLeft = (objects) => {
  if (!objects || objects.length === 0) return;

  // Find leftmost edge
  let leftmost = Infinity;
  objects.forEach((obj) => {
    const bounds = getBounds(obj);
    if (bounds.left < leftmost) {
      leftmost = bounds.left;
    }
  });

  // Align all objects to that edge
  objects.forEach((obj) => {
    const bounds = getBounds(obj);
    const deltaX = leftmost - bounds.left;
    obj.set({ left: obj.left + deltaX });
    obj.setCoords();
  });
};

/**
 * Align objects to horizontal center
 */
export const alignCenter = (objects) => {
  if (!objects || objects.length === 0) return;

  // Find center of all objects
  let leftmost = Infinity;
  let rightmost = -Infinity;

  objects.forEach((obj) => {
    const bounds = getBounds(obj);
    if (bounds.left < leftmost) leftmost = bounds.left;
    if (bounds.right > rightmost) rightmost = bounds.right;
  });

  const groupCenterX = (leftmost + rightmost) / 2;

  // Align all objects to that center
  objects.forEach((obj) => {
    const bounds = getBounds(obj);
    const deltaX = groupCenterX - bounds.centerX;
    obj.set({ left: obj.left + deltaX });
    obj.setCoords();
  });
};

/**
 * Align objects to the right edge
 */
export const alignRight = (objects) => {
  if (!objects || objects.length === 0) return;

  // Find rightmost edge
  let rightmost = -Infinity;
  objects.forEach((obj) => {
    const bounds = getBounds(obj);
    if (bounds.right > rightmost) {
      rightmost = bounds.right;
    }
  });

  // Align all objects to that edge
  objects.forEach((obj) => {
    const bounds = getBounds(obj);
    const deltaX = rightmost - bounds.right;
    obj.set({ left: obj.left + deltaX });
    obj.setCoords();
  });
};

/**
 * Align objects to the top edge
 */
export const alignTop = (objects) => {
  if (!objects || objects.length === 0) return;

  // Find topmost edge
  let topmost = Infinity;
  objects.forEach((obj) => {
    const bounds = getBounds(obj);
    if (bounds.top < topmost) {
      topmost = bounds.top;
    }
  });

  // Align all objects to that edge
  objects.forEach((obj) => {
    const bounds = getBounds(obj);
    const deltaY = topmost - bounds.top;
    obj.set({ top: obj.top + deltaY });
    obj.setCoords();
  });
};

/**
 * Align objects to vertical middle
 */
export const alignMiddle = (objects) => {
  if (!objects || objects.length === 0) return;

  // Find middle of all objects
  let topmost = Infinity;
  let bottommost = -Infinity;

  objects.forEach((obj) => {
    const bounds = getBounds(obj);
    if (bounds.top < topmost) topmost = bounds.top;
    if (bounds.bottom > bottommost) bottommost = bounds.bottom;
  });

  const groupCenterY = (topmost + bottommost) / 2;

  // Align all objects to that middle
  objects.forEach((obj) => {
    const bounds = getBounds(obj);
    const deltaY = groupCenterY - bounds.centerY;
    obj.set({ top: obj.top + deltaY });
    obj.setCoords();
  });
};

/**
 * Align objects to the bottom edge
 */
export const alignBottom = (objects) => {
  if (!objects || objects.length === 0) return;

  // Find bottommost edge
  let bottommost = -Infinity;
  objects.forEach((obj) => {
    const bounds = getBounds(obj);
    if (bounds.bottom > bottommost) {
      bottommost = bounds.bottom;
    }
  });

  // Align all objects to that edge
  objects.forEach((obj) => {
    const bounds = getBounds(obj);
    const deltaY = bottommost - bounds.bottom;
    obj.set({ top: obj.top + deltaY });
    obj.setCoords();
  });
};

/**
 * Distribute objects horizontally with even spacing
 */
export const distributeHorizontally = (objects) => {
  if (!objects || objects.length < 2) return;

  // Sort objects by left position
  const sorted = [...objects].sort((a, b) => {
    const boundsA = getBounds(a);
    const boundsB = getBounds(b);
    return boundsA.left - boundsB.left;
  });

  // Get leftmost and rightmost positions
  const leftBounds = getBounds(sorted[0]);
  const rightBounds = getBounds(sorted[sorted.length - 1]);
  const totalWidth = rightBounds.right - leftBounds.left;

  // Calculate total width of all objects
  let objectsWidth = 0;
  sorted.forEach((obj) => {
    const bounds = getBounds(obj);
    objectsWidth += bounds.width;
  });

  // Calculate spacing
  const spacing = (totalWidth - objectsWidth) / (sorted.length - 1);

  // Position objects
  let currentX = leftBounds.left;
  sorted.forEach((obj, index) => {
    if (index === 0 || index === sorted.length - 1) {
      // Keep first and last objects in place
      const bounds = getBounds(obj);
      currentX = bounds.right + spacing;
      return;
    }

    const bounds = getBounds(obj);
    const offset = bounds.left - obj.left;
    obj.set({ left: currentX - offset });
    obj.setCoords();

    currentX += bounds.width + spacing;
  });
};

/**
 * Distribute objects vertically with even spacing
 */
export const distributeVertically = (objects) => {
  if (!objects || objects.length < 2) return;

  // Sort objects by top position
  const sorted = [...objects].sort((a, b) => {
    const boundsA = getBounds(a);
    const boundsB = getBounds(b);
    return boundsA.top - boundsB.top;
  });

  // Get topmost and bottommost positions
  const topBounds = getBounds(sorted[0]);
  const bottomBounds = getBounds(sorted[sorted.length - 1]);
  const totalHeight = bottomBounds.bottom - topBounds.top;

  // Calculate total height of all objects
  let objectsHeight = 0;
  sorted.forEach((obj) => {
    const bounds = getBounds(obj);
    objectsHeight += bounds.height;
  });

  // Calculate spacing
  const spacing = (totalHeight - objectsHeight) / (sorted.length - 1);

  // Position objects
  let currentY = topBounds.top;
  sorted.forEach((obj, index) => {
    if (index === 0 || index === sorted.length - 1) {
      // Keep first and last objects in place
      const bounds = getBounds(obj);
      currentY = bounds.bottom + spacing;
      return;
    }

    const bounds = getBounds(obj);
    const offset = bounds.top - obj.top;
    obj.set({ top: currentY - offset });
    obj.setCoords();

    currentY += bounds.height + spacing;
  });
};

/**
 * Align objects to canvas center
 */
export const alignToCanvasCenter = (objects, canvas) => {
  if (!objects || objects.length === 0 || !canvas) return;

  const canvasCenterX = canvas.width / 2;
  const canvasCenterY = canvas.height / 2;

  // Calculate bounding box of all objects
  let leftmost = Infinity;
  let rightmost = -Infinity;
  let topmost = Infinity;
  let bottommost = -Infinity;

  objects.forEach((obj) => {
    const bounds = getBounds(obj);
    if (bounds.left < leftmost) leftmost = bounds.left;
    if (bounds.right > rightmost) rightmost = bounds.right;
    if (bounds.top < topmost) topmost = bounds.top;
    if (bounds.bottom > bottommost) bottommost = bounds.bottom;
  });

  const groupCenterX = (leftmost + rightmost) / 2;
  const groupCenterY = (topmost + bottommost) / 2;

  const offsetX = canvasCenterX - groupCenterX;
  const offsetY = canvasCenterY - groupCenterY;

  // Move all objects
  objects.forEach((obj) => {
    obj.set({
      left: obj.left + offsetX,
      top: obj.top + offsetY,
    });
    obj.setCoords();
  });
};
