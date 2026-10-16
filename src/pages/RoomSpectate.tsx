import { TradingChart } from '../components/Trading/Chart';
import { TradingDepth } from '../components/Trading/TradingDepth';
import { News } from '../components/Trading/News';
import { useWebsocketContext } from '../context/ws.context';
import { useAutoConnect } from '../context/useAutoConnect';
import { useParams } from 'react-router';
import { RoomOverlays } from '../components/Room/room.overlays';



export default function RoomSpectatePage() {
  const { roomId: roomCode } = useParams();
  const {connect} = useWebsocketContext()

  useAutoConnect(roomCode, () => connect('', roomCode!, true));

  return (
    <div id='room-page' className="relative min-h-screen bg-base-100 p-2 sm:p-4">
      <RoomOverlays />
      
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Main Chart Container */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <TradingChart />

          {/* Split section in 3: News,Order history */}
          <div className='flex gap-2 w-full'>
            <News className="w-full lg:w-1/2" />
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">

          {/* Order Book / Depth Table */}
            <TradingDepth />
        </div>
      </div>
    </div>
  );
}