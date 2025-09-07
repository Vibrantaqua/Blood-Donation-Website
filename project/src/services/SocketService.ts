import { io, Socket } from 'socket.io-client';
import useStore from '../store/useStore';
import { Note, Connection } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    
    this.socket = io(API_BASE_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
      useStore.getState().setIsOnline(true);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      useStore.getState().setIsOnline(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        useStore.getState().setIsOnline(false);
      }
    });

    // Note events
    this.socket.on('note:created', (note: Note) => {
      const { notes } = useStore.getState();
      const existingNote = notes.find(n => n._id === note._id);
      if (!existingNote) {
        useStore.getState().setNotes([...notes, note]);
      }
    });

    this.socket.on('note:updated', (note: Note) => {
      const { notes } = useStore.getState();
      const updatedNotes = notes.map(n => n._id === note._id ? note : n);
      useStore.getState().setNotes(updatedNotes);
    });

    this.socket.on('note:deleted', (noteId: string) => {
      useStore.getState().deleteNote(noteId);
    });

    this.socket.on('notes:bulkUpdate', (updatedNotes: Note[]) => {
      const { notes } = useStore.getState();
      let newNotes = [...notes];
      
      updatedNotes.forEach(updatedNote => {
        const index = newNotes.findIndex(n => n._id === updatedNote._id);
        if (index !== -1) {
          newNotes[index] = updatedNote;
        }
      });
      
      useStore.getState().setNotes(newNotes);
    });

    // Connection events
    this.socket.on('connection:created', (connection: Connection) => {
      const { connections } = useStore.getState();
      const existingConnection = connections.find(c => c._id === connection._id);
      if (!existingConnection) {
        useStore.getState().setConnections([...connections, connection]);
      }
    });

    this.socket.on('connection:deleted', (connectionId: string) => {
      useStore.getState().deleteConnection(connectionId);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }
}

export const socketService = new SocketService();