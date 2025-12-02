import { create } from 'zustand';
import { MessageType, MessageTypeNames, type ConclusionMessage, type Message, type NewsMessage } from '../types/messages';
import { usePriceStore } from './stock.store';
import { useDebugStore } from './debug.store';
import { useToast } from '../components/Toast/useToast';

export type GameSettings = {
    startingCash: number;
    openingPrice: number;
    seed: number;
    enableRandomNews: boolean;
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
  started: boolean;
  ended: boolean;
  cash: number;
  shares: number;
  onlineUsers: number;
  conclusion: ConclusionMessage|null;
  news: NewsMessage[]
  
  // Actions
  setPaused: (paused: boolean) => void;
  saveGameSettings: (settings: Partial<GameSettings>) => void;
  setUsername: (username: string) => void;
  setCash: (cash: number) => void;
  setShares: (shares: number) => void;
  setOnlineUsers: (onlineUsers: number) => void;
};

const initialGameStore: Partial<GameStore> = {
  username: "",
  paused: true,
  started: false,
  ended: false,
  gameSettings: { 
    startingCash: 5000, 
    openingPrice: 1,
    enableRandomNews: true,
    seed: Math.floor(Math.random() * 100000),
    marketVolatility: 5, 
    gameDuration: 5, 
    bots: 1, 
    ticketName: 'AAPL' 
  },
  news: [],
  isAdmin: false,
  cash: 0,
  shares: 0,
  onlineUsers: 0,
  conclusion: null,
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
        useGameStore.setState((s) => ({ paused: !s.paused, started: s.started ===false? true : s.started }));
        break;
        case MessageType.CLOCK:
          usePriceStore.getState().setClock(message.value);
          usePriceStore.setState({ timeLeft: message.timeLeft });
          break;
        case MessageType.JOIN:
          useGameStore.setState((s)=>({ onlineUsers: s.onlineUsers + 1 || 0 }));
          useToast.getState().addToast({type:'success', description:`${message.username} joined the game.`});
          break;
            /**
         * Hook onto the join message for room setup
         */
        case MessageType.PORTFOLIO_UPDATE:
          useGameStore.setState({ cash: message.value.cash || 0, shares: message.value.shares || 0 });
          break;
        case MessageType.NEWS:
          useGameStore.setState((s) => ({ news: [...s.news, message ] }));
          useToast.getState().addToast({type:'info', title: message.title, description: message.description});
          break;
            
        case MessageType.ROOM_STATE:
              useGameStore.setState({ 
                  gameSettings: message.settings || {},
                  cash: message.settings?.startingCash || 0,
                  paused: message.paused || false,
                  started: message.started || false,
                  ended: message.ended || false,
                  onlineUsers: message.clients || 0
                });
              // Set the debug and price store initial values BEFORE any stock movements
              useDebugStore.setState({ 
                intrinsicValue: message.price || 0,
                guidePrice: message.price || 0,
              intrinsicValues: [message.price || 0], guidePrices: [message.price || 0] });
              usePriceStore.setState({price: message.price || 0});
              usePriceStore.getState().setClock(message.clock || 0);

            break;
        case MessageType.STOCK_MOVEMENT:
          usePriceStore.getState().setPrice(message.price || 0);
          usePriceStore.getState().setAsks(message.depth[0] || []);
          usePriceStore.getState().setBids(message.depth[1] || []);
          break;
        case MessageType.DEBUG_PRICES:
          console.log('Debug Prices:', message.intrinsicValue, message.guidePrice);
          useDebugStore.getState().setIntrinsicValue(message.intrinsicValue || 0);
          useDebugStore.getState().setGuidePrice(message.guidePrice || 0);
          break;
        case MessageType.GAME_CONCLUSION:
          useGameStore.setState({ ended: true, conclusion:message });
          break;
        case MessageType.IS_ADMIN:
            useGameStore.setState({ isAdmin: true });
            break;
        default:
            break;
        // Handle other message types as needed
    }
}