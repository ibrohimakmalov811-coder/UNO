import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket.io] Player connected: ${socket.id}`);

  socket.on('join_room', ({ roomCode, player }) => {
    socket.join(roomCode);
    let room = rooms.get(roomCode);
    if (!room) {
      room = { id: roomCode, players: [] };
      rooms.set(roomCode, room);
    }
    
    // Add player if not present
    if (!room.players.some((p) => p.id === player.id)) {
      room.players.push({ ...player, socketId: socket.id });
    }
    
    io.to(roomCode).emit('room_updated', room);
    console.log(`[Socket.io] ${player.name} joined room ${roomCode}`);
  });

  socket.on('game_action', ({ roomCode, action, payload }) => {
    socket.to(roomCode).emit('game_action_received', { action, payload });
  });

  socket.on('send_taunt', ({ roomCode, taunt }) => {
    io.to(roomCode).emit('taunt_received', taunt);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Player disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Cyber UNO Realtime WebSocket Server running on http://localhost:${PORT}`);
});
