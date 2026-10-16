import { useGameStore } from "../../context/game.context"
import { useWebsocketContext } from "../../context/ws.context";
import { useCallback } from "react";
import { MessageType } from "../../types/messages";
import { useShallow } from "zustand/shallow";
import { ThemeController } from "../ThemeController";
import { usePriceStore } from "../../context/stock.store";
import { decimal, money } from "../../utils/math";
import { CastButton } from "../cast/button";
import { useNavigate } from "react-router";

export const InGameNavigation = () => {
    const {room,status,sendMessage,disconnect,isSpectate} = useWebsocketContext();
    const {username,cash,paused,isAdmin,onlineUsers,gameSettings,shares} = useGameStore(useShallow((state) => ({ username: state.username, cash: state.cash, paused: state.paused, isAdmin: state.isAdmin, onlineUsers: state.onlineUsers, gameSettings: state.gameSettings, shares: state.shares })));


    const togglePause = useCallback(() => {
        const newPausedState = !paused;
        sendMessage({type: MessageType.TOGGLE_PAUSE});
        useGameStore.setState({paused: newPausedState});
    }, [paused, sendMessage]);

    const navigate = useNavigate();
    const disconnectHandler = useCallback(() => {
        disconnect(); // stops auto-reconnect while this page is still mounted
        navigate('/'); // Layout resets the stores on leaving the room page
    }, [disconnect, navigate]);

    if(status === 'DISCONNECTED' && !room){
        return null;
    }

    const isPaused = room && status === 'CONNECTED' ? paused : true;

    return <>
    <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
            <a className="btn btn-ghost text-xl" href="/"><img src="/tendies-brawl-icon.webp" alt="Tendies Brawl Logo" className="w-12 h-12"/>
           </a>
            <ThemeController />
        </div>
        <div className="navbar-center">
            {isPaused && <div className="font-semibold mr-2">Room {room} PAUSED -</div>}
            {status === 'CONNECTED' && onlineUsers > 0 && <div className="font-semibold"> Market online with {onlineUsers + gameSettings.bots} participants</div>}
        </div>
        <div className="navbar-end">
            <CastButton room={room!} />
            {!isSpectate && room && status === 'CONNECTED' && (
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
                    <li><a>Cash: ${money(cash)}</a></li>
                    <li><a>Stock: {decimal(shares,0)}</a></li>
                    <li><a><ProfitAndLoss /></a></li>
                </ul>
            )}


        </div>
    </div>
    </>;
}


const ProfitAndLoss: React.FC = () => {

    const {pnl,pnlMark,shares,reservedShares} = useGameStore(useShallow((state) => ({ pnl: state.pnl, pnlMark: state.pnlMark, shares: state.shares, reservedShares: state.reservedShares })));
    const price = usePriceStore((state) => state.price);

    // The server only re-sends PORTFOLIO_UPDATE when the account changes, so mark its P&L to the
    // live price: players start with no shares, so P&L moves by (all shares held) x (price change).
    const live = pnl + (shares + reservedShares) * (price - pnlMark);
    const isNegative = live <= -0.005;

    return <div>P/L: {isNegative ? <span className="text-red-500">-${money(live)}</span> : <span className="text-green-500">+${money(live)}</span>}</div>
}
