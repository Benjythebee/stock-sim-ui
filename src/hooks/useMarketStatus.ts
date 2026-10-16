import { useGameStore } from "../context/game.context";

/** The market trades only while the game runs: not in the lobby, while paused, or after the end. */
export const useMarketOpen = () => useGameStore((state) => !state.paused && !state.ended);

/** We can place or cancel orders: the market is open and we aren't locked out (e.g. DDoSed). */
export const useCanTrade = () => useGameStore((state) => !state.paused && !state.ended && !state.tradingDisabled);
