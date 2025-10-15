import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { setupPassport } from "./config/passport.js";
import { setupYjsServer } from "./config/yjs.js";

// Import routes
import authRoutes from "./routes/auth.js";
import canvasRoutes from "./routes/canvas.js";
import aiRoutes from "./routes/ai.js";

// Load environment variables
dotenv.config();

// Log environment status (for debugging)
console.log(
  "🔑 OpenAI API Key:",
  process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing"
);

const app = express();
const server = createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGODB_URI || "mongodb://localhost:27017/collabcanvas",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Setup Passport
setupPassport();
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/canvas", canvasRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "CollabCanvas Server Running" });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join canvas room
  socket.on("join-canvas", (data) => {
    const { canvasId, userId, username, color } = data;
    socket.join(canvasId);
    socket.canvasId = canvasId;
    socket.userId = userId;
    socket.username = username;
    socket.color = color;

    // Broadcast user joined to room
    socket.to(canvasId).emit("user-joined", {
      userId,
      username,
      color,
      socketId: socket.id,
    });

    console.log(`User ${username} joined canvas ${canvasId}`);
  });

  // Handle cursor movement
  socket.on("cursor-move", (data) => {
    if (socket.canvasId) {
      socket.to(socket.canvasId).emit("cursor-update", {
        userId: socket.userId,
        username: socket.username,
        color: socket.color,
        x: data.x,
        y: data.y,
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (socket.canvasId && socket.userId) {
      socket.to(socket.canvasId).emit("user-left", {
        userId: socket.userId,
        socketId: socket.id,
      });
      console.log(`User ${socket.username} left canvas ${socket.canvasId}`);
    }
    console.log("User disconnected:", socket.id);
  });
});

// Setup Yjs WebSocket server
setupYjsServer();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Yjs WebSocket server running on port ${process.env.YJS_WS_PORT || 1234}`
  );
});
