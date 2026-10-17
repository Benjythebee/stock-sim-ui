import { useLocation } from "react-router"
import { HomeNavigation } from "./components/nav"
import { InGameNavigation } from "./components/nav/in-game.nav"
import { SiteFooter } from "./components/footer"
import { Toaster } from "./components/Toast/Toaster"
import { PresentationOverlay } from "./components/Presentation/PresentationOverlay"
import { useEffect, useRef, useState } from "react"
import { QueryClient ,QueryClientProvider} from "@tanstack/react-query"
import { useWebsocketContext } from "./context/ws.context"
import { resetRoomStores } from "./context/game.context"
import { applyPageMeta, pageMetaFor } from "./utils/seo"
import { STREAMER_PATH, useStreamerMode } from "./context/streamer.store"
import { useMaskedRoomUrl } from "./hooks/useMaskedRoomUrl"

/** Top-level pages that are not a room code. Everything else ("/:roomId", "/:roomId/spectate") is a room. */
const STATIC_PAGES = new Set(["/", "/about", "/how-to-play", "/powers", "/cast", STREAMER_PATH]);

export const Layout = ({children}: {children: React.ReactNode}) => {

    // Layout sits outside <Routes>, so useParams() is always empty here; read the path instead.
    const { pathname } = useLocation();
    const path = pathname.replace(/\/+$/, "") || "/";
    const inRoom = !STATIC_PAGES.has(path);
    // TV screens (Chromecast receiver, spectator view it embeds) get no site chrome.
    const isScreen = path === "/cast" || /^\/[^/]+\/spectate$/.test(path);
    const [queryClient,] = useState(() => new QueryClient())

    // Title, description, canonical and robots for this route (rooms are noindex). See utils/seo.ts.
    const streamerMode = useStreamerMode();
    useEffect(() => applyPageMeta(pageMetaFor(path, streamerMode)), [path, streamerMode]);
    // Streamer mode keeps the room code out of the address bar too.
    useMaskedRoomUrl(inRoom);

    // Leaving a room page any way at all (Disconnect, browser Back, footer links) closes its socket and
    // forgets its state, so Home starts clean and the old room's toasts stop. A refresh is a new page load,
    // so it never gets here and resumes the seat. This lives in Layout rather than in the room pages'
    // unmount cleanup because StrictMode's test unmount would close the socket Home just opened.
    const { disconnect } = useWebsocketContext();
    const roomPath = inRoom && path !== "/cast" ? path : null;
    const lastRoomPath = useRef(roomPath);
    useEffect(() => {
        if (lastRoomPath.current && lastRoomPath.current !== roomPath) {
            // Not sticky: if roomPath is another room, its (still mounted) page reconnects to it.
            disconnect(false);
            resetRoomStores();
        }
        lastRoomPath.current = roomPath;
    }, [roomPath, disconnect]);

    return  <QueryClientProvider client={queryClient}>
    <div className="relative min-h-screen w-full bg-base-200 flex flex-col">
            {path === "/cast" ? null : inRoom ? <InGameNavigation /> : <HomeNavigation />}

            <div className="flex-1">
                {children}
            </div>
            {!isScreen && <SiteFooter />}
            <PresentationOverlay />
            <Toaster />
        </div>
    </QueryClientProvider>
}
