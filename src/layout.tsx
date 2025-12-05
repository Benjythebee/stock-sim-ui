import { useParams } from "react-router"
import { HomeNavigation } from "./components/nav"
import { InGameNavigation } from "./components/nav/in-game.nav"
import { Toaster } from "./components/Toast/Toaster"
import { Discord } from "@ridemountainpig/svgl-react"


export const Layout = ({children}: {children: React.ReactNode}) => {

    const room = useParams<{roomId: string}>()

    return <div className="relative min-h-screen w-full bg-base-200">
            <HomeNavigation />
            <InGameNavigation />
            {children}
            <Toaster />
            {room?.roomId && <div className="fixed bottom-2 right-2 opacity-80 hover:opacity-100 transition-opacity duration-300">
                <button className="btn btn-ghost btn-sm flex items-center" onClick={() => window.open("https://discord.gg/QyjFdGSmTm", "_blank")}>
                Join us on Discord&nbsp;
                <Discord className="w-8 h-8 text-gray-600 hover:text-gray-400 cursor-pointer" onClick={() => window.open("https://discord.gg/QyjFdGSmTm", "_blank")} />
                </button>
            </div>}
        </div>
}