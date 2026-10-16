import {  useCallback, useEffectEvent, useRef, useState } from "react";
import { WebsocketContext } from "./ws.context";
import { handleGameMessage } from "./game.context";
import { MessageType, type Message } from "../types/messages";
import { SERVER_WS_URL } from "../utils/server";
import { debugLog } from "../utils/debug";

const PING_INTERVAL_MS = 3000;

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  // The live socket. State alone goes stale inside callbacks, which left old sockets open.
  const wsRef = useRef<WebSocket | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = useState<'CONNECTED' | 'PENDING' | 'DISCONNECTED'>('DISCONNECTED');
  const [error, setError] = useState<string | null>(null);
  const pingTimeRef = useRef<number | null>(null);
  const [room, setRoom] = useState<string>('');
  const [ping, setPing] = useState<number>(0);
  const [isSpectate, setIsSpectate] = useState<boolean>(false);
  const [closedByUser, setClosedByUser] = useState<boolean>(false);

    const stopPing = useCallback(() => {
        if (pingTimerRef.current) clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
    }, []);

    const onConnected = useEffectEvent(() => {
        setStatus('CONNECTED');
        setError(null);
        stopPing();
        pingTimerRef.current = setInterval(() => {
            pingTimeRef.current = Date.now();
            wsRef.current?.send(JSON.stringify({ type: MessageType.PING }));
        }, PING_INTERVAL_MS);
    })
    const onMessage = useEffectEvent((event: MessageEvent<string>) => {
        if(!event.data){
            console.error('Received invalid message:', event.data);
            return;
        }
        const message = JSON.parse(event.data) as Message;
        debugLog('Received message:', message);

        if(message.type === MessageType.ID ){
            localStorage.setItem('session_', message.id);
            return
        }

        if(message.type === MessageType.PONG){
            const now = Date.now();
            if (pingTimeRef.current) {
              const calculatedPing = now - pingTimeRef.current;
              setPing(calculatedPing);
              pingTimeRef.current = null;
            }
          return;
        }

        handleGameMessage(message);
    })
    const onDisconnected = useEffectEvent(() => {
        debugLog('Disconnected from WebSocket server');
        stopPing();
        setStatus('DISCONNECTED');
    })
    const onError = useEffectEvent(() => {
        debugLog('WebSocket error');
        setError('WebSocket error occurred');
    })

  const setListeners = useCallback((websocket: WebSocket) => {
    websocket.onopen = onConnected;
    websocket.onerror = onError;
    websocket.onmessage = onMessage;
    websocket.onclose = onDisconnected;
  }, [onConnected, onMessage, onError, onDisconnected]);

  /** Close the current socket without firing its handlers (no DISCONNECTED, so no auto-reconnect). */
  const detach = useCallback(() => {
    const previous = wsRef.current;
    if (previous) {
      previous.onopen = previous.onclose = previous.onerror = previous.onmessage = null;
      previous.close();
    }
    wsRef.current = null;
    stopPing();
  }, [stopPing]);

  const connect = useCallback((username: string, roomCode: string, spectate: boolean=false) => {
    detach();
    setClosedByUser(false);
    setStatus('PENDING');
    setIsSpectate(spectate);

    const pastSession = localStorage.getItem(`session_`);
    if(!pastSession?.startsWith(roomCode)){
      // we're connecting to a new room;
      localStorage.removeItem('session_');
    }

    const wsUrl = new URL(`${SERVER_WS_URL}/ws/${encodeURIComponent(roomCode)}`);
    wsUrl.searchParams.append('username', username);
    if(pastSession?.startsWith(roomCode)){
      // reconnecting to an existing session
      wsUrl.searchParams.append('prevSessionData', pastSession);
    }

    if(spectate){
      wsUrl.searchParams.append('spectator', 'true');
    }

    const websocket = new WebSocket(wsUrl.toString());
    wsRef.current = websocket;
    setRoom(roomCode);
    setListeners(websocket);
  }, [setListeners, detach]);

  /** Leave on purpose: closes the socket and forgets the room, so nothing reconnects. */
  const disconnect = () => {
    detach();
    setClosedByUser(true);
    setRoom('');
    setStatus('DISCONNECTED');
  }

  const sendMessage = (message: Message) => {
    if(!(message.type in MessageType)){
      console.error('Invalid message type:', message.type);
      return;
    }

    const socket = wsRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

    return (
        <WebsocketContext.Provider value={{ connect, disconnect, sendMessage, error, ping, room, status, isSpectate, closedByUser}}>
            {children}
        </WebsocketContext.Provider>
    );
};
