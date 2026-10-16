import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** The room page's boxes: a base-200 card with a title, and optional controls on the title's right. */
export const Panel = ({title, actions, className, bodyClassName, children}: {
    title: ReactNode;
    /** Shown at the right of the title row (e.g. a "Cancel all" button). */
    actions?: ReactNode;
    className?: string;
    bodyClassName?: string;
    children?: ReactNode;
}) => (
    <div className={cn("card bg-base-200", className)}>
        <div className={cn("card-body", bodyClassName)}>
            {actions ? (
                <div className="flex items-center justify-between gap-2">
                    <h2 className="card-title">{title}</h2>
                    {actions}
                </div>
            ) : (
                <h2 className="card-title">{title}</h2>
            )}
            {children}
        </div>
    </div>
);
