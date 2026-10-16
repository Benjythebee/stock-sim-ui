import { useState, useEffect } from "react"

type CastState = 'loading' | 'ready' | 'error';

const RECEIVER_SDK = "https://www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js";
const ROOM_NAMESPACE = "urn:x-cast:com.tendiesbrawl.room";

// CastReceiverContext is a singleton that can only be started once (StrictMode runs effects twice).
let started = false;

// Inline styles, not Tailwind: Cast devices can run a Chromium too old for Tailwind 4's CSS (@layer, oklch),
// and then every utility is dropped and the iframe shrinks to its default 300x150 in the corner.
const FRAME: React.CSSProperties = {position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%', border: 0, background: '#15191e'};
const SCREEN: React.CSSProperties = {position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#15191e', color: '#fff', fontFamily: 'sans-serif', textAlign: 'center'};
const BROWSER_LINE: React.CSSProperties = {position: 'fixed', bottom: 16, left: 0, right: 0, fontSize: 14, opacity: 0.5, margin: 0};
const BROWSER_BADGE: React.CSSProperties = {position: 'fixed', bottom: 8, right: 8, padding: '2px 8px', fontSize: 12, fontFamily: 'sans-serif', color: '#fff', background: 'rgba(0,0,0,.6)', borderRadius: 4};
/** Shown on the TV so we can tell which browser features the device has. */
const BROWSER = navigator.userAgent.match(/Chrome\/[\d.]+/)?.[0] ?? navigator.userAgent;

export default function CastPage() {
    const [castState, setCastState] = useState<CastState>('loading');
    const [error, setError] = useState<string>('');
    // Kept in state, not set on an iframe ref: the sender's message can arrive before the iframe is mounted.
    const [room, setRoom] = useState<string | null>(null);
    const [showBrowser, setShowBrowser] = useState(true);

    useEffect(() => {
        if (!room) return;
        const t = setTimeout(() => setShowBrowser(false), 15000);
        return () => clearTimeout(t);
    }, [room]);

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
            <div style={{...SCREEN, background: '#7f1d1d'}}>
                <div style={{fontSize: 64, marginBottom: 16}}>⚠️</div>
                <h1 style={{fontSize: 28, fontWeight: 'bold', margin: '0 0 8px'}}>Cast Error</h1>
                <p style={{fontSize: 20, margin: 0}}>{error}</p>
                <p style={BROWSER_LINE}>{BROWSER}</p>
            </div>
        );
    }

    if (castState === 'loading' || !room) {
        return (
            <div style={SCREEN}>
                <p style={{fontSize: 24, margin: 0}}>{castState === 'loading' ? 'Loading Cast Receiver...' : 'Waiting for a room...'}</p>
                <p style={BROWSER_LINE}>{BROWSER}</p>
            </div>
        );
    }

    return (
        <>
            {/* ?tv tells the spectator view it's on a TV (IS_CAST_DEVICE): no buttons, compact lobby. */}
            <iframe id="frame" src={`/${room}/spectate?tv`} title="Tendies Brawl spectator view" style={FRAME} />
            {showBrowser && <div style={BROWSER_BADGE}>{BROWSER}</div>}
        </>
    );
}
