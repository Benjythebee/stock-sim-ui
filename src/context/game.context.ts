import { create } from 'zustand';
import { MessageType, MessageTypeNames, type Message } from '../types/messages';
import { usePriceStore } from './stock.store';

export type GameSettings = {
    startingCash: number;
    openingPrice: number;
    seed: number;
    marketVolatility: number; // percentage from 1 to 100
    gameDuration: number; // in minutes
    bots: number;
    ticketName: string;
}

type GameStore = {
  // State
  isAdmin: boolean;
  username: string;
  gameSettings: GameSettings;
  paused: boolean;
  cash: number;
  PnL: number;
  shares: number;
  onlineUsers: number;
  
  // Actions
  setPaused: (paused: boolean) => void;
  saveGameSettings: (settings: Partial<GameSettings>) => void;
  setUsername: (username: string) => void;
  setCash: (cash: number) => void;
  setPnL: (PnL: number) => void;
  setShares: (shares: number) => void;
  setOnlineUsers: (onlineUsers: number) => void;
};

const initialGameStore: Partial<GameStore> = {
  username: "",
  paused: true,
  gameSettings: { 
    startingCash: 5000, 
    openingPrice: 1,
    seed: Math.floor(Math.random() * 100000),
    marketVolatility: 5, 
    gameDuration: 5, 
    bots: 0, 
    ticketName: 'AAPL' 
  },
  isAdmin: false,
  cash: 0,
  PnL: 0,
  shares: 0,
  onlineUsers: 0,
}

export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  ...initialGameStore as GameStore,
  
  // Actions
  setPaused: (paused) => set({ paused }),
  saveGameSettings: (settings) => 
    set((state) => ({ 
      gameSettings: { ...state.gameSettings, ...settings } 
    })),
  setUsername: (username) => set({ username }),
  setCash: (cash) => set({ cash }),
  setPnL: (PnL) => set({ PnL }),
  setShares: (shares) => set({ shares }),
}));

export const cleanGameStore = () => {
    useGameStore.setState(initialGameStore as GameStore);
}


export const handleGameMessage = (message: Message) => {
    const { type } = message;
    console.log(MessageTypeNames[type]);
    switch (type) {
      case MessageType.TOGGLE_PAUSE:
        useGameStore.setState((s) => ({ paused: !s.paused }));
        break;
        case MessageType.CLOCK:
          usePriceStore.getState().setClock(message.value);
          break;
        case MessageType.JOIN:
          useGameStore.setState((s)=>({ onlineUsers: s.onlineUsers + 1 || 0 }));
          break;
            /**
         * Hook onto the join message for room setup
         */
        case MessageType.PORTFOLIO_UPDATE:
          console.log("Portfolio update received:", message);
          useGameStore.setState({ cash: message.value.cash || 0, shares: message.value.shares || 0 });
          break;
            
        case MessageType.ROOM_STATE:
            usePriceStore.setState({ clock: message.clock || 0 });
            useGameStore.setState({ 
              gameSettings: message.settings || {},
              cash: message.settings?.startingCash || 0,
               paused: message.paused || false, 
               onlineUsers: message.clients || 0
               });
            break;
        case MessageType.STOCK_MOVEMENT:
          usePriceStore.getState().setPrice(message.price || 0);
          usePriceStore.getState().setAsks(message.depth[0] || []);
          usePriceStore.getState().setBids(message.depth[1] || []);
          break;
        case MessageType.IS_ADMIN:
            useGameStore.setState({ isAdmin: true });
            break;
        default:
            break;
        // Handle other message types as needed
    }
}