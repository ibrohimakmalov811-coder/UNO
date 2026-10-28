import { GameState } from '../types/uno';

// BroadcastChannel provides instant, cross-tab real-time sync with 0 setup
// Socket.io client can connect if a remote/local socket server is active.

export type NetworkMessage =
  | { type: 'STATE_SYNC'; state: GameState }
  | { type: 'PLAYER_JOIN'; player: { id: string; name: string; avatar: string } }
  | { type: 'TAUNT'; playerId: string; emoji: string; text: string }
  | { type: 'START_GAME'; roomCode: string };

class NetworkEngine {
  private channel: BroadcastChannel | null = null;
  private roomCode: string = '';
  private onMessageCallback: ((msg: NetworkMessage) => void) | null = null;

  public initRoom(roomCode: string, onMessage: (msg: NetworkMessage) => void) {
    this.roomCode = roomCode;
    this.onMessageCallback = onMessage;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      if (this.channel) {
        this.channel.close();
      }
      this.channel = new BroadcastChannel(`uno_room_${roomCode}`);
      this.channel.onmessage = (event) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(event.data);
        }
      };
    }
  }

  public broadcast(msg: NetworkMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.warn('Network broadcast error:', err);
      }
    }
  }

  public leaveRoom() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.onMessageCallback = null;
  }
}

export const network = new NetworkEngine();

export function generateRoomCode(): string {
  const prefixes = ['NEO', 'CYBER', 'HYPER', 'PULSE', 'RETRO', 'TURBO'];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${p}-${num}`;
}
