
import { Navigation } from './components/nav';
import { useViewContext, View } from './context/view.context';
import { Home } from './pages/Home';
import RoomPage from './pages/Room';


export default function GameLandingPage() {

  const {view} = useViewContext();

  return (
    <div className="relative min-h-screen w-full bg-base-200">
      <Navigation />
      {view === View.Home && <Home />}
      {view === View.Room && <RoomPage />}
    </div>
  );
}