import React from 'react';
import './Card.css';

interface CardProps {
  rank: string;
  suit: string | null;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  rank,
  suit,
  onClick,
  selectable = false,
  selected = false,
  disabled = false
}) => {
  const getSuitSymbol = (suit: string | null) => {
    switch (suit) {
      case 'D': return '♦';
      case 'H': return '♥';
      case 'S': return '♠';
      case 'C': return '♣';
      default: return '';
    }
  };

  const isRed = suit === 'D' || suit === 'H';
  const suitSymbol = getSuitSymbol(suit);
  const displayRank = rank === 'Joker' ? '🃏' : rank;

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`card ${isRed ? 'red' : ''} ${selectable ? 'selectable' : ''} 
                 ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
    >
      <div className="card-content">
        <div className="card-corner top-left">
          <div className="card-rank">{displayRank}</div>
          <div className="card-suit">{suitSymbol}</div>
        </div>
        {rank !== 'Joker' && (
          <div className="card-center">
            <div className="card-suit large">{suitSymbol}</div>
          </div>
        )}
        <div className="card-corner bottom-right">
          <div className="card-rank">{displayRank}</div>
          <div className="card-suit">{suitSymbol}</div>
        </div>
      </div>
    </div>
  );
};

export default Card; 