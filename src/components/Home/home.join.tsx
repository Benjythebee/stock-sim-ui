import { useEffect, useState } from "react";
import {useShallow} from "zustand/shallow";
import { useWebsocketContext } from "../../context/ws.context";
import { useGameStore } from "../../context/game.context";
import { Link, useNavigate } from "react-router";
import { Field } from "../ui/field";
import { useStreamerMode } from "../../context/streamer.store";
import { StreamerToggle } from "../ui/streamer-toggle";
import { cn } from "../../utils/cn";

// No 0/O or 1/I so codes are easy to read out to friends. Must match the server's ^[A-Za-z0-9_-]{1,64}$.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newRoomCode = () => Array.from(crypto.getRandomValues(new Uint32Array(5)), (n) => CODE_CHARS[n % CODE_CHARS.length]).join('');


export const Join = () => {
  const {connect,status,error} = useWebsocketContext();
  const navigate = useNavigate();
  const {username,setUsername} = useGameStore(useShallow((state) => ({username: state.username, setUsername: state.setUsername})));
  const [roomCode, setRoomCode] = useState<string>("");
  const streamerMode = useStreamerMode();

  // Leaving a room resets the store, so prefill the name we joined with last time.
  useEffect(() => {
    if (!useGameStore.getState().username) setUsername(localStorage.getItem('username') ?? '');
  }, [setUsername]);

  const handleJoin = () => {
    if (username.trim()) {
      localStorage.setItem('username', username);
      // An empty code means "new room": the server 404s /ws/ without one, so make one up.
      const code = roomCode.trim() || newRoomCode();
      setRoomCode(code);
      connect(username, code);
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

  // In the page flow (not absolutely centered) so short screens scroll instead of hiding the form under the nav.
  return <div className="flex items-center justify-center px-4 py-6 min-h-[calc(100dvh-4rem)]">
    <div className="card w-96 max-w-full bg-base-100 shadow-xl">
        <div className="card-body items-center">
          <img src="/tendies-brawl.webp" alt="Tendies Brawl logo" width={152} height={152} fetchPriority="high" className="w-38 h-38"/>
          <h1 className="text-lg font-bold text-center leading-tight">Multiplayer stock trading game</h1>
          <p className="text-sm text-center opacity-70 mb-2">
            Trade against friends and bots, grab power-ups, finish with the best P&amp;L. <Link className="link" to="/how-to-play">How to play</Link>
          </p>
          {joining && <div>
            <span className="loading loading-dots loading-lg"></span>
            </div>}
          {!joining && <>
          {error && <div role="alert" className="alert alert-error alert-soft w-full mb-2">{error}</div>}
          <Field label="Username" className="mb-2">
            <input
              type="text"
              placeholder="Enter your username"
              className="input input-bordered input-primary w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={handleKeyPress}
            />
          </Field>

          <Field label="Room Code" hint="Leave empty for a new room" className="mb-1">
            <input
              type="text"
              placeholder="Enter room code"
              // Streamer mode draws the typed code as dots (a password field would offer to save it).
              className={cn("input input-bordered input-secondary w-full uppercase", {"[-webkit-text-security:disc]": streamerMode})}
              autoComplete="off"
              value={roomCode}
              maxLength={64}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
              onKeyUp={handleKeyPress}
            />
          </Field>

          <div className="self-start"><StreamerToggle /></div>

          <div className="card-actions w-full mt-2">
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
  </div>
}