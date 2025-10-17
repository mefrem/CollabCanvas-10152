# CollabCanvas Deployment Guide

## Overview

This guide explains how to deploy CollabCanvas to production using Vercel (frontend) and Render.com (backend).

## Prerequisites

- GitHub repository with your code
- Vercel account
- Render.com account (or Railway.app)
- MongoDB Atlas account (free tier works fine)
- OpenAI API key

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Vercel    │────────>│  Render.com  │────────>│   MongoDB   │
│   (Client)  │  HTTP   │   (Server)   │         │    Atlas    │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │
       └────────────────────────┘
           WebSocket (Yjs)
```

## Step 1: Set Up MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create a free M0 cluster
3. Create a database user with password
4. Whitelist all IPs (0.0.0.0/0) for development
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/collabcanvas?retryWrites=true&w=majority
   ```

## Step 2: Deploy Server to Render.com

1. Go to https://render.com
2. Create New → Web Service
3. Connect your GitHub repository
4. Configure:

   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

5. Add Environment Variables:

   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   SESSION_SECRET=<generate-a-secure-random-string>
   OPENAI_API_KEY=<your-openai-api-key>
   CLIENT_URL=<will-be-vercel-url>
   YJS_WS_PORT=1234
   ```

6. Deploy and note your server URL (e.g., `https://your-app.onrender.com`)

## Step 3: Update Server CORS

Update `CLIENT_URL` environment variable on Render with your Vercel URL once you have it.

## Step 4: Deploy Client to Vercel

### Option A: Through Vercel Dashboard

1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure:

   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables:

   ```
   VITE_API_URL=<your-render-server-url>
   VITE_YJS_WS_URL=wss://<your-render-server-domain>
   ```

   Example:

   ```
   VITE_API_URL=https://collabcanvas-server.onrender.com
   VITE_YJS_WS_URL=wss://collabcanvas-server.onrender.com
   ```

5. Deploy

### Option B: Through Vercel CLI

```bash
cd client
npm install -g vercel
vercel login
vercel --prod
```

## Step 5: Update API Calls (if needed)

The client is configured to use relative paths (`/api/...`) which work with Vite proxy in development.

For production, you need to update the vite.config.js or use environment variables:

**Option 1: Update vite.config.js for production**

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": process.env.VITE_API_URL || "http://localhost:3001",
      "/socket.io": {
        target: process.env.VITE_API_URL || "http://localhost:3001",
        ws: true,
      },
    },
  },
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(
      process.env.VITE_API_URL || ""
    ),
  },
});
```

**Option 2: Create API utility** (Recommended)

Create `client/src/utils/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || "";

export const apiUrl = (path) => {
  if (import.meta.env.PROD && API_URL) {
    return `${API_URL}${path}`;
  }
  return path; // Use relative path in development (proxied by Vite)
};
```

Then update fetch calls:

```javascript
import { apiUrl } from "../utils/api";

const response = await fetch(apiUrl("/api/auth/login"), {
  // ...
});
```

## Step 6: WebSocket Configuration

The Yjs WebSocket server runs on the same server as your API. Make sure:

1. Your server is configured to handle WebSocket connections
2. The `YJS_WS_PORT` environment variable is set
3. Render.com allows WebSocket connections (it does by default)

The client already uses environment variables for the WebSocket URL (see `client/src/hooks/useYjs.js`).

## Step 7: Testing

1. Visit your Vercel URL
2. Register a new account
3. Create some objects
4. Open in another browser/incognito window
5. Verify real-time collaboration works
6. Test all features:
   - Object creation
   - Alignment tools
   - Layers panel
   - AI commands
   - Persistence (refresh page)

## Troubleshooting

### CORS Errors

Make sure `CLIENT_URL` in server environment matches your Vercel domain exactly.

### WebSocket Connection Failed

- Check that `VITE_YJS_WS_URL` uses `wss://` (not `ws://`) for production
- Verify Render.com service is running
- Check server logs for WebSocket errors

### 500 Errors on API Calls

- Check server logs on Render.com
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Objects Not Syncing

- Check browser console for WebSocket errors
- Verify Yjs WebSocket server is running (check server logs)
- Test with network tab open

## Environment Variables Summary

### Server (.env)

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=your-secret-here
OPENAI_API_KEY=sk-proj-...
CLIENT_URL=https://your-app.vercel.app
YJS_WS_PORT=1234
```

### Client (Vercel Environment Variables)

```env
VITE_API_URL=https://your-server.onrender.com
VITE_YJS_WS_URL=wss://your-server.onrender.com
```

## Performance Tips

1. **Enable Render CDN** for static assets
2. **Use MongoDB Atlas in same region** as your Render server
3. **Monitor performance** with Vercel Analytics
4. **Set up error tracking** (e.g., Sentry)

## Cost Estimate

- **MongoDB Atlas**: Free (M0 tier)
- **Render.com**: Free tier or $7/month
- **Vercel**: Free for personal projects
- **OpenAI API**: Pay as you go (~$0.002 per AI command)

**Total**: $0-7/month for hosting + OpenAI usage

## Next Steps

1. Set up custom domain (optional)
2. Enable HTTPS (automatic on Vercel/Render)
3. Set up monitoring and logging
4. Configure auto-deployment from GitHub
5. Add README with live demo link

## Support

For issues:

1. Check server logs on Render.com
2. Check browser console for client errors
3. Review Vercel deployment logs
4. Test locally first with same environment variables
