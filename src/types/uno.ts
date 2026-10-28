export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild_draw4';
export type CardType = 'number' | 'action' | 'wild';

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
  type: CardType;
  score: number;
}

export type BotPersonality = 'blaze' | 'viper' | 'glitch';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  botPersonality?: BotPersonality;
  hand: Card[];
  hasCalledUno: boolean;
  score: number;
  isHost?: boolean;
  isReady?: boolean;
  recentTaunt?: {
    emoji: string;
    text: string;
    time: number;
  };
}

export type GameStatus = 'lobby' | 'dealing' | 'playing' | 'round_end' | 'game_over';

export interface GameSettings {
  stackDrawCards: boolean; // Draw 2 on Draw 2, Wild 4 on Wild 4
  jumpIn: boolean;         // Play identical card out of turn
  turnDuration: number;    // Countdown in seconds (e.g. 15)
  forcePlayDrawn: boolean; // Must play drawn card if playable
  soundEnabled: boolean;
}

export interface ActionAlert {
  id: string;
  text: string;
  type: 'skip' | 'reverse' | 'draw' | 'uno' | 'wild' | 'catch' | 'turn' | 'win';
  playerIndex: number;
  playerName: string;
  timestamp: number;
}

export interface GameLog {
  id: string;
  text: string;
  color?: CardColor;
  timestamp: number;
}

export interface GameStats {
  cardsPlayed: number;
  attacksLaunched: number;
  unoCalls: number;
  catches: number;
  durationSeconds: number;
}

export interface GameState {
  roomCode: string;
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1; // 1 = Clockwise, -1 = Counter-Clockwise
  discardPile: Card[];
  drawPile: Card[];
  activeColor: 'red' | 'blue' | 'green' | 'yellow';
  pendingDrawCount: number;
  turnTimeRemaining: number;
  gameStatus: GameStatus;
  winnerId: string | null;
  settings: GameSettings;
  actionAlert: ActionAlert | null;
  logs: GameLog[];
  stats: Record<string, GameStats>;
  roundNumber: number;
  mustCallUnoPlayerId: string | null;
  mustCallUnoDeadline: number | null;
}
