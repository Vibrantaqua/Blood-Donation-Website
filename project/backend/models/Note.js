const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  title: { type: String },
  color: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  zIndex: { type: Number, required: true },
  tags: { type: [String], default: [] },
  pinned: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  rotation: { type: Number, default: 0 },
});

module.exports = mongoose.model('Note', NoteSchema);
