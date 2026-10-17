import { create } from "zustand";

/** What the address bar shows for a room page in streamer mode (see useMaskedRoomUrl). Not a valid room code for the Join form, which uppercases codes. */
export const STREAMER_PATH = '/live';

/** What a room code shows as in streamer mode. Fixed length, so it doesn't give away the real one's. */
export const HIDDEN_ROOM_CODE = '•••••';

/**
 * Streamer mode hides the room code on screen, so viewers can't join. Copy buttons still copy the
 * real code and link. Remembered in localStorage; `?streamer` / `?streamer=0` in the URL sets it too,
 * for a page that has no toggle (an OBS browser source on the spectator view).
 */
function readStreamerFlag(): boolean {
    try {
        const param = new URLSearchParams(window.location.search).get("streamer");
        if (param !== null) {
            const on = param !== "0" && param !== "false";
            localStorage.setItem("streamer", on ? "1" : "0");
            return on;
        }
        return localStorage.getItem("streamer") === "1";
    } catch {
        return false;
    }
}

type StreamerStore = {
    /** Our own choice: remembered, and reported to the room (STREAMER_MODE). */
    streamerMode: boolean,
    /** Someone in our room has it on (PLAYERS.streamer), which turns it on by default here too. */
    roomStreamer: boolean,
    /** We switched the room's default off. Reset when the room's streamer mode comes on again. */
    roomDefaultDismissed: boolean,
    /** The toggle: sets our own choice, and switching off also opts out of the room's default. */
    setStreamerMode: (streamerMode: boolean) => void,
    setRoomStreamer: (roomStreamer: boolean) => void,
}

export const useStreamerStore = create<StreamerStore>((set) => ({
    streamerMode: readStreamerFlag(),
    roomStreamer: false,
    roomDefaultDismissed: false,
    setStreamerMode: (streamerMode) => {
        try {
            localStorage.setItem("streamer", streamerMode ? "1" : "0");
        } catch { /* private mode: it just won't be remembered */ }
        set((s) => ({ streamerMode, roomDefaultDismissed: !streamerMode && s.roomStreamer }));
    },
    setRoomStreamer: (roomStreamer) => set((s) => ({
        roomStreamer,
        roomDefaultDismissed: roomStreamer && !s.roomStreamer ? false : s.roomDefaultDismissed,
    })),
}));

/** Whether the room code is hidden right now: our own streamer mode, or the room's default. */
export const isStreamerModeOn = (s: StreamerStore) => s.streamerMode || (s.roomStreamer && !s.roomDefaultDismissed);

export const useStreamerMode = () => useStreamerStore(isStreamerModeOn);

/** The room code as it should appear on screen: hidden in streamer mode. */
export const useShownRoomCode = (room: string) => {
    const streamerMode = useStreamerMode();
    return streamerMode ? HIDDEN_ROOM_CODE : room;
};
