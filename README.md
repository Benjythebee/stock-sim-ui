# [WIP] Stock Simulation UI

A real-time stock trading simulation application built with React, TypeScript, and WebSocket connectivity. This project provides an interactive trading environment where users can participate in simulated stock market trading with live price charts, order books, and portfolio management.

TODO:
- [ ] Order history
- [ ] Better portfolio calculation
<img width="1894" height="841" alt="image" src="https://github.com/user-attachments/assets/6984b541-3516-4d1b-b3e9-ad8cbd878552" />

## 🚀 Features

- **Real-time Trading**: Live stock price updates via WebSocket connections
- **Interactive Charts**: Candlestick charts powered by Chart.js with financial data visualization
- **Order Management**: Support for both market and limit orders (buy/sell)
- **Portfolio Tracking**: Real-time portfolio value and position monitoring
- **Multi-user Rooms**: Join trading rooms with multiple participants
- **Admin Controls**: Room administration features for managing trading sessions
- **Responsive Design**: Modern UI built with TailwindCSS and DaisyUI components
- **Dark/Light Theme**: Theme switching capabilities

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS 4 + DaisyUI
- **Charts**: Chart.js with financial chart extensions
- **State Management**: Zustand
- **WebSocket**: Real-time communication for trading data
- **Icons**: Lucide React
- **Date/Time**: Luxon for time handling

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Home/           # Home page components
│   ├── nav/            # Navigation components
│   └── Trading/        # Trading-specific components
│       ├── Chart.tsx   # Candlestick price chart
│       ├── OrderHistory.tsx
│       ├── TradingCard.tsx
│       └── TradingDepth.tsx
├── context/            # State management and providers
│   ├── game.context.ts # Game settings and state
│   ├── stock.store.ts  # Stock price and trading data
│   ├── view.context.ts # UI view management
│   └── ws.context.ts   # WebSocket connection management
├── pages/              # Main application pages
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- pnpm (recommended package manager)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stock-sim-ui
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## 🎮 How to Use

1. **Join a Room**: Enter a room ID to join a trading session
2. **View Market Data**: Monitor real-time price movements on the candlestick chart
3. **Place Orders**: Use the trading interface to place buy/sell orders
4. **Track Portfolio**: Monitor your cash balance and stock positions
5. **Admin Features**: If you're an admin, control room settings and trading sessions

## 🔌 WebSocket Integration

The application connects to a WebSocket server for real-time features:

- Live stock price updates
- Order book depth data
- Portfolio synchronization
- Room state management
- Multi-user chat and interactions

## 📝 License

This project is private and not licensed for public use.

## 🤝 Contributing

This is a private project. Please contact the maintainers for contribution guidelines.
