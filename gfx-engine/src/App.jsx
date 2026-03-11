import React from 'react';
import { useSocket, SocketProvider } from './contexts/SocketContext';
import Scorebug from './components/Scorebug/Scorebug';
import PlayerLowerThird from './components/LowerThirds/PlayerLowerThird';

function BroadcastCanvas() {
  const { matchState, gfxCommands, clearCommand } = useSocket();

  // If we aren't connected or the backend hasn't pushed state yet, render nothing 
  // (A transparent canvas is safer than an error screen in a live broadcast environment)
  if (!matchState) {
    return null;
  }

  // Find active lower third commands (if any)
  const activeLowerThirds = gfxCommands.filter(c => c.type === 'show-lower-third');

  return (
    <div className="relative w-full h-full overflow-hidden">
      
      {/* 1. LAYER 1: The Core Scorebug (Always On) */}
      <Scorebug matchState={matchState} />

      {/* 2. LAYER 2: Contextual Popups (Triggered) */}
      {activeLowerThirds.map(command => (
        <PlayerLowerThird 
          key={command.id} 
          command={command} 
          onComplete={() => clearCommand(command.id)} 
        />
      ))}

      {/* 
        Future Layers:
        - Full Screen Scorecards (hides Scorebug)
        - Milestone Popups (e.g., "50 Runs")
      */}
    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <BroadcastCanvas />
    </SocketProvider>
  );
}
