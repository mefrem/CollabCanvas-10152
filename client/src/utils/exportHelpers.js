/**
 * Export utilities for canvas and objects
 */

/**
 * Export canvas or selection as PNG
 * @param {fabric.Canvas} canvas - The Fabric.js canvas instance
 * @param {string} fileName - Name for the exported file
 * @param {Object} options - Export options
 * @param {number} options.quality - Quality (1-3 for 1x, 2x, 3x resolution)
 * @param {boolean} options.selectionOnly - Export only selected objects
 */
export const exportAsPNG = (canvas, fileName = "canvas", options = {}) => {
  const { quality = 1, selectionOnly = false } = options;

  try {
    let dataURL;

    if (selectionOnly) {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length === 0) {
        throw new Error("No objects selected");
      }

      // Calculate bounding box of selection
      const group = new fabric.ActiveSelection(activeObjects, { canvas });
      const bounds = group.getBoundingRect();

      // Export just the selection area
      dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: quality,
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      });
    } else {
      // Export entire canvas
      dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: quality,
      });
    }

    // Trigger download
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Error exporting PNG:", error);
    throw error;
  }
};

/**
 * Export canvas or selection as SVG
 * @param {fabric.Canvas} canvas - The Fabric.js canvas instance
 * @param {string} fileName - Name for the exported file
 * @param {boolean} selectionOnly - Export only selected objects
 */
export const exportAsSVG = (
  canvas,
  fileName = "canvas",
  selectionOnly = false
) => {
  try {
    let svgData;

    if (selectionOnly) {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length === 0) {
        throw new Error("No objects selected");
      }

      // Create a temporary group for export
      const group = new fabric.Group(
        activeObjects.map((obj) => fabric.util.object.clone(obj))
      );
      svgData = group.toSVG();
    } else {
      // Export entire canvas
      svgData = canvas.toSVG();
    }

    // Create blob and trigger download
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error exporting SVG:", error);
    throw error;
  }
};

/**
 * Export canvas as JSON (for backup/restore)
 * @param {fabric.Canvas} canvas - The Fabric.js canvas instance
 * @param {string} fileName - Name for the exported file
 */
export const exportAsJSON = (canvas, fileName = "canvas") => {
  try {
    const json = JSON.stringify(
      canvas.toJSON(["uuid", "name", "styleId", "styleName"]),
      null,
      2
    );
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error exporting JSON:", error);
    throw error;
  }
};
