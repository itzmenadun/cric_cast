import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { useSocket, SocketProvider } from './contexts/SocketContext';
import Scorebug from './components/Scorebug/Scorebug';
import PlayerLowerThird from './components/LowerThirds/PlayerLowerThird';
import BattingScorecard from './components/FullScreens/BattingScorecard';
import MilestonePopup from './components/Popups/MilestonePopup';

function BroadcastCanvas() {
  const { matchState, gfxCommands, clearCommand } = useSocket();

  // If we aren't connected or the backend hasn't pushed state yet, render nothing 
  if (!matchState) {
    return null;
  }

  // Extract command types from the queue
  const activeLowerThirds = gfxCommands.filter(c => c.type === 'show-lower-third');
  const activeMilestones = gfxCommands.filter(c => c.type === 'show-milestone');
  const activeFullScreens = gfxCommands.filter(c => c.type === 'show-full-scorecard');

  // If a full screen is active, we hide the Scorebug
  const showScorebug = activeFullScreens.length === 0;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 1. LAYER 1: The Core Scorebug (Always On unless FullScreen active) */}
      {showScorebug && <Scorebug matchState={matchState} />}

      {/* 2. LAYER 2: Contextual Popups (Lower Thirds) */}
      {activeLowerThirds.map(command => (
        <PlayerLowerThird 
          key={command.id} 
          command={command} 
          onComplete={() => clearCommand(command.id)} 
        />
      ))}

      {/* 3. LAYER 3: Milestone Popups */}
      {activeMilestones.map(command => (
        <MilestonePopup 
          key={command.id} 
          command={command} 
          onComplete={() => clearCommand(command.id)} 
        />
      ))}

      {/* 4. LAYER 4: Full Screens (Overrides Scorebug) */}
      {activeFullScreens.map(command => (
        <BattingScorecard 
          key={command.id} 
          command={command} 
          onComplete={() => clearCommand(command.id)} 
        />
      ))}
    </div>
  );
}

// ── 2. The Match-Specific Route Wrapper ──
// Grabs the ID from the URL and passes it to the Provider
function MatchBroadcastRoute() {
  const { matchId } = useParams();

  return (
    <SocketProvider matchId={matchId}>
      <BroadcastCanvas />
    </SocketProvider>
  );
}

// ── 3. The Main App Router ──
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The isolated vMix broadcast URL */}
        <Route path="/match/:matchId" element={<MatchBroadcastRoute />} />
        
        {/* Placeholder if someone hits the root URL without a match ID */}
        <Route path="/" element={
          <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white flex-col">
            <h1 className="text-4xl font-bold mb-4">CricCast GFX Engine</h1>
            <p className="text-xl text-gray-400">Please provide a valid Match URL format in your vMix browser input:</p>
            <code className="mt-4 p-4 bg-black rounded text-cricket-yellow">http://localhost:5173/match/&lt;match-id&gt;</code>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
