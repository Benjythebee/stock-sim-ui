import { useEffect, useState } from "react";
import {useShallow} from "zustand/shallow";
import { useWebsocketContext } from "../../context/ws.context";
import { useGameStore } from "../../context/game.context";
import { useNavigate } from "react-router";


export const Join = () => {
  const {connect,status,error} = useWebsocketContext();
  const navigate = useNavigate();
  const {username,setUsername} = useGameStore(useShallow((state) => ({username: state.username, setUsername: state.setUsername})));
  const [roomCode, setRoomCode] = useState<string>("");

  // Leaving a room resets the store, so prefill the name we joined with last time.
  useEffect(() => {
    if (!useGameStore.getState().username) setUsername(localStorage.getItem('username') ?? '');
  }, [setUsername]);

  const handleJoin = () => {
    if (username.trim()) {
      localStorage.setItem('username', username);
      // Add your join logic here
      connect(username, roomCode);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && username.trim()) {
      handleJoin();
    }
  };

  // roomCode is only set by typing here, so a socket still open from the room we just left
  // (Layout closes it right after this page mounts) doesn't bounce us back into it.
  const joining = status === 'PENDING' || (status === 'CONNECTED' && !!roomCode);

  useEffect(() => {
    if (roomCode && status === 'CONNECTED') {
      navigate(`/${roomCode}`);
    }
  }, [status, roomCode, navigate]);

  return <div className="card absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center">
          <img src="/stonk-lord_alpha.webp" alt="Stonk Lords Logo" className="w-38 h-38"/>
          {joining && <div>
            <span className="loading loading-dots loading-lg"></span>
            </div>}
          {!joining && <>
          {error && <div role="alert" className="alert alert-error alert-soft w-full mb-2">{error}</div>}
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