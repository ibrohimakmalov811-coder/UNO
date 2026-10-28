import React, { useState } from 'react';
import { GameSettings } from '../types/uno';
import { generateRoomCode } from '../logic/networkEngine';
import { sound } from '../utils/soundEngine';
import { Users, Bot, Sliders, Play, Sparkles } from 'lucide-react';

interface LobbyModalProps {
  isOpen: boolean;
  onStartGame: (name: string, avatar: string, roomCode: string, settings: GameSettings) => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({ isOpen, onStartGame }) => {
  const [playerName, setPlayerName] = useState('CyberViper');
  const [selectedAvatar, setSelectedAvatar] = useState('⚡');
  const [roomCode, setRoomCode] = useState(() => generateRoomCode());
  const [stacking, setStacking] = useState(true);
  const [turnDuration, setTurnDuration] = useState(15);
  const [jumpIn, setJumpIn] = useState(false);

  const avatars = ['⚡', '🤖', '👾', '🥷', '👑', '👽', '🦊', '🔥', '😎', '🚀'];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCardDeal();
    onStartGame(playerName.trim() || 'Player', selectedAvatar, roomCode, {
      stackDrawCards: stacking,
      jumpIn,
      turnDuration,
      forcePlayDrawn: false,
      soundEnabled: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none">
      <div className="relative flex flex-col max-w-lg w-full rounded-3xl border-2 border-cyan-400 bg-slate-950 p-6 sm:p-8 shadow-[0_0_60px_rgba(0,240,255,0.35)] overflow-hidden">
        {/* Glow corner highlights */}
        <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-cyan-500/20 blur-2xl" />
        <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-2xl" />

        {/* Title */}
        <div className="flex items-center gap-2 mb-1 text-cyan-400">
          <Sparkles className="h-5 w-5 animate-spin" style={{ animationDuration: '4s' }} />
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-wider text-white">
            CYBER UNO <span className="text-cyan-400">2099</span>
          </h1>
        </div>
        <p className="text-xs font-mono text-slate-400 mb-6">
          ARCADE EDITION &bull; 4-PLAYER TURN MATRIX
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Player Nickname */}
          <div>
            <label className="text-[11px] font-mono text-cyan-300 font-bold block mb-1.5 uppercase tracking-wider">
              YOUR HANDLE
            </label>
            <input
              type="text"
              maxLength={15}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono font-bold"
              placeholder="Enter username"
            />
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="text-[11px] font-mono text-cyan-300 font-bold block mb-1.5 uppercase tracking-wider">
              SELECT AVATAR
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {avatars.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => {
                    sound.playCardDeal();
                    setSelectedAvatar(av);
                  }}
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border text-xl transition-all ${
                    selectedAvatar === av
                      ? 'border-cyan-400 bg-cyan-950/80 shadow-[0_0_15px_rgba(0,240,255,0.6)] scale-110'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Room Code */}
          <div>
            <label className="text-[11px] font-mono text-cyan-300 font-bold block mb-1.5 uppercase tracking-wider">
              TABLE ROOM CODE
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white font-mono font-bold uppercase focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  sound.playCardDeal();
                  setRoomCode(generateRoomCode());
                }}
                className="px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs text-cyan-300 font-mono font-bold"
              >
                RANDOM
              </button>
            </div>
          </div>

          {/* House Rules Toggles */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 mb-3">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span>HOUSE RULES</span>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              {/* Stacking Rule */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Stack +2 and +4 Cards</span>
                <input
                  type="checkbox"
                  checked={stacking}
                  onChange={(e) => setStacking(e.target.checked)}
                  className="h-4 w-4 rounded accent-cyan-400 cursor-pointer"
                />
              </label>

              {/* Jump In Rule */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Jump-In (Play out of turn if identical)</span>
                <input
                  type="checkbox"
                  checked={jumpIn}
                  onChange={(e) => setJumpIn(e.target.checked)}
                  className="h-4 w-4 rounded accent-cyan-400 cursor-pointer"
                />
              </label>

              {/* Turn Timer Selector */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-slate-300">Turn Timer</span>
                <div className="flex gap-1.5">
                  {[10, 15, 30].map((sec) => (
                    <button
                      type="button"
                      key={sec}
                      onClick={() => setTurnDuration(sec)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        turnDuration === sec
                          ? 'bg-cyan-500 text-black shadow-[0_0_8px_#00f0ff]'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Launch Battle Button */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 mt-2 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 py-3.5 text-sm font-black text-black shadow-[0_0_30px_rgba(0,240,255,0.8)] hover:scale-102 active:scale-98 transition tracking-wider uppercase"
          >
            <Play className="h-5 w-5 fill-black" />
            <span>ENTER THE ARENA (4 PLAYERS)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
