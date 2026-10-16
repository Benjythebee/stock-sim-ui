import { useRef, useState, useEffect } from "react"

type CastState = 'loading' | 'ready' | 'error';

export default function CastPage() {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [castState, setCastState] = useState<CastState>('loading');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js";
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

    const onCastLoad = () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const CAST = (window as any).cast;

            if (!CAST) {
                throw new Error('Cast SDK not available');
            }

            const context = CAST.framework.CastReceiverContext.getInstance();

            context.start();

            // Register custom message handler
            context.addCustomMessageListener(
                "urn:x-cast:com.tendiesbrawl.room",
                (customEvent: { data: { room: string}; }) => {
                    const { room } = customEvent.data;
                    if (room && iframeRef.current) {
                        iframeRef.current.src = `/${room}/spectate`;
                    }
                }
            );

            context.addEventListener(
                CAST.framework.system.EventType.READY,
                () => {
                    setCastState('ready');
                    // Also check for initial application data on ready
                    const data = context.getApplicationData();
                    if (data?.room) {
                        if (iframeRef.current) {
                            iframeRef.current.src = `/${data.room}/spectate`;
                        }
                    }
                }
            );
        } catch (err) {
            setCastState('error');
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
    }

    if (castState === 'loading') {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-gray-900">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4 mx-auto"></div>
                    <p className="text-xl">Loading Cast Receiver...</p>
                </div>
            </div>
        );
    }

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

    return (
        <iframe
            id="frame"
            ref={iframeRef}
            className="border-none w-screen h-screen"
        />
    );
}