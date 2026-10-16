import { useEffect, useEffectEvent, useRef } from "react";
import { useWebsocketContext } from "./ws.context";

/** Retry delays: immediate first attempt, then 0.5s, 1s, 2s, 4s, capped at 8s. */
export const reconnectDelay = (attempt: number) => (attempt === 0 ? 0 : Math.min(8000, 500 * 2 ** (attempt - 1)));

/**
 * Keep a socket open to `roomCode` while the component is mounted: connect on mount and
 * reconnect with exponential backoff whenever the connection drops (server restart, network).
 *
 * Safe under React StrictMode: the doubled mount effect cancels its pending attempt in cleanup,
 * so only one socket (and so one player) is ever created.
 */
export function useAutoConnect(roomCode: string | undefined, open: () => void) {
    const { status, closedByUser } = useWebsocketContext();
    const attempts = useRef(0);
    // If the user hit Disconnect while this page was open, stay disconnected (the navigation home
    // is a transition, so this page can still see the DISCONNECTED status before it unmounts).
    // A page mounted after that (e.g. browser Back into a room) is a fresh visit and connects.
    const mountedAfterLeaving = useRef(closedByUser);
    const onOpen = useEffectEvent(open);

    useEffect(() => {
        if (status === "CONNECTED") {
            attempts.current = 0;
            return;
        }
        if (status !== "DISCONNECTED" || !roomCode) return;
        if (closedByUser && !mountedAfterLeaving.current) return;

        const timer = setTimeout(() => {
            attempts.current++;
            onOpen();
        }, reconnectDelay(attempts.current));
        return () => clearTimeout(timer);
        // onOpen is an Effect Event: it must not be a dependency (this eslint-plugin version predates useEffectEvent).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, roomCode, closedByUser]);
}
