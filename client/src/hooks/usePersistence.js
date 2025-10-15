import { useEffect, useRef, useCallback } from "react";
import * as Y from "yjs";

export const usePersistence = (canvasId, ydoc, user) => {
  const saveTimeoutRef = useRef(null);
  const lastSaveRef = useRef(0);
  const isSavingRef = useRef(false);

  // Debounced save function
  const debouncedSave = useCallback(async () => {
    if (!ydoc || !canvasId || isSavingRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for 30 seconds
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        isSavingRef.current = true;
        console.log("Saving canvas to database...");

        // Encode Yjs state as update
        const yjsState = Y.encodeStateAsUpdate(ydoc);

        const response = await fetch(`/api/canvas/${canvasId}/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            yjsState: Array.from(yjsState), // Convert Uint8Array to regular array for JSON
          }),
        });

        if (response.ok) {
          lastSaveRef.current = Date.now();
          console.log("Canvas saved successfully");
        } else {
          const error = await response.json();
          console.error("Failed to save canvas:", error.message);
        }
      } catch (error) {
        console.error("Save error:", error);
      } finally {
        isSavingRef.current = false;
      }
    }, 30000); // 30 seconds delay
  }, [ydoc, canvasId]);

  // Load canvas from database
  const loadCanvas = useCallback(async () => {
    if (!canvasId || !ydoc) return;

    try {
      console.log("Loading canvas from database...");

      const response = await fetch(`/api/canvas/${canvasId}`, {
        credentials: "include",
      });

      if (response.ok) {
        const canvasData = await response.json();
        console.log("✅ Canvas API response received:", canvasData);

        if (canvasData.yjsState && canvasData.yjsState.length > 0) {
          // Convert array back to Uint8Array and apply to Yjs doc
          const stateArray = new Uint8Array(canvasData.yjsState);
          Y.applyUpdate(ydoc, stateArray);
          console.log("📄 Canvas loaded from database");
        } else {
          console.log("🆕 No existing canvas state found, starting fresh");
        }
      } else {
        console.error(
          `❌ Canvas API failed: ${response.status} ${response.statusText}`
        );
        // Try to get error details
        try {
          const errorData = await response.json();
          console.error("Error details:", errorData);
        } catch (e) {
          console.error("Could not parse error response");
        }
      }
    } catch (error) {
      console.error("Load error:", error);
    }
  }, [canvasId, ydoc]);

  // Set up auto-save when Yjs document changes
  useEffect(() => {
    if (!ydoc) return;

    const handleDocUpdate = () => {
      // Only save if it's been more than 5 seconds since last save
      const now = Date.now();
      if (now - lastSaveRef.current > 5000) {
        debouncedSave();
      }
    };

    ydoc.on("update", handleDocUpdate);

    return () => {
      ydoc.off("update", handleDocUpdate);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [ydoc, debouncedSave]);

  // Manual save function (for immediate saves if needed)
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (!ydoc || !canvasId || isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      console.log("Manual save initiated...");

      const yjsState = Y.encodeStateAsUpdate(ydoc);

      const response = await fetch(`/api/canvas/${canvasId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          yjsState: Array.from(yjsState),
        }),
      });

      if (response.ok) {
        lastSaveRef.current = Date.now();
        console.log("Manual save completed");
        return true;
      } else {
        const error = await response.json();
        console.error("Manual save failed:", error.message);
        return false;
      }
    } catch (error) {
      console.error("Manual save error:", error);
      return false;
    } finally {
      isSavingRef.current = false;
    }
  }, [ydoc, canvasId]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Try to save synchronously on page unload
      if (ydoc && canvasId && !isSavingRef.current) {
        const yjsState = Y.encodeStateAsUpdate(ydoc);

        // Use sendBeacon for reliable delivery during page unload
        const data = JSON.stringify({
          yjsState: Array.from(yjsState),
        });

        navigator.sendBeacon(`/api/canvas/${canvasId}/save`, data);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [ydoc, canvasId]);

  return {
    loadCanvas,
    saveNow,
    isAutoSaveEnabled: true,
    lastSave: lastSaveRef.current,
  };
};
