import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Lazily connect – only create socket once
  const getSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        console.log('🔌 Socket connected:', socketRef.current.id);
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
      });
    }
    return socketRef.current;
  }, []);

  // Ensure socket is created on mount and cleaned up on unmount
  useEffect(() => {
    getSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [getSocket]);

  const value = useMemo(() => ({
    socket: socketRef.current,
    getSocket,
    isConnected,
  }), [getSocket, isConnected]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
