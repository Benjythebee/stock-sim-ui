import { useGameStore } from "../../context/game.context"
import { useWebsocketContext } from "../../context/ws.context";
import { useCallback } from "react";
import { useShallow } from "zustand/shallow";
import { decimal, money } from "../../utils/math";
import { CastButton } from "../cast/button";
import { useNavigate } from "react-router";
import { cn } from "../../utils/cn";
import { NavBrand } from "./nav.brand";
import { Pnl } from "../ui/pnl";
import { useGameActions } from "../../hooks/useGameActions";
import { useRoomConnection } from "../../hooks/useRoomConnection";
import { useLivePnl } from "../../hooks/useLivePnl";

export const InGameNavigation = () => {
    const {status,disconnect} = useWebsocketContext();
    const {room,connected,isSpectate} = useRoomConnection();
    const {username,paused,isAdmin,onlineUsers,bots} = useGameStore(useShallow((state) => ({ username: state.username, paused: state.paused, isAdmin: state.isAdmin, onlineUsers: state.onlineUsers, bots: state.gameSettings.bots })));
    const {togglePause} = useGameActions();

    const navigate = useNavigate();
    const disconnectHandler = useCallback(() => {
        disconnect(); // stops auto-reconnect while this page is still mounted
        navigate('/'); // Layout resets the stores on leaving the room page
    }, [disconnect, navigate]);

    if(status === 'DISCONNECTED' && !room){
        return null;
    }

    const isPaused = connected ? paused : true;
    const showPortfolio = !isSpectate && connected;

    return <>
    <div className="navbar bg-base-100 shadow-sm gap-2 px-2 sm:px-4">
        <NavBrand />
        <div className="navbar-center flex-1 min-w-0 justify-center">
            <RoomStatus room={room} isPaused={isPaused} participants={connected && onlineUsers > 0 ? onlineUsers + bots : 0} />
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

const ProfitAndLoss = () => {
    const pnl = useLivePnl();
    return <div>P/L: <Pnl value={pnl} /></div>;
}
