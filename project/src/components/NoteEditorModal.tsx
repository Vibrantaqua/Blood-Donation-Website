import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Palette, Type, Tag } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Note } from '../types';
import useStore, { themes } from '../store/useStore';

interface NoteEditorModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Note>) => void;
}

const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  note,
  isOpen,
  onClose,
  onSave
}) => {
  const { currentTheme } = useStore();
  const theme = themes[currentTheme];
  
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [color, setColor] = useState('#FEF3C7');
  const [fontSize, setFontSize] = useState(14);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setText(note.text);
      setColor(note.color);
      setFontSize(note.fontSize || 14);
      setTags(note.tags);
    }
  }, [note]);

  const handleSave = () => {
    if (!note) return;
    
    const updates = {
      title,
      text,
      color,
      fontSize,
      tags
    };
    
    onSave(updates);
    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === document.activeElement) {
      if ((e.target as HTMLElement).tagName === 'INPUT') {
        handleAddTag();
      }
    }
  };

  if (!isOpen || !note) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Note</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter note title..."
            />
          </div>

          {/* Text */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Enter note content..."
            />
          </div>

          {/* Style Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Palette className="w-4 h-4 inline mr-1" />
                Color
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border-2 cursor-pointer"
                  style={{ backgroundColor: color }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                  <div className="absolute z-10">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowColorPicker(false)}
                    />
                    <HexColorPicker color={color} onChange={setColor} />
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {theme.noteColors.map((themeColor) => (
                    <button
                      key={themeColor}
                      className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                      style={{ backgroundColor: themeColor }}
                      onClick={() => setColor(themeColor)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Type className="w-4 h-4 inline mr-1" />
                Font Size
              </label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={12}>Small (12px)</option>
                <option value={14}>Medium (14px)</option>
                <option value={16}>Large (16px)</option>
                <option value={18}>Extra Large (18px)</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag..."
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium mb-2">Preview</label>
            <div
              className="p-4 rounded-lg border-2 min-h-[100px]"
              style={{ 
                backgroundColor: color,
                fontSize: `${fontSize}px`
              }}
            >
              {title && (
                <h3 className="font-bold mb-2">{title}</h3>
              )}
              <p className="whitespace-pre-wrap">{text || 'Your note content will appear here...'}</p>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <span key={tag} className="text-xs bg-black bg-opacity-10 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NoteEditorModal;