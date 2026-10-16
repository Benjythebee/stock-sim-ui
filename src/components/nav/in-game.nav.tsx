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
import { cn } from "../../utils/cn";

export const InGameNavigation = () => {
    const {room,status,sendMessage,disconnect,isSpectate} = useWebsocketContext();
    const {username,paused,isAdmin,onlineUsers,gameSettings} = useGameStore(useShallow((state) => ({ username: state.username, paused: state.paused, isAdmin: state.isAdmin, onlineUsers: state.onlineUsers, gameSettings: state.gameSettings })));


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
    const showPortfolio = !isSpectate && !!room && status === 'CONNECTED';

    return <>
    <div className="navbar bg-base-100 shadow-sm gap-2 px-2 sm:px-4">
        <div className="navbar-start w-auto shrink-0">
            <a className="btn btn-ghost px-1 sm:px-2" href="/"><img src="/tendies-brawl-icon.webp" alt="Tendies Brawl Logo" className="w-10 h-10 sm:w-12 sm:h-12"/>
           </a>
            <ThemeController />
        </div>
        <div className="navbar-center flex-1 min-w-0 justify-center">
            <RoomStatus room={room} isPaused={!!isPaused} participants={status === 'CONNECTED' && onlineUsers > 0 ? onlineUsers + gameSettings.bots : 0} />
        </div>
        <div className="navbar-end w-auto shrink-0 gap-1">
            <CastButton room={room!} />
            {showPortfolio && <PortfolioStats className="hidden lg:flex" />}
            {showPortfolio && (
                <details className="dropdown dropdown-end">
                    <summary className="btn btn-sm sm:btn-md max-w-32 sm:max-w-48"><strong className="truncate">{username}</strong></summary>
                    <ul className="menu dropdown-content bg-base-100 rounded-box z-50 w-52 p-2 shadow-sm">
                        {isAdmin && <li><a onClick={togglePause}>{paused ? 'Unpause' : 'Pause'}</a></li>}
                        <li><a onClick={disconnectHandler}>Disconnect</a></li>
                    </ul>
                </details>
            )}
        </div>
    </div>
    {/* Phones and tablets: the portfolio gets its own row under the nav. */}
    {showPortfolio && <PortfolioStats className="lg:hidden grid grid-cols-3 bg-base-100 border-t border-base-200 px-2 py-1.5 text-sm text-center" />}
    </>;
}

const RoomStatus = ({room, isPaused, participants}: {room: string | null, isPaused: boolean, participants: number}) => (
    <div className="text-center leading-tight min-w-0">
        {/* The room code gets its own line so it never truncates: it's what friends type to join. */}
        {room && <div className="font-semibold truncate">Room {room}</div>}
        <div className="text-xs sm:text-sm truncate">
            {isPaused && <span className="badge badge-warning badge-xs sm:badge-sm mr-1 align-middle">Paused</span>}
            {participants > 0 && <span className="opacity-70"><span className="hidden sm:inline">Market online with </span>{participants} participants</span>}
        </div>
    </div>
);

const PortfolioStats = ({className}: {className?: string}) => {
    const {cash,shares} = useGameStore(useShallow((state) => ({ cash: state.cash, shares: state.shares })));
    return <div className={cn("items-center gap-4 font-medium tabular-nums whitespace-nowrap", className)}>
        <div>Cash: ${money(cash)}</div>
        <div>Stock: {decimal(shares,0)}</div>
        <ProfitAndLoss />
    </div>
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
