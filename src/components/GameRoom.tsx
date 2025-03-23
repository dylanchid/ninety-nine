import React, { useState } from 'react';
import './GameRoom.css';

interface CardType {
  rank: string;
  suit: string | null;
}

interface Player {
  name: string;
  isBot: boolean;
  score: number;
  position: 'bottom' | 'left' | 'right';
}

interface GameRoomProps {
  playerName: string;
  playerCount: number;
}

const GameRoom: React.FC<GameRoomProps> = ({ playerName, playerCount }) => {
  const [players, setPlayers] = useState<Player[]>(() => {
    // Initialize players array with positions based on player count
    const positions: ('bottom' | 'left' | 'right')[] = ['bottom'];
    
    if (playerCount === 2) {
      positions.push('right');
    } else if (playerCount === 3) {
      positions.push('left', 'right');
    }

    const initialPlayers: Player[] = [
      { name: playerName, isBot: false, score: 0, position: positions[0] }
    ];
    
    // Add bot players with their positions
    for (let i = 1; i < playerCount; i++) {
      initialPlayers.push({ 
        name: `Bot ${i}`, 
        isBot: true, 
        score: 0,
        position: positions[i]
      });
    }
    
    return initialPlayers;
  });

  return (
    <div className="game-room">
      <div className="game-header">
        <h2>Game Room</h2>
      </div>

      <div className="game-table">
        <div className="table-center">
          <div className="table-felt">
            <p>Game implementation coming soon!</p>
          </div>
        </div>

        {players.map((player, index) => (
          <div 
            key={index} 
            className={`player-position player-position-${player.position}`}
          >
            <div className="player-info">
              <h3>{player.name} {player.isBot ? '(Bot)' : '(You)'}</h3>
              <p>Score: {player.score}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameRoom; 