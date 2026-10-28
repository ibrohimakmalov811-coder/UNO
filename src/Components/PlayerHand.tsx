import React, { useMemo, useState } from 'react';
import { Card, CardColor, GameState } from '../types/uno';
import { CardView } from './CardView';
import { isValidPlay } from '../logic/unoEngine';
import { sound } from '../utils/soundEngine';
import { ArrowDownToLine, Shuffle, Sparkles, Filter } from 'lucide-react';

interface PlayerHandProps {
  hand: Card[];
  state: GameState;
  onPlayCard: (cardId: string) => void;
  onDrawCard: () => void;
  isMyTurn: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  hand,
  state,
  onPlayCard,
  onDrawCard,
  isMyTurn,
}) => {
  const [sortMode, setSortMode] = useState<'default' | 'color' | 'value'>('default');

  const topDiscard = state.discardPile[state.discardPile.length - 1];

  // Check playability of each card
  const playableMap = useMemo(() => {
    const map = new Map<string, boolean>();
    hand.forEach((card) => {
      const valid =
        isMyTurn &&
        isValidPlay(
          card,
          topDiscard,
          state.activeColor,
          state.pendingDrawCount,
          state.settings.stackDrawCards
        );
      map.set(card.id, valid);
    });
    return map;
  }, [hand, isMyTurn, topDiscard, state.activeColor, state.pendingDrawCount, state.settings.stackDrawCards]);

  const playableCount = Array.from(playableMap.values()).filter(Boolean).length;

  // Sorting logic
  const sortedHand = useMemo(() => {
    const copy = [...hand];
    if (sortMode === 'color') {
      const colorOrder: Record<CardColor, number> = {
        red: 1,
        blue: 2,
        green: 3,
        yellow: 4,
        wild: 5,
      };
      return copy.sort((a, b) => {
        if (colorOrder[a.color] !== colorOrder[b.color]) {
          return colorOrder[a.color] - colorOrder[b.color];
        }
        return a.score - b.score;
      });
    }
    if (sortMode === 'value') {
      return copy.sort((a, b) => a.score - b.score);
    }
    return copy;
  }, [hand, sortMode]);

  // Compute curved fanned spread
  const totalCards = sortedHand.length;
  // Dynamic spread based on card count
  const maxSpreadAngle = Math.min(60, totalCards * 4.5);
  const angleStep = totalCards > 1 ? maxSpreadAngle / (totalCards - 1) : 0;
  const startAngle = -maxSpreadAngle / 2;

  const handleCardClick = (cardId: string) => {
    if (!isMyTurn) return;
    const canPlay = playableMap.get(cardId);
    if (canPlay) {
      sound.playCardPlay();
      onPlayCard(cardId);
    } else {
      sound.playPenalty();
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-end pb-2 select-none z-30">
      {/* Hand Controls Bar */}
      <div className="mb-2 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
        <span className="text-xs font-mono font-semibold text-cyan-300">
          YOUR HAND ({totalCards})
        </span>

        {isMyTurn && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              playableCount > 0
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
            }`}
          >
            {playableCount > 0 ? `${playableCount} Playable` : 'No Moves! Draw!'}
          </span>
        )}

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* Sort Controls */}
        <button
          onClick={() => {
            sound.playCardDeal();
            setSortMode(sortMode === 'color' ? 'default' : 'color');
          }}
          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded transition ${
            sortMode === 'color'
              ? 'bg-cyan-500 text-black shadow-[0_0_8px_#00f0ff]'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Sort by Color"
        >
          <Filter className="h-3 w-3" />
          Color
        </button>

        <button
          onClick={() => {
            sound.playCardDeal();
            setSortMode(sortMode === 'value' ? 'default' : 'value');
          }}
          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded transition ${
            sortMode === 'value'
              ? 'bg-cyan-500 text-black shadow-[0_0_8px_#00f0ff]'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Sort by Number"
        >
          <Shuffle className="h-3 w-3" />
          Value
        </button>

        {/* Draw Card button quick trigger */}
        {isMyTurn && (
          <button
            onClick={() => {
              sound.playCardDraw();
              onDrawCard();
            }}
            className="flex items-center gap-1 ml-2 text-xs font-black bg-gradient-to-r from-cyan-500 to-blue-600 text-black px-3 py-1 rounded-full shadow-[0_0_12px_rgba(0,240,255,0.6)] hover:scale-105 transition"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            {state.pendingDrawCount > 0 ? `TAKE +${state.pendingDrawCount}` : 'DRAW'}
          </button>
        )}
      </div>

      {/* Fanned Cards Spread */}
      <div className="relative flex items-center justify-center h-48 sm:h-56 w-full max-w-4xl px-4 overflow-visible">
        {sortedHand.map((card, idx) => {
          const rotation = startAngle + idx * angleStep;
          // Arch curve: center cards are elevated, edges are lower
          const normalized = totalCards > 1 ? (idx - (totalCards - 1) / 2) / ((totalCards - 1) / 2) : 0;
          const yOffset = Math.abs(normalized) * 26;
          const isPlayable = playableMap.get(card.id) ?? false;

          // Horizontal overlap margin
          const overlapOffset = totalCards > 8 ? -Math.min(36, (totalCards - 8) * 4) : 0;

          return (
            <div
              key={card.id}
              style={{
                marginLeft: idx === 0 ? 0 : `${overlapOffset}px`,
                zIndex: isPlayable ? 40 + idx : 10 + idx,
              }}
              className="relative transition-transform duration-200"
            >
              <CardView
                card={card}
                isPlayable={isPlayable}
                rotation={rotation}
                yOffset={yOffset}
                onClick={() => handleCardClick(card.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
