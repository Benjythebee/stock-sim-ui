import { usePowerStore } from "../../context/game.context";
import { cn } from "../../utils/cn";
import { Portal } from "../portal";
import { useWebsocketContext } from "../../context/ws.context";
import { MessageType } from "../../types/messages";
import { HandOfCards } from "../PowerCards/handOfCards";


export const PowerButton = () => {
  const {currentOffers,clearOffers} = usePowerStore()
  const {sendMessage,isSpectate} = useWebsocketContext();

    const modal = ()=>{
        return (document.getElementById('hand-cards-modal')! as HTMLDialogElement)
    }
    const onToggle = () => {
      if(!currentOffers || currentOffers.length === 0) return;
        modal()?.showModal()
    }

    const onClose = () => {
        clearOffers();
        modal()?.close()
    }

    const onSelectCard = (index: number) => {
        sendMessage({
            type:MessageType.POWER_SELECT,
            index
        })
        onClose();
    }

    if(isSpectate) return null;

  return   <>
    <button className="btn btn-sm btn-amber" data-active={currentOffers.length > 0} disabled={currentOffers.length === 0} onClick={onToggle}>
            {currentOffers.length > 0 && <img src="/briefcase_opened.webp" className={cn('w-8 h-8 animate-wiggle')} alt="Open Hand of Cards"/>}
            {currentOffers.length === 0 && <img src="/closed_briefcase.webp" className={cn('w-7 h-7')} alt="No power available"/>}
            {currentOffers.length === 0 ? 'No Power' : 'Open'}
          </button>
      {currentOffers.length > 0 && <Portal>
        <HandOfCards cards={currentOffers} onSelectCard={onSelectCard} onSkip={onClose} />
      </Portal>}
    </>
}