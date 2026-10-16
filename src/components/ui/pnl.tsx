import { money } from "../../utils/math";
import { cn } from "../../utils/cn";

/** A profit or loss in dollars: signed (+$1,234.50 / -$12.00) and green or red. */
export const Pnl = ({value, className}: {value: number, className?: string}) => {
    // Under half a cent of loss rounds to -$0.00: show it as +$0.00.
    const isNegative = value <= -0.005;
    return <span className={cn(isNegative ? 'text-error' : 'text-success', className)}>{isNegative ? '-' : '+'}${money(value)}</span>;
};
