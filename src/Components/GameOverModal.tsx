import React, { useEffect } from 'react';
import { GameState } from '../types/uno';
import confetti from 'canvas-confetti';
import { sound } from '../utils/soundEngine';
import { Trophy, Flame, Swords, Zap, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameOverModalProps {
  state: GameState;
  onPlayAgain: () => void;
  onExitLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ state, onPlayAgain, onExitLobby }) => {
  const winner = state.players.find((p) => p.id === state.winnerId);

  // Trigger celebratory confetti burst on mount
  useEffect(() => {
    sound.playVictory();

    const count = 200;
    const defaults = {
      origin: { y: 0.6 },
    };

    function fire(particleRatio: number, opts: Record<string, unknown>) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#00f0ff', '#ff1744', '#00e676', '#ffea00'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#00f0ff', '#ff1744', '#00e676', '#ffea00'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
  }, []);

  // Sorted players: winner 1st, then by least remaining hand cards
  const sortedPlayers = [...state.players].sort((a, b) => {
    if (a.id === state.winnerId) return -1;
    if (b.id === state.winnerId) return 1;
    return a.hand.length - b.hand.length;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 select-none">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative flex flex-col items-center max-w-xl w-full rounded-3xl border-2 border-cyan-400 bg-slate-950 p-6 sm:p-8 shadow-[0_0_80px_rgba(0,240,255,0.4)] text-center overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />

        {/* Trophy Header */}
        <div className="relative mb-3 flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-tr from-yellow-500 to-amber-300 border-2 border-white shadow-[0_0_40px_#ffea00]">
          <Trophy className="h-10 w-10 text-slate-950" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black italic tracking-wider text-white drop-shadow">
          {winner?.name.toUpperCase()} WINS!
        </h1>
        <p className="text-xs font-mono text-cyan-300 mt-1 mb-6">
          CIRCUIT CHAMPION &bull; ROUND {state.roundNumber} COMPLETED
        </p>

        {/* Cyberpunk Podium */}
        <div className="grid grid-cols-4 gap-2 w-full mb-6">
          {sortedPlayers.map((p, idx) => {
            const isWinner = idx === 0;
            return (
              <div
                key={p.id}
                className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all ${
                  isWinner
                    ? 'bg-gradient-to-b from-amber-500/30 to-yellow-600/10 border-yellow-400 shadow-[0_0_20px_rgba(255,234,0,0.3)] scale-105'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-full mb-1 ${
                    idx === 0
                      ? 'bg-yellow-400 text-black'
                      : idx === 1
                      ? 'bg-slate-300 text-black'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  #{idx + 1}
                </span>

                <span className="text-2xl my-1">{p.avatar}</span>
                <span className="text-xs font-bold text-white truncate max-w-full">{p.name}</span>

                <span className="text-[10px] font-mono text-cyan-400 mt-1">
                  {isWinner ? '0 CARDS' : `${p.hand.length} LEFT`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Match MVP Stats */}
        <div className="grid grid-cols-3 gap-3 w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-3 mb-6 text-left">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-400" />
            <div>
              <div className="text-[10px] font-mono text-slate-400">CARDS PLAYED</div>
              <div className="text-sm font-bold text-white">
                {state.stats[winner?.id || '']?.cardsPlayed || 12}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-cyan-400" />
            <div>
              <div className="text-[10px] font-mono text-slate-400">ATTACKS LAUNCHED</div>
              <div className="text-sm font-bold text-white">
                {state.stats[winner?.id || '']?.attacksLaunched || 3}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <div>
              <div className="text-[10px] font-mono text-slate-400">UNO CALLS</div>
              <div className="text-sm font-bold text-white">
                {state.stats[winner?.id || '']?.unoCalls || 1}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={() => {
              sound.playCardDeal();
              onPlayAgain();
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-black font-black py-3 rounded-2xl shadow-[0_0_25px_rgba(0,240,255,0.7)] hover:scale-105 transition"
          >
            <RefreshCw className="h-5 w-5" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onExitLobby}
            className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 font-bold px-5 py-3 rounded-2xl transition"
          >
            <Home className="h-5 w-5" />
            <span>LOBBY</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
