// Arrangement and layout algorithms for canvas objects

// Calculate bounding box of objects
const getBoundingBox = (objects) => {
  if (objects.length === 0) return { x: 0, y: 0, width: 800, height: 600 };

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  objects.forEach((obj) => {
    const objLeft = obj.left || obj.x || 0;
    const objTop = obj.top || obj.y || 0;
    const objWidth = obj.width || obj.radius * 2 || 50;
    const objHeight = obj.height || obj.radius * 2 || 50;

    minX = Math.min(minX, objLeft);
    minY = Math.min(minY, objTop);
    maxX = Math.max(maxX, objLeft + objWidth);
    maxY = Math.max(maxY, objTop + objHeight);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// Arrange objects in a horizontal row
export const arrangeInRow = (
  objects,
  spacing = "even",
  align = "center",
  startX = 100,
  startY = 300
) => {
  if (objects.length === 0) return [];

  const modifications = {};
  let currentX = startX;

  // Calculate total width to determine spacing
  const totalWidth = objects.reduce((sum, obj) => {
    return sum + (obj.width || obj.radius * 2 || 50);
  }, 0);

  let gap;
  if (spacing === "even") {
    const availableWidth = 800 - startX * 2;
    gap = (availableWidth - totalWidth) / (objects.length + 1);
  } else {
    gap = spacing || 20;
  }

  objects.forEach((obj) => {
    const objWidth = obj.width || obj.radius * 2 || 50;
    const objHeight = obj.height || obj.radius * 2 || 50;

    let yPos = startY;
    if (align === "start") {
      yPos = startY;
    } else if (align === "center") {
      yPos = startY;
    } else if (align === "end") {
      yPos = startY;
    }

    modifications[obj.id] = {
      left: currentX + gap,
      top: yPos,
    };

    currentX += objWidth + gap;
  });

  return modifications;
};

// Arrange objects in a vertical column
export const arrangeInColumn = (
  objects,
  spacing = "even",
  align = "center",
  startX = 400,
  startY = 100
) => {
  if (objects.length === 0) return [];

  const modifications = {};
  let currentY = startY;

  // Calculate total height to determine spacing
  const totalHeight = objects.reduce((sum, obj) => {
    return sum + (obj.height || obj.radius * 2 || 50);
  }, 0);

  let gap;
  if (spacing === "even") {
    const availableHeight = 600 - startY * 2;
    gap = (availableHeight - totalHeight) / (objects.length + 1);
  } else {
    gap = spacing || 20;
  }

  objects.forEach((obj) => {
    const objWidth = obj.width || obj.radius * 2 || 50;
    const objHeight = obj.height || obj.radius * 2 || 50;

    let xPos = startX;
    if (align === "start") {
      xPos = startX;
    } else if (align === "center") {
      xPos = startX;
    } else if (align === "end") {
      xPos = startX;
    }

    modifications[obj.id] = {
      left: xPos,
      top: currentY + gap,
    };

    currentY += objHeight + gap;
  });

  return modifications;
};

// Arrange objects in a grid
export const arrangeInGrid = (
  objects,
  spacing = 20,
  startX = 100,
  startY = 100
) => {
  if (objects.length === 0) return [];

  const modifications = {};

  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(objects.length));
  const rows = Math.ceil(objects.length / cols);

  // Estimate cell size based on average object size
  const avgWidth =
    objects.reduce((sum, obj) => sum + (obj.width || obj.radius * 2 || 80), 0) /
    objects.length;
  const avgHeight =
    objects.reduce(
      (sum, obj) => sum + (obj.height || obj.radius * 2 || 80),
      0
    ) / objects.length;

  const cellWidth = avgWidth + spacing;
  const cellHeight = avgHeight + spacing;

  objects.forEach((obj, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    modifications[obj.id] = {
      left: startX + col * cellWidth,
      top: startY + row * cellHeight,
    };
  });

  return modifications;
};

// Distribute objects evenly horizontally
export const distributeHorizontal = (objects) => {
  if (objects.length <= 1) return {};

  const modifications = {};

  // Find leftmost and rightmost objects
  const sorted = [...objects].sort(
    (a, b) => (a.left || a.x || 0) - (b.left || b.x || 0)
  );
  const firstObj = sorted[0];
  const lastObj = sorted[sorted.length - 1];

  const startX = firstObj.left || firstObj.x || 0;
  const endX = lastObj.left || lastObj.x || 0;
  const span = endX - startX;
  const spacing = span / (objects.length - 1);

  sorted.forEach((obj, index) => {
    if (index > 0 && index < objects.length - 1) {
      modifications[obj.id] = {
        left: startX + index * spacing,
        top: obj.top || obj.y || 0, // Keep same Y position
      };
    }
  });

  return modifications;
};

// Distribute objects evenly vertically
export const distributeVertical = (objects) => {
  if (objects.length <= 1) return {};

  const modifications = {};

  // Find topmost and bottommost objects
  const sorted = [...objects].sort(
    (a, b) => (a.top || a.y || 0) - (b.top || b.y || 0)
  );
  const firstObj = sorted[0];
  const lastObj = sorted[sorted.length - 1];

  const startY = firstObj.top || firstObj.y || 0;
  const endY = lastObj.top || lastObj.y || 0;
  const span = endY - startY;
  const spacing = span / (objects.length - 1);

  sorted.forEach((obj, index) => {
    if (index > 0 && index < objects.length - 1) {
      modifications[obj.id] = {
        left: obj.left || obj.x || 0, // Keep same X position
        top: startY + index * spacing,
      };
    }
  });

  return modifications;
};

// Arrange objects in a circle
export const arrangeInCircle = (
  objects,
  centerX = 400,
  centerY = 300,
  radius = 150
) => {
  if (objects.length === 0) return {};

  const modifications = {};
  const angleStep = (2 * Math.PI) / objects.length;

  objects.forEach((obj, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    modifications[obj.id] = {
      left: x,
      top: y,
    };
  });

  return modifications;
};

// Main arrangement executor
export const executeArrangement = (objects, arrangement) => {
  const { type, spacing, align, position } = arrangement;
  const startX = position?.x || 100;
  const startY = position?.y || 100;

  switch (type) {
    case "row":
      return arrangeInRow(objects, spacing, align, startX, startY);

    case "column":
      return arrangeInColumn(objects, spacing, align, startX, startY);

    case "grid":
      return arrangeInGrid(
        objects,
        typeof spacing === "number" ? spacing : 20,
        startX,
        startY
      );

    case "circle":
      return arrangeInCircle(objects, startX || 400, startY || 300, 150);

    case "distribute_horizontal":
      return distributeHorizontal(objects);

    case "distribute_vertical":
      return distributeVertical(objects);

    default:
      console.warn("Unknown arrangement type:", type);
      return {};
  }
};

// Filter objects based on criteria
export const filterObjects = (allObjects, criteria) => {
  if (criteria === "all") {
    return allObjects;
  }

  if (Array.isArray(criteria)) {
    // List of UUIDs
    return allObjects.filter((obj) => criteria.includes(obj.id));
  }

  if (typeof criteria === "object") {
    // Filter by properties (e.g., {type: "circle"} or {fill: "#ff0000"})
    return allObjects.filter((obj) => {
      return Object.entries(criteria).every(([key, value]) => {
        if (key === "fill") {
          // Color matching - exact or close
          return obj[key] === value;
        }
        return obj[key] === value;
      });
    });
  }

  // Default: return all objects
  return allObjects;
};
