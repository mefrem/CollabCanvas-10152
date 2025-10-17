# CollabCanvas

Real-time collaborative canvas application with AI assistance, built for modern web development.

## Overview

CollabCanvas is a production-ready collaborative design tool that combines real-time multi-user editing with AI-powered canvas manipulation. Users can simultaneously create, edit, and manipulate shapes while an AI agent assists with complex design tasks.

## 🚀 Key Features

### Real-Time Collaboration

- **Multi-user editing** with live cursor synchronization
- **Conflict-free replication** using Yjs CRDT technology
- **Instant object sync** across all connected users (< 200ms latency)
- **User presence** indicators with online user count

### Canvas Tools

- **Shape creation**: Rectangle, Circle, Triangle, Text
- **Transform operations**: Move, resize, rotate, delete
- **Multi-select** with Shift+Click
- **Pan & Zoom** controls with Space+Drag and mouse wheel
- **Keyboard shortcuts** for power users

### Advanced Features

- **Layers Panel** with drag-to-reorder, visibility toggle, lock controls
- **Alignment Tools** (9 tools) - align left/center/right, top/middle/bottom, distribute
- **Z-Index Management** - bring to front, send to back with keyboard shortcuts
- **Color picker** with 8 presets + custom colors + recent colors
- **Undo/Redo** with Yjs UndoManager (Cmd+Z / Cmd+Shift+Z)
- **Object duplication** (Cmd+D)
- **Arrow key nudging** (10px normal, 50px with Shift)
- **Toast notifications** for user feedback
- **Smooth animations** and professional design system

### AI Canvas Agent

- **8 command types** covering creation, manipulation, layout, and complex operations
- **GPT-4o integration** with superior spatial reasoning
- **Natural language** commands like "Create a login form"
- **Real-time execution** with 2-3 second response times

### Persistence & Authentication

- **Auto-save** every 30 seconds with manual save option
- **MongoDB persistence** with full canvas state restoration
- **User authentication** with secure sessions
- **Cross-session continuity** - canvas persists on refresh

## 🛠 Tech Stack

| Component            | Technology         | Version      | Purpose                                |
| -------------------- | ------------------ | ------------ | -------------------------------------- |
| **Frontend**         | React              | 18.3+        | UI framework with concurrent features  |
| **Canvas Rendering** | Fabric.js          | 5.3+         | Object model and transforms (60 FPS)   |
| **Real-time Sync**   | Yjs + y-websocket  | 13.6+ / 1.5+ | CRDT for conflict-free collaboration   |
| **WebSocket**        | Socket.io          | 4.7+         | Cursor synchronization and presence    |
| **Backend**          | Express.js         | 4.18+        | HTTP server and API endpoints          |
| **Database**         | MongoDB + Mongoose | 7.0+ / 8.0+  | Document store for persistence         |
| **AI Integration**   | OpenAI GPT-4o      | Latest       | Advanced canvas command processing     |
| **Authentication**   | Passport.js        | 0.7+         | Local strategy with bcrypt             |
| **Build Tool**       | Vite               | 5.3+         | Fast development and production builds |

## 📋 Architecture

```
┌─────────────────────────────────────────────────┐
│  React Frontend (Port 3000)                     │
│  ├─ Canvas Component (Fabric.js)                │
│  ├─ Yjs Document + WebSocket Provider           │
│  ├─ User Cursors Component                      │
│  └─ AI Command Interface                        │
└──────────┬──────────────────────────────────────┘
           │ Socket.io + Yjs WebSocket
┌──────────▼──────────────────────────────────────┐
│  Express + Socket.io Server (Port 3001)         │
│  ├─ Yjs WebSocket Server (Port 1234)            │
│  ├─ Cursor Broadcast                            │
│  ├─ AI Command Processing                       │
│  ├─ Canvas Persistence Layer                    │
│  └─ Authentication (Passport.js)                │
└──────────┬──────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────┐
│  MongoDB                                        │
│  ├─ users (authentication & user data)          │
│  ├─ canvases (Yjs state snapshots)             │
│  └─ sessions (express-session storage)          │
└─────────────────────────────────────────────────┘
```

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd collabcanvas
   npm install
   cd client && npm install && cd ../server && npm install && cd ..
   ```

2. **Set up environment variables**

   ```bash
   # Copy and edit environment file
   cp env.example .env
   ```

   Configure `.env`:

   ```env
   # Server
   PORT=3001
   NODE_ENV=development

   # MongoDB (choose one)
   MONGODB_URI=mongodb://localhost:27017/collabcanvas
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collabcanvas

   # Session
   SESSION_SECRET=your-secret-key-change-in-production

   # OpenAI API
   OPENAI_API_KEY=sk-proj-xxxxx

   # Client URL
   CLIENT_URL=http://localhost:3000

   # Yjs WebSocket
   YJS_WS_PORT=1234
   ```

3. **Start the application**

   ```bash
   # Start both client and server
   npm run dev

   # Or start individually
   npm run server  # Port 3001
   npm run client  # Port 3000
   ```

4. **Access the application**
   - Open http://localhost:3000
   - Register a new account
   - Start creating on the canvas!

## 🎯 AI Commands

The AI agent supports 8 distinct command categories:

### Creation Commands

- `"Create a red circle at 200, 300"`
- `"Add text that says 'Hello World'"`

### Manipulation Commands

- `"Move the circle to the center"`
- `"Make the rectangle twice as wide"`

### Layout Commands

- `"Arrange all rectangles in a horizontal row"`
- `"Space these three circles evenly"`

### Complex Commands

- `"Create a login form"` _(generates multiple aligned elements)_
- `"Make a navigation bar with Home, About, Contact"` _(creates structured layout)_

The AI uses GPT-4o's advanced spatial reasoning to create professional, well-aligned layouts with proper spacing and visual hierarchy.

## 🎮 Controls & Shortcuts

### Mouse Controls

- **Left Click**: Select objects
- **Shift + Click**: Multi-select objects
- **Drag**: Move selected objects
- **Corner Handles**: Resize objects
- **Rotation Handle**: Rotate objects
- **Space + Drag**: Pan canvas
- **Mouse Wheel**: Zoom in/out

### Keyboard Shortcuts

**Object Operations:**

- **Delete**: Remove selected objects
- **Cmd/Ctrl + D**: Duplicate objects
- **Arrow Keys**: Nudge objects 10px
- **Shift + Arrow Keys**: Nudge objects 50px

**History:**

- **Cmd/Ctrl + Z**: Undo
- **Cmd/Ctrl + Shift + Z**: Redo

**Alignment:**

- **Cmd/Ctrl + Shift + L**: Align Left
- **Cmd/Ctrl + Shift + H**: Align Center (Horizontal)
- **Cmd/Ctrl + Shift + R**: Align Right
- **Cmd/Ctrl + Shift + T**: Align Top
- **Cmd/Ctrl + Shift + M**: Align Middle (Vertical)
- **Cmd/Ctrl + Shift + B**: Align Bottom
- **Cmd/Ctrl + Shift + C**: Center on Canvas

**Z-Index:**

- **Cmd/Ctrl + ]**: Bring to Front
- **Cmd/Ctrl + [**: Send to Back
- **Cmd/Ctrl + Shift + ]**: Bring Forward
- **Cmd/Ctrl + Shift + [**: Send Backward

### Tools

- **Select Tool**: Default selection and manipulation
- **Rectangle Tool**: Click to create rectangles
- **Circle Tool**: Click to create circles
- **Triangle Tool**: Click to create triangles
- **Text Tool**: Click to create editable text

## 🧪 Testing Scenarios

### Basic Functionality

- [ ] User registration and login
- [ ] Canvas object creation (all 4 types)
- [ ] Object selection, movement, and deletion
- [ ] Multi-select with Shift+Click
- [ ] Pan and zoom operations

### Real-Time Collaboration

- [ ] Open two browser windows, see objects sync
- [ ] Cursor positions update smoothly
- [ ] Multi-user editing without conflicts
- [ ] User count displays correctly

### Persistence

- [ ] Create objects, wait 30s, refresh → objects persist
- [ ] Manual save button works and shows feedback
- [ ] Canvas loads previous state on login

### AI Agent

- [ ] All 8 example commands execute correctly
- [ ] Complex commands create proper layouts
- [ ] AI objects sync to all connected users
- [ ] Error handling for invalid commands

### Advanced Features

- [ ] Color picker changes object colors
- [ ] Undo/redo works with keyboard shortcuts
- [ ] All keyboard shortcuts function correctly

## 📁 Project Structure

```
collabcanvas/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.jsx     # Main canvas component
│   │   │   ├── Toolbar.jsx    # Tool selection
│   │   │   ├── ColorPicker.jsx # Color selection
│   │   │   ├── CursorOverlay.jsx # User cursors
│   │   │   ├── AICommandInput.jsx # AI interface
│   │   │   └── Auth/          # Login/Register
│   │   ├── hooks/
│   │   │   ├── useYjs.js      # Yjs integration
│   │   │   ├── useSocketCursors.js # Cursor sync
│   │   │   └── usePersistence.js # Auto-save
│   │   ├── utils/
│   │   │   └── fabricHelpers.js # Fabric.js utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                    # Express backend
│   ├── models/
│   │   ├── User.js           # User authentication
│   │   └── Canvas.js         # Canvas persistence
│   ├── routes/
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── canvas.js         # Canvas CRUD operations
│   │   └── ai.js             # AI command processing
│   ├── middleware/
│   │   └── auth.js           # Route protection
│   ├── config/
│   │   ├── db.js             # MongoDB connection
│   │   ├── passport.js       # Passport configuration
│   │   └── yjs.js            # Yjs WebSocket server
│   ├── index.js              # Server entry point
│   └── package.json
├── package.json              # Root package.json
├── .env.example              # Environment template
└── README.md
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Canvas

- `GET /api/canvas/:canvasId` - Load canvas state
- `POST /api/canvas/:canvasId/save` - Save canvas state

### AI Commands

- `POST /api/ai/command` - Process AI command

## 🚀 Performance Characteristics

### Real-Time Sync

- **Object sync latency**: < 200ms under normal conditions
- **Cursor update frequency**: 20 FPS (50ms intervals)
- **Concurrent users**: Tested with 2-3 users, designed for 5+
- **Object capacity**: 100+ objects at 60 FPS

### AI Response

- **Average response time**: 2-3 seconds (GPT-4o)
- **Accuracy rate**: 75-80% for complex commands
- **Supported commands**: 8 distinct types
- **Context awareness**: Full canvas state included

### Persistence

- **Auto-save interval**: 30 seconds (debounced)
- **Manual save response**: < 500ms
- **Canvas load time**: < 2 seconds for typical canvases
- **Data integrity**: Full state restoration on refresh

## 🎛 Configuration

### Development

- Client dev server: `http://localhost:3000`
- API server: `http://localhost:3001`
- Yjs WebSocket: `ws://localhost:1234`
- Hot reload enabled for both client and server

### Production Considerations

- Use MongoDB Atlas for database
- Set secure session secrets
- Enable HTTPS for WebSocket security
- Configure CORS for your domain
- Set up process monitoring (PM2)

## 🚧 Known Limitations

- **Single canvas**: Currently hardcoded to 'default-canvas'
- **Mobile support**: Optimized for desktop use
- **File uploads**: Not implemented in current version
- **User management**: Basic authentication only
- **Canvas sharing**: No permission system yet

## 🛣 Future Roadmap

### SHOT-2: Performance Optimization

- Sub-100ms sync latency
- Canvas virtualization for 500+ objects
- Advanced conflict resolution
- Stress testing with 10+ users

### SHOT-3: AI Enhancement

- Sub-2s AI response times
- 90%+ command accuracy
- Chain-of-thought reasoning
- Context-aware suggestions

### Future Features

- Export to PNG/SVG
- Layer management system
- Component/symbol library
- Mobile-responsive design
- Advanced blend modes

## 📄 License

This project is built for educational and demonstration purposes.

## 🤝 Contributing

This is a demonstration project showcasing modern collaborative web application architecture. The codebase serves as a reference for implementing real-time collaboration with AI assistance.

---

**Built with ❤️ using React, Yjs, Fabric.js, and OpenAI GPT-4o**
