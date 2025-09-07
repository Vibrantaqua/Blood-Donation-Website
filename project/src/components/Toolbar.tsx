import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Link,
  Palette,
  Download,
  ZoomIn,
  ZoomOut,
  Search,
  Filter,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';
import useStore, { themes } from '../store/useStore';
import { notesApi } from '../services/api/notes';
import html2canvas from 'html2canvas';

interface ToolbarProps {
  onNewNote: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onNewNote }) => {
  const {
    connectMode,
    setConnectMode,
    currentTheme,
    setTheme,
    searchQuery,
    setSearchQuery,
    zoom,
    setZoom,
    isOnline,
    clearSelection,
    notes,
    selectedNotes
  } = useStore();

  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleZoomIn = () => setZoom(zoom + 0.1);
  const handleZoomOut = () => setZoom(zoom - 0.1);

  const handleExportImage = async () => {
    try {
      const canvas = document.querySelector('.canvas-container') as HTMLElement;
      if (canvas) {
        const screenshot = await html2canvas(canvas, {
          backgroundColor: null,
          scale: 2,
          useCORS: true
        });

        const link = document.createElement('a');
        link.download = `sticky-wall-${new Date().toISOString().split('T')[0]}.png`;
        link.href = screenshot.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error('Failed to export image:', error);
    }
  };

  const handleSaveLayout = async () => {
    try {
      const updates = notes.map(note => ({
        id: note._id,
        x: note.x,
        y: note.y,
        zIndex: note.zIndex
      }));

      await notesApi.bulkUpdate(updates);
      console.log('Layout saved successfully');
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  };

  return (
    <>
      {/* Main Toolbar */}
      <motion.div
        className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg border p-2 flex items-center gap-2"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Connection Status */}
        <div className={`p-2 rounded ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        </div>

        {/* New Note */}
        <button
          onClick={onNewNote}
          className="p-2 hover:bg-blue-50 text-blue-600 rounded transition-colors"
          title="New Note"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Pin/Unpin Note */}
        <button
          onClick={() => {
            const selectedNote = notes.find(n => selectedNotes.includes(n._id));
            if (selectedNote) {
              notesApi.update(selectedNote._id, { locked: !selectedNote.locked });
            }
          }}
          className="p-2 hover:bg-gray-50 text-gray-600 rounded transition-colors"
          title="Pin/Unpin Selected Note"
        >
          📌
        </button>

        {/* Connect Mode */}
        <button
          onClick={() => setConnectMode(!connectMode)}
          className={`p-2 rounded transition-colors ${connectMode
              ? 'bg-purple-100 text-purple-600'
              : 'hover:bg-gray-50 text-gray-600'
            }`}
          title="Toggle Connect Mode"
        >
          <Link className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Zoom Controls */}
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-50 text-gray-600 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-sm text-gray-500 min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-50 text-gray-600 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className="p-2 hover:bg-gray-50 text-gray-600 rounded transition-colors"
            title="Change Theme"
          >
            <Palette className="w-5 h-5" />
          </button>

          {showThemeSelector && (
            <motion.div
              className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border p-2 min-w-[150px]"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {Object.values(themes).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setShowThemeSelector(false);
                  }}
                  className={`w-full text-left p-2 rounded hover:bg-gray-50 text-sm ${currentTheme === theme.id ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                >
                  {theme.name}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Export */}
        <button
          onClick={handleExportImage}
          className="p-2 hover:bg-gray-50 text-gray-600 rounded transition-colors"
          title="Export as PNG"
        >
          <Download className="w-5 h-5" />
        </button>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-50 text-gray-600 rounded transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-2 flex items-center gap-2 min-w-[300px]"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 outline-none text-sm"
        />
        <button
          onClick={clearSelection}
          className="p-1 hover:bg-gray-50 text-gray-600 rounded transition-colors"
          title="Clear Selection"
        >
          <Filter className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          className="fixed top-20 left-4 z-50 bg-white rounded-lg shadow-lg border p-4 w-64"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="font-semibold mb-3">Settings</h3>

          <div className="space-y-3">
            <button
              onClick={handleSaveLayout}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Save Layout
            </button>

            <button
              onClick={clearSelection}
              className="w-full p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
            >
              Clear Selection
            </button>
          </div>

          <div className="mt-4 pt-3 border-t text-xs text-gray-500">
            <p>Zoom: {Math.round(zoom * 100)}%</p>
            <p>Notes: {notes.length}</p>
            <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
          </div>
        </motion.div>
      )}

      {/* Click overlay to close dropdowns */}
      {(showThemeSelector || showSettings) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowThemeSelector(false);
            setShowSettings(false);
          }}
        />
      )}
    </>
  );
};

export default Toolbar;
