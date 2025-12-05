import { TradingChart } from '../components/Trading/Chart';
import { TradingDepth } from '../components/Trading/TradingDepth';
import { AdminModal } from '../components/Admin';
import { useGameStore } from '../context/game.context';
import { useShallow } from 'zustand/shallow';
import { News } from '../components/Trading/News';
import { useWebsocketContext } from '../context/ws.context';
import { useEffect } from 'react';
import { useParams } from 'react-router';



export default function RoomSpectatePage() {
  const { roomId: roomCode } = useParams();
  const {status,connect} = useWebsocketContext()
  const {paused,ended} = useGameStore(useShallow((state) => ({paused: state.paused, ended: state.ended,setUsername:state.setUsername})));

  useEffect(() => {
    if (status == 'DISCONNECTED' && roomCode) {
      connect('', roomCode,true);
    }
  }, [status]);

  return (
    <div id='room-page' className="relative min-h-screen bg-base-100 p-4">
      {(paused || ended) && <div className="modal-backdrop fixed inset-0 bg-black opacity-20 z-40"></div>}
      <AdminModal  />
      
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Main Chart Container */}
        <div className="flex-1 flex flex-col gap-4">
          <TradingChart />

          {/* Split section in 3: News,Order history */}
          <div className='flex gap-2 w-full'>
            <News className="w-1/2" />
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