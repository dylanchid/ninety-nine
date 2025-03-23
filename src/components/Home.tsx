import React, { useState } from 'react';

type GameMode = 'computer' | 'multiplayer' | null;

interface HomeProps {
  onGameStart: (playerName: string, playerCount: number) => void;
}

const Home: React.FC<HomeProps> = ({ onGameStart }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(null);
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handlePlayClick = () => {
    if (!playerName.trim() || !selectedMode || !playerCount) return;
    
    setError('');
    setIsLoading(true);

    // For now, we'll just start the game with the selected options
    onGameStart(playerName, playerCount);
  };

  return (
    <>
      <header className="game-header">
        <h1>Ninety-Nine</h1>
        <p>A strategic card game where every decision counts. Play against the computer or challenge your friends!</p>
      </header>

      <div className="home-container">
        {error && (
          <div className="alert alert-danger mx-4 mt-4 mb-0" role="alert">
            {error}
          </div>
        )}

        <div className="game-modes">
          <div 
            className={`mode-card ${selectedMode === 'computer' ? 'selected' : ''}`}
            onClick={() => {
              setSelectedMode('computer');
              setError('AI mode is coming soon! Please use multiplayer mode for now.');
            }}
          >
            <h3>Play vs Computer</h3>
            <p>Challenge our AI in a single-player game</p>
            <span className="coming-soon">Coming Soon!</span>
          </div>

          <div 
            className={`mode-card ${selectedMode === 'multiplayer' ? 'selected' : ''}`}
            onClick={() => {
              setSelectedMode('multiplayer');
              setError('');
            }}
          >
            <h3>Multiplayer</h3>
            <p>Play with friends in real-time</p>
          </div>
        </div>

        <div className="player-count">
          <h3>Number of Players</h3>
          <div className="count-options">
            <div 
              className={`count-option ${playerCount === 2 ? 'selected' : ''}`}
              onClick={() => setPlayerCount(2)}
            >
              2 Players
            </div>
            <div 
              className={`count-option ${playerCount === 3 ? 'selected' : ''}`}
              onClick={() => setPlayerCount(3)}
            >
              3 Players
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="form-control mb-4"
            style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}
          />
          <button 
            className="btn-play"
            disabled={!selectedMode || !playerCount || !playerName.trim() || isLoading}
            onClick={handlePlayClick}
          >
            {isLoading ? 'Setting up...' : 'Play Now'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Home; 