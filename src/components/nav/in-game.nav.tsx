import { useGameStore } from "../../context/game.context"
import { useWebsocketContext } from "../../context/ws.context";
import { useCallback } from "react";
import { useShallow } from "zustand/shallow";
import { CastButton } from "../cast/button";
import { useNavigate } from "react-router";
import { NavBrand } from "./nav.brand";
import { useGameActions } from "../../hooks/useGameActions";
import { useRoomConnection } from "../../hooks/useRoomConnection";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import { PowerLibraryButton } from "../PowerLibrary/library.button";
import { PlayerName } from "../Admin/player-name";
import { PlayerList } from "../Admin/player-list";
import { IS_CAST_DEVICE } from "../../utils/screen";
import { cn } from "../../utils/cn";
import { Check, Copy, LogOut, Pause, Play } from "lucide-react";

/**
 * The room's nav: which room and what state it's in on the left, labeled actions on the right.
 * The portfolio (cash, shares, P/L) lives on the room page next to the order form, not here.
 * The lobby, pause and game-over overlays cover this bar, so its buttons matter while the game runs.
 */
export const InGameNavigation = () => {
    const {status,disconnect} = useWebsocketContext();
    const {room,connected,isSpectate} = useRoomConnection();
    const {paused,started,ended,isAdmin} = useGameStore(useShallow((state) => ({ paused: state.paused, started: state.started, ended: state.ended, isAdmin: state.isAdmin })));
    const {togglePause} = useGameActions();

    const navigate = useNavigate();
    const disconnectHandler = useCallback(() => {
        disconnect(); // stops auto-reconnect while this page is still mounted
        navigate('/'); // Layout resets the stores on leaving the room page
    }, [disconnect, navigate]);

    if(status === 'DISCONNECTED' && !room){
        return null;
    }

    const showHostControls = isAdmin && connected && started && !ended;
    // Labels show from md up; below that the buttons are icons with a tooltip.
    const navButton = "btn btn-ghost btn-sm sm:btn-md gap-1.5 px-2 sm:px-3";
    const label = "hidden md:inline";

    return (
        <div className="navbar bg-base-100 shadow-sm gap-1 sm:gap-2 px-2 sm:px-4 min-h-14">
            <NavBrand />
            <div className="flex-1 min-w-0 flex items-center gap-1 sm:gap-2">
                {room && <RoomCode room={room} />}
                <GameStatus connected={connected} started={started} paused={paused} ended={ended} />
                {connected && <div className="hidden sm:block"><PlayerList /></div>}
            </div>
            <div className="flex items-center shrink-0 gap-0.5 sm:gap-1">
                {/* Nobody can click on a TV we are cast to. */}
                {!IS_CAST_DEVICE && <PowerLibraryButton className={navButton} label="Powers" labelClassName={label} />}
                {!IS_CAST_DEVICE && room && (
                    <CastButton room={room} className={navButton}>
                        <span className={label}>Cast</span>
                    </CastButton>
                )}
                {showHostControls && (
                    <button className={cn(navButton, "btn-soft btn-warning")} onClick={togglePause} title={paused ? "Resume the game" : "Pause the game for everyone"}>
                        {paused ? <Play size={16} /> : <Pause size={16} />}
                        <span className={label}>{paused ? "Resume" : "Pause"}</span>
                    </button>
                )}
                {!isSpectate && connected && <div className="hidden lg:block"><PlayerName /></div>}
                {!IS_CAST_DEVICE && (
                    <button className={navButton} onClick={disconnectHandler} title="Leave this room" aria-label="Leave room">
                        <LogOut size={16} />
                        <span className={label}>Leave</span>
                    </button>
                )}
            </div>
        </div>
    );
}

/** "Room ABCDE", click to copy the invite link: it's what friends need to join. */
const RoomCode = ({room}: {room: string}) => {
    const {copied, copy} = useCopyToClipboard();
    return (
        <button
            className="btn btn-ghost btn-sm sm:btn-md shrink gap-1.5 px-2 min-w-0 font-semibold"
            onClick={() => copy(`${window.location.origin}/${room}`)}
            title="Copy the invite link"
            aria-label={`Room ${room}. Copy the invite link`}
        >
            <span className="truncate"><span className="hidden sm:inline font-normal opacity-70">Room </span>{room}</span>
            {copied ? <Check size={14} className="shrink-0 text-success" /> : <Copy size={14} className="shrink-0 opacity-60" />}
        </button>
    );
};

const GameStatus = ({connected, started, paused, ended}: {connected: boolean, started: boolean, paused: boolean, ended: boolean}) => {
    const [text, style] =
        !connected ? ["Reconnecting", "badge-error"]
        : ended ? ["Game over", "badge-neutral"]
        : !started ? ["Lobby", "badge-info"]
        : paused ? ["Paused", "badge-warning"]
        : ["Live", "badge-success"];
    const live = text === "Live";
    return (
        // On phones "Live" is just the pulsing dot, to leave room for the buttons.
        <span className={cn("badge badge-soft gap-1.5 shrink-0", style, {"max-sm:px-1.5": live})} title={text}>
            {live && <span className="size-2 rounded-full bg-success animate-pulse" aria-hidden />}
            <span className={cn({"max-sm:sr-only": live})}>{text}</span>
        </span>
    );
};
