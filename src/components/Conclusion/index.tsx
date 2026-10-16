
import { useGameStore } from "../../context/game.context";
import { useShallow } from "zustand/shallow";
import { useWebsocketContext } from "../../context/ws.context";
import { MessageType } from "../../types/messages";



export const ConclusionModal = () => {
    const {conclusion, isAdmin} = useGameStore(useShallow((state) => ({
        conclusion: state.conclusion,
        isAdmin: state.isAdmin,
    })));
    const { sendMessage } = useWebsocketContext();


    if(!conclusion){
        return null;
    }

  return <div className="card fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto bg-base-100 shadow-xl z-50">
            <div className="card-body items-center ">
                <h1 className="text-3xl sm:text-4xl font-bold text-center bg-clip-text text-primary">
                    Game Over
                </h1>
                <p className="text-center text-base-content/70 mb-2">
                    Check out the leaderboard
                </p>

                <div>
                    <p className="text-center text-base-content/70 mb-2">
                        Total Volume Traded: ${conclusion.volumeTraded.toLocaleString()}
                    </p>
                </div>

                <div className="w-full">
                    <div className="max-h-60 overflow-y-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th className="w-2/3">Name</th>
                                    <th className="w-1/3">Profit/Loss</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...conclusion.players]
                                    .sort((a, b) => (b.pnl || 0) - (a.pnl || 0))
                                    .map((user, index) => (
                                        <tr key={`${user.name}-${index}`}>
                                            <td className="font-medium">{user.name}</td>
                                            <td className={`${(user.pnl || 0) >= 0 ? 'text-success' : 'text-error'}`}>
                                                ${(user.pnl || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                
                <div tabIndex={0} className="collapse collapse-arrow bg-base-100 border-base-300 border">
                    <div className="collapse-title font-semibold">View Bot Performance</div>
                    <div className="collapse-content text-sm">
                        <div className="max-h-60 overflow-y-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th className="w-2/4">Name</th>
                                        <th className="w-1/4">Type of bot</th>
                                        <th className="w-1/4">Profit/Loss</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...conclusion.bots]
                                        .sort((a, b) => (b.pnl || 0) - (a.pnl || 0))
                                        .map((user, index) => (
                                            <tr key={`${user.name}-${index}`}>
                                                <td className="font-medium">{user.name}</td>
                                                <td className="font-light">{user.type}</td>
                                                <td className={`${(user.pnl || 0) >= 0 ? 'text-success' : 'text-error'}`}>
                                                    ${(user.pnl || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* The server answers with ROOM_STATE started=false, which clears the conclusion and brings back the lobby. */}
                {isAdmin ? (
                    <button className="btn btn-primary w-full mt-2" onClick={() => sendMessage({ type: MessageType.RESET_GAME })}>
                        Go back to setup
                    </button>
                ) : (
                    <p className="text-center text-sm text-base-content/60 mt-2">Waiting for the host to set up a new game</p>
                )}
            </div>
        </div>;


}