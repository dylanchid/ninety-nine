const { Deck } = require('./deck');

class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = new Map(); // socketId -> { name, hand, bid, tricks, score }
    this.deck = null;
    this.turnUpCard = null;
    this.currentTrick = [];
    this.leadSuit = null;
    this.currentTurn = null;
    this.phase = 'WAITING'; // WAITING, BIDDING, PLAYING, SCORING
    this.dealNumber = 0;
  }

  addPlayer(socketId, name) {
    if (this.players.size >= 3) {
      throw new Error('Room is full');
    }
    this.players.set(socketId, {
      name,
      hand: [],
      bid: null,
      tricks: [],
      score: 0
    });

    if (this.players.size === 3) {
      this.startNewDeal();
    }
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    if (this.players.size < 3) {
      this.phase = 'WAITING';
    }
  }

  startNewDeal() {
    this.dealNumber++;
    this.deck = new Deck();
    this.deck.shuffle();
    
    const { hands, turnUpCard } = this.deck.deal(3);
    this.turnUpCard = turnUpCard;
    
    // Distribute hands to players
    const playerIds = Array.from(this.players.keys());
    playerIds.forEach((socketId, index) => {
      const player = this.players.get(socketId);
      player.hand = hands[index];
      player.bid = null;
      player.tricks = [];
    });

    this.phase = 'BIDDING';
    this.currentTurn = playerIds[0]; // First player starts bidding
  }

  submitBid(socketId, cards) {
    if (this.phase !== 'BIDDING') {
      throw new Error('Not in bidding phase');
    }
    if (socketId !== this.currentTurn) {
      throw new Error('Not your turn');
    }

    const player = this.players.get(socketId);
    if (!Deck.isValidBid(cards)) {
      throw new Error('Invalid bid');
    }

    // Remove bid cards from hand and calculate bid value
    player.bid = {
      cards,
      value: Deck.calculateBidValue(cards)
    };

    // Move to next player or start playing phase
    const playerIds = Array.from(this.players.keys());
    const currentIndex = playerIds.indexOf(socketId);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    
    if (Array.from(this.players.values()).every(p => p.bid !== null)) {
      this.phase = 'PLAYING';
      // Remove bid cards from hands
      this.players.forEach(player => {
        player.hand = player.hand.filter(card => 
          !player.bid.cards.some(bidCard => 
            bidCard.rank === card.rank && bidCard.suit === card.suit
          )
        );
      });
    }
    this.currentTurn = playerIds[nextIndex];
  }

  playCard(socketId, card) {
    if (this.phase !== 'PLAYING') {
      throw new Error('Not in playing phase');
    }
    if (socketId !== this.currentTurn) {
      throw new Error('Not your turn');
    }

    const player = this.players.get(socketId);
    // Validate card play
    if (!this.isValidPlay(player.hand, card)) {
      throw new Error('Invalid card play');
    }

    // Remove card from hand and add to current trick
    player.hand = player.hand.filter(c => 
      !(c.rank === card.rank && c.suit === card.suit)
    );
    this.currentTrick.push({ socketId, card });

    // If trick is complete, determine winner
    if (this.currentTrick.length === 3) {
      const winnerId = this.determineTrickWinner();
      const winner = this.players.get(winnerId);
      winner.tricks.push(this.currentTrick);
      this.currentTrick = [];
      this.leadSuit = null;
      this.currentTurn = winnerId;

      // Check if all tricks are played
      if (Array.from(this.players.values()).every(p => p.hand.length === 0)) {
        this.scoreRound();
      }
    } else {
      // Move to next player
      const playerIds = Array.from(this.players.keys());
      const currentIndex = playerIds.indexOf(socketId);
      this.currentTurn = playerIds[(currentIndex + 1) % playerIds.length];
      if (this.currentTrick.length === 1) {
        this.leadSuit = card.suit;
      }
    }
  }

  isValidPlay(hand, card) {
    // First card of trick can be any card
    if (!this.leadSuit) {
      return hand.some(c => c.rank === card.rank && c.suit === card.suit);
    }

    // Must follow suit if possible
    const hasSuit = hand.some(c => c.suit === this.leadSuit);
    if (hasSuit) {
      return card.suit === this.leadSuit;
    }

    // If no cards of lead suit, can play any card
    return hand.some(c => c.rank === card.rank && c.suit === card.suit);
  }

  determineTrickWinner() {
    const trumpSuit = this.turnUpCard.rank === '9' || this.turnUpCard.rank === 'Joker' 
      ? null 
      : this.turnUpCard.suit;

    let winningCard = this.currentTrick[0].card;
    let winnerId = this.currentTrick[0].socketId;

    for (let i = 1; i < this.currentTrick.length; i++) {
      const { card, socketId } = this.currentTrick[i];
      if (this.isWinningCard(card, winningCard, trumpSuit)) {
        winningCard = card;
        winnerId = socketId;
      }
    }

    return winnerId;
  }

  isWinningCard(card, currentWinner, trumpSuit) {
    const ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    // Handle Joker
    if (card.rank === 'Joker') {
      return trumpSuit !== null; // Joker wins only if there is a trump suit
    }
    if (currentWinner.rank === 'Joker') {
      return false; // Nothing beats Joker in trump games
    }

    // Handle trump cards
    if (trumpSuit) {
      if (card.suit === trumpSuit && currentWinner.suit !== trumpSuit) {
        return true;
      }
      if (card.suit !== trumpSuit && currentWinner.suit === trumpSuit) {
        return false;
      }
    }

    // If same suit, compare ranks
    if (card.suit === currentWinner.suit) {
      return ranks.indexOf(card.rank) > ranks.indexOf(currentWinner.rank);
    }

    // If different suits and no trump, lead suit wins
    return false;
  }

  scoreRound() {
    const exactBids = new Set();
    
    this.players.forEach((player, socketId) => {
      const tricksWon = player.tricks.length;
      if (tricksWon === player.bid.value) {
        exactBids.add(socketId);
      }
      player.score += tricksWon; // Base points
    });

    // Add bonuses
    if (exactBids.size === 3) {
      exactBids.forEach(socketId => {
        this.players.get(socketId).score += 10;
      });
    } else if (exactBids.size === 2) {
      exactBids.forEach(socketId => {
        this.players.get(socketId).score += 20;
      });
    } else if (exactBids.size === 1) {
      const [socketId] = exactBids;
      this.players.get(socketId).score += 30;
    }

    this.phase = 'SCORING';
  }

  getGameState() {
    return {
      roomId: this.roomId,
      players: Array.from(this.players.entries()).map(([socketId, player]) => ({
        socketId,
        name: player.name,
        handSize: player.hand.length,
        bid: player.bid,
        tricksWon: player.tricks.length,
        score: player.score
      })),
      turnUpCard: this.turnUpCard,
      currentTrick: this.currentTrick,
      phase: this.phase,
      currentTurn: this.currentTurn,
      dealNumber: this.dealNumber
    };
  }

  getPlayerState(socketId) {
    const player = this.players.get(socketId);
    return {
      ...this.getGameState(),
      hand: player.hand
    };
  }
}

module.exports = GameRoom; 