import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedNumber from '../AnimatedNumber';

export default function BattingScorecard({ command, onComplete }) {
  // Command structure: { type: 'show-full-scorecard', duration: 15000, data: { team: {}, batsmen: [], extras: 4, overs: 18.5, wickets: 3, total: 165 } }
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!command || !command.duration) return;
    const timer = setTimeout(() => setIsVisible(false), command.duration);
    return () => clearTimeout(timer);
  }, [command]);

  const handleExitComplete = () => onComplete(command.id);

  if (!command?.data) return null;
  const { team, batsmen, extras, overs, wickets, total } = command.data;

  // Stagger animation for batsman rows
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="show"
          exit="exit"
          variants={containerVariants}
          // The full screen dims the background for focus
          className="absolute inset-0 bg-black/70 flex p-20 items-center justify-center pointer-events-none"
        >
          <div className="w-[1400px] bg-cricket-dark rounded-xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] border border-gray-700 overflow-hidden flex flex-col">
            
            {/* Header: Team & Total */}
            <div className="flex bg-cricket-panel h-[100px] border-b border-gray-600">
              <div 
                className="w-[160px] flex items-center justify-center"
                style={{ backgroundColor: team?.color || '#1E3A8A' }}
              >
                <span className="text-white font-black text-6xl tracking-widest">{team?.abbr}</span>
              </div>
              <div className="flex-1 flex justify-between items-center px-10">
                <span className="text-white font-bold text-5xl uppercase tracking-widest">Batting Card</span>
                <div className="flex items-baseline font-mono font-bold">
                  <AnimatedNumber value={total} className="text-7xl text-white drop-shadow-md" />
                  <span className="text-5xl text-gray-400 mx-2">/</span>
                  <AnimatedNumber value={wickets} className="text-6xl text-cricket-yellow drop-shadow-md" />
                  <span className="text-2xl text-gray-500 font-sans ml-4 italic">({Math.floor(overs)}.{Math.round((overs % 1) * 10)} ov)</span>
                </div>
              </div>
            </div>

            {/* Table Headers */}
            <div className="flex px-10 py-4 border-b border-gray-800 bg-black/40 text-gray-400 text-sm font-bold uppercase tracking-widest">
              <div className="w-[50%]">Batsman</div>
              <div className="w-[30%] text-center">Dismissal</div>
              <div className="w-[5%] text-right text-white">R</div>
              <div className="w-[5%] text-right font-normal">B</div>
              <div className="w-[5%] text-right font-normal">4s</div>
              <div className="w-[5%] text-right font-normal">6s</div>
            </div>

            {/* Batsmen Rows */}
            <div className="flex-1 flex flex-col px-10 py-4 bg-cricket-panelLight/40 gap-1 overflow-hidden">
              {batsmen?.map((bat, idx) => (
                <motion.div 
                  key={bat.id || idx} 
                  variants={itemVariants}
                  className={`flex py-3 px-4 items-center ${idx % 2 === 0 ? 'bg-black/20' : ''}`}
                >
                  <div className="w-[50%] flex items-center">
                    <span className="text-white font-bold text-2xl truncate mr-2">{bat.name}</span>
                    <span className="text-cricket-yellow text-2xl leading-none">{bat.status === 'BATTING' ? '*' : ''}</span>
                  </div>
                  <div className="w-[30%] text-gray-400 text-sm font-medium italic truncate pr-4 text-center">
                    {bat.status === 'OUT' ? bat.dismissalString : (bat.status === 'BATTING' ? 'not out' : 'yet to bat')}
                  </div>
                  <div className="w-[5%] text-right text-white font-bold font-mono text-2xl">{bat.runs}</div>
                  <div className="w-[5%] text-right text-gray-400 font-mono text-xl">{bat.ballsFaced}</div>
                  <div className="w-[5%] text-right text-gray-400 font-mono text-xl">{bat.fours}</div>
                  <div className="w-[5%] text-right text-cricket-blueLight font-mono font-bold text-xl">{bat.sixes}</div>
                </motion.div>
              ))}
            </div>

            {/* Footer: Extras */}
            <div className="flex bg-cricket-panel h-[60px] px-10 items-center justify-between border-t border-gray-700">
              <span className="text-gray-400 uppercase font-bold tracking-widest text-lg">Extras</span>
              <span className="text-white font-mono font-bold text-2xl">{extras}</span>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
