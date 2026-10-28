import React from 'react';
import { Player, GameState } from '../types/uno';
import { CardView } from './CardView';
import { Bot, User, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OpponentSlotProps {
  player: Player;
  isCurrentTurn: boolean;
  position: 'left' | 'top' | 'right';
  state: GameState;
}

export const OpponentSlot: React.FC<OpponentSlotProps> = ({
  player,
  isCurrentTurn,
  position,
  state,
}) => {
  const cardCount = player.hand.length;
  const isUnoDanger = cardCount === 1;

  // Max visual cards to show in fanned back stack
  const visualCards = Math.min(cardCount, 6);
  const cardItems = Array.from({ length: visualCards });

  return (
    <div
      className={`relative flex items-center gap-3 select-none ${
        position === 'left'
          ? 'flex-row items-center'
          : position === 'right'
          ? 'flex-row-reverse items-center'
          : 'flex-col items-center'
      }`}
    >
      {/* Speech Bubble Taunt */}
      <AnimatePresence>
        {player.recentTaunt && Date.now() - player.recentTaunt.time < 3500 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className={`absolute z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 border-2 border-cyan-400 text-white shadow-[0_0_20px_rgba(0,240,255,0.7)] text-xs font-bold whitespace-nowrap ${
              position === 'left'
                ? 'left-20 -top-8'
                : position === 'right'
                ? 'right-20 -top-8'
                : '-bottom-10'
            }`}
          >
            <span className="text-base">{player.recentTaunt.emoji}</span>
            <span className="font-mono text-cyan-200">{player.recentTaunt.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Box with Turn Ring */}
      <div className="relative">
        {/* Animated Active Turn Glow */}
        {isCurrentTurn && (
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-400 blur-md opacity-75 animate-pulse" />
        )}

        <div
          className={`relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border-2 transition-all ${
            isCurrentTurn
              ? 'border-cyan-400 bg-slate-900 shadow-[0_0_20px_rgba(0,240,255,0.8)] scale-105'
              : 'border-slate-700 bg-slate-950/80 shadow-md'
          }`}
        >
          {/* Avatar Icon */}
          <span className="text-2xl sm:text-3xl drop-shadow">{player.avatar}</span>

          {/* Turn timer indicator ring overlay */}
          {isCurrentTurn && (
            <svg className="absolute inset-0 h-full w-full -rotate-90 p-0.5">
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                className="stroke-cyan-400"
                strokeWidth="3"
                fill="none"
                strokeDasharray="180"
                strokeDashoffset={180 * (1 - state.turnTimeRemaining / state.settings.turnDuration)}
                strokeLinecap="round"
              />
            </svg>
          )}

          {/* Bot Indicator Badge */}
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-cyan-400 text-[10px] text-cyan-300">
            {player.isBot ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
          </div>
        </div>
      </div>

      {/* Name, Info & Card Backs */}
      <div
        className={`flex flex-col ${
          position === 'left' ? 'items-start' : position === 'right' ? 'items-end' : 'items-center'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide">
            {player.name}
          </span>
          {isUnoDanger && (
            <span className="flex items-center gap-0.5 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full animate-bounce shadow-[0_0_12px_#ff1744]">
              <AlertCircle className="h-3 w-3" />
              UNO!
            </span>
          )}
        </div>

        {/* Card Counter Badge */}
        <div className="mt-1 flex items-center gap-1">
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
              isUnoDanger
                ? 'bg-rose-500/30 text-rose-300 border border-rose-500'
                : 'bg-slate-900/90 text-cyan-300 border border-slate-700'
            }`}
          >
            {cardCount} {cardCount === 1 ? 'CARD' : 'CARDS'}
          </span>
        </div>

        {/* Compact Fanned Card Backs */}
        <div className="relative mt-2 flex h-14 items-center">
          {cardItems.map((_, i) => {
            const rot = (i - (visualCards - 1) / 2) * 8;
            return (
              <div
                key={i}
                style={{
                  marginLeft: i === 0 ? 0 : '-18px',
                  zIndex: i,
                }}
              >
                <CardView
                  card={{ id: `fake-${i}`, color: 'wild', value: 'wild', type: 'wild', score: 0 }}
                  isFacedown
                  isCompact
                  rotation={rot}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
