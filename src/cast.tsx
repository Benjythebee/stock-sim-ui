import { useState, useEffect } from "react"

type CastState = 'loading' | 'ready' | 'error';

const RECEIVER_SDK = "https://www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js";
const ROOM_NAMESPACE = "urn:x-cast:com.tendiesbrawl.room";

// CastReceiverContext is a singleton that can only be started once (StrictMode runs effects twice).
let started = false;

export default function CastPage() {
    const [castState, setCastState] = useState<CastState>('loading');
    const [error, setError] = useState<string>('');
    // Kept in state, not set on an iframe ref: the sender's message can arrive before the iframe is mounted.
    const [room, setRoom] = useState<string | null>(null);

    useEffect(() => {
        const onCastLoad = () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const CAST = (window as any).cast;

                if (!CAST) {
                    throw new Error('Cast SDK not available');
                }
                if (started) return;
                started = true;

                const context = CAST.framework.CastReceiverContext.getInstance();

                // Custom namespaces must be registered before start(), or the sender's messages are rejected.
                context.addCustomMessageListener(
                    ROOM_NAMESPACE,
                    (customEvent: { data: { room?: string } | string }) => {
                        const data = typeof customEvent.data === 'string' ? JSON.parse(customEvent.data) : customEvent.data;
                        if (data?.room) setRoom(data.room);
                    }
                );

                context.addEventListener(
                    CAST.framework.system.EventType.READY,
                    () => setCastState('ready')
                );

                context.start({
                    customNamespaces: { [ROOM_NAMESPACE]: CAST.framework.system.MessageType.JSON },
                    // Not a media app: don't load the players, and don't close when no media is playing.
                    skipPlayersLoad: true,
                    disableIdleTimeout: true,
                });
            } catch (err) {
                setCastState('error');
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            }
        };

        const script = document.createElement('script');
        script.src = RECEIVER_SDK;
        script.onload = onCastLoad;
        script.onerror = () => {
            setCastState('error');
            setError('Failed to load Cast SDK');
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    if (castState === 'error') {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-red-900">
                <div className="text-center text-white">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold mb-2">Cast Error</h1>
                    <p className="text-lg">{error}</p>
                </div>
            </div>
        );
    }

    if (castState === 'loading' || !room) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-gray-900">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4 mx-auto"></div>
                    <p className="text-xl">{castState === 'loading' ? 'Loading Cast Receiver...' : 'Waiting for a room...'}</p>
                </div>
            </div>
        );
    }

    return (
        <iframe
            id="frame"
            src={`/${room}/spectate`}
            className="border-none w-screen h-screen"
        />
    );
}
