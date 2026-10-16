import { useState } from "react";
import { usePowerStore } from "../../context/game.context";
import { cn } from "../../utils/cn";
import { Portal } from "../portal";
import { useWebsocketContext } from "../../context/ws.context";
import { MessageType, POWER_SKIP_INDEX } from "../../types/messages";
import { HandOfCards } from "../PowerCards/handOfCards";


export const PowerButton = () => {
  const {currentOffers,clearOffers} = usePowerStore()
  const {sendMessage,isSpectate} = useWebsocketContext();
  const [open, setOpen] = useState(false);

    const onToggle = () => {
      if(!currentOffers || currentOffers.length === 0) return;
        setOpen(true)
    }

    // The offers are used up (picked or skipped): forget them and close.
    const finish = () => {
        clearOffers();
        setOpen(false)
    }

    const onSkip = () => {
        // Tell the server too, or it re-sends the offers on reconnect.
        sendMessage({
            type:MessageType.POWER_SELECT,
            index: POWER_SKIP_INDEX
        })
        finish();
    }

    const onSelectCard = (index: number) => {
        sendMessage({
            type:MessageType.POWER_SELECT,
            index
        })
        finish();
    }

    if(isSpectate) return null;

  return   <>
    <button className="btn btn-sm btn-amber" data-active={currentOffers.length > 0} disabled={currentOffers.length === 0} onClick={onToggle}>
            {currentOffers.length > 0 && <img src="/briefcase_opened.webp" className={cn('w-8 h-8 animate-wiggle')} alt="Open Hand of Cards"/>}
            {currentOffers.length === 0 && <img src="/closed_briefcase.webp" className={cn('w-7 h-7')} alt="No power available"/>}
            {currentOffers.length === 0 ? 'No Power' : 'Open'}
          </button>
      {currentOffers.length > 0 && <Portal>
        {/* Esc only hides the hand: the offers stay and the briefcase can reopen it. */}
        <HandOfCards cards={currentOffers} open={open} onDismiss={() => setOpen(false)} onSelectCard={onSelectCard} onSkip={onSkip} />
      </Portal>}
    </>
}
