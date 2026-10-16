import { usePriceStore } from "../../context/stock.store";
import { useMarketOpen } from "../../hooks/useMarketStatus";
import { formatCountdown } from "../../utils/time";

export const MarketStateIndicator: React.FC = () => {
    const open = useMarketOpen();
    const timeLeftMs = usePriceStore((state) => state.timeLeft);

    return <div>
        {open ? (
            <div className="badge badge-success gap-2 p-2 text-sm">
                Market Open - Closes in: {formatCountdown(timeLeftMs)}
            </div>
        ) : (
            <div className="badge badge-warning gap-2 p-2 text-sm">
                Market Closed
            </div>
        )}
    </div>
}
