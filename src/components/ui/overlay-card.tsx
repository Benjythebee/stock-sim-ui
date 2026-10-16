import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/**
 * A bare card centered over the page (z-50), scrolling when taller than the screen. Width and inner
 * layout are the caller's (cn() doesn't dedupe Tailwind classes, so it sets no width of its own).
 * Not a <dialog>: it sits over a Backdrop and blocks the page under it.
 */
export const OverlayShell = ({className, children}: {className?: string, children?: ReactNode}) => (
    <div className={cn("card fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[calc(100vw-1rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto bg-base-100 shadow-xl z-50", className)}>
        {children}
    </div>
);

/** An OverlayShell with a centered title, for the paused, game-over and presentation screens. */
export const OverlayCard = ({title, subtitle, actions, className, children}: {
    title: ReactNode;
    subtitle?: ReactNode;
    /** Buttons at the bottom (card-actions). */
    actions?: ReactNode;
    className?: string;
    children?: ReactNode;
}) => (
    <OverlayShell className={cn("w-96", className)}>
        <div className="card-body items-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-center bg-clip-text text-primary">
                {title}
            </h1>
            {subtitle && <p className="text-center text-base-content/70 mb-2">{subtitle}</p>}
            {children}
            {actions && <div className="card-actions">{actions}</div>}
        </div>
    </OverlayShell>
);

/** Dims the page under an OverlayCard (z-40). */
export const Backdrop = () => <div className="modal-backdrop fixed inset-0 bg-black opacity-20 z-40"></div>;
