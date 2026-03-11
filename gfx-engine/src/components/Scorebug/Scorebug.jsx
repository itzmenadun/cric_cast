import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedNumber from '../AnimatedNumber';

export default function Scorebug({ matchState }) {
  if (!matchState?.batting_team) return null;

  const { batting_team, crr, current_strikers, current_bowler } = matchState;
  const onStrike = current_strikers?.find(s => s.on_strike) || current_strikers?.[0];
  const offStrike = current_strikers?.find(s => !s.on_strike) || current_strikers?.[1];

  // The main wrapper animates in from the bottom of the screen
  return (
    <motion.div 
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 200, opacity: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-stretch h-[80px] shadow-2xl overflow-hidden rounded-xl bg-cricket-dark border border-gray-800"
    >
      
      {/* 1. TEAM ABBREVIATION (Brand Color Block) */}
      <div 
        className="w-[120px] flex items-center justify-center font-bold text-4xl text-white tracking-widest"
        style={{ backgroundColor: batting_team.color || '#1E3A8A' }}
      >
        {batting_team.abbr}
      </div>

      {/* 2. MAIN SCORE (Runs / Wickets) */}
      <div className="bg-cricket-panel px-6 flex items-center space-x-2">
        <div className="flex items-baseline font-mono font-bold">
          <AnimatedNumber 
            value={batting_team.score} 
            className="text-5xl text-white drop-shadow-md" 
          />
          <span className="text-3xl text-gray-400 mx-2">/</span>
          <AnimatedNumber 
            value={batting_team.wickets} 
            className="text-4xl text-cricket-yellow drop-shadow-md" 
          />
        </div>
      </div>

      {/* 3. OVERS & CRR */}
      <div className="bg-cricket-panelLight px-6 flex flex-col justify-center border-r border-gray-700 min-w-[140px]">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Overs</span>
          <AnimatedNumber 
            value={batting_team.overs} 
            // Simple format function to keep 1 decimal if needed
            formatFn={(v) => Number(v).toFixed(1)}
            className="text-xl text-white font-mono font-semibold" 
          />
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">CRR</span>
          <span className="text-sm text-cricket-blueLight font-mono font-bold">{crr}</span>
        </div>
      </div>

      {/* 4. CURRENT BATTERS (Split View) */}
      <div className="flex bg-cricket-panel">
        {/* Striker */}
        {onStrike && (
          <div className="flex items-center px-4 w-[200px] border-r border-gray-700">
            <div className="flex-col w-full">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold truncate pr-2 flex items-center">
                  {onStrike.name} <span className="text-cricket-yellow ml-1 text-lg leading-none">*</span>
                </span>
                <div className="flex text-white font-mono gap-1">
                  <AnimatedNumber value={onStrike.runs} className="font-bold text-lg" />
                  <span className="text-gray-400 text-sm mt-[2px]">({onStrike.balls})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Non-Striker */}
        {offStrike && (
          <div className="flex items-center px-4 w-[200px] border-r border-gray-700 opacity-80">
            <div className="flex-col w-full">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium truncate pr-2">
                  {offStrike.name}
                </span>
                <div className="flex text-gray-300 font-mono gap-1">
                  <AnimatedNumber value={offStrike.runs} className="font-semibold text-lg" />
                  <span className="text-gray-500 text-sm mt-[2px]">({offStrike.balls})</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. CURRENT BOWLER */}
      {current_bowler && (
        <div className="bg-gradient-to-r from-cricket-panel to-cricket-blue/90 px-6 flex items-center min-w-[200px]">
          <div className="flex-col w-full">
            <div className="text-xs text-cricket-yellow uppercase font-bold tracking-widest mb-[2px]">Bowling</div>
            <div className="flex justify-between items-center">
              <span className="text-white font-bold truncate pr-4">{current_bowler.name}</span>
              <div className="flex text-white font-mono font-bold gap-[2px]">
                <AnimatedNumber value={current_bowler.wickets} />
                <span className="text-gray-400 font-normal">-</span>
                <AnimatedNumber value={current_bowler.runs_conceded} />
              </div>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
