import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import PlayerHand from './PlayerHand';
import Card from './Card';
import './GameRoom.css';

interface CardType {
  rank: string;
  suit: string | null;
}

interface Player {
  socketId: string;
  name: string;
  handSize: number;
  bid: { cards: CardType[]; value: number } | null;
  tricksWon: number;
  score: number;
}

interface GameState {
  roomId: string;
  players: Player[];
  turnUpCard: CardType | null;
  currentTrick: { socketId: string; card: CardType }[];
  phase: 'WAITING' | 'BIDDING' | 'PLAYING' | 'SCORING';
  currentTurn: string;
  dealNumber: number;
}

interface PlayerState extends GameState {
  hand: CardType[];
}

interface GameRoomProps {
  socket: Socket;
  roomId: string;
  playerName: string;
}

const GameRoom: React.FC<GameRoomProps> = ({ socket, roomId, playerName }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    socket.on('game-state', (state: GameState) => {
      setGameState(state);
    });

    socket.on('player-state', (state: PlayerState) => {
      setPlayerState(state);
    });

    return () => {
      socket.off('game-state');
      socket.off('player-state');
    };
  }, [socket]);

  const handleCardSelect = (card: CardType) => {
    setSelectedCards(prev => {
      const isSelected = prev.some(
        c => c.rank === card.rank && c.suit === card.suit
      );

      if (isSelected) {
        return prev.filter(c => !(c.rank === card.rank && c.suit === card.suit));
      } else {
        if (gameState?.phase === 'BIDDING' && prev.length < 3) {
          return [...prev, card];
        }
        if (gameState?.phase === 'PLAYING') {
          return [card];
        }
        return prev;
      }
    });
  };

  const handleAction = () => {
    if (!gameState || !playerState) return;

    if (gameState.phase === 'BIDDING') {
      socket.emit('submit-bid', { cards: selectedCards }, (response: any) => {
        if (!response.success) {
          setError(response.error);
        } else {
          setSelectedCards([]);
        }
      });
    } else if (gameState.phase === 'PLAYING' && selectedCards.length === 1) {
      socket.emit('play-card', { card: selectedCards[0] }, (response: any) => {
        if (!response.success) {
          setError(response.error);
        } else {
          setSelectedCards([]);
        }
      });
    }
  };

  if (!gameState || !playerState) {
    return <div>Loading game...</div>;
  }

  const isCurrentTurn = gameState.currentTurn === socket.id;
  const currentPlayer = gameState.players.find(p => p.socketId === socket.id);
  const otherPlayers = gameState.players.filter(p => p.socketId !== socket.id);

  return (
    <Container fluid className="game-room">
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <Row className="game-info">
        <Col>
          <h2>Room: {roomId}</h2>
          <p>Deal: {gameState.dealNumber}</p>
          <p>Phase: {gameState.phase}</p>
          {gameState.turnUpCard && (
            <div className="turn-up-card">
              <h3>Trump Card</h3>
              <Card
                rank={gameState.turnUpCard.rank}
                suit={gameState.turnUpCard.suit}
                disabled
              />
            </div>
          )}
        </Col>
      </Row>

      <Row className="other-players">
        {otherPlayers.map(player => (
          <Col key={player.socketId} className="player-info">
            <h3>{player.name}</h3>
            <p>Score: {player.score}</p>
            <p>Cards: {player.handSize}</p>
            {player.bid && <p>Bid: {player.bid.value}</p>}
            <p>Tricks: {player.tricksWon}</p>
            {gameState.currentTurn === player.socketId && (
              <div className="current-turn-indicator">🎯</div>
            )}
          </Col>
        ))}
      </Row>

      <Row className="current-trick">
        <Col>
          <h3>Current Trick</h3>
          <div className="trick-cards">
            {gameState.currentTrick.map(({ card, socketId }, index) => (
              <div key={index} className="trick-card">
                <Card rank={card.rank} suit={card.suit} disabled />
                <p>{gameState.players.find(p => p.socketId === socketId)?.name}</p>
              </div>
            ))}
          </div>
        </Col>
      </Row>

      <Row className="player-area">
        <Col>
          <div className="current-player">
            <h3>{currentPlayer?.name} (You)</h3>
            <p>Score: {currentPlayer?.score}</p>
            {currentPlayer?.bid && <p>Bid: {currentPlayer.bid.value}</p>}
            <p>Tricks: {currentPlayer?.tricksWon}</p>
          </div>
          <PlayerHand
            cards={playerState.hand}
            phase={gameState.phase}
            isCurrentTurn={isCurrentTurn}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
            maxSelectable={gameState.phase === 'BIDDING' ? 3 : 1}
          />
          {isCurrentTurn && selectedCards.length > 0 && (
            <Button
              variant="primary"
              onClick={handleAction}
              className="action-button"
            >
              {gameState.phase === 'BIDDING' ? 'Submit Bid' : 'Play Card'}
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default GameRoom; 