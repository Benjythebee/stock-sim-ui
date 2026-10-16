import { useEffect } from "react"
import { PowerCard } from "./card"
import { usePowerStore } from "../../context/game.context";
import type { PowerDescription } from "../../types/types";
import { cn } from "../../utils/cn";
import { apiUrl } from "../../utils/server";

type HandOfCardsProps = {
    cards: PowerDescription[];
    onSelectCard: (index: number) => void;
    onClose?: () => void;
    title?: string; // will override the skip button
    onSkip?: () => void; // Optional callback for when selection is skipped
    className?: string;
}

export const HandOfCards = ({cards, title, onSelectCard, onSkip, onClose, className}: HandOfCardsProps) => {
    const {data, setPowers} = usePowerStore();
    
    useEffect(() => {
        if(data.length) return
       fetch(apiUrl('/api/powers.json')).then((r)=>{
        return r.json()
       }).then((data: PowerDescription[])=>{
        setPowers(data);
       })
    }, [data]);

    
    return (
        <dialog className={cn('modal',className)} id="hand-cards-modal">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 ">
            {title ? <h2 className="text-primary font-bold text-4xl">{title}</h2> : (onSkip && <div className="btn btn-error btn-lg pointer-events-auto" onClick={onClose}>
                Skip Selection
            </div>)}
            </div>
            <div className="hand-of-cards-background"></div>
            <div className="hand-of-cards-wrapper">
                <div className="hand-of-cards pointer-events-auto">
                    {cards.map((power, index)=>(
                        <PowerCard key={power.title} power={power} onClick={()=>onSelectCard(index)} />
                    ))}
                </div>
            </div>
            {onClose && 
                <button className="btn btn-lg btn-secondary absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto" onClick={onClose}>Close</button>
            }
        
        </dialog>
    )
}