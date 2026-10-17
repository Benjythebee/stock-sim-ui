import { useState } from "react";
import { Link } from "react-router";
import { Backdrop, OverlayCard } from "../ui/overlay-card";
import { Field } from "../ui/field";
import { MAX_NAME_LENGTH } from "../../utils/name";
import { useShownRoomCode } from "../../context/streamer.store";

/**
 * Asks for a player name before joining, for someone who opened an invite link (/:roomId) without
 * ever having played on this device. The name is remembered like the Join form's.
 */
export const NamePrompt = ({room, onSubmit}: {room: string, onSubmit: (name: string) => void}) => {
    const [name, setName] = useState('');
    const trimmed = name.trim();
    const shownRoom = useShownRoomCode(room);

    return (
        <>
            <Backdrop />
            <OverlayCard
                title="Join the game"
                subtitle={<>Pick a name to join room <span className="font-mono font-semibold text-base-content">{shownRoom}</span>.</>}
            >
                <form
                    className="w-full flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (trimmed) onSubmit(trimmed);
                    }}
                >
                    <Field label="Your name">
                        <input
                            type="text"
                            autoFocus
                            placeholder="Shown to other players and on the leaderboard"
                            className="input input-bordered input-primary w-full"
                            maxLength={MAX_NAME_LENGTH}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Field>
                    <button type="submit" className="btn btn-primary w-full" disabled={!trimmed}>Join room</button>
                    <Link to={`/${room}/spectate`} className="link link-hover text-sm text-center text-base-content/70">
                        Just watching? Open the spectator view
                    </Link>
                </form>
            </OverlayCard>
        </>
    );
};
