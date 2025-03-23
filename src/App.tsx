import React, { useState } from 'react';
import './App.css';
import Home from './components/Home';
import GameRoom from './components/GameRoom';

interface GameState {
  playerName: string;
  playerCount: number;
}

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const handleGameStart = (playerName: string, playerCount: number) => {
    setGameState({ playerName, playerCount });
  };

  return (
    <div className="App">
      {gameState ? (
        <GameRoom
          playerName={gameState.playerName}
          playerCount={gameState.playerCount}
        />
      ) : (
        <Home onGameStart={handleGameStart} />
      )}
    </div>
  );
}

export default App; 