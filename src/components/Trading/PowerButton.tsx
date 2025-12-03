import { usePowerStore } from "../../context/game.context";
import { cn } from "../../utils/cn";


export const PowerButton = () => {
  const {currentOffers} = usePowerStore()


    const onToggle = () => {
      if(!currentOffers || currentOffers.length === 0) return;
        (document.getElementById('hand-cards-modal')! as HTMLDialogElement).showModal()
    }
    return <button className="btn btn-sm btn-amber" data-active={currentOffers.length > 0} disabled={currentOffers.length === 0} onClick={onToggle}>
            {currentOffers.length > 0 && <img src="/briefcase_opened.webp" className={cn('w-8 h-8 animate-wiggle')} alt="Open Hand of Cards"/>}
            {currentOffers.length === 0 && <img src="/closed_briefcase.webp" className={cn('w-7 h-7')} alt="No power available"/>}
            {currentOffers.length === 0 ? 'No Power' : 'Open'}
          </button>
}