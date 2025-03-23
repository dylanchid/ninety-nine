const GameRoom = require('./room');

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> GameRoom
    this.playerRooms = new Map(); // socketId -> roomId
  }

  createRoom() {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.rooms.set(roomId, new GameRoom(roomId));
    return roomId;
  }

  joinRoom(roomId, socketId, playerName) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.addPlayer(socketId, playerName);
    this.playerRooms.set(socketId, roomId);
    return room;
  }

  leaveRoom(socketId) {
    const roomId = this.playerRooms.get(socketId);
    if (roomId) {
      const room = this.rooms.get(roomId);
      if (room) {
        room.removePlayer(socketId);
        if (room.players.size === 0) {
          this.rooms.delete(roomId);
        }
      }
      this.playerRooms.delete(socketId);
    }
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getRoomByPlayer(socketId) {
    const roomId = this.playerRooms.get(socketId);
    return roomId ? this.rooms.get(roomId) : null;
  }

  listRooms() {
    return Array.from(this.rooms.entries()).map(([roomId, room]) => ({
      roomId,
      playerCount: room.players.size,
      phase: room.phase
    }));
  }
}

module.exports = RoomManager; 