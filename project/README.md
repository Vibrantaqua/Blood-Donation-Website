# Sticky Wall - Interactive To-Do Board

A beautiful, interactive sticky note wall application built with React, TypeScript, and modern web technologies. Create, organize, and connect your ideas on an infinite canvas with real-time collaboration.

## Features

### 🎨 Creative Canvas
- **Infinite Canvas**: Drag and zoom across a large workspace
- **Tactile Design**: Realistic sticky notes with shadows and subtle rotations
- **Multiple Themes**: Corkboard, Minimal, and Neon themes
- **Responsive Design**: Works on desktop, tablet, and mobile

### 📝 Smart Notes
- **Rich Editing**: Title, content, colors, fonts, and tags
- **Drag & Drop**: Move notes anywhere on the canvas
- **Pin System**: Pin important notes to prevent accidental moves
- **Auto-save**: Changes are saved automatically
- **Bulk Operations**: Select and manage multiple notes

### 🔗 Visual Connections
- **Yarn-like Threads**: Connect related notes with beautiful curved paths
- **Interactive**: Click connections to edit or delete them
- **Smart Routing**: Connections automatically update when notes move

### ⚡ Real-time Collaboration
- **Live Updates**: See changes from other users instantly
- **Conflict Resolution**: Smart merging of simultaneous edits
- **Offline Support**: Continue working even without internet

### 🛠 Productivity Features
- **Search & Filter**: Find notes by content, title, or tags
- **Export**: Save your wall as a high-quality PNG image
- **Keyboard Shortcuts**: Quick actions for power users
- **Touch Support**: Full touch and gesture support on mobile

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Canvas**: React Konva
- **State**: Zustand
- **HTTP**: Axios
- **Real-time**: Socket.IO Client
- **Build**: Vite

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A backend server running the Sticky Wall API (see backend requirements below)

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd sticky-wall
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your backend URL:
   ```
   VITE_API_BASE_URL=http://localhost:4000
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:4000` |

## Backend Requirements

The frontend expects a REST API with Socket.IO support. Here are the required endpoints:

### REST API Endpoints

#### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `PATCH /api/notes/bulk` - Bulk update note positions
- `DELETE /api/notes/:id` - Delete a note

#### Connections
- `GET /api/connections` - Get all connections
- `POST /api/connections` - Create a new connection
- `DELETE /api/connections/:id` - Delete a connection

### Socket.IO Events

#### Incoming Events (Frontend → Backend)
- `join-room` - Join a room for real-time updates

#### Outgoing Events (Backend → Frontend)
- `note:created` - New note created
- `note:updated` - Note updated
- `note:deleted` - Note deleted
- `notes:bulkUpdate` - Multiple notes updated
- `connection:created` - New connection created
- `connection:deleted` - Connection deleted

### Data Models

#### Note
```typescript
interface Note {
  _id: string;
  text: string;
  title?: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  tags: string[];
  pinned: boolean;
  rotation?: number;
  fontSize?: number;
}
```

#### Connection
```typescript
interface Connection {
  _id: string;
  from: string; // Note ID
  to: string;   // Note ID
  meta?: {
    label?: string;
    color?: string;
  };
}
```

## Usage Guide

### Creating Notes
- **New Note Button**: Click the + button in the toolbar
- **Double-click**: Double-click anywhere on the canvas
- **Quick Edit**: Double-click any note to edit inline

### Moving Notes
- **Drag**: Click and drag any note to move it
- **Multi-select**: Shift+click to select multiple notes
- **Pin**: Click the pin icon to lock a note in place

### Connecting Notes
1. Click the Link button in the toolbar to enter connect mode
2. Click on the first note to start a connection
3. Click on the second note to complete the connection
4. Click the connection line to delete it

### Themes
Choose from three beautiful themes:
- **Corkboard**: Warm, textured background with earth tones
- **Minimal**: Clean white background with subtle colors
- **Neon**: Dark background with vibrant neon colors

### Keyboard Shortcuts
- `Escape` - Exit connect mode or clear selection
- `Delete` - Delete selected notes
- `Ctrl/Cmd + Z` - Undo (if implemented in backend)
- `Ctrl/Cmd + S` - Save layout

## Development

### Project Structure
```
src/
├── components/           # React components
│   ├── Canvas.tsx       # Main canvas component
│   ├── NoteCard.tsx     # Individual note component
│   ├── ConnectionLayer.tsx # SVG connection layer
│   ├── Toolbar.tsx      # Main toolbar
│   ├── NoteEditorModal.tsx # Note editing modal
│   └── ...
├── services/            # External service integrations
│   ├── api/            # API client modules
│   │   ├── notes.ts    # Notes API
│   │   └── connections.ts # Connections API
│   └── SocketService.ts # Socket.IO client
├── store/              # State management
│   └── useStore.ts     # Zustand store
├── types/              # TypeScript definitions
│   └── index.ts        # Shared types
└── assets/             # Static assets
    └── pin.svg         # Pin icon
```

### Key Components

- **Canvas**: Main workspace with infinite scroll and zoom
- **NoteCard**: Individual sticky note with editing capabilities
- **ConnectionLayer**: SVG layer for drawing connections between notes
- **Toolbar**: Main UI controls and settings
- **SocketService**: Real-time communication handler

### State Management

Uses Zustand for simple, performant state management:
- **Notes State**: All notes and their properties
- **UI State**: Selection, themes, zoom, pan, search
- **Connection State**: Note connections and connect mode
- **Network State**: Online/offline status

## Customization

### Adding New Themes
Edit `src/store/useStore.ts` and add to the `themes` object:

```typescript
newTheme: {
  id: 'new-theme',
  name: 'My Theme',
  background: 'bg-gradient-to-br from-blue-50 to-purple-50',
  noteColors: ['#color1', '#color2', ...],
  textColor: '#333333',
  accent: '#0066cc'
}
```

### Custom Note Colors
Modify the `noteColors` array in any theme to change available colors.

### Canvas Behavior
Adjust zoom limits, pan constraints, and other canvas behaviors in `Canvas.tsx`.

## Performance

- **Virtual Scrolling**: Large numbers of notes are handled efficiently
- **Debounced Updates**: Rapid changes are batched for better performance  
- **Lazy Loading**: Components load only when needed
- **Optimistic Updates**: UI updates immediately, syncs with backend asynchronously

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+
- **Features**: Requires modern JavaScript features (ES2018+)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the [GitHub Issues](issues)
- Review the [API Documentation](#backend-requirements)
- Ensure your backend implements all required endpoints

---

**Built with ❤️ using React, TypeScript, and modern web technologies**