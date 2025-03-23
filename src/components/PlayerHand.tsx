import React from 'react';
import Card from './Card';
import './PlayerHand.css';

interface CardType {
  rank: string;
  suit: string | null;
}

interface PlayerHandProps {
  cards: CardType[];
  phase: 'BIDDING' | 'PLAYING' | 'WAITING' | 'SCORING';
  isCurrentTurn: boolean;
  selectedCards: CardType[];
  onCardSelect: (card: CardType) => void;
  maxSelectable: number;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  phase,
  isCurrentTurn,
  selectedCards,
  onCardSelect,
  maxSelectable
}) => {
  const isCardSelected = (card: CardType) => {
    return selectedCards.some(
      selected => selected.rank === card.rank && selected.suit === card.suit
    );
  };

  const isCardSelectable = (card: CardType) => {
    if (!isCurrentTurn) return false;
    if (phase === 'WAITING' || phase === 'SCORING') return false;

    if (phase === 'BIDDING') {
      // Can't select Joker for bidding
      if (card.rank === 'Joker') return false;
      // Can't select more than maxSelectable cards
      if (selectedCards.length >= maxSelectable && !isCardSelected(card)) return false;
      return true;
    }

    if (phase === 'PLAYING') {
      // Can only select one card during play phase
      if (selectedCards.length >= 1 && !isCardSelected(card)) return false;
      return true;
    }

    return false;
  };

  return (
    <div className="player-hand">
      {cards.map((card, index) => (
        <div key={`${card.rank}-${card.suit}-${index}`} className="card-wrapper">
          <Card
            rank={card.rank}
            suit={card.suit}
            onClick={() => onCardSelect(card)}
            selectable={isCardSelectable(card)}
            selected={isCardSelected(card)}
            disabled={!isCardSelectable(card)}
          />
        </div>
      ))}
    </div>
  );
};

export default PlayerHand; 