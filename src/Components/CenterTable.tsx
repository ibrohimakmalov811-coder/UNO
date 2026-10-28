import React, { useMemo } from 'react';
import { GameState } from '../types/uno';
import { CardView } from './CardView';
import { sound } from '../utils/soundEngine';
import { RotateCw, RotateCcw, AlertTriangle, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface CenterTableProps {
  state: GameState;
  onDrawCard: () => void;
  isMyTurn: boolean;
}

export const CenterTable: React.FC<CenterTableProps> = ({ state, onDrawCard, isMyTurn }) => {
  const topDiscard = state.discardPile[state.discardPile.length - 1];

  // Stable random rotation for top 3 discard cards
  const discardStack = useMemo(() => {
    const len = state.discardPile.length;
    const items = state.discardPile.slice(Math.max(0, len - 3));
    return items.map((card, idx) => {
      // Deterministic angle based on card id characters
      let hash = 0;
      for (let i = 0; i < card.id.length; i++) hash += card.id.charCodeAt(i);
      const angle = (hash % 21) - 10; // between -10deg and +10deg
      return { card, angle, isTop: idx === items.length - 1 };
    });
  }, [state.discardPile]);

  // Color glow based on active color
  const getActiveColorGlow = () => {
    switch (state.activeColor) {
      case 'red':
        return 'from-rose-500/40 via-red-600/30 to-transparent shadow-[0_0_50px_rgba(255,23,68,0.5)] border-rose-500';
      case 'blue':
        return 'from-cyan-500/40 via-sky-600/30 to-transparent shadow-[0_0_50px_rgba(0,210,255,0.5)] border-cyan-400';
      case 'green':
        return 'from-emerald-500/40 via-green-600/30 to-transparent shadow-[0_0_50px_rgba(0,230,118,0.5)] border-emerald-400';
      case 'yellow':
        return 'from-amber-400/40 via-yellow-500/30 to-transparent shadow-[0_0_50px_rgba(255,234,0,0.5)] border-yellow-300';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-4">
      {/* Orbital Direction Indicator Ring */}
      <div className="absolute -inset-10 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: state.direction === 1 ? 360 : -360 }}
          transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
          className="relative h-64 w-64 sm:h-72 sm:w-72 rounded-full border border-dashed border-cyan-500/20"
        >
          {/* Orbital glowing arrows */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-cyan-400 drop-shadow-[0_0_8px_#00f0ff]">
            {state.direction === 1 ? <RotateCw className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-cyan-400 drop-shadow-[0_0_8px_#00f0ff]">
            {state.direction === 1 ? <RotateCw className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
          </div>
        </motion.div>
      </div>

      {/* Active Color Rune / Indicator Banner */}
      <div className="mb-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700/80 shadow-lg">
        <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400">ACTIVE COLOR:</span>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-3.5 w-3.5 rounded-full border border-white/50 shadow-md ${
              state.activeColor === 'red'
                ? 'bg-rose-500 shadow-[0_0_8px_#ff1744]'
                : state.activeColor === 'blue'
                ? 'bg-cyan-400 shadow-[0_0_8px_#00d2ff]'
                : state.activeColor === 'green'
                ? 'bg-emerald-400 shadow-[0_0_8px_#00e676]'
                : 'bg-yellow-400 shadow-[0_0_8px_#ffea00]'
            }`}
          />
          <span className="text-xs font-black uppercase text-white tracking-widest">{state.activeColor}</span>
        </div>
      </div>

      {/* Table Center: Discard Pile & Draw Deck */}
      <div className="relative flex items-center justify-center gap-8 sm:gap-14">
        {/* DRAW DECK */}
        <div className="relative group cursor-pointer" onClick={() => onDrawCard()}>
          {/* 3D Stack layers underneath */}
          <div className="absolute top-2 left-2 h-36 w-24 sm:h-44 sm:w-30 rounded-xl bg-slate-900 border border-slate-700" />
          <div className="absolute top-1 left-1 h-36 w-24 sm:h-44 sm:w-30 rounded-xl bg-indigo-950 border border-slate-600" />

          {/* Top Draw Card */}
          <div className="relative transition-transform duration-200 group-hover:-translate-y-2 group-hover:scale-105">
            <CardView
              card={{ id: 'draw-top', color: 'wild', value: 'wild', type: 'wild', score: 0 }}
              isFacedown
            />
            {/* Draw count badge */}
            <div className="absolute -bottom-2 -right-2 flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-black text-[11px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_#00f0ff] border border-cyan-200">
              <Layers className="h-3 w-3" />
              <span>{state.drawPile.length}</span>
            </div>
          </div>
        </div>

        {/* DISCARD PILE */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing Active Color Aura */}
          <div
            className={`absolute -inset-6 rounded-3xl bg-gradient-to-r ${getActiveColorGlow()} blur-xl opacity-60 animate-pulse`}
          />

          {/* Stack of played cards */}
          <div className="relative h-36 w-24 sm:h-44 sm:w-30">
            {discardStack.map(({ card, angle, isTop }) => (
              <div
                key={card.id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: `rotate(${angle}deg)`,
                  zIndex: isTop ? 20 : 10,
                }}
              >
                <CardView card={card} isPlayable={false} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stack Warning Banner (if +2 or +4 is active) */}
      {state.pendingDrawCount > 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.05, 1], opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 border-2 border-white text-white font-black text-xs shadow-[0_0_20px_#ff1744]"
        >
          <AlertTriangle className="h-4 w-4 animate-bounce" />
          <span>+{state.pendingDrawCount} STACK ACTIVE! STACK OR DRAW!</span>
        </motion.div>
      )}
    </div>
  );
};
