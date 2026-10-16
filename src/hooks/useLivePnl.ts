import { useShallow } from "zustand/shallow";
import { useGameStore } from "../context/game.context";
import { usePriceStore } from "../context/stock.store";

/**
 * Our P&L marked to the live price. The server only re-sends PORTFOLIO_UPDATE when the account changes,
 * so this adds what the price moved since: players start with no shares, so P&L moves by
 * (all shares held) x (price change).
 */
export const useLivePnl = () => {
    const { pnl, pnlMark, shares, reservedShares } = useGameStore(useShallow((state) => ({ pnl: state.pnl, pnlMark: state.pnlMark, shares: state.shares, reservedShares: state.reservedShares })));
    const price = usePriceStore((state) => state.price);
    return pnl + (shares + reservedShares) * (price - pnlMark);
};
