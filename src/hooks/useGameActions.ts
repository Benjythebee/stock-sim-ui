import { useMemo } from "react";
import { useWebsocketContext } from "../context/ws.context";
import { useGameStore, type GameSettings } from "../context/game.context";
import { MessageType, ORDER_CANCEL_ALL, POWER_SKIP_INDEX } from "../types/messages";

export type OrderSide = 'BUY' | 'SELL';
export type OrderKind = 'LIMIT' | 'MARKET';

/**
 * Everything the player can ask the server to do. Nothing here is optimistic except the pause flag
 * and the settings echo, and the server corrects both.
 */
export const useGameActions = () => {
    const { sendMessage } = useWebsocketContext();

    return useMemo(() => ({
        /** Host only. The server answers with the absolute `paused`, which overwrites this guess. */
        togglePause: () => {
            sendMessage({ type: MessageType.TOGGLE_PAUSE });
            useGameStore.setState((s) => ({ paused: !s.paused }));
        },
        /** Host only, in the lobby. Every ADMIN_SETTINGS rebuilds the game and echoes ROOM_STATE. */
        updateSettings: (settings: Partial<GameSettings>) => {
            // ADMIN_SETTINGS takes volatility as a percentage; the store (like ROOM_STATE) holds a fraction.
            sendMessage({ type: MessageType.ADMIN_SETTINGS, settings });
            useGameStore.getState().saveGameSettings(settings.marketVolatility === undefined ? settings : { ...settings, marketVolatility: settings.marketVolatility / 100 });
        },
        /** Host only, after the game ended. The server answers with ROOM_STATE started=false. */
        resetGame: () => sendMessage({ type: MessageType.RESET_GAME }),

        /** Whole shares. Market orders send a dummy price, which the server ignores. */
        placeOrder: (action: OrderSide, orderType: OrderKind, quantity: number, limitPrice?: number) => sendMessage({
            type: MessageType.STOCK_ACTION,
            action,
            orderType,
            quantity,
            price: orderType === 'LIMIT' ? limitPrice ?? 0 : 100,
        }),
        cancelOrder: (id: number) => sendMessage({ type: MessageType.ORDER_CANCEL, id }),
        cancelAllOrders: () => sendMessage({ type: MessageType.ORDER_CANCEL, id: ORDER_CANCEL_ALL }),

        /** Take a bank loan of settings.loanAmount. The server answers with a NOTIFICATION and a PORTFOLIO_UPDATE. */
        borrow: () => sendMessage({ type: MessageType.LOAN_BORROW }),
        /** Repay our loan, or half of what's left of it, plus the interest accrued so far. */
        repayLoan: (portion: 'all' | 'half' = 'all') => sendMessage({ type: MessageType.LOAN_REPAY, portion }),

        /** Pick one of the briefcase's offers. */
        selectPower: (index: number) => sendMessage({ type: MessageType.POWER_SELECT, index }),
        /** Decline the briefcase. Tell the server too, or it re-sends the offers on reconnect. */
        skipPowers: () => sendMessage({ type: MessageType.POWER_SELECT, index: POWER_SKIP_INDEX }),
        /** Use a power from the inventory. */
        consumePower: (id: string) => sendMessage({ type: MessageType.POWER_CONSUME, id }),

        /** Change our display name, here and on the server, and remember it for the next join. */
        rename: (username: string) => {
            sendMessage({ type: MessageType.RENAME, username });
            localStorage.setItem('username', username);
            useGameStore.getState().setUsername(username);
        },
    }), [sendMessage]);
};
