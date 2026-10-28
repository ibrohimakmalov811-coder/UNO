# ⚡ CYBER UNO 2099 // ARCADE EDITION

A real-time, interactive 4-player online UNO web application tailored for teenagers. Built with high-energy visuals, snappy micro-animations, vibrant themes, sound synthesis, and rock-solid turn-based game logic.

![Cyber UNO Arcade Banner](https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Key Features

### 1. 🎴 Authentic 108-Card Turn Engine (`src/logic/unoEngine.ts`)
- **Deck Setup:**
  - Red, Blue, Green, Yellow: 1x `0`, 2x `1-9`, 2x `Skip`, 2x `Reverse`, 2x `Draw 2` (+2)
  - 4x `Wild`, 4x `Wild Draw 4` (+4)
  - Exact 108-card official distribution with Fisher-Yates cryptographically robust shuffle.
- **Direction & Turn Ring:**
  - Clockwise & Counter-Clockwise orbital neon arrows dynamically spinning with particle trails.
  - 15-second countdown timer ring with color transition and urgent heartbeat audio when under 5s.
- **Attack Stacking (House Rules Toggle):**
  - Chain `Draw 2` on `Draw 2` (+2 &rarr; +4 &rarr; +6) or `Wild Draw 4` on `Wild Draw 4`!
- **Interactive "UNO!" Mega Button:**
  - **Safe Shout:** When holding 1 card, press UNO to secure safety.
  - **Penalty Catch:** If an opponent has 1 card and forgot to shout UNO before their next play, hit **CATCH UNO!** to hit them with a **+2 card penalty**!

### 2. 🤖 3 Smart AI Bot Personas (`src/logic/botEngine.ts`)
- **BLAZE_99 (Ruthless Attacker):** Hoards Wild Draw 4s for clutch moments, attacks players with low cards, calls UNO 95% of the time, and catches opponents with rapid reflex.
- **VIPER_X (Tactical Dominator):** Counts hand color density to dictate board flow, plays high value action cards, and counters stacks.
- **GLITCH_KID (Chaotic Wildcard):** Fast tempo, erratic reverses, and cyberpunk emoji taunts.
- **Natural Delays:** Human-like thinking intervals (1100ms - 1600ms) with typing and speech bubbles.

### 3. 🔊 Web Audio Synthesis Engine (`src/utils/soundEngine.ts`)
Zero-dependency, zero-latency Web Audio API synthesizer:
- Card dealing swoosh
- Discard slam (sub-bass punch + snap)
- Skip laser deflection
- Reverse pitch-bend warp
- Draw 2 dual lasers
- Wild Draw 4 sub-bass explosion
- "UNO!" celebratory chime
- Penalty error buzzers
- Urgent heartbeat pulse (<5s)
- 8-bit victory fanfare and emoji taunt pops

### 4. 🌐 Real-Time Multiplayer Architecture (`src/logic/networkEngine.ts` & `server.js`)
- **Instant Offline Mode:** 1 Player vs 3 Bots immediately ready with zero configuration.
- **Cross-Tab / Multi-Window Real-Time Sync:** Native `BroadcastChannel` synchronizes state, moves, and taunts across browser windows with room codes (`NEO-4096`).
- **Dedicated WebSocket Server:** Included Node.js + Express + Socket.io server script (`server.js`) for full network or cloud deployment.

---

## 🛠 Tech Stack

- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 with dark cyberpunk neon accents, glassmorphic card overlays, and scanline effects
- **Motion:** Framer Motion (ergonomic fanned hands, 3D hover lift, discard rotations, screen shake, pop alerts)
- **Celebration:** Canvas Confetti (multi-stage fireworks podium celebration)
- **Audio:** Web Audio API Native Synthesizer (instant offline support)
- **Real-Time:** WebSockets / BroadcastChannel / Socket.io

---

## 📦 Project Structure

```
props/
├── public/                 # Static assets & favicons
├── server.js               # Standalone Socket.io Express server
├── src/
│   ├── Components/
│   │   ├── ActionAlerts.tsx     # Floating arcade popup banner ("SKIP!", "REVERSE!", "+4 BOMB!")
│   │   ├── CardView.tsx         # Neo-brutalist holographic cards with SVG icons & pips
│   │   ├── CenterTable.tsx      # Discard pile with randomized rotation, draw deck & orbital arrows
│   │   ├── ColorPickerModal.tsx # Chromatic 4-quadrant radial color wheel
│   │   ├── GameBoard.tsx        # 4-Player oval felt arena (Top/Left/Right bots, Bottom player)
│   │   ├── GameOverModal.tsx    # Confetti fireworks, cyberpunk podium & MVP match stats
│   │   ├── LobbyModal.tsx       # Player customization, avatar picker, room code & house rules
│   │   ├── Navbar.tsx           # Cyber arcade header, sound toggle, room code copy & taunt menu
│   │   ├── OpponentSlot.tsx     # Bot slots with card fan, countdown ring & speech taunts
│   │   ├── PlayerHand.tsx       # Ergonomic curved card spread with sort by color/number
│   │   ├── RulesModal.tsx       # Interactive rules & penalty guide
│   │   └── UnoButton.tsx        # High-voltage arcade button ("SHOUT UNO!" vs "CATCH UNO!")
│   ├── logic/
│   │   ├── botEngine.ts         # Smart AI bot heuristics, decision tree & catch timers
│   │   ├── networkEngine.ts     # Multi-tab BroadcastChannel & room code engine
│   │   └── unoEngine.ts         # Pure TypeScript 108-card deck, shuffle, turns, and scoring
│   ├── types/
│   │   └── uno.ts               # Strict TypeScript definitions for cards, players, and state
│   ├── utils/
│   │   └── soundEngine.ts       # Low-latency Web Audio API synthesizer
│   ├── App.tsx                  # Master reactive game loop, countdown timers, and event bus
│   ├── index.css                # Tailwind CSS v4, neon glows, and custom keyframes
│   ├── main.tsx                 # React DOM root entry point
│   └── vite-env.d.ts            # Type definitions for assets and confetti
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🎮 How to Run

### Development Mode
```bash
# Start frontend client
npm run dev
```

### Production Build
```bash
# Type check and build bundle
npm run build

# Preview build
npm run preview
```

### Optional Dedicated WebSocket Server
```bash
# Start Node.js Socket.io server on port 3001
node server.js
```
