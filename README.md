# Ninety-Nine Card Game

A multiplayer card game implementation using React, Node.js, and Socket.IO.

## Game Rules

Ninety-Nine is a trick-taking card game for exactly 3 players. The game uses a special 37-card deck consisting of:
- All cards from 6 through Ace in each suit (32 cards)
- One Joker

### Setup
1. Players are dealt 12 cards each
2. The 37th card is turned face up to determine the trump suit
   - If the turn-up card is a 9 or Joker, there is no trump suit for that deal

### Bidding
1. Each player selects 3 regular suited cards (no Joker) to discard
2. The bid value is calculated as the sum of the suit values:
   - Diamond = 0
   - Spade = 1
   - Heart = 2
   - Club = 3
3. Example: Discarding 5♥ (2), 7♠ (1), 3♦ (0) = 3 total

### Playing
1. Nine tricks are played with the remaining 9 cards
2. Players must follow suit if possible
3. The highest card of the led suit wins unless trumped
4. In trump games:
   - Joker is the highest trump
   - Any trump beats any non-trump card
5. In no-trump games:
   - Only the led suit matters
   - Joker cannot win tricks

### Scoring
1. Players score 1 point per trick won
2. Bonus points for meeting bids exactly:
   - All 3 players meet bids: +10 each
   - Only 2 meet bids: +20 each
   - Only 1 meets bid: +30
3. Game ends after 9 deals or when a target score is reached

## Technical Setup

### Prerequisites
- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ninety-nine-game.git
cd ninety-nine-game
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install server dependencies:
```bash
cd server
npm install
```

### Running the Application

1. Start the server (from the server directory):
```bash
npm start
```

2. Start the frontend (from the project root):
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- Real-time multiplayer gameplay using Socket.IO
- Beautiful card UI with animations
- Responsive design for desktop and mobile
- Game state management and validation
- Room-based gameplay
- Player lobbies and room creation

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Socket.IO Client
  - React Bootstrap
  - CSS3 Animations

- Backend:
  - Node.js
  - Express
  - Socket.IO
  - TypeScript

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
