import express from "express";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Initialize OpenAI client lazily
let openai = null;

const getOpenAIClient = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

// Process AI command
router.post("/command", requireAuth, async (req, res) => {
  try {
    const { command, canvasState } = req.body;

    if (!command) {
      return res.status(400).json({ message: "Command is required" });
    }

    const client = getOpenAIClient();
    if (!client) {
      console.error(
        "OpenAI API key not found:",
        process.env.OPENAI_API_KEY
          ? "Key exists but client failed"
          : "No API key"
      );
      return res.status(503).json({
        message:
          "AI features unavailable. Please set OPENAI_API_KEY in .env file.",
      });
    }

    // Enhanced system prompt for GPT-4o's superior reasoning
    const systemPrompt = `You are a precise canvas design assistant. Follow instructions EXACTLY as given.

CRITICAL RULES:
1. ONLY create what the user explicitly asks for - nothing extra
2. If the user says "create a red circle", create ONLY a red circle
3. Do NOT add additional elements "for balance" or "for design"
4. If user says "in the middle" or "center", use coordinates (400, 300)
5. Follow the EXACT color, shape, and quantity specified
6. For modifications, ANALYZE the canvas state carefully to find the right object
7. Match objects by description: color, shape type, text content, or position

Canvas specifications:
- Dimensions: 800x600 pixels
- Center point: (400, 300) - use this for "middle", "center", "centered"
- Coordinate system: Top-left is (0, 0)

Position keywords:
- "middle", "center", "centered" → x: 400, y: 300 (adjust for object size)
- "top left" → x: 100, y: 100
- "top right" → x: 700, y: 100
- "bottom left" → x: 100, y: 500
- "bottom right" → x: 700, y: 500

For complex multi-element commands ONLY (forms, navigation bars):
- Plan the layout carefully
- Ensure consistent spacing
- Use professional design principles

Always respond with valid JSON matching the exact schema provided.`;

    const userPrompt = `Current canvas state:
${JSON.stringify(canvasState || [], null, 2)}

User command: "${command}"

IMPORTANT: Create ONLY what the user asked for. Do not add extra objects.

For large batch requests (10+ objects), use PATTERN mode for efficiency:
Instead of generating 100 individual objects, generate a pattern that will be executed client-side.

Example: "Create 100 circles" should use pattern mode:
{
  "action": "create_pattern",
  "pattern": {
    "shape": "circle",
    "count": 100,
    "distribution": "random",
    "colorScheme": "rainbow",
    "radiusRange": [30, 50]
  }
}

For single/few objects (1-9), use standard object creation:
{
  "action": "create",
  "objects": [...]
}

Respond with JSON following this exact schema:

For individual objects (1-9 items):
{
  "action": "create" | "modify" | "arrange" | "delete",
  "objects": [
    {
      "id": "uuid-v4-string",
      "type": "rect" | "circle" | "triangle" | "text",
      "x": number,
      "y": number,
      "width": number (required for rect/triangle),
      "height": number (required for rect/triangle),
      "radius": number (required for circles),
      "fill": "#hexcolor",
      "text": "content" (required for text type),
      "fontSize": number (for text, 12-24 range),
      "stroke": "#hexcolor" (optional border color),
      "strokeWidth": number (optional, 1-5),
      "angle": number (rotation in degrees, 0-360, optional),
      "scaleX": number (horizontal scale, 1.0 = 100%, optional),
      "scaleY": number (vertical scale, 1.0 = 100%, optional)
    }
  ],
  "modifications": {
    "existing-object-uuid": {
      "x": 100,
      "y": 200,
      "fill": "#ff0000",
      "angle": 45,
      "scaleX": 1.5,
      // any properties to update
    }
  },
  "deletions": ["uuid-to-delete"],
  "explanation": "Friendly description"
}

IMPORTANT for modifications:
- Analyze the current canvas state to find objects by description
- Match objects by: color (fill), type, position, or text content
- For "the blue rectangle", find object with type="rect" and fill close to blue
- For "twice as big", multiply current width/height or radius by 2
- For "rotate 45 degrees", add or update angle property

Examples of modification commands:
- "Move the red circle to the center" → Find circle with red fill, set x:400, y:300
- "Rotate the text 45 degrees" → Find text object, set angle: 45
- "Make the blue rectangle twice as big" → Find blue rect, set scaleX: 2, scaleY: 2
- "Resize the circle to radius 100" → Find circle, set radius: 100

For batch operations (10+ items):
{
  "action": "create_pattern",
  "pattern": {
    "shape": "circle" | "rect" | "triangle" | "random",
    "count": number (how many to create),
    "distribution": "random" | "grid" | "circle" | "line" | "scatter",
    "colorScheme": "rainbow" | "gradient" | "monochrome" | "random" | "#hexcolor",
    "radiusRange": [min, max] (for circles),
    "sizeRange": [min, max] (for rects/triangles - width/height),
    "area": {"x": number, "y": number, "width": number, "height": number} (optional, defaults to full canvas)
  },
  "explanation": "Friendly description"
}

Note: shape can be "random" to randomly mix circles, rectangles, and triangles

For arrangement/layout operations:
{
  "action": "arrange",
  "targetObjects": "all" | "selected" | ["uuid1", "uuid2"] | {type: "circle"} | {fill: "#ff0000"},
  "arrangement": {
    "type": "row" | "column" | "grid" | "circle" | "distribute_horizontal" | "distribute_vertical",
    "spacing": number | "even",
    "align": "start" | "center" | "end",
    "position": {"x": number, "y": number} (optional, starting point)
  },
  "explanation": "Friendly description"
}

Examples of arrangement commands:
- "Arrange all circles in a horizontal row" → action: "arrange", targetObjects: {type: "circle"}, arrangement: {type: "row", spacing: "even"}
- "Space these elements evenly" → action: "arrange", targetObjects: "selected", arrangement: {type: "distribute_horizontal", spacing: "even"}
- "Create a 3x3 grid with all rectangles" → action: "arrange", targetObjects: {type: "rect"}, arrangement: {type: "grid", spacing: 20}

Creation guidelines:
- Rectangles: 60-200px width/height typically
- Circles: 30-100px radius typically
- Triangles: 50-150px dimensions
- Text: 16-20px for body, 24-32px for headings
- For single objects: Position EXACTLY as requested (center = 400, 300)
- Colors: Use the EXACT color specified by the user

For "create login form" specifically:
- Title text at top (24px, bold)
- Username label + input field (rectangle) with 10px gap
- Password label + input field with 10px gap  
- Submit button (rectangle with contrasting color) below inputs
- Center-align all elements, use consistent widths
- Total height: ~250-300px

For "create navigation bar":
- Container rectangle as background (full width or centered)
- Text items evenly spaced horizontally
- Use 18-20px font size
- Items should be clickable-looking with good contrast`;

    // Call OpenAI GPT-4o
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more precise, less creative responses
      max_tokens: 16000, // Increased for large batch operations (e.g., 100 objects)
    });

    // Check if response was truncated due to token limits
    if (response.choices[0].finish_reason === "length") {
      console.warn("AI response truncated due to token limit");
      return res.status(400).json({
        message:
          "Request too complex. Try creating fewer objects (max ~50 at once).",
      });
    }

    const result = JSON.parse(response.choices[0].message.content);

    // Validate response structure
    if (!result.action) {
      throw new Error("Invalid AI response structure: missing action");
    }

    // Handle pattern-based creation
    if (result.action === "create_pattern") {
      if (!result.pattern) {
        throw new Error("Pattern action requires pattern object");
      }
      // Pattern will be executed client-side
      console.log(
        `Pattern generation requested: ${result.pattern.count} ${result.pattern.shape}s`
      );
    } else if (result.action === "arrange") {
      // Handle arrangement actions
      if (!result.arrangement) {
        throw new Error("Arrange action requires arrangement object");
      }
      console.log(`Arrangement requested: ${result.arrangement.type}`);
    } else {
      // Handle traditional object-based creation
      if (!Array.isArray(result.objects)) {
        result.objects = [];
      }

      // Ensure all new objects have UUIDs
      result.objects.forEach((obj) => {
        if (!obj.id) {
          obj.id = uuidv4();
        }
      });
    }

    res.json(result);
  } catch (error) {
    console.error("AI command error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      type: error.type,
      status: error.status,
    });

    if (error.code === "insufficient_quota") {
      return res.status(429).json({
        message: "OpenAI API quota exceeded. Please try again later.",
      });
    }

    if (error.code === "rate_limit_exceeded") {
      return res.status(429).json({
        message: "Rate limit exceeded. Please wait a moment and try again.",
      });
    }

    if (error.code === "context_length_exceeded") {
      return res.status(400).json({
        message:
          "Request too large. Try creating fewer objects at once (max ~50).",
      });
    }

    res.status(500).json({
      message: "Failed to process AI command. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
