import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { SyncQueue } from '../services/syncQueue';

const MatchContext = createContext();

export const useMatch = () => useContext(MatchContext);

export const MatchProvider = ({ children }) => {
  const [matchId, setMatchId] = useState(null);
  const [matchState, setMatchState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Background queue flusher (runs every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      SyncQueue.flush();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadMatchState = useCallback(async (id) => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      // Fetch full details of the match from our REST DB endpoint
      const response = await api.get(`/api/matches/${id}`);
      setMatchState(response.data);
      setMatchId(id);
    } catch (err) {
      console.error('Failed to load match state:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Expose the core scoring action function so any component can safely submit a ball
  const submitDelivery = async (ballData) => {
    try {
      // Optimistically update some UI (optional MVP logic)
      // Here we just attempt the post immediately
      await api.post('/api/scoring/ball', ballData);
      // If success, reload the state heavily to reflect the entire DB update
      await loadMatchState(matchId);
    } catch (err) {
      console.warn('Network failed or offline. Queueing action locally.', err.message);
      // Offline fallback: Queue it for the flusher
      await SyncQueue.enqueue('/api/scoring/ball', ballData);
      
      // We could optimistically mutate `matchState` here for an instantaneous offline feel, 
      // but to keep the MVP stable, we alert the user
      alert('Network unstable. Ball queued for background sync.');
    }
  };

  const undoLastDelivery = async (inningsId) => {
    try {
      await api.post('/api/scoring/undo', { inningsId });
      await loadMatchState(matchId);
    } catch (err) {
      alert('Error undoing delivery. Must be online.');
    }
  };

  return (
    <MatchContext.Provider 
      value={{ 
        matchId, 
        matchState, 
        isLoading, 
        error, 
        loadMatchState,
        submitDelivery,
        undoLastDelivery
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};
