import { useEffect } from "react";
import { useLocation } from "react-router";
import { STREAMER_PATH, useStreamerMode } from "../context/streamer.store";

/** sessionStorage key: the room page the address bar is hiding, for when this tab opens STREAMER_PATH again. */
const MASKED_ROOM_KEY = "streamer_room";

/** The room page this tab last hid behind STREAMER_PATH, if any. */
export function maskedRoomPath(): string | null {
    try {
        return sessionStorage.getItem(MASKED_ROOM_KEY);
    } catch {
        return null;
    }
}

/**
 * In streamer mode, the address bar shows STREAMER_PATH instead of the room's URL (which holds the
 * room code). Only the address bar changes: the router keeps the real location, so the room page
 * works as usual, and a refresh or Back lands on STREAMER_PATH, whose route sends this tab back to
 * the room. Turning streamer mode off puts the real URL back.
 */
export const useMaskedRoomUrl = (inRoom: boolean) => {
    const {pathname, search, hash} = useLocation();
    const streamerMode = useStreamerMode();

    useEffect(() => {
        const real = pathname + search + hash;
        if (inRoom && streamerMode) {
            try {
                sessionStorage.setItem(MASKED_ROOM_KEY, real);
            } catch { /* then a refresh lands on Home */ }
            // Keep the router's history state (its key and index), or Back/Forward get confused.
            if (window.location.pathname !== STREAMER_PATH) window.history.replaceState(window.history.state, "", STREAMER_PATH);
        } else if (window.location.pathname === STREAMER_PATH && pathname !== STREAMER_PATH) {
            window.history.replaceState(window.history.state, "", real);
        }
    }, [inRoom, streamerMode, pathname, search, hash]);
};
