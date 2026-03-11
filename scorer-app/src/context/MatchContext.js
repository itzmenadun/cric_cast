import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { SyncQueue } from '../services/syncQueue';

const MatchContext = createContext();

export const useMatch = () => useContext(MatchContext);

export const MatchProvider = ({ children }) => {
  const [matchId, setMatchId]       = useState(null);
  const [matchState, setMatchState] = useState(null);
  const [inningsId, setInningsId]   = useState(null);
  const [currentOverId, setCurrentOverId] = useState(null);
  const [currentBallNumber, setCurrentBallNumber] = useState(1);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState(null);

  // Background queue flusher (runs every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => { SyncQueue.flush(); }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadMatchState = useCallback(async (id) => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/api/matches/${id}`);
      const data = response.data;
      setMatchState(data);
      setMatchId(id);

      // Automatically extract current innings and over state
      const liveInnings = data.innings?.find(inn => inn.status === 'IN_PROGRESS');
      if (liveInnings) {
        setInningsId(liveInnings.id);
        const lastOver = liveInnings.overs?.[liveInnings.overs.length - 1];
        if (lastOver) {
          setCurrentOverId(lastOver.id);
          setCurrentBallNumber((lastOver.balls?.length || 0) + 1);
        }
      }
    } catch (err) {
      console.error('Failed to load match state:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitDelivery = async (ballData) => {
    try {
      await api.post('/api/scoring/ball', {
        ...ballData,
        inningsId,
        overId: currentOverId,
        ballNumber: currentBallNumber,
      });
      await loadMatchState(matchId);
    } catch (err) {
      console.warn('Network failed or offline. Queueing action locally.', err.message);
      await SyncQueue.enqueue('/api/scoring/ball', {
        ...ballData, inningsId, overId: currentOverId, ballNumber: currentBallNumber,
      });
      alert('Network unstable. Ball queued for background sync.');
    }
  };

  const undoLastDelivery = async () => {
    if (!inningsId) { alert('Cannot undo — no active innings found.'); return; }
    try {
      await api.post('/api/scoring/undo', { inningsId });
      await loadMatchState(matchId);
    } catch (err) {
      alert('Error undoing delivery. Must be online.');
    }
  };

  // Called at the start of each new over to set the bowler
  const startBowlerOver = async (bowlerId) => {
    if (!inningsId) return;
    try {
      const { data } = await api.post(`/api/innings/${inningsId}/start-over`, { bowlerId });
      setCurrentOverId(data.overId);
      setCurrentBallNumber(1);
      await loadMatchState(matchId);
    } catch (err) {
      alert('Failed to start new over.');
    }
  };

  // Called when 1st innings ends to create 2nd innings
  const startSecondInnings = async ({ battingTeamId, bowlingTeamId, target }) => {
    try {
      await api.post(`/api/matches/${matchId}/start-innings`, {
        battingTeamId,
        bowlingTeamId,
        inningsNumber: 2,
        target,
      });
      await loadMatchState(matchId);
    } catch (err) {
      alert('Failed to start 2nd innings.');
    }
  };

  return (
    <MatchContext.Provider
      value={{
        matchId,
        matchState,
        inningsId,
        currentOverId,
        currentBallNumber,
        isLoading,
        error,
        loadMatchState,
        submitDelivery,
        undoLastDelivery,
        startBowlerOver,
        startSecondInnings,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};
