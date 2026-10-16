import { ChevronDown, Crown, Users } from "lucide-react";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "../../context/game.context";
import { cn } from "../../utils/cn";

/**
 * The lobby's "N connected" badge. Clicking it lists who's in the room (from PLAYERS): the host,
 * you, and anyone whose seat is held while they reconnect. Without a list yet (an older server),
 * it's a plain count.
 */
export const PlayerList = () => {
    const {players, you, onlineUsers} = useGameStore(useShallow((state) => ({players: state.players, you: state.you, onlineUsers: state.onlineUsers})));
    const badge = "badge badge-lg badge-soft badge-success gap-1.5";

    if (players.length === 0) {
        return <span className={badge}><Users size={16} /> {onlineUsers} connected</span>;
    }

    const online = players.filter((p) => p.connected).length;
    return (
        // Focus-driven DaisyUI dropdown: opens on click, closes when focus leaves.
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className={cn(badge, "cursor-pointer hover:brightness-110")} aria-label={`${online} connected. Show players`}>
                <Users size={16} /> {online} connected <ChevronDown size={14} />
            </div>
            <div tabIndex={0} className="dropdown-content z-10 mt-2 w-64 rounded-box bg-base-100 border border-base-300 shadow-xl p-2">
                <div className="px-2 py-1 text-sm font-semibold text-base-content/70">Players in this room</div>
                <ul className="max-h-72 overflow-y-auto">
                    {players.map((p, i) => (
                        <li key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-field">
                            <span className={cn("size-2.5 rounded-full shrink-0", p.connected ? "bg-success" : "bg-base-content/30")} aria-hidden />
                            <span className={cn("truncate", {"text-base-content/50": !p.connected})}>{p.name}</span>
                            {i === you && <span className="badge badge-sm badge-ghost shrink-0">you</span>}
                            {p.host && <Crown size={16} className="text-warning shrink-0 ml-auto" aria-label="Host" />}
                            {!p.connected && <span className="text-xs text-base-content/50 shrink-0 ml-auto">reconnecting</span>}
                        </li>
                    ))}
                </ul>
                <p className="px-2 pt-1 text-xs text-base-content/60">Bots and spectators aren't listed.</p>
            </div>
        </div>
    );
};
