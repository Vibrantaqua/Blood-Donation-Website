import { create } from 'zustand';
import { AppState, Note, Connection, Theme } from '../types';

export const themes: Record<string, Theme> = {
  corkboard: {
    id: 'corkboard',
    name: 'Corkboard',
    background: 'bg-gradient-to-br from-amber-50 to-amber-100',
    noteColors: ['#FEF3C7', '#FECACA', '#D1FAE5', '#DBEAFE', '#E0E7FF', '#F3E8FF'],
    textColor: '#374151',
    accent: '#D97706'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    background: 'bg-gray-50',
    noteColors: ['#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF'],
    textColor: '#111827',
    accent: '#6B7280'
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    background: 'bg-gradient-to-br from-gray-900 to-purple-900',
    noteColors: ['#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899'],
    textColor: '#FFFFFF',
    accent: '#06FFA5'
  }
};

interface StoreActions {
  // Notes
  addNote: (note: Omit<Note, '_id'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setNotes: (notes: Note[]) => void;
  bulkUpdateNotes: (updates: { id: string; x: number; y: number; zIndex?: number }[]) => void;
  
  // Connections
  addConnection: (connection: Connection) => void;
  deleteConnection: (id: string) => void;
  setConnections: (connections: Connection[]) => void;
  
  // Selection & Connect Mode
  selectNotes: (ids: string[]) => void;
  toggleSelectNote: (id: string) => void;
  clearSelection: () => void;
  setConnectMode: (mode: boolean) => void;
  setConnectingFrom: (id: string | null) => void;
  
  // UI State
  setTheme: (themeId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setIsOnline: (online: boolean) => void;
}

const useStore = create<AppState & StoreActions>((set, get) => ({
  // Initial state
  notes: [],
  connections: [],
  selectedNotes: [],
  connectMode: false,
  connectingFrom: null,
  currentTheme: 'corkboard',
  searchQuery: '',
  selectedTags: [],
  zoom: 1,
  pan: { x: 0, y: 0 },
  isOnline: true,

  // Actions
  addNote: (note) => set((state) => ({ 
    notes: [...state.notes, { ...note, _id: `temp-${Date.now()}` }] 
  })),
  
  updateNote: (id, updates) => set((state) => ({ 
    notes: state.notes.map(note => 
      note._id === id ? { ...note, ...updates } : note
    )
  })),
  
  deleteNote: (id) => set((state) => ({ 
    notes: state.notes.filter(note => note._id !== id),
    selectedNotes: state.selectedNotes.filter(noteId => noteId !== id),
    connections: state.connections.filter(conn => conn.from !== id && conn.to !== id)
  })),
  
  setNotes: (notes) => set({ notes }),
  
  bulkUpdateNotes: (updates) => set((state) => {
    const updatedNotes = [...state.notes];
    updates.forEach(({ id, x, y, zIndex }) => {
      const index = updatedNotes.findIndex(note => note._id === id);
      if (index !== -1) {
        updatedNotes[index] = { 
          ...updatedNotes[index], 
          x, 
          y, 
          ...(zIndex !== undefined && { zIndex }) 
        };
      }
    });
    return { notes: updatedNotes };
  }),

  addConnection: (connection) => set((state) => ({ 
    connections: [...state.connections, connection] 
  })),
  
  deleteConnection: (id) => set((state) => ({ 
    connections: state.connections.filter(conn => conn._id !== id) 
  })),
  
  setConnections: (connections) => set({ connections }),

  selectNotes: (ids) => set({ selectedNotes: ids }),
  
  toggleSelectNote: (id) => set((state) => {
    const isSelected = state.selectedNotes.includes(id);
    return {
      selectedNotes: isSelected 
        ? state.selectedNotes.filter(noteId => noteId !== id)
        : [...state.selectedNotes, id]
    };
  }),
  
  clearSelection: () => set({ selectedNotes: [] }),
  
  setConnectMode: (mode) => set({ 
    connectMode: mode, 
    connectingFrom: mode ? null : get().connectingFrom 
  }),
  
  setConnectingFrom: (id) => set({ connectingFrom: id }),

  setTheme: (themeId) => set({ currentTheme: themeId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
  setPan: (pan) => set({ pan }),
  setIsOnline: (online) => set({ isOnline: online })
}));

export default useStore;