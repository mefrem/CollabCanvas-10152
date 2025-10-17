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

    // Optimized system prompt to reduce tokens
    const systemPrompt = `You are a canvas design assistant. Create ONLY what the user asks for.

Canvas: 800x600px. Center: (400, 300). Top-left: (0, 0).

For 10+ objects use PATTERN mode:
{"action":"create_pattern","pattern":{"shape":"circle|rect|triangle|random","count":number,"distribution":"random|grid","colorScheme":"rainbow|random|#hex","radiusRange":[min,max],"sizeRange":[min,max]},"explanation":"str"}

For 1-9 objects use:
{"action":"create|modify|delete","objects":[{"id":"uuid","type":"rect|circle|triangle|text","x":num,"y":num,"width":num,"height":num,"radius":num,"fill":"#hex","text":"str","fontSize":num}],"explanation":"str"}

Always respond with valid JSON.`;

    const userPrompt = `Canvas: ${JSON.stringify(canvasState || [])}

Command: "${command}"`;

    // Smart model selection: Use gpt-4o for complex layouts, gpt-4o-mini for simple shapes
    const complexPatterns =
      /\b(form|login|signup|register|navigation|nav|menu|layout|dashboard|card|button|input|modal|dialog|component)\b/i;
    const isComplexCommand = complexPatterns.test(command);
    const model = isComplexCommand ? "gpt-4o" : "gpt-4o-mini";

    console.log(`🤖 Using model: ${model} for command: "${command}"`);

    // Call OpenAI with appropriate model
    const startTime = Date.now();
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: isComplexCommand ? 2000 : 800, // More tokens for complex commands
    });
    const elapsedTime = Date.now() - startTime;
    console.log(`⚡ AI response time: ${elapsedTime}ms (${model})`);

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
