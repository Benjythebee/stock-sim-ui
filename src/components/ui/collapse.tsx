import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** A DaisyUI collapse with an arrow, open/closed by clicking its title. */
export const Collapse = ({title, className, children}: {title: ReactNode, className?: string, children: ReactNode}) => (
    <details className={cn("collapse collapse-arrow", className)}>
        <summary className="collapse-title font-semibold">{title}</summary>
        <div className="collapse-content">{children}</div>
    </details>
);
