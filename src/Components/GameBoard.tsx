import React from 'react';
import { GameState } from '../types/uno';
import { CenterTable } from './CenterTable';
import { OpponentSlot } from './OpponentSlot';
import { PlayerHand } from './PlayerHand';
import { UnoButton } from './UnoButton';
import { motion } from 'framer-motion';
import { ShieldCheck, User } from 'lucide-react';

interface GameBoardProps {
  state: GameState;
  onPlayCard: (cardId: string) => void;
  onDrawCard: () => void;
  onCallUno: () => void;
  onCatchUno: () => void;
  isMyTurn: boolean;
  shakeScreen: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  state,
  onPlayCard,
  onDrawCard,
  onCallUno,
  onCatchUno,
  isMyTurn,
  shakeScreen,
}) => {
  const p0 = state.players[0]; // Local human player (Bottom)
  const p1 = state.players[1]; // Opponent Left
  const p2 = state.players[2]; // Opponent Top
  const p3 = state.players[3]; // Opponent Right

  return (
    <motion.main
      animate={
        shakeScreen
          ? {
              x: [-12, 12, -8, 8, -4, 4, 0],
              y: [-6, 6, -4, 4, 0],
              transition: { duration: 0.4 },
            }
          : {}
      }
      className="relative flex-1 w-full flex flex-col justify-between items-center px-2 sm:px-6 py-2 overflow-hidden"
    >
      {/* Oval Felt Table Surface Visual */}
      <div className="absolute inset-x-4 inset-y-12 sm:inset-x-12 sm:inset-y-14 rounded-[70px] sm:rounded-[120px] border-2 border-cyan-500/20 table-felt-radial pointer-events-none -z-10" />

      {/* TOP SLOT: Opponent 2 */}
      <div className="w-full flex justify-center pt-1 z-20">
        {p2 && (
          <OpponentSlot
            player={p2}
            isCurrentTurn={state.currentPlayerIndex === 2}
            position="top"
            state={state}
          />
        )}
      </div>

      {/* MIDDLE ROW: Opponent 1 (Left), Center Table, Opponent 3 (Right) */}
      <div className="relative w-full flex items-center justify-between px-2 sm:px-8 py-2 z-20">
        {/* LEFT SLOT: Opponent 1 */}
        <div className="flex-1 flex justify-start">
          {p1 && (
            <OpponentSlot
              player={p1}
              isCurrentTurn={state.currentPlayerIndex === 1}
              position="left"
              state={state}
            />
          )}
        </div>

        {/* CENTER TABLE */}
        <div className="flex-shrink-0">
          <CenterTable state={state} onDrawCard={onDrawCard} isMyTurn={isMyTurn} />
        </div>

        {/* RIGHT SLOT: Opponent 3 */}
        <div className="flex-1 flex justify-end">
          {p3 && (
            <OpponentSlot
              player={p3}
              isCurrentTurn={state.currentPlayerIndex === 3}
              position="right"
              state={state}
            />
          )}
        </div>
      </div>

      {/* BOTTOM AREA: Self Player & Controls */}
      <div className="relative w-full flex flex-col items-center z-30">
        {/* Player Status Strip & UNO Button */}
        <div className="w-full max-w-4xl px-4 flex items-center justify-between mb-1">
          {/* Self Profile Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/80 border border-slate-700 shadow-md">
            <span className="text-xl sm:text-2xl">{p0.avatar}</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide">
                  {p0.name} (YOU)
                </span>
                {p0.hasCalledUno && (
                  <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/40">
                    <ShieldCheck className="h-3 w-3" />
                    UNO SAFE
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                {isMyTurn ? '👉 YOUR TURN!' : 'Waiting for turn...'}
              </span>
            </div>
          </div>

          {/* Turn Countdown Ring if My Turn */}
          {isMyTurn && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <span className="text-[11px] font-mono text-slate-300">TIMER:</span>
              <span
                className={`font-mono font-black text-sm ${
                  state.turnTimeRemaining <= 5 ? 'text-rose-400 animate-ping' : 'text-cyan-300'
                }`}
              >
                {state.turnTimeRemaining}s
              </span>
            </div>
          )}

          {/* UNO Button */}
          <UnoButton state={state} onCallUno={onCallUno} onCatchUno={onCatchUno} />
        </div>

        {/* Player Hand */}
        <PlayerHand
          hand={p0.hand}
          state={state}
          onPlayCard={onPlayCard}
          onDrawCard={onDrawCard}
          isMyTurn={isMyTurn}
        />
      </div>
    </motion.main>
  );
};
