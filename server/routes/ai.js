import express from "express";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Process AI command
router.post("/command", requireAuth, async (req, res) => {
  try {
    const { command, canvasState } = req.body;

    if (!command) {
      return res.status(400).json({ message: "Command is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: "OpenAI API key not configured" });
    }

    // Enhanced system prompt for GPT-4o's superior reasoning
    const systemPrompt = `You are an expert canvas design assistant with strong spatial reasoning and design principles knowledge.

Canvas specifications:
- Dimensions: 800x600 pixels
- Center point: (400, 300)
- Coordinate system: Top-left is (0, 0)

When executing commands:
1. Consider visual hierarchy and composition
2. Apply proper spacing and alignment principles
3. Use harmonious color palettes
4. Create balanced, professional layouts
5. Think about user experience and readability

For complex multi-element commands (forms, navigation, dashboards):
- Plan the layout before generating objects
- Ensure consistent spacing and alignment
- Use appropriate sizes for different element types
- Consider grouping and visual relationships

Always respond with valid JSON matching the exact schema provided.`;

    const userPrompt = `Current canvas state:
${JSON.stringify(canvasState || [], null, 2)}

User command: "${command}"

Respond with JSON following this exact schema:
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
      "strokeWidth": number (optional, 1-5)
    }
  ],
  "modifications": {
    "existing-object-uuid": {
      "x": 100,
      "y": 200,
      "fill": "#ff0000"
      // any properties to update
    }
  },
  "deletions": ["uuid-to-delete"],
  "explanation": "Friendly 1-2 sentence description of what you created/modified"
}

Creation guidelines:
- Rectangles: 60-250px width/height, use for buttons, containers, input fields
- Circles: 25-100px radius, use for avatars, icons, decorative elements  
- Triangles: 50-150px dimensions, use sparingly for arrows or decorative accents
- Text: 16-20px for body, 24-32px for headings, use clear web-safe colors
- Spacing: Minimum 15-20px between related elements, 40-60px between groups
- Colors: Use professional palettes (avoid pure primaries unless requested)

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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000,
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Validate response structure
    if (!result.action || !Array.isArray(result.objects)) {
      throw new Error("Invalid AI response structure");
    }

    // Ensure all new objects have UUIDs
    result.objects.forEach((obj) => {
      if (!obj.id) {
        obj.id = uuidv4();
      }
    });

    res.json(result);
  } catch (error) {
    console.error("AI command error:", error);

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

    res.status(500).json({
      message: "Failed to process AI command. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
