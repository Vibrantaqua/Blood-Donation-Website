import React, { useRef, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NoteCard from './NoteCard';
import ConnectionLayer from './ConnectionLayer';
import useStore, { themes } from '../store/useStore';
import { notesApi } from '../services/api/notes';
import { connectionsApi } from '../services/api/connections';
import { Note } from '../types';

const Canvas: React.FC = () => {
  const {
    notes,
    connections,
    selectedNotes,
    connectMode,
    connectingFrom,
    currentTheme,
    searchQuery,
    zoom,
    pan,
    setPan,
    setConnectingFrom,
    setConnectMode,
    toggleSelectNote,
    selectNotes,
    updateNote,
    deleteNote,
    addConnection,
    deleteConnection
  } = useStore();

  const theme = themes[currentTheme];
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const filteredNotes = notes.filter(note =>
    !searchQuery ||
    note.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.title && note.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  /** PAN CONTROL **/
  const handleCanvasMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.target === canvasRef.current) {
      if (!event.shiftKey) {
        selectNotes([]);
      }
      setIsPanning(true);
      setPanStart({
        x: event.clientX - pan.x,
        y: event.clientY - pan.y
      });
    }
  }, [pan, selectNotes]);

  const handleCanvasMouseMove = useCallback((event: MouseEvent) => {
    if (isPanning) {
      setPan({
        x: event.clientX - panStart.x,
        y: event.clientY - panStart.y
      });
    }
  }, [isPanning, panStart, setPan]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isPanning, handleCanvasMouseMove, handleCanvasMouseUp]);

  /** NOTE UPDATE **/
  const handleNoteUpdate = useCallback(async (id: string, updates: Partial<Note>) => {
    updateNote(id, updates);

    // Save locked/unlocked instantly
    if (updates.locked !== undefined) {
      try {
        await notesApi.update(id, { locked: updates.locked });
      } catch (error) {
        console.error('Failed to update lock state:', error);
      }
      return;
    }

    // Position updates
    if (updates.x !== undefined || updates.y !== undefined) {
      try {
        await notesApi.update(id, updates);
      } catch (error) {
        console.error('Failed to update note position:', error);
      }
    }

    // Z-index updates
    if (updates.zIndex !== undefined) {
      try {
        await notesApi.update(id, { zIndex: updates.zIndex });
      } catch (error) {
        console.error('Failed to update note z-index:', error);
      }
    }
  }, [updateNote]);

  /** NOTE DELETE **/
  const handleNoteDelete = useCallback(async (id: string) => {
    deleteNote(id);
    try {
      await notesApi.delete(id);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }, [deleteNote]);

  /** CONNECTION LOGIC **/
  const handleStartConnection = useCallback(async (fromId: string) => {
    if (connectingFrom && connectingFrom !== fromId) {
      // Complete connection
      const newConnection = { from: connectingFrom, to: fromId, meta: {} };
      try {
        const created = await connectionsApi.create(newConnection);
        addConnection(created);
        setConnectingFrom(null);
        setConnectMode(false);
      } catch (error) {
        console.error('Failed to create connection:', error);
      }
    } else {
      // Start connection
      setConnectingFrom(fromId);
      setConnectMode(true);
    }
  }, [connectingFrom, addConnection, setConnectingFrom, setConnectMode]);

  const handleDeleteConnection = useCallback(async (id: string) => {
    deleteConnection(id);
    try {
      await connectionsApi.delete(id);
    } catch (error) {
      console.error('Failed to delete connection:', error);
    }
  }, [deleteConnection]);

  /** DOUBLE CLICK → NEW NOTE **/
  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    if (event.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left - pan.x) / zoom;
      const y = (event.clientY - rect.top - pan.y) / zoom;

      const newNote: Omit<Note, '_id'> = {
        text: 'New note',
        title: '',
        color: theme.noteColors[Math.floor(Math.random() * theme.noteColors.length)],
        x,
        y,
        width: 200,
        height: 150,
        zIndex: 1,
        tags: [],
        locked: false, // NEW: default unlocked
        pinned: false, // Default value for pinned
        rotation: (Math.random() - 0.5) * 6
      };

      handleCreateNote(newNote);
    }
  }, [pan, zoom, theme.noteColors]);

  const handleCreateNote = async (noteData: Omit<Note, '_id'>) => {
    const maxZ = Math.max(...notes.map(n => n.zIndex), 0);
    const noteWithZIndex = { ...noteData, zIndex: maxZ + 1 };
    try {
      const created = await notesApi.create(noteWithZIndex);
      useStore.getState().setNotes([...notes, created]);
    } catch (error) {
      console.error('Failed to create note:', error);
      useStore.getState().addNote(noteWithZIndex);
    }
  };

  return (
    <div
      ref={canvasRef}
      className={`canvas-container w-screen h-screen overflow-hidden ${theme.background} ${isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      onMouseDown={handleCanvasMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
        transformOrigin: '0 0'
      }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${theme.textColor} 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Connect Mode Banner */}
      {connectMode && (
        <motion.div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg z-40"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {connectingFrom ? 'Click another note to connect' : 'Click a note to start connecting'}
        </motion.div>
      )}

      {/* Notes */}
      <AnimatePresence>
        {filteredNotes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            onUpdate={(updates) => handleNoteUpdate(note._id, updates)}
            onDelete={() => handleNoteDelete(note._id)}
            onStartConnection={() => handleStartConnection(note._id)}
            isSelected={selectedNotes.includes(note._id)}
            onSelect={() => {
              if (!note.locked) {
                const maxZ = Math.max(...filteredNotes.map(n => n.zIndex), 0);
                handleNoteUpdate(note._id, { zIndex: maxZ + 1 });
                toggleSelectNote(note._id);
              }
            }}
          />
        ))}
      </AnimatePresence>

      {/* Connections */}
      <ConnectionLayer
        connections={connections}
        notes={filteredNotes}
        onDeleteConnection={handleDeleteConnection}
      />

      {/* Selection Info */}
      {selectedNotes.length > 0 && (
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border px-4 py-2 z-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {selectedNotes.length} note{selectedNotes.length !== 1 ? 's' : ''} selected
        </motion.div>
      )}
    </div>
  );
};

export default Canvas;
