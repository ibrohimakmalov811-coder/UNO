import { Card, CardColor, CardValue, GameState, Player, GameSettings, ActionAlert } from '../types/uno';

// Generates the standard 108-card UNO deck
export function createDeck(): Card[] {
  const deck: Card[] = [];
  const colors: CardColor[] = ['red', 'blue', 'green', 'yellow'];

  colors.forEach((color) => {
    // One '0' card per color
    deck.push({
      id: `${color}-0-${Math.random().toString(36).substring(2, 7)}`,
      color,
      value: 0,
      type: 'number',
      score: 0,
    });

    // Two of each 1-9
    for (let i = 1; i <= 9; i++) {
      for (let copy = 1; copy <= 2; copy++) {
        deck.push({
          id: `${color}-${i}-${copy}-${Math.random().toString(36).substring(2, 7)}`,
          color,
          value: i as CardValue,
          type: 'number',
          score: i,
        });
      }
    }

    // Two of each Action card: Skip, Reverse, Draw 2
    const actionTypes: CardValue[] = ['skip', 'reverse', 'draw2'];
    actionTypes.forEach((act) => {
      for (let copy = 1; copy <= 2; copy++) {
        deck.push({
          id: `${color}-${act}-${copy}-${Math.random().toString(36).substring(2, 7)}`,
          color,
          value: act,
          type: 'action',
          score: 20,
        });
      }
    });
  });

  // 4 Wild cards
  for (let i = 1; i <= 4; i++) {
    deck.push({
      id: `wild-${i}-${Math.random().toString(36).substring(2, 7)}`,
      color: 'wild',
      value: 'wild',
      type: 'wild',
      score: 50,
    });
  }

  // 4 Wild Draw 4 cards
  for (let i = 1; i <= 4; i++) {
    deck.push({
      id: `wild_draw4-${i}-${Math.random().toString(36).substring(2, 7)}`,
      color: 'wild',
      value: 'wild_draw4',
      type: 'wild',
      score: 50,
    });
  }

  return deck;
}

// Fisher-Yates cryptographically robust shuffle
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Validate whether a card is legal to play
export function isValidPlay(
  card: Card,
  topDiscard: Card | undefined,
  activeColor: 'red' | 'blue' | 'green' | 'yellow',
  pendingDrawCount: number,
  allowStacking: boolean
): boolean {
  if (!topDiscard) return true;

  // Stacking Scenario
  if (pendingDrawCount > 0) {
    if (!allowStacking) return false;
    // Stack Draw 2 on Draw 2
    if (topDiscard.value === 'draw2' && card.value === 'draw2') return true;
    // Stack Wild Draw 4 on Wild Draw 4
    if (topDiscard.value === 'wild_draw4' && card.value === 'wild_draw4') return true;
    return false;
  }

  // Normal Play Scenario
  // 1. Wild cards can be played on anything
  if (card.color === 'wild' || card.type === 'wild') {
    return true;
  }

  // 2. Same color as active color
  if (card.color === activeColor) {
    return true;
  }

  // 3. Same value / symbol
  if (card.value === topDiscard.value) {
    return true;
  }

  return false;
}

// Helper to advance player index
export function getNextPlayerIndex(
  current: number,
  direction: 1 | -1,
  totalPlayers: number,
  step: number = 1
): number {
  return (current + direction * step + totalPlayers * 10) % totalPlayers;
}

// Reshuffle discard pile when draw pile is running low
export function replenishDrawPile(drawPile: Card[], discardPile: Card[]): { newDraw: Card[]; newDiscard: Card[] } {
  if (drawPile.length > 3) {
    return { newDraw: drawPile, newDiscard: discardPile };
  }
  if (discardPile.length <= 1) {
    // Emergency deck generation if all cards are in hands
    const fresh = shuffleDeck(createDeck());
    return { newDraw: [...drawPile, ...fresh], newDiscard: discardPile };
  }

  const topCard = discardPile[discardPile.length - 1];
  const cardsToShuffle = discardPile.slice(0, discardPile.length - 1);
  const reshuffled = shuffleDeck(cardsToShuffle);

  return {
    newDraw: [...drawPile, ...reshuffled],
    newDiscard: [topCard],
  };
}

// Default Bot Personas
export const DEFAULT_BOTS: Player[] = [
  {
    id: 'bot_blaze',
    name: 'BLAZE_99',
    avatar: '🤖',
    isBot: true,
    botPersonality: 'blaze',
    hand: [],
    hasCalledUno: false,
    score: 0,
  },
  {
    id: 'bot_viper',
    name: 'VIPER_X',
    avatar: '👾',
    isBot: true,
    botPersonality: 'viper',
    hand: [],
    hasCalledUno: false,
    score: 0,
  },
  {
    id: 'bot_glitch',
    name: 'GLITCH_KID',
    avatar: '⚡',
    isBot: true,
    botPersonality: 'glitch',
    hand: [],
    hasCalledUno: false,
    score: 0,
  },
];

// Initialize a new game
export function initializeGame(
  roomCode: string,
  humanPlayerName: string = 'CyberPlayer',
  humanAvatar: string = '😎',
  customSettings?: Partial<GameSettings>
): GameState {
  const defaultSettings: GameSettings = {
    stackDrawCards: true,
    jumpIn: false,
    turnDuration: 15,
    forcePlayDrawn: false,
    soundEnabled: true,
    ...customSettings,
  };

  const humanPlayer: Player = {
    id: 'p0',
    name: humanPlayerName,
    avatar: humanAvatar,
    isBot: false,
    hand: [],
    hasCalledUno: false,
    score: 0,
    isHost: true,
  };

  const players: Player[] = [
    humanPlayer,
    { ...DEFAULT_BOTS[0], id: 'p1', hand: [], hasCalledUno: false },
    { ...DEFAULT_BOTS[1], id: 'p2', hand: [], hasCalledUno: false },
    { ...DEFAULT_BOTS[2], id: 'p3', hand: [], hasCalledUno: false },
  ];

  let deck = shuffleDeck(createDeck());

  // Deal 7 cards to each player
  for (let round = 0; round < 7; round++) {
    for (const player of players) {
      const drawn = deck.pop();
      if (drawn) player.hand.push(drawn);
    }
  }

  // Draw starting discard card (cannot be Wild Draw 4)
  let topDiscard = deck.pop()!;
  while (topDiscard.value === 'wild_draw4') {
    deck.unshift(topDiscard);
    deck = shuffleDeck(deck);
    topDiscard = deck.pop()!;
  }

  let activeColor: 'red' | 'blue' | 'green' | 'yellow' = 'blue';
  if (topDiscard.color !== 'wild') {
    activeColor = topDiscard.color;
  } else {
    // If starting card is a regular Wild, pick a vibrant default
    const colors: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];
    activeColor = colors[Math.floor(Math.random() * colors.length)];
  }

  let direction: 1 | -1 = 1;
  let currentPlayerIndex = 0;
  let pendingDrawCount = 0;

  // Handle first card action effect if any
  if (topDiscard.value === 'reverse') {
    direction = -1;
  } else if (topDiscard.value === 'skip') {
    currentPlayerIndex = 1;
  } else if (topDiscard.value === 'draw2') {
    pendingDrawCount = 2;
  }

  const initialStats = players.reduce((acc, p) => {
    acc[p.id] = {
      cardsPlayed: 0,
      attacksLaunched: 0,
      unoCalls: 0,
      catches: 0,
      durationSeconds: 0,
    };
    return acc;
  }, {} as Record<string, any>);

  return {
    roomCode,
    players,
    currentPlayerIndex,
    direction,
    discardPile: [topDiscard],
    drawPile: deck,
    activeColor,
    pendingDrawCount,
    turnTimeRemaining: defaultSettings.turnDuration,
    gameStatus: 'playing',
    winnerId: null,
    settings: defaultSettings,
    actionAlert: {
      id: Math.random().toString(),
      text: 'GAME ON!',
      type: 'turn',
      playerIndex: currentPlayerIndex,
      playerName: players[currentPlayerIndex].name,
      timestamp: Date.now(),
    },
    logs: [
      {
        id: Math.random().toString(),
        text: `Round started! First card is ${topDiscard.color.toUpperCase()} ${topDiscard.value}.`,
        color: topDiscard.color,
        timestamp: Date.now(),
      },
    ],
    stats: initialStats,
    roundNumber: 1,
    mustCallUnoPlayerId: null,
    mustCallUnoDeadline: null,
  };
}

// Execute playing a card
export function executePlayCard(
  state: GameState,
  playerIndex: number,
  cardId: string,
  chosenColor?: 'red' | 'blue' | 'green' | 'yellow'
): { nextState: GameState; error?: string } {
  const player = state.players[playerIndex];
  if (!player) return { nextState: state, error: 'Player not found' };

  if (state.currentPlayerIndex !== playerIndex && !state.settings.jumpIn) {
    return { nextState: state, error: 'Not your turn!' };
  }

  const cardIndex = player.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return { nextState: state, error: 'Card not in hand' };

  const card = player.hand[cardIndex];
  const topDiscard = state.discardPile[state.discardPile.length - 1];

  if (!isValidPlay(card, topDiscard, state.activeColor, state.pendingDrawCount, state.settings.stackDrawCards)) {
    return { nextState: state, error: 'Invalid card play!' };
  }

  // Clone state
  const newPlayers = state.players.map((p, idx) => {
    if (idx !== playerIndex) return { ...p };
    return {
      ...p,
      hand: p.hand.filter((c) => c.id !== cardId),
    };
  });

  const remainingCardsCount = newPlayers[playerIndex].hand.length;
  let newPendingDraw = state.pendingDrawCount;
  let newDirection = state.direction;
  let step = 1;
  let alert: ActionAlert | null = null;
  let resolvedColor = state.activeColor;

  // Resolve wild color
  if (card.color === 'wild') {
    resolvedColor = chosenColor || 'red';
  } else {
    resolvedColor = card.color;
  }

  // Update stats
  const newStats = { ...state.stats };
  if (newStats[player.id]) {
    newStats[player.id].cardsPlayed += 1;
  }

  // Resolve Action Cards
  if (card.value === 'reverse') {
    newDirection = (newDirection * -1) as 1 | -1;
    alert = {
      id: Math.random().toString(),
      text: 'REVERSE!',
      type: 'reverse',
      playerIndex,
      playerName: player.name,
      timestamp: Date.now(),
    };
  } else if (card.value === 'skip') {
    step = 2;
    const skippedIndex = getNextPlayerIndex(playerIndex, newDirection, state.players.length, 1);
    alert = {
      id: Math.random().toString(),
      text: `${state.players[skippedIndex].name} SKIPPED!`,
      type: 'skip',
      playerIndex: skippedIndex,
      playerName: state.players[skippedIndex].name,
      timestamp: Date.now(),
    };
  } else if (card.value === 'draw2') {
    newPendingDraw += 2;
    if (newStats[player.id]) newStats[player.id].attacksLaunched += 1;
    alert = {
      id: Math.random().toString(),
      text: state.settings.stackDrawCards ? `+2 STACK (${newPendingDraw})!` : '+2 DRAW!',
      type: 'draw',
      playerIndex,
      playerName: player.name,
      timestamp: Date.now(),
    };
    if (!state.settings.stackDrawCards) {
      step = 2; // In non-stacking, next player draws and loses their turn
    }
  } else if (card.value === 'wild_draw4') {
    newPendingDraw += 4;
    if (newStats[player.id]) newStats[player.id].attacksLaunched += 1;
    alert = {
      id: Math.random().toString(),
      text: state.settings.stackDrawCards ? `+4 STACK (${newPendingDraw})!` : '+4 BOMBSHELL!',
      type: 'draw',
      playerIndex,
      playerName: player.name,
      timestamp: Date.now(),
    };
    if (!state.settings.stackDrawCards) {
      step = 2;
    }
  } else if (card.type === 'wild') {
    alert = {
      id: Math.random().toString(),
      text: `COLOR: ${resolvedColor.toUpperCase()}`,
      type: 'wild',
      playerIndex,
      playerName: player.name,
      timestamp: Date.now(),
    };
  }

  // Check Win Condition
  if (remainingCardsCount === 0) {
    const finalScores = calculateScores(newPlayers, player.id);
    return {
      nextState: {
        ...state,
        players: newPlayers.map((p) => ({
          ...p,
          score: p.id === player.id ? p.score + finalScores : p.score,
        })),
        discardPile: [...state.discardPile, card],
        activeColor: resolvedColor,
        gameStatus: 'game_over',
        winnerId: player.id,
        actionAlert: {
          id: Math.random().toString(),
          text: `🏆 ${player.name} WINS!`,
          type: 'win',
          playerIndex,
          playerName: player.name,
          timestamp: Date.now(),
        },
        stats: newStats,
        logs: [
          ...state.logs,
          {
            id: Math.random().toString(),
            text: `👑 ${player.name} played their final card (${card.value}) and won the match!`,
            color: resolvedColor,
            timestamp: Date.now(),
          },
        ],
      },
    };
  }

  // Check UNO Status (holding 1 card)
  let mustCallPlayer: string | null = state.mustCallUnoPlayerId;
  let mustCallDeadline: number | null = state.mustCallUnoDeadline;

  if (remainingCardsCount === 1) {
    if (!player.hasCalledUno) {
      mustCallPlayer = player.id;
      // 3.5 seconds window for player to click UNO or opponents to catch
      mustCallDeadline = Date.now() + 3500;
    }
  } else {
    // Reset UNO called state if player has more cards
    newPlayers[playerIndex].hasCalledUno = false;
    if (mustCallPlayer === player.id) {
      mustCallPlayer = null;
      mustCallDeadline = null;
    }
  }

  const nextPlayerIndex = getNextPlayerIndex(playerIndex, newDirection, state.players.length, step);

  const logEntry = {
    id: Math.random().toString(),
    text: `${player.name} played ${card.color !== 'wild' ? card.color : ''} ${card.value}${
      card.color === 'wild' ? ` -> ${resolvedColor.toUpperCase()}` : ''
    }`,
    color: resolvedColor,
    timestamp: Date.now(),
  };

  return {
    nextState: {
      ...state,
      players: newPlayers,
      currentPlayerIndex: nextPlayerIndex,
      direction: newDirection,
      discardPile: [...state.discardPile, card],
      activeColor: resolvedColor,
      pendingDrawCount: newPendingDraw,
      turnTimeRemaining: state.settings.turnDuration,
      actionAlert: alert,
      logs: [logEntry, ...state.logs.slice(0, 40)],
      stats: newStats,
      mustCallUnoPlayerId: mustCallPlayer,
      mustCallUnoDeadline: mustCallDeadline,
    },
  };
}

// Execute drawing cards (either taking pending penalty or 1 card from deck)
export function executeDrawCard(state: GameState, playerIndex: number): GameState {
  const player = state.players[playerIndex];
  if (!player) return state;

  const countToDraw = state.pendingDrawCount > 0 ? state.pendingDrawCount : 1;
  const isPenaltyDraw = state.pendingDrawCount > 0;

  // Replenish draw pile if needed
  let { newDraw, newDiscard } = replenishDrawPile(state.drawPile, state.discardPile);
  const drawnCards: Card[] = [];

  for (let i = 0; i < countToDraw; i++) {
    if (newDraw.length === 0) {
      const rep = replenishDrawPile(newDraw, newDiscard);
      newDraw = rep.newDraw;
      newDiscard = rep.newDiscard;
    }
    const card = newDraw.pop();
    if (card) drawnCards.push(card);
  }

  const newPlayers = state.players.map((p, idx) => {
    if (idx !== playerIndex) return { ...p };
    return {
      ...p,
      hand: [...p.hand, ...drawnCards],
      hasCalledUno: false, // drawing forfeits UNO safety
    };
  });

  const nextIndex = getNextPlayerIndex(playerIndex, state.direction, state.players.length, 1);

  const alert: ActionAlert = {
    id: Math.random().toString(),
    text: isPenaltyDraw ? `${player.name} DREW +${countToDraw}!` : `${player.name} DREW 1`,
    type: 'draw',
    playerIndex,
    playerName: player.name,
    timestamp: Date.now(),
  };

  const logText = isPenaltyDraw
    ? `💥 ${player.name} took the hit and drew ${countToDraw} cards!`
    : `${player.name} drew a card.`;

  return {
    ...state,
    players: newPlayers,
    drawPile: newDraw,
    discardPile: newDiscard,
    currentPlayerIndex: nextIndex,
    pendingDrawCount: 0,
    turnTimeRemaining: state.settings.turnDuration,
    actionAlert: alert,
    logs: [
      {
        id: Math.random().toString(),
        text: logText,
        timestamp: Date.now(),
      },
      ...state.logs.slice(0, 40),
    ],
  };
}

// Player calls "UNO!"
export function executeCallUno(state: GameState, playerIndex: number): { nextState: GameState; success: boolean } {
  const player = state.players[playerIndex];
  if (!player) return { nextState: state, success: false };

  // Valid if holding 1 or 2 cards (or calling ahead of playing)
  if (player.hand.length <= 2) {
    const newPlayers = state.players.map((p, idx) => (idx === playerIndex ? { ...p, hasCalledUno: true } : p));
    const newStats = { ...state.stats };
    if (newStats[player.id]) newStats[player.id].unoCalls += 1;

    return {
      nextState: {
        ...state,
        players: newPlayers,
        mustCallUnoPlayerId: state.mustCallUnoPlayerId === player.id ? null : state.mustCallUnoPlayerId,
        mustCallUnoDeadline: state.mustCallUnoPlayerId === player.id ? null : state.mustCallUnoDeadline,
        actionAlert: {
          id: Math.random().toString(),
          text: `⚡ ${player.name} CALLED UNO!`,
          type: 'uno',
          playerIndex,
          playerName: player.name,
          timestamp: Date.now(),
        },
        stats: newStats,
        logs: [
          {
            id: Math.random().toString(),
            text: `🔥 ${player.name} shouted "UNO!" and is safe!`,
            timestamp: Date.now(),
          },
          ...state.logs.slice(0, 40),
        ],
      },
      success: true,
    };
  }

  return { nextState: state, success: false };
}

// Catch an opponent who forgot to call UNO
export function executeCatchUno(state: GameState, catcherIndex: number): { nextState: GameState; caught: boolean } {
  const catcher = state.players[catcherIndex];
  if (!catcher) return { nextState: state, caught: false };

  // Look for any player who has exactly 1 card and has NOT called UNO
  const targetIndex = state.players.findIndex(
    (p, idx) => idx !== catcherIndex && p.hand.length === 1 && !p.hasCalledUno
  );

  if (targetIndex === -1) {
    return { nextState: state, caught: false };
  }

  const target = state.players[targetIndex];

  // Draw 2 penalty cards for forgetting UNO
  let { newDraw, newDiscard } = replenishDrawPile(state.drawPile, state.discardPile);
  const penaltyCards: Card[] = [];

  for (let i = 0; i < 2; i++) {
    if (newDraw.length === 0) {
      const rep = replenishDrawPile(newDraw, newDiscard);
      newDraw = rep.newDraw;
      newDiscard = rep.newDiscard;
    }
    const c = newDraw.pop();
    if (c) penaltyCards.push(c);
  }

  const newPlayers = state.players.map((p, idx) => {
    if (idx === targetIndex) {
      return {
        ...p,
        hand: [...p.hand, ...penaltyCards],
        hasCalledUno: false,
      };
    }
    return p;
  });

  const newStats = { ...state.stats };
  if (newStats[catcher.id]) newStats[catcher.id].catches += 1;

  return {
    nextState: {
      ...state,
      players: newPlayers,
      drawPile: newDraw,
      discardPile: newDiscard,
      mustCallUnoPlayerId: null,
      mustCallUnoDeadline: null,
      actionAlert: {
        id: Math.random().toString(),
        text: `🚨 ${target.name} CAUGHT! +2 PENALTY!`,
        type: 'catch',
        playerIndex: targetIndex,
        playerName: target.name,
        timestamp: Date.now(),
      },
      stats: newStats,
      logs: [
        {
          id: Math.random().toString(),
          text: `🚨 ${catcher.name} caught ${target.name} forgetting UNO! +2 penalty cards applied!`,
          timestamp: Date.now(),
        },
        ...state.logs.slice(0, 40),
      ],
    },
    caught: true,
  };
}

// Calculate standard points for winning round
export function calculateScores(players: Player[], winnerId: string): number {
  let scoreSum = 0;
  players.forEach((p) => {
    if (p.id !== winnerId) {
      p.hand.forEach((card) => {
        scoreSum += card.score;
      });
    }
  });
  return scoreSum;
}
