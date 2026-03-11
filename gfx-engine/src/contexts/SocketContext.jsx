import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

// Change this to the backend's IP address if running on a different machine
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const SocketProvider = ({ children, matchId }) => {
  const [socket, setSocket] = useState(null);
  const [matchState, setMatchState] = useState(null);
  const [gfxCommands, setGfxCommands] = useState([]); // Queue for popups/lower thirds

  useEffect(() => {
    // 1. Initialize Connection
    const socketInstance = io(BACKEND_URL, {
      transports: ['websocket', 'polling'], // Fallback if WS fails
    });

    setSocket(socketInstance);

    // 2. Listen for connection events
    socketInstance.on('connect', () => {
      console.log(`[Socket] Connected to backend GFX broadcast server`);
      if (matchId) {
        socketInstance.emit('join-match', matchId);
        // Force the backend to send the latest state for this room
        // NOTE: Your backend 'match-update' may need triggering or polling, 
        // depending on how you structured the initial connect.
      }
    });

    // 3. Listen for Live State Updates
    // The backend emits this every time a ball is scored
    socketInstance.on('match-update', (data) => {
      console.log('[Socket] match-update received:', data);
      setMatchState(data);
    });

    // 4. Listen for specific GFX Triggers (e.g., 'show-lower-third')
    socketInstance.on('gfx-command', (command) => {
      console.log('[Socket] gfx-command received:', command);
      setGfxCommands(prev => [...prev, command]);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });

    // Cleanup
    return () => {
      if (matchId) {
        socketInstance.emit('leave-match', matchId);
      }
      socketInstance.disconnect();
    };
  }, [matchId]);

  // Helper to consume/dismiss a command from the queue once rendered
  const clearCommand = (id) => {
    setGfxCommands(prev => prev.filter(c => c.id !== id));
  };

  return (
    <SocketContext.Provider value={{ socket, matchState, gfxCommands, clearCommand }}>
      {children}
    </SocketContext.Provider>
  );
};
