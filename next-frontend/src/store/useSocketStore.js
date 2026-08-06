import { create } from 'zustand';
import { io } from 'socket.io-client';
import { clearSceneryAudioOnHostExit } from '@/lib/sceneryAudio';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  getSocket: () => {
    let { socket } = get();
    if (!socket) {
      socket = io(SOCKET_URL, {
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
        set({ isConnected: true });
      });

      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
        set({ isConnected: false });
        clearSceneryAudioOnHostExit();
      });

      socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
      });

      set({ socket });
    }
    return socket;
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      console.log('🔌 Manually disconnecting socket');
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
    clearSceneryAudioOnHostExit();
  }
}));
