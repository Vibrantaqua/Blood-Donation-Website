export interface Note {
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
  locked?: boolean; // Indicates if the note is locked
}

export interface Connection {
  _id: string;
  from: string;
  to: string;
  meta?: {
    label?: string;
    color?: string;
  };
}

export interface Theme {
  id: string;
  name: string;
  background: string;
  noteColors: string[];
  textColor: string;
  accent: string;
}

export interface AppState {
  notes: Note[];
  connections: Connection[];
  selectedNotes: string[];
  connectMode: boolean;
  connectingFrom: string | null;
  currentTheme: string;
  searchQuery: string;
  selectedTags: string[];
  zoom: number;
  pan: { x: number; y: number };
  isOnline: boolean;
}