import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, GameSettings } from './types/uno';
import {
  initializeGame,
  executePlayCard,
  executeDrawCard,
  executeCallUno,
  executeCatchUno,
} from './logic/unoEngine';
import { getBotMove, checkBotUnoCatch } from './logic/botEngine';
import { network } from './logic/networkEngine';
import { sound } from './utils/soundEngine';

import { Navbar } from './Components/Navbar';
import { GameBoard } from './Components/GameBoard';
import { ColorPickerModal } from './Components/ColorPickerModal';
import { ActionAlerts } from './Components/ActionAlerts';
import { GameOverModal } from './Components/GameOverModal';
import { LobbyModal } from './Components/LobbyModal';
import { RulesModal } from './Components/RulesModal';

export function App() {
  const [gameState, setGameState] = useState<GameState>(() =>
    initializeGame('CYBER-2099', 'CyberPilot', '⚡')
  );

  const [isLobbyOpen, setIsLobbyOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [pendingWildCardId, setPendingWildCardId] = useState<string | null>(null);
  const [shakeScreen, setShakeScreen] = useState(false);

  const botActionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const turnCountdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Trigger screen shake for high impact plays
  const triggerShake = useCallback(() => {
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 450);
  }, []);

  // Multi-tab BroadcastChannel listener
  useEffect(() => {
    network.initRoom(gameState.roomCode, (msg) => {
      if (msg.type === 'STATE_SYNC') {
        setGameState(msg.state);
      } else if (msg.type === 'TAUNT') {
        setGameState((prev) => ({
          ...prev,
          players: prev.players.map((p) =>
            p.id === msg.playerId
              ? { ...p, recentTaunt: { emoji: msg.emoji, text: msg.text, time: Date.now() } }
              : p
          ),
        }));
      }
    });

    return () => network.leaveRoom();
  }, [gameState.roomCode]);

  // Turn Countdown Timer (1s ticks)
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    turnCountdownTimerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.gameStatus !== 'playing') return prev;

        const newTime = prev.turnTimeRemaining - 1;

        // Urgent Heartbeat sound when time is low
        if (newTime <= 4 && newTime > 0 && prev.currentPlayerIndex === 0) {
          sound.playUrgentHeartbeat();
        }

        // Time ran out! Auto-draw card and pass
        if (newTime <= 0) {
          sound.playPenalty();
          const drawn = executeDrawCard(prev, prev.currentPlayerIndex);
          return drawn;
        }

        return { ...prev, turnTimeRemaining: newTime };
      });
    }, 1000);

    return () => {
      if (turnCountdownTimerRef.current) clearInterval(turnCountdownTimerRef.current);
    };
  }, [gameState.gameStatus]);

  // Bot AI Turn Controller
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const currentIdx = gameState.currentPlayerIndex;
    const currentPlayer = gameState.players[currentIdx];

    // Check if current player is a bot
    if (currentPlayer && currentPlayer.isBot) {
      if (botActionTimerRef.current) clearTimeout(botActionTimerRef.current);

      // Realistic reaction delay (1000ms - 1600ms)
      const thinkDelay = 1100 + Math.random() * 500;

      botActionTimerRef.current = setTimeout(() => {
        // Step 1: Check if bot catches someone who forgot to call UNO
        if (checkBotUnoCatch(gameState, currentIdx)) {
          const { nextState, caught } = executeCatchUno(gameState, currentIdx);
          if (caught) {
            sound.playPenalty();
            setGameState(nextState);
            return;
          }
        }

        // Step 2: Make regular bot turn decision
        const decision = getBotMove(gameState, currentIdx);

        if (decision.action === 'play' && decision.cardId) {
          // If bot has 2 cards and is playing 1, high chance to shout UNO
          let intermediateState = gameState;
          if (currentPlayer.hand.length === 2 && Math.random() < 0.9) {
            const unoRes = executeCallUno(intermediateState, currentIdx);
            intermediateState = unoRes.nextState;
            sound.playUnoCall();
          }

          const { nextState, error } = executePlayCard(
            intermediateState,
            currentIdx,
            decision.cardId,
            decision.chosenColor
          );

          if (!error) {
            // Apply bot taunt if any
            let finalState = nextState;
            if (decision.taunt) {
              finalState = {
                ...nextState,
                players: nextState.players.map((p, idx) =>
                  idx === currentIdx
                    ? { ...p, recentTaunt: { emoji: decision.taunt!.emoji, text: decision.taunt!.text, time: Date.now() } }
                    : p
                ),
              };
            }

            // Sound & Shake triggers
            const playedCard = currentPlayer.hand.find((c) => c.id === decision.cardId);
            if (playedCard) {
              if (playedCard.value === 'wild_draw4') {
                sound.playDraw4();
                triggerShake();
              } else if (playedCard.value === 'draw2') {
                sound.playDraw2();
              } else if (playedCard.value === 'skip') {
                sound.playSkip();
              } else if (playedCard.value === 'reverse') {
                sound.playReverse();
              } else {
                sound.playCardPlay();
              }
            }

            setGameState(finalState);
          } else {
            // Fallback draw
            const drawnState = executeDrawCard(gameState, currentIdx);
            setGameState(drawnState);
          }
        } else {
          // Bot draws card
          sound.playCardDraw();
          const drawnState = executeDrawCard(gameState, currentIdx);
          setGameState(drawnState);
        }
      }, thinkDelay);
    }

    return () => {
      if (botActionTimerRef.current) clearTimeout(botActionTimerRef.current);
    };
  }, [gameState.currentPlayerIndex, gameState.gameStatus, triggerShake]);

  // Human Player Actions
  const handlePlayCard = (cardId: string) => {
    if (gameState.currentPlayerIndex !== 0) return;

    const human = gameState.players[0];
    const card = human.hand.find((c) => c.id === cardId);
    if (!card) return;

    // If Wild Card, show color picker modal first
    if (card.color === 'wild' || card.type === 'wild') {
      sound.playColorSelect();
      setPendingWildCardId(cardId);
      return;
    }

    // Normal card play
    const { nextState, error } = executePlayCard(gameState, 0, cardId);
    if (!error) {
      if (card.value === 'draw2') {
        sound.playDraw2();
      } else if (card.value === 'skip') {
        sound.playSkip();
      } else if (card.value === 'reverse') {
        sound.playReverse();
      } else {
        sound.playCardPlay();
      }
      setGameState(nextState);
      network.broadcast({ type: 'STATE_SYNC', state: nextState });
    } else {
      sound.playPenalty();
    }
  };

  const handleColorPicked = (color: 'red' | 'blue' | 'green' | 'yellow') => {
    if (!pendingWildCardId) return;

    const human = gameState.players[0];
    const card = human.hand.find((c) => c.id === pendingWildCardId);

    const { nextState, error } = executePlayCard(gameState, 0, pendingWildCardId, color);
    setPendingWildCardId(null);

    if (!error) {
      if (card?.value === 'wild_draw4') {
        sound.playDraw4();
        triggerShake();
      } else {
        sound.playCardPlay();
      }
      setGameState(nextState);
      network.broadcast({ type: 'STATE_SYNC', state: nextState });
    }
  };

  const handleDrawCard = () => {
    if (gameState.currentPlayerIndex !== 0) return;
    sound.playCardDraw();
    const nextState = executeDrawCard(gameState, 0);
    setGameState(nextState);
    network.broadcast({ type: 'STATE_SYNC', state: nextState });
  };

  const handleCallUno = () => {
    const { nextState, success } = executeCallUno(gameState, 0);
    if (success) {
      sound.playUnoCall();
      setGameState(nextState);
      network.broadcast({ type: 'STATE_SYNC', state: nextState });
    }
  };

  const handleCatchUno = () => {
    const { nextState, caught } = executeCatchUno(gameState, 0);
    if (caught) {
      sound.playPenalty();
      setGameState(nextState);
      network.broadcast({ type: 'STATE_SYNC', state: nextState });
    }
  };

  const handleSendTaunt = (emoji: string, text: string) => {
    const humanId = gameState.players[0].id;
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p, idx) =>
        idx === 0 ? { ...p, recentTaunt: { emoji, text, time: Date.now() } } : p
      ),
    }));
    network.broadcast({ type: 'TAUNT', playerId: humanId, emoji, text });
  };

  const handleRestartMatch = () => {
    const human = gameState.players[0];
    const fresh = initializeGame(gameState.roomCode, human.name, human.avatar, gameState.settings);
    setGameState(fresh);
    sound.playCardDeal();
    network.broadcast({ type: 'STATE_SYNC', state: fresh });
  };

  const handleStartLobbyGame = (
    name: string,
    avatar: string,
    roomCode: string,
    settings: GameSettings
  ) => {
    const fresh = initializeGame(roomCode, name, avatar, settings);
    setGameState(fresh);
    setIsLobbyOpen(false);
  };

  return (
    <div className="relative flex flex-col h-screen w-screen cyber-grid-bg text-slate-100 overflow-hidden font-sans">
      {/* Header Bar */}
      <Navbar
        state={gameState}
        onSendTaunt={handleSendTaunt}
        onOpenRules={() => setIsRulesOpen(true)}
        onNewGame={() => setIsLobbyOpen(true)}
      />

      {/* Main 4-Player Arena */}
      <GameBoard
        state={gameState}
        onPlayCard={handlePlayCard}
        onDrawCard={handleDrawCard}
        onCallUno={handleCallUno}
        onCatchUno={handleCatchUno}
        isMyTurn={gameState.currentPlayerIndex === 0}
        shakeScreen={shakeScreen}
      />

      {/* Wild Color Selection Modal */}
      <ColorPickerModal
        isOpen={!!pendingWildCardId}
        onSelectColor={handleColorPicked}
      />

      {/* Floating Action Alerts Overlay */}
      <ActionAlerts alert={gameState.actionAlert} />

      {/* Game Over / Winner Podium Modal */}
      {gameState.gameStatus === 'game_over' && (
        <GameOverModal
          state={gameState}
          onPlayAgain={handleRestartMatch}
          onExitLobby={() => setIsLobbyOpen(true)}
        />
      )}

      {/* Lobby / Setup Modal */}
      <LobbyModal
        isOpen={isLobbyOpen}
        onStartGame={handleStartLobbyGame}
      />

      {/* Rules & Guide Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
}

export default App;
