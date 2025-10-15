import mongoose from "mongoose";

const canvasSchema = new mongoose.Schema({
  canvasId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: "Untitled Canvas",
  },
  yjsState: {
    type: Buffer,
    required: true,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  collaborators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export default mongoose.model("Canvas", canvasSchema);
