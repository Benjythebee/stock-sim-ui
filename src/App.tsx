
import { Navigation } from './components/nav';
import { Toaster } from './components/Toast/Toaster';
import { useViewContext, View } from './context/view.context';
import { Home } from './pages/Home';
import { Discord } from '@ridemountainpig/svgl-react'
import RoomPage from './pages/Room';


export default function GameLandingPage() {

  const {view} = useViewContext();

  return (
    <>
      <div className="relative min-h-screen w-full bg-base-200">
        <Navigation />
        {view === View.Home && <Home />}
        {view === View.Room && <RoomPage />}
      </div>
      <Toaster />
      {view === View.Home && <div className="fixed bottom-2 right-2 opacity-80 hover:opacity-100 transition-opacity duration-300">
        <button className="btn btn-ghost btn-sm flex items-center" onClick={() => window.open("https://discord.gg/QyjFdGSmTm", "_blank")}>
          Join us on Discord&nbsp;
          <Discord className="w-8 h-8 text-gray-600 hover:text-gray-400 cursor-pointer" onClick={() => window.open("https://discord.gg/QyjFdGSmTm", "_blank")} />
        </button>
      </div>}
    </>
  );
}