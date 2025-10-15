import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Circle, AlertCircle } from 'lucide-react';

const CollabCanvasPRD = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (id) => {
    setExpandedSections(prev => ({...prev, [id]: !prev[id]}));
  };

  const Section = ({ id, title, priority, children, targetPoints }) => {
    const isExpanded = expandedSections[id];
    const priorityColors = {
      'SHOT-1': 'bg-blue-100 text-blue-800 border-blue-300',
      'SHOT-2': 'bg-amber-100 text-amber-800 border-amber-300',
      'SHOT-3': 'bg-purple-100 text-purple-800 border-purple-300',
      'FUTURE': 'bg-gray-100 text-gray-600 border-gray-300'
    };

    return (
      <div className="mb-4 border rounded-lg overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
          onClick={() => toggleSection(id)}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            <h3 className="font-semibold text-lg">{title}</h3>
            {targetPoints && <span className="text-sm text-gray-600">({targetPoints} pts)</span>}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[priority]}`}>
            {priority}
          </span>
        </div>
        {isExpanded && (
          <div className="p-4 bg-white">
            {children}
          </div>
        )}
      </div>
    );
  };

  const Requirement = ({ type, text }) => {
    const icon = type === 'must' ? <CheckCircle size={16} className="text-green-600" /> :
                 type === 'should' ? <Circle size={16} className="text-blue-600" /> :
                 <AlertCircle size={16} className="text-amber-600" />;
    const label = type === 'must' ? 'MUST' : type === 'should' ? 'SHOULD' : 'NICE';
    
    return (
      <div className="flex items-start gap-2 mb-2">
        {icon}
        <span className="text-sm">
          <span className="font-semibold">{label}:</span> {text}
        </span>
      </div>
    );
  };

  const TechSpec = ({ name, version, reason }) => (
    <div className="mb-3 pl-4 border-l-2 border-blue-300">
      <div className="font-semibold text-sm">{name} <span className="text-gray-600 font-normal">{version}</span></div>
      <div className="text-xs text-gray-600 mt-1">{reason}</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CollabCanvas - Product Requirements Document</h1>
        <p className="text-gray-600 mb-4">Foundation Shot + Iteration Roadmap</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">One-Shot Strategy</h3>
          <p className="text-sm mb-3">This PRD is designed for a single comprehensive prompt to an AI coding agent (Cursor), targeting 70-75 points with clean foundations for iteration.</p>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="bg-blue-100 p-2 rounded"><strong>SHOT-1:</strong> Foundation (this document)</div>
            <div className="bg-amber-100 p-2 rounded"><strong>SHOT-2:</strong> Performance tuning</div>
            <div className="bg-purple-100 p-2 rounded"><strong>SHOT-3:</strong> AI enhancement</div>
            <div className="bg-gray-100 p-2 rounded"><strong>FUTURE:</strong> Polish & scale</div>
          </div>
        </div>
      </div>

      <Section id="overview" title="1. Project Overview" priority="SHOT-1">
        <p className="mb-4">A real-time collaborative canvas application with AI-powered object manipulation, inspired by Figma. Users can simultaneously create, edit, and manipulate shapes, text, and other canvas objects while an AI agent assists with design tasks.</p>
        
        <h4 className="font-semibold mb-2 mt-4">Target Points Breakdown (70-75 total):</h4>
        <ul className="space-y-1 text-sm">
          <li>• Core Collaborative Infrastructure: 18-22 / 30 points</li>
          <li>• Canvas Features & Performance: 14-16 / 20 points</li>
          <li>• Advanced Features: 6-9 / 15 points</li>
          <li>• AI Canvas Agent: 15-18 / 25 points</li>
          <li>• Technical Implementation: 8-9 / 10 points</li>
          <li>• Documentation: 4-5 / 5 points</li>
        </ul>
      </Section>

      <Section id="tech" title="2. Technology Stack" priority="SHOT-1">
        <h4 className="font-semibold mb-3">Required Stack (Non-negotiable):</h4>
        
        <TechSpec 
          name="React" 
          version="18.3+" 
          reason="Component architecture, concurrent features for performance"
        />
        
        <TechSpec 
          name="Socket.io" 
          version="4.7+" 
          reason="Reliable WebSocket with fallbacks, room management, easy reconnection handling"
        />
        
        <TechSpec 
          name="Fabric.js" 
          version="5.3+" 
          reason="Battle-tested canvas library with object model, transforms, serialization. Handles 500+ objects at 60fps."
        />
        
        <TechSpec 
          name="Yjs + y-websocket" 
          version="13.6+ / 1.5+" 
          reason="CRDT for conflict-free state synchronization. Industry standard for collaborative editing."
        />
        
        <TechSpec 
          name="Express.js" 
          version="4.18+" 
          reason="Simple HTTP server for Socket.io attachment and API endpoints"
        />
        
        <TechSpec 
          name="MongoDB + Mongoose" 
          version="7.0+ / 8.0+" 
          reason="Document store for canvas persistence, user data, and session management"
        />
        
        <TechSpec 
          name="OpenAI API" 
          version="GPT-4o" 
          reason="AI agent for canvas commands. GPT-4o provides superior reasoning for complex multi-step commands and better spatial understanding for layouts. Use JSON mode (response_format: json_object) for reliable command parsing."
        />
        
        <TechSpec 
          name="Passport.js" 
          version="0.7+" 
          reason="Authentication middleware with local strategy for MVP"
        />

        <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-4">
          <p className="text-sm"><strong>Critical:</strong> Do NOT invent custom sync protocols. Use Yjs. Do NOT use Canvas API directly - use Fabric.js for object management.</p>
        </div>
      </Section>

      <Section id="arch" title="3. System Architecture" priority="SHOT-1">
        <h4 className="font-semibold mb-3">High-Level Architecture:</h4>
        
        <div className="bg-gray-50 p-4 rounded mb-4 font-mono text-xs">
          <pre>{`┌─────────────────────────────────────────────────┐
│  React Frontend (Port 3000)                     │
│  ├─ Canvas Component (Fabric.js)                │
│  ├─ Yjs Document + WebSocket Provider           │
│  ├─ User Cursors Component                      │
│  └─ AI Command Interface                        │
└──────────┬──────────────────────────────────────┘
           │ Socket.io + Yjs WebSocket
┌──────────▼──────────────────────────────────────┐
│  Express + Socket.io Server (Port 3001)         │
│  ├─ Yjs WebSocket Server                        │
│  ├─ Cursor Broadcast                            │
│  ├─ AI Command Processing                       │
│  ├─ Canvas Persistence Layer                    │
│  └─ Authentication (Passport.js)                │
└──────────┬──────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────┐
│  MongoDB                                        │
│  ├─ users (auth)                                │
│  ├─ canvases (state snapshots every 30s)       │
│  └─ sessions                                    │
└─────────────────────────────────────────────────┘`}</pre>
        </div>

        <h4 className="font-semibold mb-2 mt-4">Key Architectural Decisions:</h4>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-3">
            <strong className="text-sm">State Synchronization:</strong>
            <p className="text-sm text-gray-700">Yjs Y.Map stores canvas objects as serialized Fabric.js JSON. Each object has a unique ID. Yjs handles CRDT merge automatically.</p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-3">
            <strong className="text-sm">Cursor Broadcasting:</strong>
            <p className="text-sm text-gray-700">Separate Socket.io events for cursor position (emit every 50ms, no persistence). Format: {`{userId, x, y, color}`}</p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-3">
            <strong className="text-sm">Canvas Persistence:</strong>
            <p className="text-sm text-gray-700">Debounced save to MongoDB every 30 seconds. Full canvas state serialized from Yjs. On load, hydrate Yjs from latest snapshot.</p>
          </div>
          
          <div className="border-l-4 border-amber-500 pl-3">
            <strong className="text-sm">AI Command Flow:</strong>
            <p className="text-sm text-gray-700">Client sends command text → Server calls Claude API → Parse structured response → Server applies to Yjs → Yjs syncs to all clients</p>
          </div>
        </div>
      </Section>

      <Section id="sync" title="4. Real-Time Synchronization (Target: 18/30 pts)" priority="SHOT-1" targetPoints="18/30">
        <Requirement type="must" text="Use Yjs with y-websocket provider for object state synchronization" />
        <Requirement type="must" text="Separate Socket.io channel for cursor positions, broadcast every 50ms" />
        <Requirement type="must" text="Object operations (create, move, resize, delete) sync within 200ms under normal conditions" />
        <Requirement type="must" text="Each canvas object has UUID. Store in Yjs Y.Map with key = UUID, value = Fabric.js object JSON" />
        <Requirement type="should" text="Display active user count and list of online users" />
        <Requirement type="should" text="Show colored cursor with username label for each user" />
        
        <h4 className="font-semibold mt-4 mb-2">Implementation Checklist:</h4>
        <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
          <div>☐ Set up Yjs Y.Doc on client and y-websocket provider</div>
          <div>☐ Create Y.Map for canvas objects: ydoc.getMap('objects')</div>
          <div>☐ On Fabric object creation, serialize to JSON and add to Y.Map</div>
          <div>☐ Listen to Y.Map changes, update Fabric canvas on remote changes</div>
          <div>☐ Implement cursor broadcast with throttle (50ms)</div>
          <div>☐ Render cursor overlays outside Fabric canvas (separate SVG layer)</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded p-3 mt-4">
          <p className="text-sm"><strong>Deferred to SHOT-2:</strong> Sub-100ms sync, zero-lag optimization, stress testing with 10+ simultaneous edits</p>
        </div>
      </Section>

      <Section id="conflict" title="5. Conflict Resolution (Target: 5/9 pts)" priority="SHOT-2" targetPoints="5/9">
        <Requirement type="must" text="Document that Yjs CRDT provides automatic conflict resolution (last-write-wins on properties)" />
        <Requirement type="must" text="No ghost objects - ensure delete operations propagate correctly" />
        <Requirement type="nice" text="Visual indicator showing who last edited an object (deferred to SHOT-2)" />
        
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-3">
          <p className="text-sm"><strong>SHOT-1 Scope:</strong> Basic Yjs integration handles most conflicts automatically. Aim for 5/9 points.</p>
          <p className="text-sm mt-2"><strong>SHOT-2 Will Add:</strong> Simultaneous edit testing, rapid edit storm handling, delete vs edit conflict resolution, visual feedback. Target: 8-9/9 points.</p>
        </div>
      </Section>

      <Section id="persistence" title="6. Persistence & Reconnection (Target: 6/9 pts)" priority="SHOT-1" targetPoints="6/9">
        <Requirement type="must" text="Save full Yjs state snapshot to MongoDB every 30 seconds (debounced)" />
        <Requirement type="must" text="On canvas load, fetch latest snapshot and initialize Yjs Y.Map" />
        <Requirement type="must" text="y-websocket provider handles reconnection automatically" />
        <Requirement type="must" text="Show connection status indicator (green=connected, yellow=reconnecting, red=disconnected)" />
        <Requirement type="should" text="User refresh preserves all canvas state" />
        <Requirement type="nice" text="Queue operations during disconnect and sync on reconnect (deferred)" />
        
        <h4 className="font-semibold mt-4 mb-2">MongoDB Schema:</h4>
        <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono">
          <pre>{`const canvasSchema = new Schema({
  canvasId: { type: String, required: true, unique: true },
  name: String,
  yjsState: Buffer,  // Yjs state as binary
  lastModified: { type: Date, default: Date.now },
  createdBy: { type: ObjectId, ref: 'User' },
  collaborators: [{ type: ObjectId, ref: 'User' }]
});`}</pre>
        </div>
      </Section>

      <Section id="canvas" title="7. Canvas Features (Target: 6/8 pts)" priority="SHOT-1" targetPoints="6/8">
        <Requirement type="must" text="Implement 3 shape types: Rectangle, Circle, Triangle (Fabric.js built-ins)" />
        <Requirement type="must" text="Text tool with basic formatting (font size, color)" />
        <Requirement type="must" text="Transforms: move (drag), resize (handles), rotate (corner handle)" />
        <Requirement type="must" text="Delete selected object (Delete key)" />
        <Requirement type="must" text="Multi-select with Shift+Click" />
        <Requirement type="must" text="Pan canvas (Space+Drag) and zoom (mouse wheel)" />
        <Requirement type="should" text="Duplicate object (Cmd/Ctrl+D)" />
        
        <h4 className="font-semibold mt-4 mb-2">UI Components:</h4>
        <div className="space-y-2 text-sm">
          <div>• <strong>Toolbar:</strong> Buttons for Rectangle, Circle, Triangle, Text tools</div>
          <div>• <strong>Properties Panel:</strong> Show selected object color, size, rotation (read-only for SHOT-1)</div>
          <div>• <strong>Zoom Controls:</strong> Buttons for Zoom In, Zoom Out, Fit to Screen</div>
        </div>
      </Section>

      <Section id="performance" title="8. Performance (Target: 8/12 pts)" priority="SHOT-2" targetPoints="8/12">
        <Requirement type="must" text="Render at 60 FPS with up to 100 objects" />
        <Requirement type="must" text="Support 2-3 concurrent users without noticeable lag" />
        <Requirement type="nice" text="Optimize for 300+ objects and 5+ users (SHOT-2 target)" />
        
        <h4 className="font-semibold mt-4 mb-2">Performance Best Practices (SHOT-1):</h4>
        <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
          <div>☐ Use Fabric.js object caching: set objectCaching: true</div>
          <div>☐ Throttle Yjs updates to 100ms for drag operations</div>
          <div>☐ Throttle cursor broadcasts to 50ms</div>
          <div>☐ Disable Fabric.js selection updates during drag (update on mouseup)</div>
          <div>☐ Use React.memo for UI components that don't change often</div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-3">
          <p className="text-sm"><strong>SHOT-2 Optimizations:</strong> Canvas virtualization, object pooling, WebGL renderer investigation, load testing with 500+ objects</p>
        </div>
      </Section>

      <Section id="advanced" title="9. Advanced Features (Target: 6/15 pts)" priority="SHOT-1" targetPoints="6/15">
        <h4 className="font-semibold mb-2">Select Exactly 3 Tier-1 Features:</h4>
        
        <Requirement type="must" text="Color Picker: Show palette with 8 preset colors + custom picker. Store recent 5 colors in localStorage." />
        <Requirement type="must" text="Undo/Redo: Use Yjs UndoManager. Wire to Cmd+Z / Cmd+Shift+Z." />
        <Requirement type="must" text="Keyboard Shortcuts: Delete (Del), Arrow keys to nudge selected object 10px, Cmd+D to duplicate." />
        
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
          <p className="text-sm"><strong>Why these 3?</strong> Color picker and shortcuts are quick wins that improve UX significantly. Undo/redo is partially handled by Yjs.</p>
        </div>

        <h4 className="font-semibold mb-2 mt-4">Future Features (SHOT-3+):</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• Export as PNG (Tier 1, +2 pts)</div>
          <div>• Layers panel (Tier 2, +3 pts)</div>
          <div>• Alignment tools (Tier 2, +3 pts)</div>
          <div>• Z-index management (Tier 2, +3 pts)</div>
        </div>
      </Section>

      <Section id="ai" title="10. AI Canvas Agent (Target: 15/25 pts)" priority="SHOT-1" targetPoints="15/25">
        <Requirement type="must" text="Implement 8 distinct AI commands covering all 4 categories" />
        <Requirement type="must" text="AI command input: text box at bottom of screen, send button" />
        <Requirement type="must" text="Commands execute within 3 seconds" />
        <Requirement type="must" text="Show loading state while AI processes command" />
        <Requirement type="must" text="AI-created objects sync to all users via Yjs" />
        
        <h4 className="font-semibold mt-4 mb-2">Required Commands (8 minimum):</h4>
        
        <div className="space-y-3 mt-3">
          <div className="border-l-4 border-green-500 pl-3">
            <strong className="text-sm">Creation (2 required):</strong>
            <div className="text-sm space-y-1 mt-1">
              <div>1. "Create a red circle at 200, 300"</div>
              <div>2. "Add text that says 'Hello World'"</div>
            </div>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-3">
            <strong className="text-sm">Manipulation (2 required):</strong>
            <div className="text-sm space-y-1 mt-1">
              <div>3. "Move the circle to the center"</div>
              <div>4. "Make the rectangle twice as wide"</div>
            </div>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-3">
            <strong className="text-sm">Layout (2 required):</strong>
            <div className="text-sm space-y-1 mt-1">
              <div>5. "Arrange all rectangles in a horizontal row"</div>
              <div>6. "Space these three circles evenly"</div>
            </div>
          </div>
          
          <div className="border-l-4 border-amber-500 pl-3">
            <strong className="text-sm">Complex (2 required):</strong>
            <div className="text-sm space-y-1 mt-1">
              <div>7. "Create a login form" (username label + input field, password label + input field, submit button - all properly aligned)</div>
              <div>8. "Make a navigation bar with Home, About, Contact" (centered horizontally with even spacing)</div>
              <div className="text-xs text-gray-600 mt-2">Note: GPT-4o excels at these multi-element layouts with its superior spatial reasoning</div>
            </div>
          </div>
        </div>

        <h4 className="font-semibold mt-4 mb-2">AI Implementation Architecture:</h4>
        <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono">
          <pre>{`// Server-side command processing with OpenAI GPT-4o
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function processAICommand(command, canvasState) {
  const systemPrompt = \`You are an expert canvas design assistant with strong spatial reasoning.
You help users create, modify, and arrange visual elements on a canvas.

Canvas dimensions: 800x600
Canvas center: (400, 300)

When creating layouts:
- Consider visual hierarchy and spacing
- Use pleasant, harmonious colors
- Ensure proper alignment and distribution
- Create professional-looking compositions

Always respond with valid JSON matching the schema provided.\`;

  const userPrompt = \`Current canvas state:
\${JSON.stringify(canvasState, null, 2)}

User command: "\${command}"

Respond with JSON following this exact schema:
{
  "action": "create" | "modify" | "delete" | "arrange",
  "objects": [
    {
      "id": "uuid-for-new-objects-or-existing-id",
      "type": "rect" | "circle" | "triangle" | "text",
      "x": number,
      "y": number,
      "width": number (for rect/triangle),
      "height": number (for rect/triangle),
      "radius": number (for circles),
      "fill": "#hexcolor",
      "text": "content" (required for text objects),
      "fontSize": number (for text, default 16)
    }
  ],
  "modifications": {
    "existing-object-id": {
      "x": number,
      "y": number,
      "width": number,
      "fill": "#color"
      // any properties to update
    }
  },
  "deletions": ["object-id-to-delete"],
  "explanation": "Brief, friendly description of what you did"
}

Guidelines:
- For CREATE: Generate new UUIDs and place objects thoughtfully
- For MODIFY: Reference existing object IDs and update specific properties
- For ARRANGE: Calculate new positions for proper spacing/alignment
- For DELETE: Identify objects to remove by ID
- Use standard web colors or hex codes
- Text should be readable (16-24px font size)
- Rectangles/triangles: 80-200px dimensions
- Circles: 30-100px radius
- Consider the existing canvas layout when adding new elements\`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 3000
  });
  
  const result = JSON.parse(response.choices[0].message.content);
  
  // Validate result has required structure
  if (!result.action || !result.objects) {
    throw new Error('Invalid AI response structure');
  }
  
  return result;
}`}</pre>
        </div>

        <div className="bg-red-50 border border-red-200 rounded p-3 mt-4">
          <p className="text-sm"><strong>Deferred to SHOT-3:</strong> Sub-2s responses (GPT-4o typically 1.5-2.5s), 90%+ accuracy, advanced multi-step planning with chain-of-thought reasoning, context-aware suggestions. SHOT-1 aims for 70-80% accuracy with 2-3s response time = 15/25 pts.</p>
        </div>
      </Section>

      <Section id="auth" title="11. Authentication (Target: 4/5 pts)" priority="SHOT-1" targetPoints="4/5">
        <Requirement type="must" text="Local authentication with email + password (Passport.js)" />
        <Requirement type="must" text="Hash passwords with bcrypt" />
        <Requirement type="must" text="Express sessions with express-session + connect-mongo" />
        <Requirement type="must" text="Protected routes: require authentication for canvas access" />
        <Requirement type="must" text="Login page, Register page, Logout functionality" />
        <Requirement type="nice" text="Password reset flow (defer to future)" />
        
        <h4 className="font-semibold mt-4 mb-2">User Schema:</h4>
        <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono">
          <pre>{`const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hash
  username: { type: String, required: true },
  color: { type: String, default: '#3B82F6' }, // for cursor
  createdAt: { type: Date, default: Date.now }
});`}</pre>
        </div>
      </Section>

      <Section id="testing" title="12. Testing Scenarios" priority="SHOT-2">
        <p className="text-sm text-gray-600 mb-3">These scenarios should be manually tested after SHOT-1 completion. Document results in README.</p>
        
        <h4 className="font-semibold mb-2">SHOT-1 Testing:</h4>
        <div className="space-y-2 text-sm">
          <div>☐ <strong>Basic Sync:</strong> User A creates rectangle, User B sees it within 1 second</div>
          <div>☐ <strong>Multi-select:</strong> User A shift-clicks 3 objects, can move them together</div>
          <div>☐ <strong>Persistence:</strong> User creates 5 objects, refreshes browser, objects persist</div>
          <div>☐ <strong>AI Command:</strong> Type "create a red circle", circle appears on canvas</div>
          <div>☐ <strong>Cursor Sync:</strong> Move mouse, see cursor on other user's screen</div>
        </div>

        <h4 className="font-semibold mb-2 mt-4">SHOT-2 Testing (Performance & Conflicts):</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div>☐ Simultaneous move: 2 users drag same object → consistent final state</div>
          <div>☐ Edit storm: 3 users modify same object rapidly → no corruption</div>
          <div>☐ Delete vs edit: User A deletes while User B edits → graceful handling</div>
          <div>☐ Load test: 300 objects at 60 FPS, 5 concurrent users</div>
        </div>
      </Section>

      <Section id="docs" title="13. Documentation Requirements" priority="SHOT-1">
        <Requirement type="must" text="README.md with project description, setup instructions, tech stack list" />
        <Requirement type="must" text="List all dependencies with versions" />
        <Requirement type="must" text="Step-by-step local setup: npm install, env vars, MongoDB setup, npm run dev" />
        <Requirement type="must" text="Architecture diagram (can be ASCII art or Mermaid)" />
        <Requirement type="must" text="Document Yjs integration and why it was chosen" />
        <Requirement type="should" text="API endpoint documentation for AI commands" />
        
        <h4 className="font-semibold mt-4 mb-2">README.md Template:</h4>
        <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono">
          <pre>{`# CollabCanvas

Real-time collaborative canvas with AI assistance.

## Tech Stack
- React 18.3 + Fabric.js 5.3
- Socket.io 4.7 + Yjs 13.6
- Express 4.18 + MongoDB 7.0
- Claude 3.5 Sonnet API

## Architecture
[Include diagram from PRD Section 3]

## Local Setup
1. \`npm install\` in root and client folders
2. Create \`.env\`: MONGODB_URI, ANTHROPIC_API_KEY
3. \`npm run dev\` starts server (3001) and client (3000)

## Features Implemented
- [x] Real-time sync with Yjs CRDT
- [x] 3 shape types + text
- [x] Multi-user cursors
- [x] 8 AI commands
- [x] Undo/redo, color picker, shortcuts

## Testing
[Results from Section 12]`}</pre>
        </div>
      </Section>

      <Section id="deployment" title="14. Deployment" priority="FUTURE">
        <p className="text-sm text-gray-600 mb-3">Defer to post-SHOT-1. Use Render, Railway, or Vercel for quick deployment.</p>
        
        <Requirement type="nice" text="Deploy to Render: separate web service for Express, free MongoDB Atlas" />
        <Requirement type="nice" text="Environment variables for production (MONGODB_URI, SESSION_SECRET, ANTHROPIC_API_KEY)" />
        <Requirement type="nice" text="HTTPS required for Socket.io secure websockets" />
      </Section>

      <Section id="tasks" title="15. Implementation Task Breakdown" priority="SHOT-1">
        <p className="text-sm text-gray-600 mb-3">Ordered checklist for systematic implementation. Each task is independently testable.</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Phase 1: Project Setup (30 min)</h4>
            <div className="space-y-1 text-sm pl-4">
              <div>☐ Initialize React app with Vite</div>
              <div>☐ Set up Express server with Socket.io</div>
              <div>☐ Configure MongoDB connection with Mongoose</div>
              <div>☐ Install all dependencies from tech stack section</div>
              <div>☐ Create .env.example with required variables</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Phase 2: Authentication (1 hour)</h4>
            <div className="space-y-1 text-sm pl-4">
              <div>☐ Create User model with bcrypt password hashing</div>
              <div>☐ Set up Passport.js local strategy</div>
              <div>☐ Implement express-session with connect-mongo store</div>
              <div>☐ Create /api/register, /api/login, /api/logout endpoints</div>
              <div>☐ Build Login and Register UI components</div>
              <div>☐ Implement protected route middleware</div>
              <div>☐ Test: Register user, login, access protected canvas route</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Phase 3: Canvas Foundation (1.5 hours)</h4>
            <div className="space-y-1 text-sm pl-4">
              <div>☐ Create Canvas component with Fabric.js initialization</div>
              <div>☐ Implement toolbar with Rectangle, Circle, Triangle, Text buttons</div>
              <div>☐ Wire tool buttons to Fabric.js object creation</div>
              <div>☐ Add object selection, drag, resize, rotate handlers</div>
              <div>☐ Implement Delete key handler</div>
              <div>☐ Add pan (Space+Drag) and zoom (mouse wheel) controls</div>
              <div>☐ Test: Create, select, move, resize, delete objects locally</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Phase 4: Yjs Integration (2 hours)</h4>
            <div className="space-y-1 text-sm pl-4">
              <div>☐ Set up Yjs Y.Doc on client</div>
              <div>☐ Create y-websocket provider connecting to server</div>
              <div>☐ Set up Yjs WebSocket server in Express</div>
              <div>☐ Create Y.Map('objects') for canvas state</div>
              <div>☐ On Fabric object add: serialize to JSON, add to Y.Map with UUID key</div>
              <div>☐ Listen to Y.Map.observe(): on remote changes, update Fabric canvas</div>
              <div>☐ On Fabric object modified: update corresponding Y.Map entry</div>
              <div>☐ On Fabric object deleted: delete from Y.Map</div>
              <div>☐ Test: Open two browsers, create object in one, see in other</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Phase 5: Cursor Synchronization (1 hour)</h4>
            <div className="space-y-1 text-sm pl-4">
              <div>☐ Set up Socket.io room joining when user enters canvas</div>
              <div>☐ Emit 'cursor-move' event on mousemove (throttled to 50ms)</div>
              <div>☐ Server broadcasts cursor position to all users in room</div>
              <div>☐ Create CursorOverlay component (SVG layer above canvas)</div>
              <div>☐ Render cursor dot + username label for each remote user</div>
              <div>☐ Assign random color to each user on join</div>
              <div>☐ Test: Move mouse, see cursor appear on other user's screen</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Phase 6: Persistence (1 hour)</h4>
            <div className="space-y-1 text-sm pl-4">
              <div>☐ Create Canvas model in MongoDB</div>
              <div>☐ Implement debounced save: serialize Yjs state to Buffer every 30s</div>
              <div>☐ Create /api/canvas/:id endpoint to fetch canvas data</div>
              <div>☐ On canvas load: fetch from MongoDB, apply to Y.Doc</div>
              <div>☐ Add connection status indicator component</div>
              <div>☐ Test: Create objects, wait 30s, refresh, objects persist</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Phase 7: Advanced Features (1.5 hours)</h4>
            <div className="space-y-1 text-sm pl-4">
              <div>☐ <strong>Color Picker:</strong> Add color picker component with 8 presets</div>
              <div>☐ Store recent 5 colors in localStorage</div>
              <div>☐ Wire to selected object fill color</div>
              <div>☐ <strong>Undo/Redo:</strong> Set up Yjs.UndoManager</div>
              <div>☐ Wire Cmd+Z to undo, Cmd+Shift+Z to redo</div>
              <div>☐ <strong>Keyboard Shortcuts:</strong> Delete key (done), Arrow keys for nudge</div>
              <div>☐ Cmd+D for duplicate object</div>
              <div>☐ Test: Change colors, undo, redo, use all shortcuts</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Phase 8: AI Agent (2.5 hours)</h4>
            <div className="space-y-1 text-sm pl-4">
              <div>☐ Create AI command input component at bottom of canvas</div>
              <div>☐ Set up Anthropic API client on server with API key</div>
              <div>☐ Create /api/ai-command endpoint</div>
              <div>☐ Build prompt template with canvas state context</div>
              <div>☐ Parse Claude's JSON response into Fabric.js objects</div>
              <div>☐ Apply AI-generated objects to Yjs Y.Map (syncs to all users)</div>
              <div>☐ Implement 8 command handlers (see Section 10)</div>
              <div>☐ Add loading spinner during AI processing</div>
              <div>☐ Show AI explanation message after execution</div>
              <div>☐ Test: All 8 commands execute and create correct objects</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Phase 9: Polish & Documentation (1 hour)</h4>
            <div className="space-y-1 text-sm pl-4">
              <div>☐ Add multi-select with Shift+Click</div>
              <div>☐ Implement zoom controls UI (buttons + display)</div>
              <div>☐ Add active user count display</div>
              <div>☐ Write comprehensive README.md</div>
              <div>☐ Document architecture and tech choices</div>
              <div>☐ Create .env.example with all required variables</div>
              <div>☐ Run through all testing scenarios from Section 12</div>
              <div>☐ Fix any critical bugs found during testing</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded p-4 mt-4">
          <p className="font-semibold mb-2">Total Estimated Time: 12-14 hours</p>
          <p className="text-sm">This is achievable as a foundation shot. The phased approach allows for incremental testing and debugging.</p>
        </div>
      </Section>

      <Section id="prompting" title="16. Prompt Engineering for Cursor" priority="SHOT-1">
        <h4 className="font-semibold mb-3">How to Use This PRD with Cursor:</h4>
        
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <p className="text-sm font-semibold mb-2">Master Prompt Template:</p>
          <div className="bg-white p-3 rounded text-xs font-mono">
            <pre>{`I need you to build a real-time collaborative canvas application called CollabCanvas. 

**Context**: This is for a project graded on a 100-point rubric. I'm targeting 70-75 points with this initial implementation, focusing on solid foundations that can be iterated on.

**Complete Requirements**: [Paste entire PRD sections 2-15]

**Critical Implementation Rules**:
1. Use EXACTLY the tech stack specified in Section 2. Do not substitute.
2. Follow the architecture in Section 3 precisely.
3. Implement tasks in order from Section 15.
4. After each phase, create a git commit with descriptive message.
5. Write clean, commented code with clear separation of concerns.
6. Include error handling and loading states.
7. Test each phase before moving to next.

**Deliverables**:
- Working React + Express application
- All authentication flows functional
- Canvas with 3 shapes + text, all transforms working
- Real-time sync with Yjs (2-3 users, 100 objects)
- Cursor synchronization
- 8 AI commands working
- 3 advanced features (color picker, undo/redo, shortcuts)
- MongoDB persistence with 30s autosave
- Comprehensive README.md

**What NOT to do**:
- Don't create custom sync protocols - use Yjs
- Don't use Canvas API directly - use Fabric.js
- Don't skip error handling
- Don't add features beyond what's specified
- Don't optimize prematurely - focus on working implementation

Start with Phase 1: Project Setup. After completing each phase, summarize what was built and any issues encountered.`}</pre>
          </div>
        </div>

        <h4 className="font-semibold mb-2 mt-4">Phase-by-Phase Prompting Strategy:</h4>
        <p className="text-sm text-gray-600 mb-3">If the one-shot approach doesn't work perfectly, break it down:</p>
        
        <div className="space-y-2 text-sm">
          <div><strong>Prompt 1:</strong> "Complete Phases 1-2 (Setup + Auth). Stop after authentication is working."</div>
          <div><strong>Prompt 2:</strong> "Complete Phase 3 (Canvas Foundation). Ensure all tools work locally before proceeding."</div>
          <div><strong>Prompt 3:</strong> "Complete Phase 4 (Yjs Integration). Test with two browser windows."</div>
          <div><strong>Prompt 4:</strong> "Complete Phases 5-6 (Cursors + Persistence)."</div>
          <div><strong>Prompt 5:</strong> "Complete Phase 7 (Advanced Features)."</div>
          <div><strong>Prompt 6:</strong> "Complete Phase 8 (AI Agent). Implement all 8 commands."</div>
          <div><strong>Prompt 7:</strong> "Complete Phase 9 (Polish + Docs). Run all tests."</div>
        </div>

        <h4 className="font-semibold mb-2 mt-4">Debugging Prompts:</h4>
        <div className="bg-amber-50 border border-amber-200 rounded p-3">
          <p className="text-sm mb-2">If something breaks during implementation:</p>
          <div className="space-y-1 text-xs">
            <div>"The Yjs sync isn't working. Objects created in one browser don't appear in another. Debug the Y.Map integration."</div>
            <div>"Cursors aren't showing up. Check the Socket.io event listeners and cursor rendering."</div>
            <div>"AI commands return errors. Show me the Claude API response and parsing logic."</div>
            <div>"Canvas is laggy. Profile the performance and suggest optimizations within SHOT-1 scope."</div>
          </div>
        </div>
      </Section>

      <Section id="iteration" title="17. Iteration Roadmap (SHOT-2 & SHOT-3)" priority="FUTURE">
        <h4 className="font-semibold mb-3">SHOT-2: Performance & Conflict Resolution (Target: +10-12 points)</h4>
        <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-4">
          <p className="text-sm font-semibold mb-2">Focus Areas:</p>
          <div className="space-y-2 text-sm">
            <div><strong>Real-Time Sync:</strong> Optimize to sub-100ms. Investigate throttling strategies, batch updates, delta compression.</div>
            <div><strong>Conflict Resolution:</strong> Implement and test all scenarios from rubric. Add visual feedback for edit conflicts.</div>
            <div><strong>Performance:</strong> Load test with 300-500 objects, 5+ users. Implement canvas virtualization if needed.</div>
            <div><strong>Reconnection:</strong> Queue operations during disconnect, sync on reconnect without data loss.</div>
          </div>
          <p className="text-sm mt-3"><strong>Target:</strong> 85-87 total points (up from 70-75)</p>
        </div>

        <h4 className="font-semibold mb-3">SHOT-3: AI Enhancement & Features (Target: +8-10 points)</h4>
        <div className="bg-purple-50 border border-purple-200 rounded p-4">
          <p className="text-sm font-semibold mb-2">Focus Areas:</p>
          <div className="space-y-2 text-sm">
            <div><strong>AI Response Time:</strong> Optimize to sub-2s with prompt caching, streaming responses, and parallel processing.</div>
            <div><strong>AI Accuracy:</strong> Improve to 90%+ with few-shot examples, chain-of-thought prompting, and iterative refinement.</div>
            <div><strong>Complex Commands:</strong> Add multi-step reasoning. "Create a modern dashboard" should produce charts, cards, and navigation. GPT-4o's spatial reasoning enables sophisticated layouts.</div>
            <div><strong>Context Awareness:</strong> AI suggests complementary elements based on existing canvas ("This would look better with a title").</div>
            <div><strong>Additional Features:</strong> Add 1-2 Tier 2 features (layers panel, alignment tools, export to PNG).</div>
          </div>
          <p className="text-sm mt-3"><strong>Target:</strong> 92-98 total points (A/A+ range)</p>
        </div>

        <h4 className="font-semibold mb-3 mt-4">Future Enhancements (Beyond A Grade):</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div>• Export to PNG/SVG</div>
          <div>• Version history with time-travel</div>
          <div>• Collaborative comments on objects</div>
          <div>• Component/symbol system</div>
          <div>• Advanced blend modes and effects</div>
          <div>• Mobile-responsive canvas</div>
        </div>
      </Section>

      <Section id="risks" title="18. Risk Mitigation" priority="SHOT-1">
        <h4 className="font-semibold mb-3">Known Risks & Mitigation Strategies:</h4>
        
        <div className="space-y-3">
          <div className="border-l-4 border-red-500 pl-3">
            <strong className="text-sm">Risk: Yjs learning curve</strong>
            <p className="text-sm text-gray-700 mt-1"><strong>Mitigation:</strong> Use official Yjs examples as reference. Start with simple Y.Map operations. Don't customize Yjs internals.</p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-3">
            <strong className="text-sm">Risk: Fabric.js + Yjs integration complexity</strong>
            <p className="text-sm text-gray-700 mt-1"><strong>Mitigation:</strong> Serialize Fabric objects to JSON immediately on change. Keep Fabric as rendering layer only, Yjs as source of truth.</p>
          </div>
          
          <div className="border-l-4 border-yellow-500 pl-3">
            <strong className="text-sm">Risk: AI command parsing failures</strong>
            <p className="text-sm text-gray-700 mt-1"><strong>Mitigation:</strong> Use Claude's structured output mode. Provide clear JSON schema in prompt. Implement fallback error messages.</p>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-3">
            <strong className="text-sm">Risk: Performance degradation with multiple users</strong>
            <p className="text-sm text-gray-700 mt-1"><strong>Mitigation:</strong> Throttle all network operations (Yjs updates: 100ms, cursors: 50ms). Use Fabric object caching. Defer optimization to SHOT-2.</p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-3">
            <strong className="text-sm">Risk: MongoDB connection issues in development</strong>
            <p className="text-sm text-gray-700 mt-1"><strong>Mitigation:</strong> Use MongoDB Atlas free tier for consistency. Include clear setup instructions. Provide connection error handling.</p>
          </div>
        </div>
      </Section>

      <Section id="success" title="19. Definition of Success (SHOT-1)" priority="SHOT-1">
        <h4 className="font-semibold mb-3">SHOT-1 is successful if:</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Two users can simultaneously create, move, and edit objects with visible sync</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Cursor positions update in near real-time (under 200ms)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Canvas state persists across page refreshes</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>All 8 AI commands execute and create correct objects</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>3 shape types + text with full transforms work smoothly</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Color picker, undo/redo, and keyboard shortcuts all functional</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Authentication prevents unauthorized canvas access</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>README allows another developer to run the project locally</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>No critical bugs that prevent core functionality</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Code is clean, organized, and uses specified tech stack</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded p-4 mt-4">
          <p className="text-sm"><strong>Expected Rubric Score:</strong> 70-75 points</p>
          <p className="text-sm mt-2">This provides a solid B/B+ foundation with clear paths to optimize to A grade through SHOT-2 and SHOT-3.</p>
        </div>
      </Section>

      <Section id="appendix" title="20. Appendix: Environment Variables" priority="SHOT-1">
        <h4 className="font-semibold mb-3">.env.example:</h4>
        <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono">
          <pre>{`# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/collabcanvas
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collabcanvas

# Session
SESSION_SECRET=your-secret-key-change-in-production

# OpenAI API
OPENAI_API_KEY=sk-proj-xxxxx

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# Yjs WebSocket
YJS_WS_PORT=1234`}</pre>
        </div>

        <h4 className="font-semibold mb-3 mt-4">package.json scripts:</h4>
        <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono">
          <pre>{`{
  "scripts": {
    "dev": "concurrently \\"npm run server\\" \\"npm run client\\"",
    "server": "cd server && nodemon index.js",
    "client": "cd client && npm run dev",
    "build": "cd client && npm run build",
    "start": "cd server && node index.js"
  }
}`}</pre>
        </div>
      </Section>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-3">🎯 Next Steps</h3>
        <ol className="space-y-2 text-sm">
          <li><strong>1.</strong> Review this entire PRD with your team/instructor if needed</li>
          <li><strong>2.</strong> Set up your development environment (MongoDB, Node.js, etc.)</li>
          <li><strong>3.</strong> Copy the master prompt from Section 16 into Cursor</li>
          <li><strong>4.</strong> Paste this entire PRD into the prompt context</li>
          <li><strong>5.</strong> Let Cursor build Phase 1, then review before continuing</li>
          <li><strong>6.</strong> Test each phase incrementally as it's built</li>
          <li><strong>7.</strong> Document any deviations or issues for SHOT-2 planning</li>
        </ol>
        
        <p className="mt-4 text-sm font-semibold">Estimated Development Time: 12-14 hours with AI assistance</p>
      </div>
    </div>
  );
};

export default CollabCanvasPRD;