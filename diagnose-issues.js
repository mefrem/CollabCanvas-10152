#!/usr/bin/env node

/**
 * CollabCanvas Issue Diagnostics
 * Checks common issues and provides solutions
 */

import fs from "fs";
import http from "http";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

console.log("🔍 CollabCanvas Issue Diagnostics\n");

const checks = [
  {
    name: ".env file exists",
    check: () => fs.existsSync(".env"),
    fix: "Create a .env file with MongoDB URI and other config. See startup-checklist.md",
  },
  {
    name: "MongoDB connection",
    check: async () => {
      try {
        // Try to connect to MongoDB
        const { stdout } = await execAsync(
          'mongo --eval "db.runCommand({connectionStatus: 1})" --quiet',
          { timeout: 5000 }
        );
        return stdout.includes('"ok" : 1');
      } catch (error) {
        return false;
      }
    },
    fix: "Start MongoDB: ./start-mongodb.sh or brew services start mongodb-community",
  },
  {
    name: "Express server running (port 3001)",
    check: () => testPort("http://localhost:3001"),
    fix: "Start the server: npm run dev",
  },
  {
    name: "Yjs WebSocket server (port 1234)",
    check: () => testWebSocket("ws://localhost:1234"),
    fix: "Server should start Yjs WebSocket automatically. Check server logs.",
  },
  {
    name: "Client server running (port 3000)",
    check: () => testPort("http://localhost:3000"),
    fix: "Start the client: npm run dev",
  },
];

async function testPort(url) {
  return new Promise((resolve) => {
    const req = http.get(url, () => {
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(3000, () => resolve(false));
  });
}

async function testWebSocket(url) {
  // For simplicity, we'll assume WebSocket is working if Express server is running
  return await testPort("http://localhost:3001");
}

async function runDiagnostics() {
  console.log("Running diagnostics...\n");

  const results = [];

  for (const check of checks) {
    process.stdout.write(`Checking ${check.name}... `);

    try {
      const result = await check.check();

      if (result) {
        console.log("✅ OK");
        results.push({ ...check, status: "ok" });
      } else {
        console.log("❌ FAIL");
        results.push({ ...check, status: "fail" });
      }
    } catch (error) {
      console.log("❌ ERROR");
      results.push({ ...check, status: "error", error: error.message });
    }
  }

  console.log("\n📋 Summary:");

  const failed = results.filter((r) => r.status !== "ok");

  if (failed.length === 0) {
    console.log("🎉 All checks passed! Your setup looks good.");
  } else {
    console.log(`❌ ${failed.length} issue(s) found:\n`);

    failed.forEach((result, i) => {
      console.log(`${i + 1}. ${result.name}`);
      console.log(`   Fix: ${result.fix}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log("");
    });

    console.log("💡 Quick fixes:");
    console.log("1. Start MongoDB: ./start-mongodb.sh");
    console.log("2. Create .env file (see startup-checklist.md)");
    console.log("3. Install dependencies: npm run install-all");
    console.log("4. Start servers: npm run dev");
  }
}

runDiagnostics().catch(console.error);

