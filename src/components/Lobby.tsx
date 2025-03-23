import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
  Alert,
  Spinner
} from 'react-bootstrap';
import './Lobby.css';

interface Room {
  roomId: string;
  playerCount: number;
  phase: string;
}

interface LobbyProps {
  socket: Socket;
  onJoinRoom: (roomId: string, playerName: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ socket, onJoinRoom }) => {
  const [playerName, setPlayerName] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('http://localhost:3001/api/rooms');
      const roomList = await response.json();
      setRooms(roomList);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name to create a room');
      return;
    }

    setIsLoading(true);
    socket.emit('create-room', (response: any) => {
      setIsLoading(false);
      if (response.success) {
        onJoinRoom(response.roomId, playerName);
      } else {
        setError(response.error || 'Failed to create room. Please try again.');
      }
    });
  };

  const handleJoinRoom = (roomId: string) => {
    if (!playerName.trim()) {
      setError('Please enter your name to join a room');
      return;
    }

    setIsLoading(true);
    socket.emit('join-room', { roomId, playerName }, (response: any) => {
      setIsLoading(false);
      if (response.success) {
        onJoinRoom(roomId, playerName);
      } else {
        setError(response.error || 'Failed to join room. Please try again.');
      }
    });
  };

  const getPhaseDisplay = (phase: string) => {
    switch (phase.toUpperCase()) {
      case 'WAITING':
        return 'Waiting for players';
      case 'BIDDING':
        return 'Bidding in progress';
      case 'PLAYING':
        return 'Game in progress';
      default:
        return phase;
    }
  };

  return (
    <div className="lobby">
      <Card className="lobby-card">
        <Card.Header>Ninety-Nine Card Game</Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          <Form className="w-100">
            <Form.Group>
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name to play"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </Form.Group>

            <Button
              variant="primary"
              onClick={handleCreateRoom}
              disabled={isLoading || !playerName.trim()}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Creating Room...
                </>
              ) : (
                'Create New Room'
              )}
            </Button>

            <div className="d-flex justify-content-between align-items-center">
              <h3 className="text-center">Available Rooms</h3>
              <Button
                variant="link"
                onClick={fetchRooms}
                disabled={isRefreshing}
                className="p-0"
              >
                {isRefreshing ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  '🔄 Refresh'
                )}
              </Button>
            </div>

            {rooms.length > 0 ? (
              <ListGroup className="w-100">
                {rooms.map((room) => (
                  <ListGroup.Item
                    key={room.roomId}
                    className="room-item"
                    action
                    disabled={room.playerCount >= 3 || isLoading}
                    onClick={() => handleJoinRoom(room.roomId)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Room {room.roomId}</strong>
                        <br />
                        <small className="text-muted">
                          {getPhaseDisplay(room.phase)}
                        </small>
                      </div>
                      <div className="room-status">
                        <span className="player-count">
                          {room.playerCount}/3 players
                        </span>
                        {room.playerCount >= 3 && (
                          <span className="full-indicator">Full</span>
                        )}
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-center text-muted">
                No rooms available. Create one to start playing!
              </p>
            )}
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Lobby; 