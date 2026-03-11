import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlayerLowerThird({ command, onComplete }) {
  // Typical command structure: { type: 'show-lower-third', duration: 5000, data: { name, role, stats: [] } }
  
  // We use this local state to control the Framer exit animation before telling the parent we're done
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!command || !command.duration) return;
    
    // Auto-hide after the requested duration
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, command.duration);

    return () => clearTimeout(timer);
  }, [command]);

  // Once Framer finishes the Exit animation, we notify the parent Context to remove this command from the queue
  const handleExitComplete = () => {
    onComplete(command.id);
  };

  if (!command?.data) return null;
  const { name, role, teamColor, stats } = command.data;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          initial={{ x: -1000, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -1000, opacity: 0, transition: { duration: 0.5, ease: "anticipate" } }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="absolute bottom-[200px] left-20 flex shadow-2xl rounded-r-2xl overflow-hidden bg-cricket-dark border-y border-r border-gray-700 max-w-[800px]"
        >
          {/* Accent Color Bar */}
          <div className="w-4" style={{ backgroundColor: teamColor || '#FACC15' }} />

          <div className="flex flex-col">
            {/* Header: Name & Role */}
            <div className="bg-gradient-to-r from-cricket-panel to-transparent px-8 py-4 border-b border-gray-800">
              <h1 className="text-4xl font-bold text-white uppercase tracking-wider">{name}</h1>
              <h2 className="text-xl text-cricket-yellow font-semibold tracking-widest">{role}</h2>
            </div>

            {/* Stats Row */}
            {stats && stats.length > 0 && (
              <div className="flex bg-cricket-panelLight/90 px-8 py-3 gap-12">
                {stats.map((stat, i) => (
                  <div key={i} className="flex flex-col items-start pr-8 border-r border-gray-700 last:border-0">
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">{stat.label}</span>
                    <span className="text-3xl text-white font-mono font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
