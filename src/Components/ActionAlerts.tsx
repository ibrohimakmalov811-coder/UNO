import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionAlert } from '../types/uno';

interface ActionAlertsProps {
  alert: ActionAlert | null;
}

export const ActionAlerts: React.FC<ActionAlertsProps> = ({ alert }) => {
  if (!alert) return null;

  const getAlertStyles = (type: ActionAlert['type']) => {
    switch (type) {
      case 'skip':
        return 'from-fuchsia-600 to-indigo-700 border-fuchsia-400 text-white shadow-[0_0_40px_rgba(217,70,239,0.8)]';
      case 'reverse':
        return 'from-cyan-500 to-blue-700 border-cyan-300 text-white shadow-[0_0_40px_rgba(6,182,212,0.8)]';
      case 'draw':
        return 'from-red-600 via-rose-600 to-amber-600 border-red-400 text-white shadow-[0_0_50px_rgba(255,23,68,0.9)]';
      case 'uno':
        return 'from-yellow-400 via-amber-400 to-orange-500 border-yellow-200 text-black shadow-[0_0_50px_rgba(255,234,0,0.9)]';
      case 'catch':
        return 'from-rose-600 to-red-800 border-white text-white shadow-[0_0_40px_rgba(255,23,68,0.9)]';
      case 'win':
        return 'from-emerald-400 via-teal-400 to-cyan-500 border-emerald-200 text-black shadow-[0_0_60px_rgba(52,211,153,0.9)]';
      case 'wild':
      default:
        return 'from-purple-600 to-indigo-700 border-purple-400 text-white shadow-[0_0_40px_rgba(168,85,247,0.8)]';
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={alert.id}
          initial={{ scale: 0.3, y: 30, opacity: 0, rotate: -6 }}
          animate={{
            scale: [0.3, 1.25, 1],
            y: [30, -10, 0],
            opacity: 1,
            rotate: [-6, 3, 0],
          }}
          exit={{ scale: 0.8, y: -40, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className={`flex flex-col items-center justify-center px-8 py-4 rounded-3xl border-3 bg-gradient-to-r ${getAlertStyles(
            alert.type
          )} select-none backdrop-blur-md`}
        >
          <span className="text-2xl sm:text-4xl font-black italic tracking-widest drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] text-center">
            {alert.text}
          </span>
          <span className="text-xs font-mono font-bold tracking-wider mt-1 opacity-90 uppercase">
            {alert.playerName}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
