import { useState } from "react";
import { Check, Pencil, User, X } from "lucide-react";
import { useGameStore } from "../../context/game.context";
import { useRoomConnection } from "../../hooks/useRoomConnection";
import { useGameActions } from "../../hooks/useGameActions";
import { MAX_NAME_LENGTH } from "../../utils/name";

/**
 * Our name in the lobby header, with a pencil to change it. Like the settings inputs, the edit
 * commits on Enter or blur; Escape (or ✕) cancels. Hidden for spectators, who have no name.
 */
export const PlayerName = () => {
    const username = useGameStore((state) => state.username);
    const { isSpectate } = useRoomConnection();
    const { rename } = useGameActions();
    // null = not editing.
    const [draft, setDraft] = useState<string | null>(null);

    if (isSpectate || !username) return null;

    const commit = () => {
        if (draft === null) return;
        const next = draft.trim().slice(0, MAX_NAME_LENGTH);
        setDraft(null);
        if (next && next !== username) rename(next);
    };

    if (draft !== null) {
        return (
            <div className="join">
                <input
                    autoFocus
                    className="input input-bordered input-primary join-item w-44"
                    aria-label="Your name"
                    maxLength={MAX_NAME_LENGTH}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onBlur={commit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') commit();
                        if (e.key === 'Escape') setDraft(null);
                    }}
                />
                {/* preventDefault on mousedown keeps the input focused, so its blur doesn't commit first. */}
                <button className="btn btn-primary join-item" aria-label="Save name" onMouseDown={(e) => e.preventDefault()} onClick={commit} disabled={!draft.trim()}>
                    <Check size={16} />
                </button>
                <button className="btn join-item" aria-label="Cancel" onMouseDown={(e) => e.preventDefault()} onClick={() => setDraft(null)}>
                    <X size={16} />
                </button>
            </div>
        );
    }

    return (
        <button
            className="btn btn-ghost gap-1.5 font-semibold max-w-60"
            title="Change your name"
            aria-label={`Your name: ${username}. Change it`}
            onClick={() => setDraft(username)}
        >
            <User size={16} className="shrink-0" />
            <span className="truncate">{username}</span>
            <Pencil size={14} className="shrink-0 opacity-60" />
        </button>
    );
};
