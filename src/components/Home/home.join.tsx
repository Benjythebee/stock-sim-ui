import { useEffect, useState } from "react";
import {useShallow} from "zustand/shallow";
import { useWebsocketContext } from "../../context/ws.context";
import { useGameStore } from "../../context/game.context";
import { useViewContext, View } from "../../context/view.context";


export const Join = () => {
  const {connect,status,error} = useWebsocketContext();
  const {setView} = useViewContext();
  const {username,setUsername} = useGameStore(useShallow((state) => ({username: state.username, setUsername: state.setUsername})));
  const [roomCode, setRoomCode] = useState<string>("");

  const handleJoin = () => {
    if (username.trim()) {
      console.log("Joining game:", { username, roomCode });
      // Add your join logic here
      connect(username, roomCode);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && username.trim()) {
      handleJoin();
    }
  };

  useEffect(() => {
    if (roomCode && status === 'CONNECTED') {
      setView(View.Room);
    }
  }, [status, roomCode]);

  return <div className="card absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center">
          <h1 className="text-4xl font-bold text-center mb-2 bg-clip-text text-primary">
            Stock Sim Game
          </h1>
          <p className="text-center text-base-content/70 mb-6">
            Enter your details to start playing
          </p>
          {status === 'PENDING' && error && <div className="text-red-500 mb-4">{error}</div>}
          {status === 'PENDING'&& !error && <div>
            <span className="loading loading-dots loading-lg"></span>
            </div>}
          {status === 'DISCONNECTED' && <>
          <div className="form-control w-full mb-2">
            <label className="label">
              <span className="label-text font-semibold">Username</span>
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              className="input input-bordered input-primary w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={handleKeyPress}
            />
          </div>

          <div className="form-control w-full mb-1">
            <label className="label">
              <span className="label-text font-semibold">Room Code</span>
              <span className="label-text text-sm">Leave empty for a new room</span>
            </label>
            <input
              type="text"
              placeholder="Enter room code"
              className="input input-bordered input-secondary w-full uppercase"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
          </div>

          <div className="card-actions w-full mt-4">
            <button
              className="btn btn-primary w-full"
              onClick={handleJoin}
              disabled={!username.trim()}
            >
              Join Game
            </button>
          </div>
        </>}
      </div>
    </div>
}