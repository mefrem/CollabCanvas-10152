import { v4 as uuidv4 } from "uuid";

// Generate colors based on color scheme
const generateColor = (scheme, index, total) => {
  if (scheme.startsWith("#")) {
    return scheme; // Specific color
  }

  switch (scheme) {
    case "rainbow":
      const hue = (index / total) * 360;
      return `hsl(${hue}, 70%, 60%)`;

    case "gradient":
      const start = [59, 130, 246]; // Blue
      const end = [239, 68, 68]; // Red
      const ratio = index / total;
      const r = Math.round(start[0] + (end[0] - start[0]) * ratio);
      const g = Math.round(start[1] + (end[1] - start[1]) * ratio);
      const b = Math.round(start[2] + (end[2] - start[2]) * ratio);
      return `rgb(${r}, ${g}, ${b})`;

    case "random":
      const randomHue = Math.floor(Math.random() * 360);
      return `hsl(${randomHue}, 70%, 60%)`;

    case "monochrome":
      const lightness = 30 + (index / total) * 40;
      return `hsl(220, 20%, ${lightness}%)`;

    default:
      return "#3B82F6"; // Default blue
  }
};

// Generate position based on distribution
const generatePosition = (distribution, index, total, area, objectSize) => {
  const canvasArea = area || { x: 0, y: 0, width: 800, height: 600 };
  const padding = objectSize * 2;

  switch (distribution) {
    case "grid": {
      const cols = Math.ceil(Math.sqrt(total));
      const rows = Math.ceil(total / cols);
      const cellWidth = (canvasArea.width - padding * 2) / cols;
      const cellHeight = (canvasArea.height - padding * 2) / rows;
      const col = index % cols;
      const row = Math.floor(index / cols);

      return {
        x: canvasArea.x + padding + col * cellWidth + cellWidth / 2,
        y: canvasArea.y + padding + row * cellHeight + cellHeight / 2,
      };
    }

    case "circle": {
      const angle = (index / total) * Math.PI * 2;
      const radius = Math.min(canvasArea.width, canvasArea.height) / 3;
      const centerX = canvasArea.x + canvasArea.width / 2;
      const centerY = canvasArea.y + canvasArea.height / 2;

      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    }

    case "line": {
      const isHorizontal = canvasArea.width > canvasArea.height;
      if (isHorizontal) {
        const spacing = (canvasArea.width - padding * 2) / (total - 1 || 1);
        return {
          x: canvasArea.x + padding + index * spacing,
          y: canvasArea.y + canvasArea.height / 2,
        };
      } else {
        const spacing = (canvasArea.height - padding * 2) / (total - 1 || 1);
        return {
          x: canvasArea.x + canvasArea.width / 2,
          y: canvasArea.y + padding + index * spacing,
        };
      }
    }

    case "scatter":
    case "random":
    default: {
      // Random with minimum distance to avoid overlap
      const minDistance = objectSize * 2.5;
      let x,
        y,
        attempts = 0;
      const maxAttempts = 50;

      do {
        x =
          canvasArea.x +
          padding +
          Math.random() * (canvasArea.width - padding * 2);
        y =
          canvasArea.y +
          padding +
          Math.random() * (canvasArea.height - padding * 2);
        attempts++;
      } while (attempts < maxAttempts);

      return { x, y };
    }
  }
};

// Execute a pattern and generate objects
export const executePattern = (pattern) => {
  const {
    shape,
    count,
    distribution,
    colorScheme,
    radiusRange = [30, 50],
    sizeRange = [60, 120],
    area,
  } = pattern;

  const objects = [];
  const validShapes = ["circle", "rect", "triangle"];

  for (let i = 0; i < count; i++) {
    // Handle random shape selection
    let actualShape = shape;
    if (shape === "random" || !validShapes.includes(shape)) {
      actualShape = validShapes[Math.floor(Math.random() * validShapes.length)];
    }

    const size =
      actualShape === "circle"
        ? radiusRange[0] + Math.random() * (radiusRange[1] - radiusRange[0])
        : sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);

    const position = generatePosition(distribution, i, count, area, size);
    const color = generateColor(colorScheme, i, count);

    const baseObject = {
      id: uuidv4(),
      type: actualShape,
      x: position.x,
      y: position.y,
      fill: color,
      stroke: "#000000",
      strokeWidth: 1,
    };

    if (actualShape === "circle") {
      baseObject.radius = size;
    } else if (actualShape === "rect") {
      baseObject.width = size;
      baseObject.height = size * 0.75; // Slightly rectangular
    } else if (actualShape === "triangle") {
      baseObject.width = size;
      baseObject.height = size;
    }

    objects.push(baseObject);
  }

  return objects;
};
