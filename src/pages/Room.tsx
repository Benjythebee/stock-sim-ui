import { TradingChart } from '../components/Trading/Chart';
import { OrderHistory } from '../components/Trading/OrderHistory';
import { TradingCard } from '../components/Trading/TradingCard';
import { TradingDepth } from '../components/Trading/TradingDepth';
import { AdminModal } from '../components/Admin';
import { useGameStore } from '../context/game.context';
import { useShallow } from 'zustand/shallow';
import { ConclusionModal } from '../components/Conclusion';
import { News } from '../components/Trading/News';



export default function RoomPage() {
  const {paused,ended} = useGameStore(useShallow((state) => ({paused: state.paused, ended: state.ended})));

  return (
    <div className="relative min-h-screen bg-base-100 p-4">
      {(paused || ended) && <div className="modal-backdrop fixed inset-0 bg-black opacity-20 z-40"></div>}
      <AdminModal  />
      <ConclusionModal  />
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Main Chart Container */}
        <div className="flex-1 flex flex-col gap-4">
          <TradingChart />

          {/* Split section in 3: News,Order history */}
          <div className='flex gap-2 w-full'>
            <News className="w-1/2" />
            <OrderHistory className="w-1/2" />
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