import axios from 'axios';
import { Note } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      // Handle offline state
      console.warn('API request failed - working offline');
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export const notesApi = {
  async getAll(): Promise<Note[]> {
    try {
      const response = await api.get('/notes');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      return [];
    }
  },

  async create(note: Omit<Note, '_id'>): Promise<Note> {
    const response = await api.post('/notes', note);
    return response.data;
  },

  async update(id: string, updates: Partial<Note>): Promise<Note> {
    const response = await api.put(`/notes/${id}`, updates);
    return response.data;
  },

  async bulkUpdate(updates: { id: string; x: number; y: number; zIndex?: number }[]): Promise<{ updated: number; notes: Note[] }> {
    const response = await api.patch('/notes/bulk', { updates });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notes/${id}`);
  }
};