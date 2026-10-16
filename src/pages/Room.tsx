import { useState } from 'react';
import { TradingChart } from '../components/Trading/Chart';
import { OrderHistory } from '../components/Trading/OrderHistory';
import { CurrentOrders } from '../components/Trading/CurrentOrders';
import { TradingCard } from '../components/Trading/TradingCard';
import { useOrderFormStore } from '../context/order-form.store';
import { TradingDepth } from '../components/Trading/TradingDepth';
import { useGameStore } from '../context/game.context';
import { News } from '../components/Trading/News';
import { useWebsocketContext } from '../context/ws.context';
import { useAutoConnect } from '../context/useAutoConnect';
import { useParams } from 'react-router';
import { RoomOverlays } from '../components/Room/room.overlays';
import { NamePrompt } from '../components/Room/room.name-prompt';



export default function RoomPage() {
  const { roomId: roomCode } = useParams();
  const {connect} = useWebsocketContext()
  const setUsername = useGameStore((state) => state.setUsername);
  // Opened from an invite link without ever having played here: ask for a name before taking a seat.
  // Anyone who has joined before (Home or this prompt) has one saved, including a refresh resuming a seat.
  const [needsName, setNeedsName] = useState(() => !localStorage.getItem('username')?.trim());

  useAutoConnect(needsName ? undefined : roomCode, () => {
    const storedUsername = localStorage.getItem('username')!;
    setUsername(storedUsername);
    connect(storedUsername, roomCode!);
  });

  const onName = (name: string) => {
    localStorage.setItem('username', name);
    setNeedsName(false);
  };

  return (
    <div id='room-page' className="relative min-h-screen bg-base-100 p-2 sm:p-4">
      {needsName ? <NamePrompt room={roomCode!} onSubmit={onName} /> : <RoomOverlays />}

      {/* Below lg the two columns dissolve (display: contents) so `order-*` can interleave them:
          chart, order form, order book, then news and orders. */}
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Main Chart Container */}
        <div className="contents lg:flex flex-1 flex-col gap-4 min-w-0">
          <TradingChart className="order-1 lg:order-none" onPickPrice={useOrderFormStore.getState().pickLimitPrice} />

          {/* News, our open orders, and our finished orders */}
          <div className='order-4 lg:order-none grid grid-cols-1 2xl:grid-cols-3 md:grid-cols-2 gap-2 w-full'>
            <News className="min-w-0" />
            <CurrentOrders className="min-w-0 order-first md:order-none" />
            <OrderHistory className="min-w-0 md:col-span-2 2xl:col-span-1" />
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="contents lg:flex w-full lg:w-80 flex-col gap-4">
          {/* Trading Panel */}
          <div className="order-2 lg:order-none"><TradingCard /></div>

          {/* Order Book / Depth Table */}
          <TradingDepth className="order-3 lg:order-none" />
        </div>
      </div>
    </div>
  );
}