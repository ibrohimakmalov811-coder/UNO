import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardColor } from '../types/uno';
import { Ban, RotateCcw, Copy, Sparkles } from 'lucide-react';

interface CardViewProps {
  card: Card;
  isPlayable?: boolean;
  onClick?: () => void;
  isFacedown?: boolean;
  scale?: number;
  rotation?: number;
  yOffset?: number;
  className?: string;
  isCompact?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isPlayable = false,
  onClick,
  isFacedown = false,
  scale = 1,
  rotation = 0,
  yOffset = 0,
  className = '',
  isCompact = false,
}) => {
  // Color configuration
  const getColorStyle = (color: CardColor) => {
    switch (color) {
      case 'red':
        return {
          bg: 'from-rose-600 via-red-500 to-rose-700',
          border: 'border-red-400',
          glow: 'shadow-[0_0_20px_rgba(255,23,68,0.55)]',
          text: 'text-red-500',
          subBg: 'bg-red-950/80',
          accent: '#ff1744',
        };
      case 'blue':
        return {
          bg: 'from-cyan-600 via-sky-500 to-blue-700',
          border: 'border-cyan-300',
          glow: 'shadow-[0_0_20px_rgba(0,210,255,0.55)]',
          text: 'text-cyan-400',
          subBg: 'bg-blue-950/80',
          accent: '#00d2ff',
        };
      case 'green':
        return {
          bg: 'from-emerald-600 via-green-500 to-teal-700',
          border: 'border-emerald-300',
          glow: 'shadow-[0_0_20px_rgba(0,230,118,0.55)]',
          text: 'text-emerald-400',
          subBg: 'bg-emerald-950/80',
          accent: '#00e676',
        };
      case 'yellow':
        return {
          bg: 'from-amber-500 via-yellow-400 to-amber-600',
          border: 'border-yellow-200',
          glow: 'shadow-[0_0_20px_rgba(255,234,0,0.55)]',
          text: 'text-amber-400',
          subBg: 'bg-amber-950/80',
          accent: '#ffea00',
        };
      case 'wild':
      default:
        return {
          bg: 'from-fuchsia-600 via-purple-600 to-indigo-800',
          border: 'border-purple-300',
          glow: 'shadow-[0_0_25px_rgba(168,85,247,0.7)]',
          text: 'text-fuchsia-300',
          subBg: 'bg-slate-950/90',
          accent: '#a855f7',
        };
    }
  };

  const cStyle = getColorStyle(card.color);

  // Facedown Card (Back of Card)
  if (isFacedown) {
    return (
      <motion.div
        style={{
          transform: `rotate(${rotation}deg) translateY(${yOffset}px)`,
        }}
        className={`relative select-none rounded-xl border-2 border-cyan-500/40 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 shadow-xl transition-all ${
          isCompact ? 'h-16 w-11' : 'h-36 w-24 sm:h-44 sm:w-30'
        } ${className}`}
      >
        {/* Holographic circuit pattern back */}
        <div className="absolute inset-1 flex items-center justify-center rounded-lg border border-cyan-500/20 bg-slate-900/80 overflow-hidden">
          <div className="absolute -inset-4 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:8px_8px] opacity-25" />
          <div className="relative rotate-[-30deg] font-black italic tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
            <span className={isCompact ? 'text-[10px]' : 'text-sm sm:text-lg'}>UNO</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Render Card Icon / Center Content
  const renderCenterGraphic = () => {
    switch (card.value) {
      case 'skip':
        return <Ban className={`${isCompact ? 'h-5 w-5' : 'h-10 w-10 sm:h-12 sm:w-12'} text-white drop-shadow-md`} strokeWidth={3} />;
      case 'reverse':
        return <RotateCcw className={`${isCompact ? 'h-5 w-5' : 'h-10 w-10 sm:h-12 sm:w-12'} text-white drop-shadow-md`} strokeWidth={3} />;
      case 'draw2':
        return (
          <div className="flex flex-col items-center">
            <span className={`${isCompact ? 'text-xs' : 'text-2xl sm:text-3xl'} font-black text-white italic drop-shadow`}>+2</span>
            <Copy className={`${isCompact ? 'h-3 w-3' : 'h-5 w-5'} text-white/90`} />
          </div>
        );
      case 'wild':
        return (
          <div className="relative flex items-center justify-center">
            <div className={`grid grid-cols-2 rounded-full p-1 border-2 border-white/60 shadow-lg ${isCompact ? 'h-7 w-7' : 'h-14 w-14 sm:h-16 sm:w-16'}`}>
              <span className="rounded-tl-full bg-red-500" />
              <span className="rounded-tr-full bg-cyan-400" />
              <span className="rounded-bl-full bg-yellow-400" />
              <span className="rounded-br-full bg-emerald-400" />
            </div>
            <Sparkles className="absolute h-5 w-5 text-white animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        );
      case 'wild_draw4':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className={`grid grid-cols-2 rounded-full p-1 border-2 border-white/80 shadow-xl ${isCompact ? 'h-7 w-7' : 'h-12 w-12 sm:h-14 sm:w-14'}`}>
              <span className="rounded-tl-full bg-red-500" />
              <span className="rounded-tr-full bg-cyan-400" />
              <span className="rounded-bl-full bg-yellow-400" />
              <span className="rounded-br-full bg-emerald-400" />
            </div>
            <span className={`font-black text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] ${isCompact ? 'text-xs' : 'text-xl sm:text-2xl'}`}>
              +4
            </span>
          </div>
        );
      default:
        // Number card
        return (
          <span className={`font-black italic text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] ${isCompact ? 'text-lg' : 'text-4xl sm:text-5xl'}`}>
            {card.value}
          </span>
        );
    }
  };

  const renderCornerPips = () => {
    let label = `${card.value}`;
    if (card.value === 'draw2') label = '+2';
    if (card.value === 'wild_draw4') label = '+4';
    if (card.value === 'wild') label = '★';
    if (card.value === 'skip') label = '⊘';
    if (card.value === 'reverse') label = '⇄';

    return (
      <>
        {/* Top-left */}
        <div className="absolute left-1.5 top-1.5 flex flex-col items-center leading-none font-black text-white drop-shadow">
          <span className={isCompact ? 'text-[9px]' : 'text-xs sm:text-sm'}>{label}</span>
        </div>
        {/* Bottom-right inverted */}
        <div className="absolute right-1.5 bottom-1.5 flex flex-col items-center leading-none font-black text-white rotate-180 drop-shadow">
          <span className={isCompact ? 'text-[9px]' : 'text-xs sm:text-sm'}>{label}</span>
        </div>
      </>
    );
  };

  return (
    <motion.div
      onClick={isPlayable ? onClick : undefined}
      whileHover={
        isPlayable
          ? {
              y: yOffset - 32,
              scale: scale * 1.12,
              transition: { type: 'spring', stiffness: 450, damping: 20 },
            }
          : undefined
      }
      whileTap={isPlayable ? { scale: scale * 0.96 } : undefined}
      style={{
        transform: `rotate(${rotation}deg) translateY(${yOffset}px)`,
        transformOrigin: 'bottom center',
      }}
      className={`relative select-none rounded-xl border-2 transition-shadow cursor-pointer ${
        isCompact ? 'h-20 w-14' : 'h-36 w-24 sm:h-44 sm:w-30'
      } bg-gradient-to-br ${cStyle.bg} ${cStyle.border} ${
        isPlayable
          ? `${cStyle.glow} ring-2 ring-white/80 ring-offset-2 ring-offset-black hover:z-50 animate-pulse`
          : 'opacity-75 contrast-90 hover:opacity-90'
      } ${className}`}
    >
      {/* Corner pips */}
      {renderCornerPips()}

      {/* Glossy inner reflection */}
      <div className="absolute inset-2 flex items-center justify-center rounded-lg bg-black/25 backdrop-blur-[2px] border border-white/20 overflow-hidden shadow-inner">
        {/* Foil sheen line */}
        <div className="absolute -inset-x-10 -top-10 h-24 rotate-[-35deg] bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
        
        {/* Center Graphic */}
        {renderCenterGraphic()}
      </div>

      {/* Playable badge pulse on hover */}
      {isPlayable && (
        <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border border-black shadow-[0_0_8px_#00e676] animate-ping" />
      )}
    </motion.div>
  );
};
