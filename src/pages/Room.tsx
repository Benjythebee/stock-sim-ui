import { TradingChart } from '../components/Trading/Chart';
import { OrderHistory } from '../components/Trading/OrderHistory';
import { CurrentOrders } from '../components/Trading/CurrentOrders';
import { TradingCard } from '../components/Trading/TradingCard';
import { TradingDepth } from '../components/Trading/TradingDepth';
import { AdminModal } from '../components/Admin';
import { useGameStore } from '../context/game.context';
import { useShallow } from 'zustand/shallow';
import { ConclusionModal } from '../components/Conclusion';
import { News } from '../components/Trading/News';
import { useWebsocketContext } from '../context/ws.context';
import { useAutoConnect } from '../context/useAutoConnect';
import { useParams } from 'react-router';



export default function RoomPage() {
  const { roomId: roomCode } = useParams();
  const {connect} = useWebsocketContext()
  const {paused,ended, setUsername} = useGameStore(useShallow((state) => ({paused: state.paused, ended: state.ended,setUsername:state.setUsername})));

  useAutoConnect(roomCode, () => {
    const storedUsername = localStorage.getItem('username') || `Trader${Math.floor(Math.random() * 1000)}`;
    setUsername(storedUsername);
    connect(storedUsername, roomCode!);
  });

  return (
    <div id='room-page' className="relative min-h-screen bg-base-100 p-4">
      {(paused || ended) && <div className="modal-backdrop fixed inset-0 bg-black opacity-20 z-40"></div>}
      <AdminModal  />
      <ConclusionModal  />
      
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Main Chart Container */}
        <div className="flex-1 flex flex-col gap-4">
          <TradingChart />

          {/* News, our open orders, and our finished orders */}
          <div className='grid grid-cols-1 2xl:grid-cols-3 md:grid-cols-2 gap-2 w-full'>
            <News className="min-w-0" />
            <CurrentOrders className="min-w-0" />
            <OrderHistory className="min-w-0 md:col-span-2 2xl:col-span-1" />
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Trading Panel */}
            <TradingCard />

          {/* Order Book / Depth Table */}
            <TradingDepth />
        </div>
      </div>
    </div>
  );
}