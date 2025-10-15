# CollabCanvas Startup Checklist

## Quick Fix for Connection Errors

### 1. Create `.env` file in project root:

```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/collabcanvas

# Session
SESSION_SECRET=your-secret-key-change-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# Yjs WebSocket
YJS_WS_PORT=1234

# Optional: OpenAI API (comment out if not available)
# OPENAI_API_KEY=sk-your-api-key-here
```

### 2. Install all dependencies:

```bash
npm run install-all
```

### 3. Start MongoDB:

```bash
# On macOS with Homebrew:
brew services start mongodb-community

# Or manually:
mongod --config /usr/local/etc/mongod.conf

# On Windows:
net start MongoDB

# On Linux:
sudo systemctl start mongod
```

### 4. Start the development servers:

```bash
npm run dev
```

### 5. Check if servers are running:

- Server: http://localhost:3001
- Client: http://localhost:3000
- Yjs WebSocket: ws://localhost:1234

### 6. If still getting errors:

1. Check console for specific error messages
2. Ensure MongoDB is running
3. Check if ports 3000, 3001, and 1234 are available
4. Try restarting the servers

## Expected Behavior:

- Server should start on port 3001
- Yjs WebSocket should start on port 1234
- Client should start on port 3000
- You should see "Connected to Socket.io server" in browser console
- You should see Yjs connection status updates

