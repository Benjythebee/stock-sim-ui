import { useLocation } from "react-router"
import { HomeNavigation } from "./components/nav"
import { InGameNavigation } from "./components/nav/in-game.nav"
import { SiteFooter } from "./components/footer"
import { Toaster } from "./components/Toast/Toaster"
import { useState } from "react"
import { QueryClient ,QueryClientProvider} from "@tanstack/react-query"

/** Top-level pages that are not a room code. Everything else ("/:roomId", "/:roomId/spectate") is a room. */
const STATIC_PAGES = new Set(["/", "/about", "/cast"]);

export const Layout = ({children}: {children: React.ReactNode}) => {

    // Layout sits outside <Routes>, so useParams() is always empty here; read the path instead.
    const { pathname } = useLocation();
    const path = pathname.replace(/\/+$/, "") || "/";
    const inRoom = !STATIC_PAGES.has(path);
    // TV screens (Chromecast receiver, spectator view it embeds) get no site chrome.
    const isScreen = path === "/cast" || /^\/[^/]+\/spectate$/.test(path);
    const [queryClient,] = useState(() => new QueryClient())

    return  <QueryClientProvider client={queryClient}>
    <div className="relative min-h-screen w-full bg-base-200 flex flex-col">
            {path === "/cast" ? null : inRoom ? <InGameNavigation /> : <HomeNavigation />}

            <div className="flex-1">
                {children}
            </div>
            {!isScreen && <SiteFooter />}
            <Toaster />
        </div>
    </QueryClientProvider>
}
