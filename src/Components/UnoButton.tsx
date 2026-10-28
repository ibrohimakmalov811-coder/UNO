import React from 'react';
import { GameState } from '../types/uno';
import { sound } from '../utils/soundEngine';
import { Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface UnoButtonProps {
  state: GameState;
  onCallUno: () => void;
  onCatchUno: () => void;
}

export const UnoButton: React.FC<UnoButtonProps> = ({ state, onCallUno, onCatchUno }) => {
  const humanPlayer = state.players[0]; // Local human player
  const myHandCount = humanPlayer?.hand.length ?? 0;
  const isMyUno = myHandCount === 1 && !humanPlayer.hasCalledUno;

  // Check if any opponent has 1 card and forgot to call UNO
  const opponentToCatch = state.players.find(
    (p, idx) => idx !== 0 && p.hand.length === 1 && !p.hasCalledUno
  );

  const isCatchable = !!opponentToCatch;
  const isUrgent = isMyUno || isCatchable;

  const handleClick = () => {
    if (isCatchable) {
      sound.playUnoCall();
      onCatchUno();
    } else {
      sound.playUnoCall();
      onCallUno();
    }
  };

  return (
    <div className="relative z-40 select-none">
      {/* Outer Glow Shockwave */}
      {isUrgent && (
        <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 blur-lg opacity-80 animate-pulse pointer-events-none" />
      )}

      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-full border-3 font-black text-sm sm:text-base tracking-wider uppercase transition-all shadow-2xl ${
          isCatchable
            ? 'bg-gradient-to-r from-red-600 to-rose-600 border-white text-white shadow-[0_0_30px_#ff1744] animate-bounce'
            : isMyUno
            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 border-white text-black shadow-[0_0_30px_#ffea00] animate-bounce'
            : humanPlayer?.hasCalledUno && myHandCount === 1
            ? 'bg-emerald-600/70 border-emerald-400 text-emerald-200 cursor-default'
            : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white hover:border-cyan-400'
        }`}
      >
        {isCatchable ? (
          <>
            <ShieldAlert className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} />
            <span>CATCH UNO!</span>
          </>
        ) : isMyUno ? (
          <>
            <Flame className="h-5 w-5 text-red-600 animate-pulse" />
            <span>SHOUT UNO!</span>
          </>
        ) : humanPlayer?.hasCalledUno && myHandCount === 1 ? (
          <>
            <Sparkles className="h-4 w-4" />
            <span>UNO SAFE!</span>
          </>
        ) : (
          <>
            <Flame className="h-4 w-4 text-slate-500" />
            <span>UNO</span>
          </>
        )}
      </motion.button>
    </div>
  );
};
