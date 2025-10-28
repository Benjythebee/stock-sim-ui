import {  useCallback, useEffectEvent, useRef, useState } from "react";
import { WebsocketContext } from "./ws.context";
import { handleGameMessage } from "./game.context";
import { MessageType, type Message } from "../types/messages";



export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<'CONNECTED' | 'PENDING' | 'DISCONNECTED'>('DISCONNECTED');
  const [error, setError] = useState<string | null>(null);
  const pingTimeRef = useRef<number | null>(null);
  const [room, setRoom] = useState<string>('');
  const [ping, setPing] = useState<number>(0);

    const onConnected = useEffectEvent(() => {
        console.log('Connected to WebSocket server');
        setStatus('CONNECTED');
        setInterval(() => {
            pingTimeRef.current = Date.now();
            ws?.send(JSON.stringify({ type: MessageType.PING }));
        }, 3000);
    })
    const onMessage = useEffectEvent((event: MessageEvent<string>) => {

        const message = JSON.parse(event.data) as Message;
        if(!event.data){
            console.error('Received invalid message:', event.data);
            return;
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
        console.log('Disconnected from WebSocket server');
        setStatus('DISCONNECTED');
    })
    const onError = useEffectEvent(() => {
        console.log('WebSocket error');
        setError('WebSocket error occurred');
    })

  const setListeners = useCallback((websocket: WebSocket) => {
    websocket.onopen = onConnected;
    websocket.onerror = onError;
    websocket.onmessage = onMessage;
    websocket.onclose = onDisconnected;
  }, [onConnected, onMessage, onError, onDisconnected]);

//   useEffect(() => {
//     const websocket = new WebSocket('ws://localhost:3000/ws/');
//     setListeners(websocket);
//     setWs(websocket);

//     // Cleanup on unmount
//     return () => websocket.close();
//   }, []);

  const connect = useCallback((username: string, roomCode: string) => {
    if (ws) {
      ws.close();
    }
    setStatus('PENDING');
    const websocket = new WebSocket(`ws://localhost:3000/ws/${roomCode}?username=${username}`);
    setRoom(roomCode);
    setListeners(websocket);
    setWs(websocket);
  }, [setListeners]);

  const disconnect = () => {
    if (ws) {
      ws.close();
    }
  }

  const sendMessage = (message: Message) => {
    if(!(message.type in MessageType)){
      console.error('Invalid message type:', message.type);
      return;
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

    return (
        <WebsocketContext.Provider value={{ connect, disconnect, sendMessage, error, ping, room, status }}>
            {children}
        </WebsocketContext.Provider>
    );
};


