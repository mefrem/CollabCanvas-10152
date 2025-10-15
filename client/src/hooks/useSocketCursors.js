import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export const useSocketCursors = (canvasId, user, fabricCanvas) => {
  const socketRef = useRef(null);
  const [cursors, setCursors] = useState({});
  const [connectedUsers, setConnectedUsers] = useState([]);
  const lastCursorUpdate = useRef(0);

  useEffect(() => {
    if (!canvasId || !user) return;

    console.log("Connecting to Socket.io for cursors...");

    // Connect to Socket.io server
    const socket = io("http://localhost:3001", {
      withCredentials: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    // Join canvas room
    socket.emit("join-canvas", {
      canvasId,
      userId: user.id,
      username: user.username,
      color: user.color,
    });

    // Handle connection events
    socket.on("connect", () => {
      console.log("Connected to Socket.io server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.io server");
      setCursors({});
      setConnectedUsers([]);
    });

    // Handle user joined
    socket.on("user-joined", (userData) => {
      console.log("User joined:", userData.username);
      setConnectedUsers((prev) => {
        const existing = prev.find((u) => u.userId === userData.userId);
        if (existing) return prev;
        return [...prev, userData];
      });
    });

    // Handle user left
    socket.on("user-left", (userData) => {
      console.log("User left:", userData.userId);
      setCursors((prev) => {
        const updated = { ...prev };
        delete updated[userData.userId];
        return updated;
      });
      setConnectedUsers((prev) =>
        prev.filter((u) => u.userId !== userData.userId)
      );
    });

    // Handle cursor updates from other users
    socket.on("cursor-update", (cursorData) => {
      const { userId, username, color, x, y } = cursorData;

      // Don't show our own cursor
      if (userId === user.id) return;

      setCursors((prev) => ({
        ...prev,
        [userId]: {
          x,
          y,
          username,
          color,
          lastUpdate: Date.now(),
        },
      }));
    });

    // Set up mouse tracking on canvas
    let isTracking = false;
    const startTracking = () => {
      if (!fabricCanvas || isTracking) return;
      isTracking = true;

      const canvasElement = fabricCanvas.upperCanvasEl;

      const handleMouseMove = (e) => {
        const now = Date.now();

        // Throttle cursor updates to 50ms (20 FPS)
        if (now - lastCursorUpdate.current < 50) return;
        lastCursorUpdate.current = now;

        const rect = canvasElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Only send if cursor is within canvas bounds
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
          socket.emit("cursor-move", { x, y });
        }
      };

      const handleMouseLeave = () => {
        // Hide cursor when leaving canvas
        socket.emit("cursor-move", { x: -1000, y: -1000 });
      };

      canvasElement.addEventListener("mousemove", handleMouseMove);
      canvasElement.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        canvasElement.removeEventListener("mousemove", handleMouseMove);
        canvasElement.removeEventListener("mouseleave", handleMouseLeave);
      };
    };

    // Start tracking after a short delay to ensure canvas is ready
    const trackingTimeout = setTimeout(startTracking, 1000);

    // Cleanup old cursors (remove cursors that haven't updated in 5 seconds)
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => {
        const updated = {};
        Object.entries(prev).forEach(([userId, cursor]) => {
          if (now - cursor.lastUpdate < 5000) {
            updated[userId] = cursor;
          }
        });
        return updated;
      });
    }, 2000);

    // Cleanup
    return () => {
      clearTimeout(trackingTimeout);
      clearInterval(cleanupInterval);
      socket.disconnect();
    };
  }, [canvasId, user, fabricCanvas]);

  // Get user count
  const userCount = connectedUsers.length + 1; // +1 for current user

  return {
    cursors,
    connectedUsers,
    userCount,
  };
};
