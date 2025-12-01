import { useGameStore } from "../../context/game.context"
import { usePriceStore } from "../../context/stock.store";



export const MarketStateIndicator: React.FC = () => {
    const paused = useGameStore((state) => state.paused);
    const ended = useGameStore((state) => state.ended);
    const timeLeftMs = usePriceStore((state) => state.timeLeft);

    const formattedTimeLeft = () => {
        const totalSeconds = Math.max(0, Math.floor(timeLeftMs / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return <div>
        {(paused || ended) ? (
            <div className="badge badge-warning gap-2 p-2 text-sm">
                Market Closed
            </div>
        ) : (
            <div className="badge badge-success gap-2 p-2 text-sm">
                Market Open - Closes in: {formattedTimeLeft()}
            </div>
        )}
    </div>
}