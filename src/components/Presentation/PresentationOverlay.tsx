import { useCallback, useEffect, useState } from "react";
import { Backdrop, OverlayCard } from "../ui/overlay-card";
import { PrizeWheel } from "./PrizeWheel";
import { usePresentations, type QueuedPresentation } from "./usePresentations";

/** How long the result stays up after the animation stops. */
const LINGER_MS = 2500;

/**
 * Plays power animations (POWER_PRESENT) one at a time, over the page. The outcome itself also
 * arrives as a normal toast, so closing early never hides anything.
 */
export const PresentationOverlay = () => {
    const current = usePresentations((s) => s.queue[0]);
    const next = usePresentations((s) => s.next);
    if (!current) return null;
    // Keyed, so every animation starts with fresh state.
    return <PresentationCard key={current.id} item={current} onDone={next} />;
};

const PresentationCard = ({ item, onDone }: { item: QueuedPresentation; onDone: () => void }) => {
    const [stopped, setStopped] = useState(false);
    const onStopped = useCallback(() => setStopped(true), []);

    useEffect(() => {
        if (!stopped) return;
        const timer = setTimeout(onDone, LINGER_MS);
        return () => clearTimeout(timer);
    }, [stopped, onDone]);

    const { presentation } = item;
    const landed = presentation.segments[presentation.result]?.label;

    return (
        <>
            <Backdrop />
            <OverlayCard
                title={item.title}
                subtitle={stopped && landed ? <span className="text-2xl font-bold text-base-content">{landed}</span> : "Spinning…"}
                actions={<button className="btn btn-sm btn-ghost" onClick={onDone}>{stopped ? "Close" : "Skip"}</button>}
            >
                {presentation.kind === "wheel" && <PrizeWheel presentation={presentation} onStopped={onStopped} />}
            </OverlayCard>
        </>
    );
};
