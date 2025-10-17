import { useState, useEffect } from "react";

// Frame presets for different devices/formats
export const FRAME_PRESETS = {
  phone: {
    "iPhone 14 Pro": { width: 393, height: 852 },
    "iPhone SE": { width: 375, height: 667 },
    "Samsung Galaxy S23": { width: 360, height: 780 },
    "Custom Phone": { width: 375, height: 812 },
  },
  tablet: {
    'iPad Pro 12.9"': { width: 1024, height: 1366 },
    "iPad Mini": { width: 744, height: 1133 },
    "Surface Pro": { width: 912, height: 1368 },
  },
  desktop: {
    "Laptop (1440p)": { width: 1440, height: 900 },
    "Desktop (1080p)": { width: 1920, height: 1080 },
    "Desktop (4K)": { width: 2560, height: 1440 },
    'MacBook Pro 14"': { width: 1512, height: 982 },
  },
  social: {
    "Instagram Post": { width: 1080, height: 1080 },
    "Instagram Story": { width: 1080, height: 1920 },
    "Twitter Post": { width: 1200, height: 675 },
    "Facebook Cover": { width: 820, height: 312 },
  },
  custom: {
    "Custom Frame": { width: 800, height: 600 },
  },
};

/**
 * Custom hook for managing frames/artboards
 */
export const useFrames = () => {
  const [frames, setFrames] = useState(() => {
    // Load frames from localStorage
    const saved = localStorage.getItem("canvas-frames");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeFrameId, setActiveFrameId] = useState(null);

  // Save frames to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("canvas-frames", JSON.stringify(frames));
  }, [frames]);

  /**
   * Add a new frame
   */
  const addFrame = (preset) => {
    const newFrame = {
      id: `frame-${Date.now()}`,
      name: preset.name || "New Frame",
      x: 50,
      y: 50,
      width: preset.width,
      height: preset.height,
      backgroundColor: "#ffffff",
      created: Date.now(),
    };

    setFrames((prev) => [...prev, newFrame]);
    return newFrame;
  };

  /**
   * Update frame properties
   */
  const updateFrame = (frameId, updates) => {
    setFrames((prev) =>
      prev.map((frame) =>
        frame.id === frameId ? { ...frame, ...updates } : frame
      )
    );
  };

  /**
   * Delete a frame
   */
  const deleteFrame = (frameId) => {
    setFrames((prev) => prev.filter((frame) => frame.id !== frameId));
    if (activeFrameId === frameId) {
      setActiveFrameId(null);
    }
  };

  /**
   * Duplicate a frame
   */
  const duplicateFrame = (frameId) => {
    const frame = frames.find((f) => f.id === frameId);
    if (!frame) return;

    const newFrame = {
      ...frame,
      id: `frame-${Date.now()}`,
      name: `${frame.name} Copy`,
      x: frame.x + 50,
      y: frame.y + 50,
      created: Date.now(),
    };

    setFrames((prev) => [...prev, newFrame]);
    return newFrame;
  };

  /**
   * Select/focus a frame
   */
  const selectFrame = (frameId) => {
    setActiveFrameId(frameId);
  };

  /**
   * Get the active frame
   */
  const getActiveFrame = () => {
    return frames.find((f) => f.id === activeFrameId);
  };

  return {
    frames,
    activeFrameId,
    addFrame,
    updateFrame,
    deleteFrame,
    duplicateFrame,
    selectFrame,
    getActiveFrame,
  };
};
