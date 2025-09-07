import axios from 'axios';
import { Connection } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const connectionsApi = {
  async getAll(): Promise<Connection[]> {
    try {
      const response = await api.get('/connections');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch connections:', error);
      return [];
    }
  },

  async create(connection: Omit<Connection, '_id'>): Promise<Connection> {
    const response = await api.post('/connections', connection);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/connections/${id}`);
  }
};