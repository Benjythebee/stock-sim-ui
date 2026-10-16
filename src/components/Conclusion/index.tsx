import { useGameStore } from "../../context/game.context";
import { useShallow } from "zustand/shallow";
import { OverlayCard } from "../ui/overlay-card";
import { Collapse } from "../ui/collapse";
import { Pnl } from "../ui/pnl";
import { useGameActions } from "../../hooks/useGameActions";

/** Best P&L first. Copies: the arrays belong to the store. */
const byPnl = <T extends {pnl?: number}>(rows: T[]) => [...rows].sort((a, b) => (b.pnl || 0) - (a.pnl || 0));

export const ConclusionModal = () => {
    const {conclusion, isAdmin} = useGameStore(useShallow((state) => ({
        conclusion: state.conclusion,
        isAdmin: state.isAdmin,
    })));
    const {resetGame} = useGameActions();

    if(!conclusion){
        return null;
    }

    return (
        <OverlayCard title="Game Over" subtitle="Check out the leaderboard">
            <p className="text-center text-base-content/70 mb-2">
                Total Volume Traded: ${conclusion.volumeTraded.toLocaleString()}
            </p>

            <div className="w-full max-h-60 overflow-y-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th className="w-2/3">Name</th>
                            <th className="w-1/3">Profit/Loss</th>
                        </tr>
                    </thead>
                    <tbody>
                        {byPnl(conclusion.players).map((user, index) => (
                            <tr key={`${user.name}-${index}`}>
                                <td className="font-medium">{user.name}</td>
                                <td><Pnl value={user.pnl || 0} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Collapse title="View Bot Performance" className="bg-base-100 border-base-300 border">
                <div className="max-h-60 overflow-y-auto text-sm">
                    <table className="table table-sm w-full">
                        <thead>
                            <tr>
                                <th className="w-2/4">Name</th>
                                <th className="w-1/4">Type of bot</th>
                                <th className="w-1/4">Profit/Loss</th>
                            </tr>
                        </thead>
                        <tbody>
                            {byPnl(conclusion.bots).map((user, index) => (
                                <tr key={`${user.name}-${index}`}>
                                    <td className="font-medium">{user.name}</td>
                                    <td className="font-light">{user.type}</td>
                                    <td><Pnl value={user.pnl || 0} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Collapse>

            {/* The server answers with ROOM_STATE started=false, which clears the conclusion and brings back the lobby. */}
            {isAdmin ? (
                <button className="btn btn-primary w-full mt-2" onClick={resetGame}>
                    Go back to setup
                </button>
            ) : (
                <p className="text-center text-sm text-base-content/60 mt-2">Waiting for the host to set up a new game</p>
            )}
        </OverlayCard>
    );
}
