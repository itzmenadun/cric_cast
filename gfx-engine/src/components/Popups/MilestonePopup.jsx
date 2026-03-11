import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MilestonePopup({ command, onComplete }) {
  // Command structure: { type: 'show-milestone', duration: 8000, data: { title: '50 Runs', name: 'K. Mendis', stats: [{label, value}] } }
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!command) return;
    const duration = command.duration || 8000;
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [command]);

  const handleExitComplete = () => onComplete(command.id);

  if (!command?.data) return null;
  const { title, name, stats } = command.data;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          // Drops down from the top center
          initial={{ y: -500, opacity: 0 }}
          animate={{ y: 100, opacity: 1 }}
          exit={{ y: -500, opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center bg-cricket-dark shadow-2xl rounded-2xl overflow-hidden border border-gray-700 min-w-[500px]"
        >
          {/* Milestone Banner (e.g., "50 RUNS") */}
          <div className="w-full bg-gradient-to-r from-cricket-blueLight via-cricket-blue to-cricket-dark py-4 flex justify-center">
            <motion.h1 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-5xl font-black text-white italic tracking-widest drop-shadow-lg uppercase"
            >
              {title}
            </motion.h1>
          </div>

          <div className="py-6 px-12 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-white mb-4">{name}</h2>
            
            {/* Stats specific to the milestone */}
            {stats && (
              <div className="flex gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-sm text-cricket-yellow uppercase font-bold tracking-widest">{stat.label}</span>
                    <span className="text-4xl text-white font-mono font-bold drop-shadow-md">{stat.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom decorative bar */}
          <div className="w-full h-2 bg-cricket-yellow" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
