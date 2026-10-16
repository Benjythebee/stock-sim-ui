import { Crown } from "lucide-react";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "../../context/game.context";
import { useWebsocketContext } from "../../context/ws.context";
import { money } from "../../utils/math";
import { OverlayShell } from "../ui/overlay-card";

/** Name tags shown before "and N more", so a big room doesn't overflow the TV. */
const MAX_TAGS = 12;

/**
 * The lobby on a TV we are cast to (IS_CAST_DEVICE): no settings or buttons, just how to join and
 * who's in. Cast devices run old Chromium, so this sticks to opacity rather than `/70` color
 * modifiers (color-mix) and to plain DaisyUI badges.
 */
export const TvWaiting = () => {
    const {room} = useWebsocketContext();
    const {players, onlineUsers, settings, hasRoomState} = useGameStore(useShallow((state) => ({
        players: state.players, onlineUsers: state.onlineUsers, settings: state.gameSettings, hasRoomState: state.hasRoomState,
    })));
    const shown = players.slice(0, MAX_TAGS);
    const more = players.length - shown.length;
    // Without a PLAYERS list (an older server), fall back to the count.
    const count = players.length || onlineUsers;

    return (
        <OverlayShell className="w-[44rem]">
            <div className="card-body items-center text-center gap-5">
                <h1 className="text-4xl font-bold text-primary">Waiting for the game to start</h1>

                {room && (
                    <p className="text-xl">
                        <span className="opacity-70">Join at </span>
                        <span className="font-semibold">{window.location.host}</span>
                        <span className="opacity-70"> with code</span>
                        <span className="block mt-1 font-mono text-5xl font-bold tracking-[0.2em] text-primary">{room}</span>
                    </p>
                )}

                <div className="w-full">
                    <h2 className="text-lg font-semibold opacity-70 mb-2">
                        {count === 0 ? 'No players yet' : count === 1 ? '1 player in' : `${count} players in`}
                    </h2>
                    {shown.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2">
                            {shown.map((p, i) => (
                                <span key={i} className={`badge badge-lg badge-neutral gap-1.5 max-w-60 ${p.connected ? '' : 'opacity-50'}`}>
                                    {p.host && <Crown size={14} className="text-warning shrink-0" aria-label="Host" />}
                                    <span className="truncate">{p.name}</span>
                                </span>
                            ))}
                            {more > 0 && <span className="badge badge-lg badge-outline">and {more} more</span>}
                        </div>
                    )}
                </div>

                {hasRoomState && (
                    <p className="text-lg opacity-70">
                        {settings.ticketName} · {settings.gameDuration} min · ${money(settings.startingCash)} each
                        {settings.bots > 0 && ` · ${settings.bots} bot${settings.bots === 1 ? '' : 's'}`}
                    </p>
                )}

                <span className="loading loading-dots loading-lg text-primary"></span>
            </div>
        </OverlayShell>
    );
};
