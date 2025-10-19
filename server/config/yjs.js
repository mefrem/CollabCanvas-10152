import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";

export const setupYjsServer = (httpServer) => {
  try {
    // In production, attach to the same HTTP server
    // In development, can use separate port
    const wss = httpServer
      ? new WebSocketServer({
          noServer: true, // Will handle upgrade manually
          perMessageDeflate: {
            zlibDeflateOptions: {
              threshold: 1024,
              concurrencyLimit: 10,
            },
            zlibInflateOptions: {
              chunkSize: 32 * 1024,
            },
          },
        })
      : new WebSocketServer({
          port: process.env.YJS_WS_PORT || 1234,
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

    // If attached to HTTP server, handle upgrade requests
    // Only handle non-Socket.io WebSocket connections
    if (httpServer) {
      httpServer.on("upgrade", (request, socket, head) => {
        const { pathname } = new URL(request.url, "http://localhost");

        // Let Socket.io handle its own upgrades
        if (pathname.startsWith("/socket.io/")) {
          return; // Socket.io will handle this
        }

        // Handle Yjs WebSocket upgrades
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      });
    }

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

    console.log(
      httpServer
        ? "✅ Yjs WebSocket server attached to main HTTP server"
        : `✅ Yjs WebSocket server listening on port ${
            process.env.YJS_WS_PORT || 1234
          }`
    );

    return wss;
  } catch (error) {
    console.error("Failed to start Yjs WebSocket server:", error);
    throw error;
  }
};
