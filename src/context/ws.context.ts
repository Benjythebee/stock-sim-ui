import { createContext, useContext } from "react";
import type { Message } from "../types/messages";

export const WebsocketContext = createContext<{
    connect: (username:string,roomCode: string) => void;
    disconnect: () => void;
    sendMessage: (message: Message) => void;
    error?: string | null;
    ping?: number;
    room: string;
    status: 'CONNECTED' | 'DISCONNECTED' | 'PENDING';
}>({
  connect: () => {},
  disconnect: () => {},
  sendMessage: () => {},
  error: null,
  ping: 0,
  room: '',
  status: 'DISCONNECTED',
});

export const useWebsocketContext = () => {
    return useContext(WebsocketContext);
}
