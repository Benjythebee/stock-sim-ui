import {  useCallback, useEffectEvent, useRef, useState } from "react";
import { WebsocketContext } from "./ws.context";
import { handleGameMessage } from "./game.context";
import { MessageType, type Message } from "../types/messages";
import { SERVER_WS_URL } from "../utils/server";
import { debugLog } from "../utils/debug";

const PING_INTERVAL_MS = 3000;
/** Server close code for "Room does not exist" (spectating an unknown room): retrying won't help. */
const CLOSE_ROOM_NOT_FOUND = 4004;

// The resume token ("<roomId>-<playerId>", from the ID message) is per tab: in localStorage, two tabs
// shared one seat and the server silently detached the first. sessionStorage survives a refresh.
const SESSION_KEY = 'session_';
localStorage.removeItem(SESSION_KEY); // where older builds kept it

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
            sessionStorage.setItem(SESSION_KEY, message.id);
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
    const onDisconnected = useEffectEvent((event: CloseEvent) => {
        debugLog('Disconnected from WebSocket server', event.code, event.reason);
        stopPing();
        // The ERROR message before this close already toasted the reason; don't retry in a loop.
        if (event.code === CLOSE_ROOM_NOT_FOUND) setClosedByUser(true);
        setStatus('DISCONNECTED');
    })
    const onError = useEffectEvent(() => {
        debugLog('WebSocket error');
        setError('Could not connect. Check the room code and that the server is running.');
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
    setError(null);
    setStatus('PENDING');
    setIsSpectate(spectate);

    const pastSession = sessionStorage.getItem(SESSION_KEY);
    const resumes = !!pastSession?.startsWith(`${roomCode}-`);
    if(!resumes){
      // we're connecting to a new room;
      sessionStorage.removeItem(SESSION_KEY);
    }

    const wsUrl = new URL(`${SERVER_WS_URL}/ws/${encodeURIComponent(roomCode)}`);
    wsUrl.searchParams.append('username', username);
    if(resumes){
      // reconnecting to an existing session
      wsUrl.searchParams.append('prevSessionData', pastSession!);
    }

    if(spectate){
      wsUrl.searchParams.append('spectator', 'true');
    }

    const websocket = new WebSocket(wsUrl.toString());
    wsRef.current = websocket;
    setRoom(roomCode);
    setListeners(websocket);
  }, [setListeners, detach]);

  /**
   * Leave on purpose: closes the socket and forgets the room. By default nothing reconnects;
   * `stayDisconnected=false` lets a mounted room page connect again (moving straight to another room).
   * The resume token is kept, so coming back to the same room within the server's grace period keeps the seat.
   */
  const disconnect = useCallback((stayDisconnected: boolean = true) => {
    detach();
    setClosedByUser(stayDisconnected);
    setError(null);
    setRoom('');
    setStatus('DISCONNECTED');
  }, [detach]);

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
