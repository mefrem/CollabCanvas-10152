import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/collabcanvas";
    console.log(`🔌 Attempting to connect to MongoDB: ${mongoUri}`);

    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Listen for connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("💡 Make sure MongoDB is running:");
    console.error("   - macOS: brew services start mongodb-community");
    console.error("   - Windows: net start MongoDB");
    console.error("   - Linux: sudo systemctl start mongod");
    process.exit(1);
  }
};
