import express from "express";
import Canvas from "../models/Canvas.js";
import { requireAuth } from "../middleware/auth.js";
import * as Y from "yjs";

const router = express.Router();

// Get canvas by ID
router.get("/:canvasId", requireAuth, async (req, res) => {
  try {
    console.log(
      `📍 Canvas route hit: ${req.params.canvasId}, User: ${req.user?.username}`
    );
    const { canvasId } = req.params;

    console.log("🔍 Attempting to find canvas in database...");
    const canvas = await Canvas.findOne({ canvasId });

    if (!canvas) {
      console.log("🆕 Canvas not found, creating new one...");
      // Create new canvas if it doesn't exist
      const ydoc = new Y.Doc();
      const objectsMap = ydoc.getMap("objects");

      console.log("📝 Creating new canvas document...");
      const newCanvas = new Canvas({
        canvasId,
        name: `Canvas ${canvasId}`,
        yjsState: Y.encodeStateAsUpdate(ydoc),
        createdBy: req.user._id,
        collaborators: [req.user._id],
      });

      console.log("💾 Saving canvas to database...");
      await newCanvas.save();
      console.log("✅ Canvas saved successfully");

      return res.json({
        canvasId,
        name: newCanvas.name,
        yjsState: Array.from(newCanvas.yjsState), // Convert Buffer to array for JSON
      });
    }

    console.log("✅ Found existing canvas, returning data");
    res.json({
      canvasId: canvas.canvasId,
      name: canvas.name,
      yjsState: Array.from(canvas.yjsState), // Convert Buffer to array for JSON
    });
  } catch (error) {
    console.error("Canvas fetch error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to fetch canvas",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Save canvas state
router.post("/:canvasId/save", requireAuth, async (req, res) => {
  try {
    const { canvasId } = req.params;
    const { yjsState } = req.body;

    if (!yjsState) {
      return res.status(400).json({ message: "Yjs state is required" });
    }

    // Convert array back to Buffer
    const stateBuffer = Buffer.from(yjsState);

    const canvas = await Canvas.findOneAndUpdate(
      { canvasId },
      {
        yjsState: stateBuffer,
        lastModified: new Date(),
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Canvas saved successfully" });
  } catch (error) {
    console.error("Canvas save error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to save canvas",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
