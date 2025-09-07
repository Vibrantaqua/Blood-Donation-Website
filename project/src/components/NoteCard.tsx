import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Edit, Link, Copy, Trash2, Pin, PinOff } from 'lucide-react';
import { Note } from '../types';
import useStore, { themes } from '../store/useStore';
import { notesApi } from '../services/api/notes';

interface NoteCardProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  onDelete: () => void;
  onStartConnection: () => void;
  isSelected: boolean;
  onSelect: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onUpdate,
  onDelete,
  onStartConnection,
  isSelected,
  onSelect
}) => {
  const { currentTheme, connectMode, connectingFrom } = useStore();
  const theme = themes[currentTheme];

  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title || '');
  const [text, setText] = useState(note.text);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const noteRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((event: React.MouseEvent) => {
    if (isEditing || note.pinned) return; // 🚀 block dragging if pinned

    // Bring note to front when starting to drag
    const maxZ = Math.max(...useStore.getState().notes.map(n => n.zIndex), 0);
    onUpdate({ zIndex: maxZ + 1 });

    setIsDragging(true);
    setDragStart({
      x: event.clientX - note.x,
      y: event.clientY - note.y
    });
  }, [note.x, note.y, isEditing, note.pinned]);

  const handleDragMove = useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    const newX = event.clientX - dragStart.x;
    const newY = event.clientY - dragStart.y;
    onUpdate({ x: newX, y: newY });
  }, [isDragging, dragStart, onUpdate]);

  const handleDragEnd = useCallback(async () => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      await notesApi.update(note._id, { x: note.x, y: note.y });
    } catch (error) {
      console.error('Failed to save note position:', error);
    }
  }, [isDragging, note._id, note.x, note.y]);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleSave = async () => {
    const updates = { title, text };
    onUpdate(updates);
    setIsEditing(false);

    try {
      await notesApi.update(note._id, updates);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleDoubleClick = () => {
    if (!connectMode) {
      const maxZ = Math.max(...useStore.getState().notes.map(n => n.zIndex), 0);
      onUpdate({ zIndex: maxZ + 1 });
      setIsEditing(true);
    }
  };

  const handleConnect = () => {
    if (connectMode) {
      if (connectingFrom === note._id) {
        useStore.getState().setConnectingFrom(null);
      } else if (connectingFrom && connectingFrom !== note._id) {
        onStartConnection();
      } else {
        useStore.getState().setConnectingFrom(note._id);
      }
    } else {
      onStartConnection();
    }
  };

  const handlePin = async () => {
    const updates = { pinned: !note.pinned, zIndex: note.pinned ? 1 : 1000 };
    onUpdate(updates);

    try {
      await notesApi.update(note._id, updates);
    } catch (error) {
      console.error('Failed to update pin status:', error);
    }
  };

  const handleDuplicate = () => {
    const maxZ = Math.max(...useStore.getState().notes.map(n => n.zIndex), 0);
    const duplicate = {
      ...note,
      x: note.x + 20,
      y: note.y + 20,
      title: `${note.title || 'Note'} (Copy)`,
      zIndex: maxZ + 1,
      _id: undefined as any
    };
    delete duplicate._id;
    useStore.getState().addNote(duplicate);
  };

  const rotation = note.rotation || (Math.random() - 0.5) * 6;
  const isConnecting = connectMode && connectingFrom === note._id;

  return (
    <motion.div
      ref={noteRef}
      className={`absolute cursor-pointer select-none ${isDragging ? 'z-50' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        zIndex: note.zIndex,
        transform: `rotate(${rotation}deg)`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        boxShadow: isSelected
          ? '0 0 0 3px rgb(59 130 246 / 0.5)'
          : isDragging
            ? '0 20px 40px rgba(0,0,0,0.3)'
            : '0 4px 12px rgba(0,0,0,0.15)'
      }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseDown={handleDragStart}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
    >
      {/* Pin */}
      {note.pinned && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-6 h-6 bg-gray-200 rounded-full shadow-md flex items-center justify-center">
            <Pin className="w-4 h-4 text-red-600 rotate-45" />
          </div>
        </div>
      )}

      {/* Note Card */}
      <div
        className={`w-full h-full rounded-lg border-2 p-3 transition-all duration-200 ${isConnecting ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
          }`}
        style={{
          backgroundColor: note.color,
          borderColor: theme.accent,
          color: theme.textColor
        }}
      >
        {/* Toolbar */}
        {(isSelected || isDragging) && !isEditing && (
          <div className="absolute -top-10 left-0 flex gap-1 bg-white rounded-md shadow-lg p-1 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleConnect(); }}
              className={`p-1 hover:bg-gray-100 rounded ${isConnecting ? 'bg-blue-100' : ''}`}
              title="Connect"
            >
              <Link className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDuplicate(); }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handlePin(); }}
              className="p-1 hover:bg-gray-100 rounded"
              title={note.pinned ? "Unpin" : "Pin"}
            >
              {note.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 hover:bg-red-100 text-red-600 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        {isEditing ? (
          <div className="w-full h-full flex flex-col gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title..."
              className="w-full bg-transparent border-b border-gray-300 font-bold text-sm outline-none"
              style={{ color: theme.textColor }}
              autoFocus
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add your note..."
              className="flex-1 w-full bg-transparent resize-none outline-none text-sm"
              style={{ color: theme.textColor }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
            {note.title && (
              <h3 className="font-bold text-sm mb-2 break-words" style={{ color: theme.textColor }}>
                {note.title}
              </h3>
            )}
            <p
              className="text-sm break-words overflow-hidden"
              style={{
                color: theme.textColor,
                fontSize: `${note.fontSize || 14}px`
              }}
            >
              {note.text}
            </p>
            {note.tags.length > 0 && (
              <div className="mt-auto pt-2 flex flex-wrap gap-1">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-black bg-opacity-10 rounded text-xs"
                    style={{ color: theme.textColor }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NoteCard;
