import { Card, GameState, Player } from '../types/uno';
import { isValidPlay } from './unoEngine';

export interface BotDecision {
  action: 'play' | 'draw' | 'call_uno' | 'catch_uno';
  cardId?: string;
  chosenColor?: 'red' | 'blue' | 'green' | 'yellow';
  taunt?: { emoji: string; text: string };
}

// Evaluate what color the bot has the most cards of
export function getBestBotColor(bot: Player): 'red' | 'blue' | 'green' | 'yellow' {
  const counts: Record<'red' | 'blue' | 'green' | 'yellow', number> = {
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0,
  };

  bot.hand.forEach((c) => {
    if (c.color !== 'wild') {
      counts[c.color]++;
    }
  });

  let maxColor: 'red' | 'blue' | 'green' | 'yellow' = 'blue';
  let maxCount = -1;

  (['red', 'blue', 'green', 'yellow'] as const).forEach((color) => {
    if (counts[color] > maxCount) {
      maxCount = counts[color];
      maxColor = color;
    }
  });

  return maxColor;
}

// Personality-based cyber taunts
const TAUNT_PRESETS: Record<string, { emoji: string; text: string }[]> = {
  attack: [
    { emoji: '💀', text: 'Target locked.' },
    { emoji: '🔥', text: 'Eat plasma!' },
    { emoji: '⚡', text: 'Overclocked!' },
    { emoji: '😈', text: 'Not on my watch!' },
    { emoji: '💥', text: 'System breach!' },
  ],
  uno: [
    { emoji: '🚨', text: 'UNO! Try to stop me.' },
    { emoji: '👑', text: 'Victory sequence initialized.' },
    { emoji: '⚡', text: 'Final circuit engaged!' },
  ],
  catch: [
    { emoji: '🤡', text: 'Forgot to say UNO? Caught!' },
    { emoji: '🛑', text: 'Penalty inbound! Pay up!' },
  ],
};

// Main AI evaluation
export function getBotMove(state: GameState, botIndex: number): BotDecision {
  const bot = state.players[botIndex];
  if (!bot) return { action: 'draw' };

  const topDiscard = state.discardPile[state.discardPile.length - 1];
  const nextPlayerIndex = (botIndex + state.direction + state.players.length) % state.players.length;
  const nextPlayer = state.players[nextPlayerIndex];
  const nextPlayerIsThreat = nextPlayer.hand.length <= 2;

  // Filter legal cards
  const legalCards = bot.hand.filter((card) =>
    isValidPlay(card, topDiscard, state.activeColor, state.pendingDrawCount, state.settings.stackDrawCards)
  );

  // If no playable cards, bot must draw
  if (legalCards.length === 0) {
    return { action: 'draw' };
  }

  // Scoring cards to pick the best move based on personality
  let chosenCard: Card | null = null;

  if (state.pendingDrawCount > 0) {
    // If pending draw stack exists, play any matching stack counter immediately
    chosenCard = legalCards.find((c) => c.value === topDiscard.value) || legalCards[0];
  } else if (nextPlayerIsThreat) {
    // Next player is about to win! Attack them with +4, +2, or Skip
    const attacks = legalCards.filter(
      (c) => c.value === 'wild_draw4' || c.value === 'draw2' || c.value === 'skip' || c.value === 'reverse'
    );
    if (attacks.length > 0) {
      chosenCard = attacks[0];
    }
  }

  // If no defensive/offensive imperative, prioritize matching non-wilds first to save wilds
  if (!chosenCard) {
    const nonWilds = legalCards.filter((c) => c.color !== 'wild');
    if (nonWilds.length > 0) {
      // Prioritize same color matching
      const sameColor = nonWilds.filter((c) => c.color === state.activeColor);
      if (sameColor.length > 0) {
        // Play action cards first, then highest number
        chosenCard = sameColor.sort((a, b) => b.score - a.score)[0];
      } else {
        // Play same number matching another color
        chosenCard = nonWilds[0];
      }
    } else {
      // Only wild cards available
      chosenCard = legalCards[0];
    }
  }

  const chosenColor = chosenCard.color === 'wild' ? getBestBotColor(bot) : undefined;

  // Check if bot should taunt
  let taunt: { emoji: string; text: string } | undefined;
  if (chosenCard.value === 'wild_draw4' || chosenCard.value === 'draw2') {
    if (Math.random() < 0.6) {
      const pool = TAUNT_PRESETS.attack;
      taunt = pool[Math.floor(Math.random() * pool.length)];
    }
  }

  return {
    action: 'play',
    cardId: chosenCard.id,
    chosenColor,
    taunt,
  };
}

// Bot UNO check: Did a human or other bot forget to say UNO?
export function checkBotUnoCatch(state: GameState, botIndex: number): boolean {
  const bot = state.players[botIndex];
  if (!bot || !bot.isBot) return false;

  // Check if there's someone holding 1 card without calling UNO
  const target = state.players.find((p, idx) => idx !== botIndex && p.hand.length === 1 && !p.hasCalledUno);

  if (target) {
    // Bot reaction chance based on personality
    const catchChance = bot.botPersonality === 'blaze' ? 0.95 : bot.botPersonality === 'viper' ? 0.85 : 0.7;
    return Math.random() < catchChance;
  }

  return false;
}
