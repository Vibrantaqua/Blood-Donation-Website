import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import NoteEditorModal from './components/NoteEditorModal';
import useStore, { themes } from './store/useStore';
import { socketService } from './services/SocketService';
import { notesApi } from './services/api/notes';
import { connectionsApi } from './services/api/connections';
import { Note } from './types';

function App() {
  const { 
    currentTheme, 
    setNotes, 
    setConnections, 
    notes 
  } = useStore();
  const theme = themes[currentTheme];
  
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      
      try {
        // Connect to Socket.IO
        socketService.connect();
        
        // Load initial data
        const [notesData, connectionsData] = await Promise.all([
          notesApi.getAll(),
          connectionsApi.getAll()
        ]);
        
        setNotes(notesData);
        setConnections(connectionsData);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Continue with empty state for offline mode
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [setNotes, setConnections]);

  const handleNewNote = () => {
    const maxZ = Math.max(...notes.map(n => n.zIndex), 0);
    const newNote: Omit<Note, '_id'> = {
      text: 'New note',
      title: '',
      color: theme.noteColors[Math.floor(Math.random() * theme.noteColors.length)],
      x: Math.random() * 400 + 100,
      y: Math.random() * 400 + 100,
      width: 200,
      height: 150,
      zIndex: maxZ + 1,
      tags: [],
      pinned: false,
      rotation: (Math.random() - 0.5) * 6,
      fontSize: 14
    };

    createNote(newNote);
  };

  const createNote = async (noteData: Omit<Note, '_id'>) => {
    try {
      const created = await notesApi.create(noteData);
      setNotes([...notes, created]);
    } catch (error) {
      console.error('Failed to create note:', error);
      // Add temporary note for offline use
      useStore.getState().addNote(noteData);
    }
  };

  const handleExportImage = () => {
    // This will be handled by the Toolbar component
    console.log('Export image triggered');
  };

  const handleEditNote = (updates: Partial<Note>) => {
    if (!editingNote) return;
    
    useStore.getState().updateNote(editingNote._id, updates);
    
    // Save to backend
    notesApi.update(editingNote._id, updates).catch((error) => {
      console.error('Failed to save note updates:', error);
    });
  };

  if (isLoading) {
    return (
      <div className={`w-screen h-screen flex items-center justify-center ${theme.background}`}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: theme.textColor }}>
            Loading Sticky Wall
          </h2>
          <p className="text-gray-500">Setting up your creative workspace...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`w-screen h-screen overflow-hidden ${theme.background}`}>
      {/* Main Canvas */}
      <Canvas />
      
      {/* UI Overlay */}
      <Toolbar 
        onNewNote={handleNewNote}
        onExportImage={handleExportImage}
      />
      
      {/* Note Editor Modal */}
      <NoteEditorModal
        note={editingNote}
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSave={handleEditNote}
      />
      
      {/* Welcome Message */}
      {notes.length === 0 && !isLoading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4" style={{ color: theme.textColor }}>
              Welcome to Sticky Wall
            </h1>
            <p className="text-lg mb-6" style={{ color: theme.textColor, opacity: 0.7 }}>
              Create your first note by clicking the + button or double-clicking anywhere on the canvas.
            </p>
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📝
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default App;