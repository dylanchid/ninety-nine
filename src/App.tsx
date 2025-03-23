import React, { useState } from 'react';
import { io } from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Home from './components/Home';
import GameRoom from './components/GameRoom';

// Initialize socket connection
const socket = io('http://localhost:3001');

function App() {
  const [gameState, setGameState] = useState<{
    roomId: string;
    playerName: string;
  } | null>(null);

  const handleJoinRoom = (roomId: string, playerName: string) => {
    setGameState({ roomId, playerName });
  };

  return (
    <div className="App">
      {gameState ? (
        <GameRoom
          socket={socket}
          roomId={gameState.roomId}
          playerName={gameState.playerName}
        />
      ) : (
        <Home socket={socket} onJoinRoom={handleJoinRoom} />
      )}
    </div>
  );
}

export default App; 