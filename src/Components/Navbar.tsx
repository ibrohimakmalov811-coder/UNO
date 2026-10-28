import React, { useState } from 'react';
import { GameState } from '../types/uno';
import { sound } from '../utils/soundEngine';
import { Volume2, VolumeX, Copy, Check, BookOpen, MessageSquarePlus, RefreshCw, Zap } from 'lucide-react';

interface NavbarProps {
  state: GameState;
  onSendTaunt: (emoji: string, text: string) => void;
  onOpenRules: () => void;
  onNewGame: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ state, onSendTaunt, onOpenRules, onNewGame }) => {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [tauntOpen, setTauntOpen] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(state.roomCode);
    setCopied(true);
    sound.playCardDeal();
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const tauntOptions = [
    { emoji: '🔥', text: 'EAT PLASMA!' },
    { emoji: '💀', text: 'TARGET LOCKED' },
    { emoji: '🤡', text: 'CRY ABOUT IT' },
    { emoji: '⚡', text: 'OVERCLOCKED!' },
    { emoji: '👑', text: 'UNO MASTER' },
    { emoji: '😭', text: 'HAVE MERCY' },
  ];

  return (
    <header className="relative z-40 w-full px-4 py-2.5 flex items-center justify-between border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
          <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-400 text-sm sm:text-base">
            CYBER UNO
          </span>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800">
            2099
          </span>
        </div>

        {/* Room Code Badge */}
        <button
          onClick={copyRoomCode}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition group text-xs font-mono"
          title="Click to copy Room Code"
        >
          <span className="text-slate-400">ROOM:</span>
          <span className="font-bold text-cyan-300">{state.roomCode}</span>
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-slate-400 group-hover:text-cyan-300" />}
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Taunt Popover Menu */}
        <div className="relative">
          <button
            onClick={() => setTauntOpen(!tauntOpen)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-fuchsia-500 text-slate-300 hover:text-white text-xs font-bold transition"
            title="Send Taunt"
          >
            <MessageSquarePlus className="h-3.5 w-3.5 text-fuchsia-400" />
            <span className="hidden md:inline">TAUNT</span>
          </button>

          {tauntOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-fuchsia-500/40 bg-slate-950 p-2 shadow-[0_0_25px_rgba(217,70,239,0.4)] z-50">
              <div className="text-[10px] font-mono text-fuchsia-300 px-2 py-1 uppercase tracking-wider">
                Select Cyber Taunt
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {tauntOptions.map((t) => (
                  <button
                    key={t.text}
                    onClick={() => {
                      sound.playTaunt();
                      onSendTaunt(t.emoji, t.text);
                      setTauntOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-900 text-left text-xs text-white transition hover:text-cyan-300"
                  >
                    <span className="text-base">{t.emoji}</span>
                    <span className="font-mono text-[11px]">{t.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rules Guide Button */}
        <button
          onClick={onOpenRules}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-bold transition"
          title="Game Rules"
        >
          <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden md:inline">RULES</span>
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleSound}
          className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
        </button>

        {/* Restart / New Game */}
        <button
          onClick={onNewGame}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-yellow-400 text-slate-300 hover:text-white text-xs font-bold transition"
          title="Start Fresh Game"
        >
          <RefreshCw className="h-3.5 w-3.5 text-yellow-400" />
          <span className="hidden sm:inline">RESTART</span>
        </button>
      </div>
    </header>
  );
};
