import React from 'react';
import { X, ShieldAlert, Zap, Ban, RotateCcw, Copy, Sparkles } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="relative flex flex-col max-w-xl w-full max-h-[85vh] rounded-3xl border-2 border-cyan-400 bg-slate-950 p-6 shadow-[0_0_50px_rgba(0,240,255,0.3)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-black italic text-white tracking-wider">OFFICIAL RULES & TACTICS</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs text-slate-300">
          {/* Rule 1: Goal */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
            <h3 className="font-bold text-cyan-300 mb-1 text-sm">🎯 MISSION OBJECTIVE</h3>
            <p className="leading-relaxed">
              Be the first player to discard all cards from your hand. You can play a card if it matches the current active card in <b>Color</b>, <b>Number</b>, or <b>Symbol</b>, or by playing any <b>Wild Card</b>.
            </p>
          </div>

          {/* Action Cards */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
            <h3 className="font-bold text-cyan-300 mb-2 text-sm">⚡ ACTION CARDS</h3>
            
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold text-white">SKIP:</span> The next player in turn order loses their turn immediately.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-white">REVERSE:</span> Reverses the direction of play (Clockwise &harr; Counter-Clockwise).
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white">DRAW 2 (+2):</span> The next player must draw 2 cards and lose their turn, unless stacking is active!
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-fuchsia-400 shrink-0" />
              <div>
                <span className="font-bold text-white">WILD & WILD DRAW 4:</span> Can be played on anything. Wild Draw 4 adds 4 cards to the stack and changes the active color.
              </div>
            </div>
          </div>

          {/* Stacking Rule */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
            <h3 className="font-bold text-cyan-300 mb-1 text-sm">🔥 ATTACK STACKING</h3>
            <p className="leading-relaxed">
              When enabled, if someone plays a Draw 2 on you, you can counter by playing another Draw 2! The penalty accumulates (e.g. +2 &rarr; +4 &rarr; +6) and passes to the next player until someone cannot stack!
            </p>
          </div>

          {/* UNO Button & Penalty Catch */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3.5">
            <div className="flex items-center gap-2 text-rose-400 mb-1 font-bold text-sm">
              <ShieldAlert className="h-4 w-4" />
              <span>THE "UNO!" SHOUT & PENALTY MECHANIC</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              When you play your second-to-last card and hold only <b>1 card</b>, you must hit the <b>UNO!</b> button. If you forget to hit it before the next player takes their turn, any opponent can click <b>CATCH UNO!</b> to hit you with a <b>+2 card penalty</b>!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition shadow-[0_0_15px_#00f0ff]"
          >
            GOT IT, LET'S PLAY!
          </button>
        </div>
      </div>
    </div>
  );
};
