#!/usr/bin/env node

/**
 * Simple connection test for CollabCanvas servers
 */

import http from "http";
import WebSocket from "ws";

console.log("🔍 Testing CollabCanvas server connections...\n");

const tests = [
  {
    name: "Express Server",
    test: () => testHTTP("http://localhost:3001"),
  },
  {
    name: "Yjs WebSocket",
    test: () => testWebSocket("ws://localhost:1234"),
  },
];

async function testHTTP(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({ success: true, status: res.statusCode });
    });

    req.on("error", (error) => {
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(5000, () => {
      resolve({ success: false, error: "Timeout" });
    });
  });
}

async function testWebSocket(url) {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(url);

      ws.on("open", () => {
        ws.close();
        resolve({ success: true });
      });

      ws.on("error", (error) => {
        resolve({ success: false, error: error.message });
      });

      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.terminate();
          resolve({ success: false, error: "Connection timeout" });
        }
      }, 5000);
    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
}

async function runTests() {
  for (const { name, test } of tests) {
    process.stdout.write(`Testing ${name}... `);

    const result = await test();

    if (result.success) {
      console.log("✅ Connected");
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
  }

  console.log("\n📋 If tests fail:");
  console.log(
    "1. Make sure you created a .env file (see startup-checklist.md)"
  );
  console.log("2. Run: npm run install-all");
  console.log("3. Start MongoDB: brew services start mongodb-community");
  console.log("4. Run: npm run dev");
}

runTests().catch(console.error);

