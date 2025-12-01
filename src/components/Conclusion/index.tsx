
import { useGameStore } from "../../context/game.context";
import { useShallow } from "zustand/shallow";



export const ConclusionModal = () => {
    const {conclusion} = useGameStore(useShallow((state) => ({
        conclusion: state.conclusion,
    })));


    if(!conclusion){
        return null;
    }

  return <div className="card absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-base-100 shadow-xl z-50">
            <div className="card-body items-center ">
                <h1 className="text-4xl font-bold text-center bg-clip-text text-primary">
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
                                {conclusion.players
                                    .sort((a, b) => (b.pnl || 0) - (a.pnl || 0))
                                    .map((user, index) => (
                                        <tr key={user.name || index}>
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
                                    {conclusion.bots
                                        .sort((a, b) => (b.pnl || 0) - (a.pnl || 0))
                                        .map((user, index) => (
                                            <tr key={user.name || index}>
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

                

            </div>
        </div>;


}