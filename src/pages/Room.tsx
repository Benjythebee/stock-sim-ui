import { TradingChart } from '../components/Trading/Chart';
import { OrderHistory } from '../components/Trading/OrderHistory';
import { TradingCard } from '../components/Trading/TradingCard';
import { TradingDepth } from '../components/Trading/TradingDepth';
import { AdminModal } from '../components/Admin';
import { useGameStore } from '../context/game.context';
import { useShallow } from 'zustand/shallow';



export default function RoomPage() {
  const {paused} = useGameStore(useShallow((state) => ({paused: state.paused})));

  return (
    <div className="relative min-h-screen bg-base-100 p-4">
      {paused && <div className="modal-backdrop fixed inset-0 bg-black opacity-20 z-40"></div>}
      <AdminModal  />
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Main Chart Container */}
        <div className="flex-1 flex flex-col gap-4">
          <TradingChart />

          {/* Order History Table */}
          <OrderHistory />
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