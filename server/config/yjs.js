import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";

export const setupYjsServer = () => {
  const wss = new WebSocketServer({
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

  wss.on("connection", (ws, req) => {
    setupWSConnection(ws, req);
    console.log("Yjs WebSocket connection established");
  });

  console.log(
    `Yjs WebSocket server listening on port ${process.env.YJS_WS_PORT || 1234}`
  );
};
