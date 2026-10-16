import { useEffect, useRef } from "react"
import { PowerCard } from "./card"
import { usePowerStore } from "../../context/game.context";
import type { PowerDescription } from "../../types/types";
import { cn } from "../../utils/cn";
import { fetchJson } from "../../utils/fetch";

type HandOfCardsProps = {
    cards: PowerDescription[];
    /** Shows the dialog as a modal while true. Each HandOfCards owns its own <dialog>. */
    open: boolean;
    /** The dialog closed by itself (Esc) or through `close()`: sync your `open` state here. */
    onDismiss: () => void;
    onSelectCard: (index: number) => void;
    onClose?: () => void;
    title?: string; // will override the skip button
    onSkip?: () => void; // Optional callback for when selection is skipped
    className?: string;
}

export const HandOfCards = ({cards, open, onDismiss, title, onSelectCard, onSkip, onClose, className}: HandOfCardsProps) => {
    const {data, setPowers} = usePowerStore();
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Fallback: the catalog normally arrives with CONTENT_MANIFEST on connect.
    useEffect(() => {
        if(data.length) return
        fetchJson<PowerDescription[]>('/api/powers.json').then(setPowers).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps -- setPowers is recreated every render
    }, [data]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        else if (!open && dialog.open) dialog.close();
    }, [open]);


    return (
        // Esc fires `cancel` (and usually, but not always, `close`); `close` covers dialog.close(). Handle both.
        <dialog ref={dialogRef} className={cn('modal',className)} onCancel={onDismiss} onClose={onDismiss}>
            <div className="absolute top-8 sm:top-20 left-1/2 -translate-x-1/2 w-max max-w-[calc(100vw-2rem)] text-center">
            {title ? <h2 className="text-primary font-bold text-3xl sm:text-4xl">{title}</h2> : (onSkip && <div className="btn btn-error btn-lg pointer-events-auto" onClick={onSkip}>
                Skip Selection
            </div>)}
            </div>
            <div className="hand-of-cards-background"></div>
            <div className="hand-of-cards-wrapper">
                <div className="hand-of-cards pointer-events-auto">
                    {cards.map((power, index)=>(
                        <PowerCard key={`${power.id}-${index}`} power={power} onClick={()=>onSelectCard(index)} />
                    ))}
                </div>
            </div>
            {onClose &&
                <button className="btn btn-lg btn-secondary absolute bottom-8 sm:bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto" onClick={onClose}>Close</button>
            }

        </dialog>
    )
}
