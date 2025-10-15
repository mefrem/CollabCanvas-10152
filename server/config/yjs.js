import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";

export const setupYjsServer = () => {
  try {
    const port = process.env.YJS_WS_PORT || 1234;

    const wss = new WebSocketServer({
      port,
      perMessageDeflate: {
        zlibDeflateOptions: {
          threshold: 1024,
          concurrencyLimit: 10,
        },
        zlibInflateOptions: {
          chunkSize: 32 * 1024,
        },
      },
    });

    wss.on("connection", (ws, req) => {
      try {
        setupWSConnection(ws, req);
        console.log("Yjs WebSocket connection established");
      } catch (error) {
        console.error("Error setting up Yjs WebSocket connection:", error);
      }
    });

    wss.on("error", (error) => {
      console.error("Yjs WebSocket server error:", error);
    });

    console.log(`✅ Yjs WebSocket server listening on port ${port}`);

    return wss;
  } catch (error) {
    console.error("Failed to start Yjs WebSocket server:", error);
    throw error;
  }
};
