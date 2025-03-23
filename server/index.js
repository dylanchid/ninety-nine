const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const RoomManager = require('./gameLogic/roomManager');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

const roomManager = new RoomManager();

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Ninety-Nine Game Server' });
});

// Get list of rooms
app.get('/api/rooms', (req, res) => {
  res.json(roomManager.listRooms());
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Create a new room
  socket.on('create-room', (callback) => {
    try {
      const roomId = roomManager.createRoom();
      callback({ success: true, roomId });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Join a room
  socket.on('join-room', ({ roomId, playerName }, callback) => {
    try {
      const room = roomManager.joinRoom(roomId, socket.id, playerName);
      socket.join(roomId);
      
      // Notify all players in the room
      io.to(roomId).emit('game-state', room.getGameState());
      
      // Send private state to the joining player
      socket.emit('player-state', room.getPlayerState(socket.id));
      
      callback({ success: true });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Submit bid
  socket.on('submit-bid', ({ cards }, callback) => {
    try {
      const room = roomManager.getRoomByPlayer(socket.id);
      if (!room) {
        throw new Error('Not in a room');
      }

      room.submitBid(socket.id, cards);
      
      // Notify all players of the updated game state
      io.to(room.roomId).emit('game-state', room.getGameState());
      
      // Send private states to all players
      room.players.forEach((_, playerId) => {
        io.to(playerId).emit('player-state', room.getPlayerState(playerId));
      });
      
      callback({ success: true });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Play card
  socket.on('play-card', ({ card }, callback) => {
    try {
      const room = roomManager.getRoomByPlayer(socket.id);
      if (!room) {
        throw new Error('Not in a room');
      }

      room.playCard(socket.id, card);
      
      // Notify all players of the updated game state
      io.to(room.roomId).emit('game-state', room.getGameState());
      
      // Send private states to all players
      room.players.forEach((_, playerId) => {
        io.to(playerId).emit('player-state', room.getPlayerState(playerId));
      });
      
      callback({ success: true });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      roomManager.leaveRoom(socket.id);
      io.to(room.roomId).emit('game-state', room.getGameState());
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 