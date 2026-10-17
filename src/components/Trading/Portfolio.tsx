import { Landmark } from "lucide-react";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "../../context/game.context";
import { useGameActions } from "../../hooks/useGameActions";
import { useLivePnl } from "../../hooks/useLivePnl";
import { decimal, money, round } from "../../utils/math";
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
    const borrowing = useGameStore((state) => state.gameSettings.enableBorrowing);
    const pnl = useLivePnl();

    return (
        <div className={cn("card bg-base-200", className)}>
            <div className="card-body p-4 gap-3">
                <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">Profit / Loss</h2>
                    <Pnl value={pnl} className="text-2xl font-bold tabular-nums" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Stat label="Cash" value={`${cash < 0 ? '-' : ''}$${money(cash)}`} locked={reservedCash > 0 ? `$${money(reservedCash)} in orders` : undefined} />
                    <Stat label="Shares" value={decimal(shares, 0).toLocaleString()} locked={reservedShares > 0 ? `${decimal(reservedShares, 0).toLocaleString()} in orders` : undefined} />
                </div>
                {borrowing && <BankLoan />}
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

/**
 * Borrow the room's fixed loan amount, or repay the one we have. Interest builds up from the moment
 * it's taken until the end of the game, when the bank collects whatever is still owed.
 */
const BankLoan = () => {
    const {loan, cash, amount, rate, running} = useGameStore(useShallow((state) => ({
        loan: state.loan,
        cash: state.cash,
        amount: state.gameSettings.loanAmount ?? 0,
        rate: state.gameSettings.loanInterestPercent ?? 0,
        running: state.started && !state.paused && !state.ended,
    })));
    const {borrow, repayLoan} = useGameActions();

    if (!loan) {
        return (
            <div className="rounded-box bg-base-100 px-3 py-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <div className="text-xs text-base-content/60 flex items-center gap-1"><Landmark size={12} /> Bank loan</div>
                    <div className="text-sm truncate">${money(amount)} at up to {round(rate, 2)}%</div>
                </div>
                <button
                    className="btn btn-sm btn-outline btn-primary"
                    disabled={!running}
                    title={`Borrow $${money(amount)}. Interest builds up until the game ends: keep it to the end and you pay ${round(rate, 2)}%, repay early and you pay less.`}
                    onClick={borrow}
                >
                    Borrow
                </button>
            </div>
        );
    }

    const owed = loan.principal + loan.interest;
    // Like the server: half the principal (rounded up to the cent) plus all the interest so far.
    const halfOwed = Math.ceil(Math.round(loan.principal * 100) / 2) / 100 + loan.interest;
    const progress = loan.maxInterest > 0 ? Math.min(100, (loan.interest / loan.maxInterest) * 100) : 100;
    const short = 'Not enough available cash: sell shares or cancel orders first.';
    return (
        <div className="rounded-box bg-base-100 px-3 py-2 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <div className="text-xs text-base-content/60 flex items-center gap-1"><Landmark size={12} /> Loan owed</div>
                    <div className="font-semibold tabular-nums truncate">${money(owed)}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                    <button
                        className="btn btn-sm btn-outline btn-primary"
                        disabled={!running || cash < halfOwed}
                        title={running && cash < halfOwed ? short : `Pay back half the loan and the interest so far ($${money(halfOwed)}). Only the other half keeps accruing interest.`}
                        onClick={() => repayLoan('half')}
                    >
                        Repay half
                    </button>
                    <button
                        className="btn btn-sm btn-primary"
                        disabled={!running || cash < owed}
                        title={running && cash < owed ? short : `Pay back $${money(owed)} now.`}
                        onClick={() => repayLoan('all')}
                    >
                        Repay
                    </button>
                </div>
            </div>
            <progress className="progress progress-warning h-1.5 w-full" value={progress} max={100} aria-label="Interest accrued" />
            <div className="text-xs text-base-content/60 tabular-nums">
                ${money(loan.principal)} + ${money(loan.interest)} interest, ${money(loan.maxInterest)} if kept to the end
            </div>
        </div>
    );
};
