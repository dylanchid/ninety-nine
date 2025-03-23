const SUITS = ['D', 'S', 'H', 'C'];
const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6'];
const SUIT_VALUES = {
  'D': 0,
  'S': 1,
  'H': 2,
  'C': 3
};

class Deck {
  constructor() {
    this.cards = this.createDeck();
  }

  createDeck() {
    const cards = [];
    // Add regular cards
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push({ rank, suit });
      }
    }
    // Add Joker
    cards.push({ rank: 'Joker', suit: null });
    return cards;
  }

  shuffle() {
    // Fisher-Yates shuffle algorithm
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(numPlayers = 3) {
    if (numPlayers !== 3) {
      throw new Error('This game is designed for exactly 3 players');
    }

    const hands = Array(numPlayers).fill().map(() => []);
    // Deal 12 cards to each player
    for (let i = 0; i < 12; i++) {
      for (let player = 0; player < numPlayers; player++) {
        hands[player].push(this.cards.pop());
      }
    }
    // Return the hands and the turn-up card
    const turnUpCard = this.cards.pop();
    return { hands, turnUpCard };
  }

  static calculateBidValue(cards) {
    return cards.reduce((sum, card) => {
      if (card.rank === 'Joker') {
        throw new Error('Joker cannot be used for bidding');
      }
      return sum + SUIT_VALUES[card.suit];
    }, 0);
  }

  static isValidBid(cards) {
    if (!Array.isArray(cards) || cards.length !== 3) {
      return false;
    }
    return cards.every(card => 
      card.suit && 
      card.rank !== 'Joker' && 
      SUITS.includes(card.suit) && 
      RANKS.includes(card.rank)
    );
  }
}

module.exports = {
  Deck,
  SUITS,
  RANKS,
  SUIT_VALUES
}; 