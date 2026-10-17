import { useShallow } from "zustand/shallow";
import { useGameStore } from "../../context/game.context";
import { useLivePnl } from "../../hooks/useLivePnl";
import { decimal, money } from "../../utils/math";
import { cn } from "../../utils/cn";
import { Pnl } from "../ui/pnl";

/**
 * Our P/L, cash and shares, next to the order form that spends them. Cash and shares are what's
 * available to trade; whatever sits in resting orders is listed under them.
 */
export const Portfolio = ({className}: {className?: string}) => {
    const {cash, shares, reservedCash, reservedShares} = useGameStore(useShallow((state) => ({
        cash: state.cash, shares: state.shares, reservedCash: state.reservedCash, reservedShares: state.reservedShares,
    })));
    const pnl = useLivePnl();

    return (
        <div className={cn("card bg-base-200", className)}>
            <div className="card-body p-4 gap-3">
                <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">Profit / Loss</h2>
                    <Pnl value={pnl} className="text-2xl font-bold tabular-nums" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Stat label="Cash" value={`$${money(cash)}`} locked={reservedCash > 0 ? `$${money(reservedCash)} in orders` : undefined} />
                    <Stat label="Shares" value={decimal(shares, 0).toLocaleString()} locked={reservedShares > 0 ? `${decimal(reservedShares, 0).toLocaleString()} in orders` : undefined} />
                </div>
            </div>
        </div>
    );
};

const Stat = ({label, value, locked}: {label: string, value: string, locked?: string}) => (
    <div className="rounded-box bg-base-100 px-3 py-2 min-w-0">
        <div className="text-xs text-base-content/60">{label}</div>
        <div className="font-semibold tabular-nums truncate">{value}</div>
        {locked && <div className="text-xs text-base-content/60 tabular-nums truncate">{locked}</div>}
    </div>
);
