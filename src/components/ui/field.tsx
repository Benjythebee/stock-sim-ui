import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** A labelled form control: the label (and an optional hint on its right) above the input. */
export const Field = ({label, hint, bold = true, className, children}: {
    label: ReactNode;
    /** Small text next to the label, e.g. "Leave empty for a new room". */
    hint?: ReactNode;
    /** Semibold label (forms) or plain (the order form). */
    bold?: boolean;
    className?: string;
    children: ReactNode;
}) => (
    <div className={cn("form-control w-full", className)}>
        <label className={cn("label", {"flex-wrap": hint})}>
            <span className={cn("label-text", {"font-semibold": bold})}>{label}</span>
            {hint && <span className="label-text text-sm">{hint}</span>}
        </label>
        {children}
    </div>
);
