import { useId, useRef } from "react";
import { BookOpen, X } from "lucide-react";
import { Link } from "react-router";
import { cn } from "../../utils/cn";
import { PowerLibrary } from ".";

/**
 * A book button that opens the power library in a modal <dialog>, without leaving the room.
 * showModal() puts it in the top layer, so it shows over the lobby and pause overlays too.
 * The nav has one, but their backdrop covers it, so those overlays carry their own.
 */
export const PowerLibraryButton = ({ className = "btn btn-ghost btn-square", label }: {
    className?: string;
    /** Text next to the icon (icon only without it). */
    label?: string;
}) => {
    const dialog = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    return (
        <>
            <button type="button" className={cn(className)} aria-label="Power library" title="Power library" onClick={() => dialog.current?.showModal()}>
                <BookOpen size={label ? 16 : 20} />{label}
            </button>
            <dialog ref={dialog} className="modal" aria-labelledby={titleId}>
                <div className="modal-box w-full max-w-4xl max-h-[calc(100dvh-2rem)]">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" aria-label="Close"><X size={16} /></button>
                    </form>
                    <h2 id={titleId} className="text-2xl font-bold flex items-center gap-2 mb-1">
                        <BookOpen /> Power library
                    </h2>
                    <p className="text-sm opacity-70 mb-3">
                        Every power a briefcase can hold. Rarer ones show up less often.{" "}
                        {/* A new tab: following a link in this tab would leave the room. */}
                        <Link to="/powers" target="_blank" className="link">Open in a new tab</Link>
                    </p>
                    <PowerLibrary />
                </div>
                <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>
        </>
    );
};
