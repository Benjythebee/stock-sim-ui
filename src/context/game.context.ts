import { create } from 'zustand';
import { MessageType, MessageTypeNames, type ConclusionMessage, type Message, type NewsMessage } from '../types/messages';
import { resetPriceStore, usePriceStore } from './stock.store';
import { resetDebugStore, useDebugStore } from './debug.store';
import { useToast } from '../components/Toast/useToast';
import type { PowerDescription } from '../types/types';
import { debugLog } from '../utils/debug';
import { powerIconSrc, preloadImages, serverAsset } from '../utils/powerIcon';

export type GameSettings = {
    startingCash: number;
    openingPrice: number;
    seed: number;
    enableRandomNews: boolean;
    marketVolatility: number; // a fraction (0.05 = 5%); ADMIN_SETTINGS takes it as a percentage
    gameDuration: number; // in minutes
    bots: number;
    ticketName: string;
    botSelection?: string[]; // array of bot Types
    revealPrices?: boolean; // server only sends DEBUG_PRICES (hidden fair value) when on
}

type GameStore = {
  // State
  isAdmin: boolean;
  username: string;
  gameSettings: GameSettings;
  paused: boolean;
  started: boolean;
  ended: boolean;
  tradingDisabled: boolean;
  /** Available cash/shares (excluding what is locked in resting orders). */
  cash: number;
  shares: number;
  reservedCash: number;
  reservedShares: number;
  /** The server's P&L as of the last PORTFOLIO_UPDATE, and the mark price it was valued at. */
  pnl: number;
  pnlMark: number;
  onlineUsers: number;
  conclusion: ConclusionMessage|null;
  news: NewsMessage[]
  powers:{
    data:PowerDescription[],
    currentOffers:PowerDescription[],
    inventory:PowerDescription[]
  },
  
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
  tradingDisabled: false,
  gameSettings: { 
    startingCash: 5000, 
    openingPrice: 1,
    enableRandomNews: true,
    seed: Math.floor(Math.random() * 100000),
    marketVolatility: 0.05, 
    gameDuration: 5, 
    bots: 1, 
    ticketName: 'AAPL',
    revealPrices: false,
  },
  news: [],
  isAdmin: false,
  cash: 0,
  shares: 0,
  reservedCash: 0,
  reservedShares: 0,
  pnl: 0,
  pnlMark: 0,
  onlineUsers: 0,
  powers:{
    data:[],
    currentOffers:[],
    inventory:[]
  },
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

/**
 * Forget the room we were in: game, price and debug stores. Called when leaving a room page.
 * Keeps the installed-powers catalog, which belongs to the server, not the room.
 */
export const resetRoomStores = () => {
    useGameStore.setState((s) => ({ ...initialGameStore, powers: { ...initialGameStore.powers!, data: s.powers.data } }) as GameStore);
    resetPriceStore();
    resetDebugStore();
}


export const handleGameMessage = (message: Message) => {
    const { type } = message;
    debugLog(MessageTypeNames[type]);
    switch (type) {
      case MessageType.TOGGLE_PAUSE: {
        // The server sends the absolute state; fall back to toggling for older servers.
        useGameStore.setState((s) => {
          const paused = message.paused ?? !s.paused;
          return { paused, started: s.started || !paused };
        });
        break;
      }
      case MessageType.ID:
        // First message of every (re)join: IS_ADMIN follows if we're (still) the host.
        useGameStore.setState({ isAdmin: false });
        break;
      case MessageType.ERROR:
        useToast.getState().addToast({type:'error', title:'Error', description:message.message, timeout:5000});
        break;
      case MessageType.LEAVE:
        useGameStore.setState((s) => ({ onlineUsers: Math.max(0, s.onlineUsers - 1) }));
        break;
        
      case MessageType.CLOCK:
        usePriceStore.getState().setClock(message.value);
        usePriceStore.setState({ timeLeft: message.timeLeft });
        break;
      case MessageType.CLIENT_STATE:
        useGameStore.setState({ tradingDisabled: message.tradingDisabled });
        break;
      case MessageType.NOTIFICATION:
        useToast.getState().addToast({type:message.level, description:message.description, title:message.title,timeout:5000});
        break;
      case MessageType.JOIN:
        useGameStore.setState((s)=>({ onlineUsers: s.onlineUsers + 1 || 0 }));
        useToast.getState().addToast({type:'success', description:`${message.username} joined the game.`});
        break;
            /**
         * Hook onto the join message for room setup
         */
      case MessageType.PORTFOLIO_UPDATE:
        useGameStore.setState({
          cash: message.value.cash || 0,
          shares: message.value.shares || 0,
          reservedCash: message.value.reservedCash || 0,
          reservedShares: message.value.reservedShares || 0,
          pnl: message.value.pnl || 0,
          pnlMark: usePriceStore.getState().price,
        });
        break;
      case MessageType.NEWS:
        useGameStore.setState((s) => ({ news: [...s.news, message ] }));
        useToast.getState().addToast({type:'info', title: message.title, description: message.description});
        break;
          
        case MessageType.ROOM_STATE:
              if (!message.started) {
                // A fresh game (new room, lobby rebuilt by ADMIN_SETTINGS, server restart): drop the last game's
                // leftovers. isAdmin and the powers catalog arrive just before ROOM_STATE, so they stay.
                useGameStore.setState((s) => ({
                  conclusion: null,
                  news: [],
                  tradingDisabled: false,
                  powers: { ...s.powers, currentOffers: [], inventory: [] },
                }));
                resetPriceStore();
                resetDebugStore();
              }
              useGameStore.setState({ 
                  gameSettings: message.settings || {},
                  cash: message.settings?.startingCash || 0,
                  shares: 0, reservedCash: 0, reservedShares: 0, pnl: 0, pnlMark: message.price || 0,
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
          break;
        case MessageType.ORDER_BOOK_UPDATE:
          usePriceStore.getState().setAsks(message.depth[0] || []);
          usePriceStore.getState().setBids(message.depth[1] || []);
          break;
        case MessageType.DEBUG_PRICES:
          // console.log('Debug Prices:', message.intrinsicValue, message.guidePrice);
          useDebugStore.getState().setIntrinsicValue(message.intrinsicValue || 0);
          useDebugStore.getState().setGuidePrice(message.guidePrice || 0);
          break;
        case MessageType.GAME_CONCLUSION:
          useGameStore.setState({ ended: true, conclusion:message });
          break;
        case MessageType.POWER_OFFERS:
          useGameStore.setState((s)=>({
            powers:{
              ...s.powers,
              currentOffers:message.offers
            }
          }))
          break;
        case MessageType.CONTENT_MANIFEST:
          // Everything installed on this server (built-ins + mods). Preload icons so cards render instantly.
          useGameStore.setState((s)=>({ powers:{ ...s.powers, data: message.powers } }));
          preloadImages([...message.assets.map(serverAsset), ...message.powers.map(powerIconSrc)]);
          break;
        case MessageType.POWER_INVENTORY:{
          // Map ids in order (not filter) so holding the same power twice shows two cards.
          const data = useGameStore.getState().powers.data;
          const inventory = message.inventory.flatMap(id => data.find(p => p.id === id) ?? []);
          useGameStore.setState((s)=>({
            powers:{
              ...s.powers,
              inventory
            }
          }))
          break;}
        case MessageType.POWER_CONSUME:
          useGameStore.setState((s)=>({
            powers:{
              ...s.powers,
              inventory:s.powers.inventory.filter(p=>p.id !== message.id)
            }
          }))
          // Anything else that needs to be done on power consume can go here

          break;
        case MessageType.IS_ADMIN:
            useGameStore.setState({ isAdmin: true });
            break;
        default:
            break;
        // Handle other message types as needed
    }
}

export const usePowerStore = ()=>{
  const powers = useGameStore((state)=>state.powers);

  const setPowers = (powersData: PowerDescription[])=>{
    useGameStore.setState((s)=>({
      powers:{
        ...s.powers,
        data:powersData
      }
    }))
  }

  const clearOffers = ()=>{
    useGameStore.setState((s)=>({
      powers:{
        ...s.powers,
        currentOffers:[]
      }
    }))
  }

  return {
    ...powers,
    setPowers,
    clearOffers
  }
}