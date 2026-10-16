import { useWebsocketContext } from "../context/ws.context";

/** The room we're in and whether its socket is up right now. */
export const useRoomConnection = () => {
    const { room, status, isSpectate } = useWebsocketContext();
    return { room, isSpectate, connected: !!room && status === 'CONNECTED' };
};
