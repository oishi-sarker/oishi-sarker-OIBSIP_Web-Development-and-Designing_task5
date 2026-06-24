import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // No token yet — connect anonymously so the app still works
      socketRef.current = io(API_BASE, { transports: ['websocket'] });
    } else {
      socketRef.current = io(API_BASE, {
        transports: ['websocket'],
        auth: { token },
      });
    }
    const s = socketRef.current;
    s.on('connect', () => setIsConnected(true));
    s.on('disconnect', () => setIsConnected(false));
    s.on('connect_error', () => setIsConnected(false));

    // Generic event channel used by pages to listen for updates
    s.on('order_status_update', (payload) => setLatestEvent({ type: 'order_status_update', payload, ts: Date.now() }));
    s.on('new_order', (payload) => setLatestEvent({ type: 'new_order', payload, ts: Date.now() }));

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
    // Reconnect when user changes (so the new role can be re-joined)
  }, [user?.id]);

  const value = { socket: socketRef.current, isConnected, latestEvent };
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
