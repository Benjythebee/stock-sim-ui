import { cleanGameStore, useGameStore } from "../../context/game.context"
import { useWebsocketContext } from "../../context/ws.context";
import { useCallback, useMemo } from "react";
import { MessageType } from "../../types/messages";
import { useShallow } from "zustand/shallow";
import { ThemeController } from "../ThemeController";
import { usePriceStore } from "../../context/stock.store";
import { decimal } from "../../utils/math";


export const Navigation = () => {
    const {room,status,sendMessage,disconnect} = useWebsocketContext();
    const {username,cash,paused,isAdmin,onlineUsers,gameSettings,shares} = useGameStore(useShallow((state) => ({ username: state.username, cash: state.cash, pnl: state.PnL, paused: state.paused, isAdmin: state.isAdmin, onlineUsers: state.onlineUsers, gameSettings: state.gameSettings, shares: state.shares })));

    const togglePause = useCallback(() => {
        const newPausedState = !paused;
        sendMessage({type: MessageType.TOGGLE_PAUSE});
        useGameStore.setState({paused: newPausedState});
    }, [paused, sendMessage]);

    const disconnectHandler = useCallback(() => {
        disconnect();
        cleanGameStore();
    }, [disconnect]);

    const isPaused = room && status === 'CONNECTED' ? paused : true;

    return <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
            <a className="btn btn-ghost text-xl">Stock Sim</a>
            <ThemeController />
        </div>
        <div className="navbar-center">
            {isPaused && <div className="font-semibold">Room {room} PAUSED</div>}
            {status === 'CONNECTED' && onlineUsers > 0 && <div className="font-semibold"> Market online with {onlineUsers + gameSettings.bots} participants</div>}
        </div>
        <div className="navbar-end">
            {room && status === 'CONNECTED' && (
                <ul className="flex w-fit flex-row gap-4 items-center">
                    <li>
                        <details className="dropdown">
                        <summary className="btn m-1"><strong>{username}</strong></summary>
                        <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                            {isAdmin && <li><a onClick={togglePause}>{paused ? 'Unpause' : 'Pause'}</a></li>}
                            <li><a onClick={disconnectHandler}>Disconnect</a></li>
                        </ul>
                        </details>
                    </li>
                    <li><a>Cash: ${decimal(cash,3)}</a></li>
                    <li><a>Stock: {decimal(shares,0)}</a></li>
                    <li><a><ProfitAndLoss /></a></li>
                </ul>
            )}


        </div>
    </div>
}


const ProfitAndLoss: React.FC = () => {

    const {cash,gameSettings,shares} = useGameStore(useShallow((state) => ({ cash: state.cash, gameSettings: state.gameSettings, shares: state.shares })));
    const {price} = usePriceStore(useShallow((state) => ({ price: state.price })));

    const pnl = useMemo(() => {
        const value = shares * price;
        return Math.floor(((value + cash) - (gameSettings.startingCash || 0))*1000)/1000;
    }, [cash,gameSettings,price,shares]);

    const isNegative = pnl < 0;

    return <div>P/L: {isNegative ? <span className="text-red-500">-${Math.abs(pnl)}</span> : <span className="text-green-500">+${pnl}</span>}</div>
}