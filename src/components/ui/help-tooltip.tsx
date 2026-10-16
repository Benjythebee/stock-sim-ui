import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CircleQuestionMark } from "lucide-react";
import { cn } from "../../utils/cn";
import { Portal } from "./portal";

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

// Full class names, so Tailwind generates them.
const POSITION_CLASS: Record<TooltipPosition, string> = {
    top: 'tooltip-top',
    bottom: 'tooltip-bottom',
    left: 'tooltip-left',
    right: 'tooltip-right',
};

/** Matches the content's w-64, plus the arrow and a margin. */
const TOOLTIP_SPACE = 256 + 16;

/**
 * A "?" button whose explanation (children) shows on hover or focus, and stays open after a click
 * (for touch screens). Keep it outside a <label>, or clicking it would also click the labelled input.
 */
export const HelpButton = ({label, position = 'bottom', children}: {
    /** What is being explained, for the button's aria-label. */
    label: string;
    /** Where the explanation shows. Left/right fall back to bottom when the screen has no room on that side. */
    position?: TooltipPosition;
    children: ReactNode;
}) => {
    const [pinned, setPinned] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const open = pinned || hovered || focused;

    return (
        <HelpTooltip open={open} position={position} content={children}>
            <button
                type="button"
                className="btn btn-ghost btn-circle btn-xs text-base-content/60 ml-1"
                aria-label={`What is "${label}"?`}
                aria-expanded={open}
                onClick={() => setPinned((p) => !p)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onFocus={(e) => setFocused(e.currentTarget.matches(':focus-visible'))}
                onBlur={() => {
                    setFocused(false);
                    setPinned(false);
                }}
            >
                <CircleQuestionMark size={16} />
            </button>
        </HelpTooltip>
    );
}

/**
 * A DaisyUI tooltip drawn in a portal over the trigger, so a scrolling parent (the admin card is
 * overflow-y-auto, which also clips sideways) can't cut it off.
 */
export const HelpTooltip = ({open, position, content, children}:{open: boolean, position: TooltipPosition, content: ReactNode, children: ReactNode}) => {
    const triggerRef = useRef<HTMLSpanElement>(null);
    const [anchor, setAnchor] = useState<{style: CSSProperties, position: TooltipPosition} | null>(null);

    const place = useCallback(() => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const fits = position === 'right' ? rect.right + TOOLTIP_SPACE <= window.innerWidth
            : position === 'left' ? rect.left - TOOLTIP_SPACE >= 0
            : true;
        setAnchor({
            style: {position: 'fixed', left: rect.left, top: rect.top, width: rect.width, height: rect.height},
            position: fits ? position : 'bottom',
        });
    }, [position]);

    useLayoutEffect(() => {
        if (!open) return;
        place();
        // Follow the trigger if the card scrolls or the window resizes while it's open.
        window.addEventListener('scroll', place, true);
        window.addEventListener('resize', place);
        return () => {
            window.removeEventListener('scroll', place, true);
            window.removeEventListener('resize', place);
        };
    }, [open, place]);

    return (
        <>
            <span ref={triggerRef} className="inline-flex">{children}</span>
            {open && anchor && (
                <Portal>
                    <div role="tooltip" style={anchor.style} className={cn('tooltip tooltip-open pointer-events-none z-[60]', POSITION_CLASS[anchor.position])}>
                        <div className="tooltip-content w-64 text-xs text-left whitespace-normal">{content}</div>
                    </div>
                </Portal>
            )}
        </>
    )
}
