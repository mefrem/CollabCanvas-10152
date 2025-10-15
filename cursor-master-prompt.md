## Master Prompt for Cursor

I need you to build a production-ready real-time collaborative canvas application called **CollabCanvas**. This is a graded project worth 100 points, and I'm targeting **70-75 points** with this initial implementation.

### Context & Constraints

**Grading Rubric**: This project is evaluated on:

- Real-time synchronization (30 pts)
- Canvas features (20 pts)
- Advanced Figma-inspired features (15 pts)
- AI canvas agent (25 pts)
- Technical implementation (10 pts)

**My Strategy**: Build a solid foundation in one shot that can be iteratively improved. Focus on working implementations over premature optimization.

**Complete Requirements Document**: I've attached a comprehensive PRD that specifies everything. Read it carefully before starting.

---

### Critical Implementation Rules

#### 1. EXACT Tech Stack (Non-Negotiable)

Use these exact versions - do NOT substitute or use alternatives:

- **React 18.3+** (Vite for tooling)
- **Fabric.js 5.3+** (for canvas rendering)
- **Socket.io 4.7+** (for WebSocket communication)
- **Yjs 13.6+ with y-websocket 1.5+** (for CRDT state sync)
- **Express.js 4.18+** (backend server)
- **MongoDB 7.0+ with Mongoose 8.0+** (database)
- **OpenAI API** (GPT-4o for superior reasoning)
- **Passport.js 0.7+** (authentication)

#### 2. Architecture Requirements

- Follow the architecture diagram in the PRD Section 3 exactly
- Yjs Y.Map is the source of truth for canvas state
- Fabric.js is ONLY for rendering - never the source of truth
- Cursor positions use separate Socket.io events (not Yjs)
- Canvas state persists to MongoDB every 30 seconds (debounced)

#### 3. Do NOT

- ❌ Create custom synchronization protocols - use Yjs
- ❌ Use HTML Canvas API directly - use Fabric.js
- ❌ Skip error handling or loading states
- ❌ Add features not specified in the PRD
- ❌ Optimize prematurely - focus on working code first
- ❌ Use localStorage or sessionStorage for canvas state
- ❌ Implement real-time collaborative text editing (out of scope)

#### 4. DO

- ✅ Follow the task breakdown in PRD Section 15 sequentially
- ✅ Create git commits after each phase
- ✅ Add clear code comments explaining Yjs integration points
- ✅ Include error handling for network failures
- ✅ Test each phase before proceeding to next
- ✅ Write clean, modular code with separation of concerns
- ✅ Create loading states for async operations (AI commands, auth, etc.)

---

### Implementation Plan

Work through these phases **in order**. After each phase, create a git commit and verify functionality before continuing.

#### Phase 1: Project Setup (30 min)

- Initialize React app with Vite
- Set up Express server with Socket.io
- Configure MongoDB connection
- Install all dependencies from PRD Section 2
- Create `.env.example` with all required variables
- Set up basic folder structure:
  ```
  /client (React)
  /server (Express)
  ```

**Test**: Server runs on 3001, client runs on 3000, MongoDB connects successfully.

---

#### Phase 2: Authentication (1 hour)

- Create User model with email, password (bcrypt hashed), username, color
- Set up Passport.js local strategy
- Implement express-session with connect-mongo store
- Create endpoints: `/api/register`, `/api/login`, `/api/logout`
- Build Login and Register UI components
- Protected route middleware for canvas access
- Assign random cursor color to user on registration

**Test**: Register new user → Login → Access protected route → Logout.

---

#### Phase 3: Canvas Foundation (1.5 hours)

- Create Canvas component with Fabric.js initialization (800x600 canvas)
- Implement toolbar with buttons: Rectangle, Circle, Triangle, Text
- Wire tool buttons to create Fabric objects with default properties:
  - Rectangle: 100x100, random color
  - Circle: radius 50, random color
  - Triangle: 100x100, random color
  - Text: "Double click to edit", 16px font
- Add object selection, drag, resize, rotate (Fabric built-ins)
- Implement Delete key handler
- Pan canvas with Space+Drag
- Zoom with mouse wheel (0.5x to 3x range)
- Multi-select with Shift+Click

**Test**: Create multiple shapes → Select → Move → Resize → Rotate → Delete → Pan/Zoom all work smoothly.

---

#### Phase 4: Yjs Real-Time Sync (2 hours)

**This is the most critical phase. Follow these steps exactly:**

**Client-side:**

1. Create Yjs Y.Doc in Canvas component
2. Set up y-websocket provider connecting to ws://localhost:1234
3. Get Y.Map reference: `const objectsMap = ydoc.getMap('objects')`
4. When Fabric object is added:
   - Generate UUID for object
   - Serialize Fabric object to JSON: `obj.toJSON()`
   - Add to Y.Map: `objectsMap.set(uuid, fabricJSON)`
5. Listen to Y.Map changes:
   ```javascript
   objectsMap.observe((event) => {
     event.changes.keys.forEach((change, key) => {
       if (change.action === "add" || change.action === "update") {
         // Deserialize and add/update in Fabric canvas
       } else if (change.action === "delete") {
         // Remove from Fabric canvas
       }
     });
   });
   ```
6. When Fabric object is modified (moved, resized, etc.):
   - Update corresponding Y.Map entry with new JSON
7. When Fabric object is deleted:
   - Remove from Y.Map: `objectsMap.delete(uuid)`

**Server-side:**

1. Set up Yjs WebSocket server on port 1234
2. Use y-websocket's built-in server (see Yjs docs)

**Critical Details:**

- Store UUID as a property on each Fabric object: `obj.uuid = uuid`
- Prevent infinite loops: Add a flag when updating from Yjs to prevent re-broadcasting
- Throttle Yjs updates during drag operations (update on mouseup, not mousemove)

**Test**:

- Open two browser windows
- Create object in window 1 → Appears in window 2 within 1 second
- Move object in window 2 → Updates in window 1
- Delete in window 1 → Disappears in window 2

---

#### Phase 5: Cursor Synchronization (1 hour)

**Client-side:**

1. On Canvas component mount, emit `join-canvas` with userId and canvasId
2. Track mouse position on `mousemove` event
3. Throttle to 50ms, emit `cursor-move` event with `{x, y, userId}`
4. Listen to `cursor-update` event from server
5. Store remote cursor positions in state: `{userId: {x, y, color, username}}`
6. Create CursorOverlay component (SVG layer positioned absolutely over canvas)
7. Render cursor dot + username label for each remote user

**Server-side:**

1. On `join-canvas`, add socket to room based on canvasId
2. Broadcast user join to room with user info (userId, username, color)
3. On `cursor-move`, broadcast to all other users in room

**Test**: Move mouse → See cursor with your username on other user's screen.

---

#### Phase 6: Persistence (1 hour)

**Database Schema:**

```javascript
const canvasSchema = new Schema({
  canvasId: String (unique),
  name: String,
  yjsState: Buffer,  // Y.encodeStateAsUpdate(ydoc)
  lastModified: Date,
  createdBy: ObjectId (ref User),
  collaborators: [ObjectId]
});
```

**Implementation:**

1. Create Canvas model
2. Debounce canvas save: Wait 30 seconds after last change
3. On save: `const state = Y.encodeStateAsUpdate(ydoc)` → Save to MongoDB
4. Create `/api/canvas/:canvasId` GET endpoint
5. On canvas load:
   - Fetch canvas from MongoDB
   - Apply state to Y.Doc: `Y.applyUpdate(ydoc, state)`
6. Add connection status indicator component (colored dot + text)
7. y-websocket provider handles reconnection automatically

**Test**: Create objects → Wait 30s → Refresh browser → Objects persist.

---

#### Phase 7: Advanced Features (1.5 hours)

**Color Picker (Tier 1):**

- Add color picker component (use HTML input type="color" + preset palette)
- 8 preset colors: red, blue, green, yellow, purple, orange, pink, black
- Store last 5 used colors in localStorage
- Apply color to selected object's fill property
- Update Yjs when color changes

**Undo/Redo (Tier 1):**

- Set up Yjs.UndoManager: `const undoManager = new Y.UndoManager(objectsMap)`
- Wire Cmd+Z to `undoManager.undo()`
- Wire Cmd+Shift+Z to `undoManager.redo()`
- Add undo/redo buttons in toolbar

**Keyboard Shortcuts (Tier 1):**

- Delete key: Already implemented
- Arrow keys: Move selected object 10px in direction
- Cmd/Ctrl+D: Duplicate selected object (create copy with offset position)

**Test**: Change colors → Undo → Redo. Use all keyboard shortcuts.

---

#### Phase 8: AI Canvas Agent (2.5 hours)

**UI:**

1. Create AI command input component at bottom of screen
2. Text input + "Send" button
3. Loading spinner while processing
4. Result message display ("Created a red circle at 200, 300")

**Server Endpoint:** `/api/ai-command`
Request body: `{command: string, canvasState: array of objects}`

**OpenAI GPT-4o API Integration:**

```javascript
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Enhanced system prompt for GPT-4o's superior reasoning
const systemPrompt = `You are an expert canvas design assistant with strong spatial reasoning and design principles knowledge.

Canvas specifications:
- Dimensions: 800x600 pixels
- Center point: (400, 300)
- Coordinate system: Top-left is (0, 0)

When executing commands:
1. Consider visual hierarchy and composition
2. Apply proper spacing and alignment principles
3. Use harmonious color palettes
4. Create balanced, professional layouts
5. Think about user experience and readability

For complex multi-element commands (forms, navigation, dashboards):
- Plan the layout before generating objects
- Ensure consistent spacing and alignment
- Use appropriate sizes for different element types
- Consider grouping and visual relationships

Always respond with valid JSON matching the exact schema provided.`;

const userPrompt = `Current canvas state:
${JSON.stringify(canvasState, null, 2)}

User command: "${command}"

Respond with JSON following this exact schema:
{
  "action": "create" | "modify" | "arrange" | "delete",
  "objects": [
    {
      "id": "uuid-v4-string",
      "type": "rect" | "circle" | "triangle" | "text",
      "x": number,
      "y": number,
      "width": number (required for rect/triangle),
      "height": number (required for rect/triangle),
      "radius": number (required for circles),
      "fill": "#hexcolor",
      "text": "content" (required for text type),
      "fontSize": number (for text, 12-24 range),
      "stroke": "#hexcolor" (optional border color),
      "strokeWidth": number (optional, 1-5)
    }
  ],
  "modifications": {
    "existing-object-uuid": {
      "x": 100,
      "y": 200,
      "fill": "#ff0000"
      // any properties to update
    }
  },
  "deletions": ["uuid-to-delete"],
  "explanation": "Friendly 1-2 sentence description of what you created/modified"
}

Creation guidelines:
- Rectangles: 60-250px width/height, use for buttons, containers, input fields
- Circles: 25-100px radius, use for avatars, icons, decorative elements  
- Triangles: 50-150px dimensions, use sparingly for arrows or decorative accents
- Text: 16-20px for body, 24-32px for headings, use clear web-safe colors
- Spacing: Minimum 15-20px between related elements, 40-60px between groups
- Colors: Use professional palettes (avoid pure primaries unless requested)

For "create login form" specifically:
- Title text at top (24px, bold)
- Username label + input field (rectangle) with 10px gap
- Password label + input field with 10px gap  
- Submit button (rectangle with contrasting color) below inputs
- Center-align all elements, use consistent widths
- Total height: ~250-300px

For "create navigation bar":
- Container rectangle as background (full width or centered)
- Text items evenly spaced horizontally
- Use 18-20px font size
- Items should be clickable-looking with good contrast`;

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
  response_format: { type: "json_object" },
  temperature: 0.7,
  max_tokens: 3000,
});

const result = JSON.parse(response.choices[0].message.content);

// Validate response structure
if (!result.action || !Array.isArray(result.objects)) {
  throw new Error("Invalid AI response structure");
}

// Ensure all new objects have UUIDs
result.objects.forEach((obj) => {
  if (!obj.id) {
    obj.id = uuidv4();
  }
});
```

**Parse Response & Execute:**

1. Parse Claude's JSON response
2. For each new object, add to Yjs Y.Map (will sync to all clients)
3. For modifications, update existing entries in Y.Map
4. For deletions, remove from Y.Map
5. Return explanation to client

**Implement These 8 Commands:**

**Creation (2):**

1. "Create a red circle at 200, 300" → Circle at x:200, y:300, radius:50, fill:red
2. "Add text that says 'Hello World'" → Text object at center

**Manipulation (2):** 3. "Move the circle to the center" → Update circle's x,y to 400, 300 4. "Make the rectangle twice as wide" → Update width to 2x current

**Layout (2):** 5. "Arrange all rectangles in a horizontal row" → Calculate evenly spaced x positions 6. "Space these three circles evenly" → Distribute selected objects

**Complex (2):** 7. "Create a login form" → Generate title text "Login" (24px), username label, username input field (rectangle 200x35px), password label, password input field, submit button (rectangle with distinct color), all center-aligned with proper spacing 8. "Make a navigation bar with Home, About, Contact" → Create background rectangle (600x50px centered) + 3 text elements evenly spaced horizontally

**CRITICAL for Complex Commands with GPT-4o:**

- These should produce 5-7 objects with professional layouts
- GPT-4o excels at spatial reasoning - give it space to create proper designs
- If results look amateurish, improve the system prompt with design principles
- Test thoroughly - these commands are worth significant points

**Test**: Execute each of the 8 commands. Verify objects are created/modified correctly and sync to other users.

---

#### Phase 9: Polish & Documentation (1 hour)

1. Add active user count display in header
2. Add zoom level display (e.g., "100%")
3. Implement "Fit to Screen" zoom button
4. Write comprehensive README.md (see PRD Section 13 for template)
5. Document architecture with ASCII diagram
6. Create `.env.example` with all variables
7. Add inline code comments for complex sections (especially Yjs integration)
8. Run through all test scenarios from PRD Section 12
9. Fix any critical bugs

**README must include:**

- Project description
- Tech stack with versions
- Architecture diagram
- Setup instructions (step-by-step)
- Environment variables needed
- How to run locally
- Feature list
- Known limitations

---

### Testing Checklist

After all phases are complete, verify:

- [ ] Two users can simultaneously edit canvas without conflicts
- [ ] Objects sync within 1 second
- [ ] Cursors update smoothly
- [ ] Page refresh preserves all canvas state
- [ ] All 8 AI commands work correctly
- [ ] Authentication prevents unauthorized access
- [ ] Multi-select works with Shift+Click
- [ ] Undo/redo works with keyboard shortcuts
- [ ] Color picker updates object colors
- [ ] No console errors under normal operation
- [ ] Canvas performs smoothly with 50+ objects

---

### Project Structure

Create this folder structure:

```
collabcanvas/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.jsx (main canvas component)
│   │   │   ├── Toolbar.jsx
│   │   │   ├── CursorOverlay.jsx
│   │   │   ├── ColorPicker.jsx
│   │   │   ├── AICommandInput.jsx
│   │   │   └── Auth/
│   │   │       ├── Login.jsx
│   │   │       └── Register.jsx
│   │   ├── hooks/
│   │   │   └── useYjs.js
│   │   ├── utils/
│   │   │   └── fabricHelpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── models/
│   │   ├── User.js
│   │   └── Canvas.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── canvas.js
│   │   └── ai.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   ├── db.js
│   │   └── passport.js
│   ├── index.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

### Error Handling Requirements

Every async operation must have error handling:

1. **Network requests**: Try-catch with user-friendly error messages
2. **MongoDB operations**: Connection errors, query failures
3. **Claude API**: Rate limits, timeouts, parsing errors
4. **Yjs sync**: Handle disconnection gracefully
5. **File operations**: Validation before processing

Example:

```javascript
try {
  const response = await fetch('/api/ai-command', {...});
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  // Process success
} catch (error) {
  console.error('AI command failed:', error);
  showErrorToast('Failed to execute AI command. Please try again.');
}
```

**Note on OpenAI API errors:**

- Handle rate limit errors (status 429) with exponential backoff
- Catch JSON parsing errors if response_format fails (rare with GPT-4o)
- Timeout after 10 seconds for user experience
- Log full responses during development to debug any schema mismatches

**GPT-4o Specific Considerations:**

- Average response time: 1.5-2.5 seconds (acceptable for SHOT-1)
- Higher token usage than GPT-4o-mini but better accuracy
- Max tokens set to 3000 to handle complex multi-object responses
- Temperature 0.7 balances creativity with consistency

---

### Success Criteria

This implementation is successful if:

1. ✅ Two users can edit simultaneously without data corruption
2. ✅ All 8 AI commands execute correctly
3. ✅ Canvas state persists across refreshes
4. ✅ Real-time sync works under normal conditions (2-3 users, 100 objects)
5. ✅ Authentication secures canvas access
6. ✅ All three advanced features work (color picker, undo/redo, shortcuts)
7. ✅ Code is clean, commented, and maintainable
8. ✅ README allows another developer to run the project
9. ✅ No critical bugs that break core functionality
10. ✅ Performance is acceptable (60 FPS with 100 objects)

**Expected Rubric Score: 72-77 points** (solid B+/A- foundation)

With GPT-4o's superior reasoning, expect:

- Higher accuracy on complex commands (75-80% vs 65-70% with cheaper models)
- Better spatial layout understanding
- More professional-looking generated designs
- Slightly slower but more reliable responses

---

### Important Notes

- **Yjs is not optional**: Do not create custom sync logic. Yjs handles CRDTs automatically.
- **Fabric.js is not optional**: Do not use Canvas API directly. Fabric handles object model and transforms.
- **Test incrementally**: Don't build everything and test at the end. Test after each phase.
- **Commit frequently**: One commit per phase minimum.
- **Ask for clarification**: If anything is unclear, ask before making assumptions.
- **Focus on working code**: Don't over-optimize. Get it working first.

---

### Next Steps After Completion

After this foundation is built:

- **SHOT-2** will optimize performance (sub-100ms sync, 500+ objects, 5+ users)
- **SHOT-3** will enhance AI (sub-2s responses, 90%+ accuracy, better complex commands)
- **Future** will add more Tier 2/3 features (layers panel, alignment, export, etc.)

But for now, focus on getting a solid working foundation!

---

## Start Implementation

Begin with **Phase 1: Project Setup**. Create the folder structure, initialize both React and Express projects, and get them running. Then proceed through each phase sequentially.

After each phase, summarize:

1. What was implemented
2. What files were created/modified
3. Any issues encountered
4. Verification that tests passed

Let's build CollabCanvas! 🚀
