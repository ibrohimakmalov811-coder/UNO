import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardColor } from '../types/uno';
import { sound } from '../utils/soundEngine';
import { Sparkles } from 'lucide-react';

interface ColorPickerModalProps {
  isOpen: boolean;
  onSelectColor: (color: 'red' | 'blue' | 'green' | 'yellow') => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({ isOpen, onSelectColor }) => {
  // Keyboard shortcut listeners (1-4 or R, B, G, Y)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === '1' || key === 'r') onSelectColor('red');
      if (key === '2' || key === 'b') onSelectColor('blue');
      if (key === '3' || key === 'g') onSelectColor('green');
      if (key === '4' || key === 'y') onSelectColor('yellow');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onSelectColor]);

  if (!isOpen) return null;

  const colors: {
    id: 'red' | 'blue' | 'green' | 'yellow';
    name: string;
    bg: string;
    border: string;
    glow: string;
    key: string;
  }[] = [
    {
      id: 'red',
      name: 'NEO RED',
      bg: 'from-rose-600 to-red-700',
      border: 'border-rose-400',
      glow: 'hover:shadow-[0_0_35px_rgba(255,23,68,0.9)]',
      key: '1 / R',
    },
    {
      id: 'blue',
      name: 'CYBER BLUE',
      bg: 'from-cyan-500 to-blue-700',
      border: 'border-cyan-300',
      glow: 'hover:shadow-[0_0_35px_rgba(0,210,255,0.9)]',
      key: '2 / B',
    },
    {
      id: 'green',
      name: 'MATRIX GREEN',
      bg: 'from-emerald-500 to-green-700',
      border: 'border-emerald-300',
      glow: 'hover:shadow-[0_0_35px_rgba(0,230,118,0.9)]',
      key: '3 / G',
    },
    {
      id: 'yellow',
      name: 'SOLAR YELLOW',
      bg: 'from-amber-400 to-yellow-600',
      border: 'border-yellow-200',
      glow: 'hover:shadow-[0_0_35px_rgba(255,234,0,0.9)]',
      key: '4 / Y',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative flex flex-col items-center rounded-3xl border-2 border-cyan-500/40 bg-slate-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,240,255,0.3)] max-w-sm w-full text-center"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <Sparkles className="h-5 w-5 animate-spin" style={{ animationDuration: '4s' }} />
            <h2 className="text-xl sm:text-2xl font-black italic tracking-wider">CHOOSE NEW COLOR</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Select a target chromatic frequency for the next player
          </p>

          {/* 2x2 Grid Selector */}
          <div className="grid grid-cols-2 gap-4 w-full">
            {colors.map((c) => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  sound.playColorSelect();
                  onSelectColor(c.id);
                }}
                className={`relative flex flex-col items-center justify-center h-28 rounded-2xl border-2 bg-gradient-to-br ${c.bg} ${c.border} ${c.glow} transition-all shadow-lg text-white font-black group`}
              >
                <span className="text-lg tracking-wider drop-shadow-md">{c.name}</span>
                <span className="mt-1 text-[10px] font-mono opacity-75 group-hover:opacity-100 bg-black/30 px-2 py-0.5 rounded-full border border-white/20">
                  KEY: {c.key}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
