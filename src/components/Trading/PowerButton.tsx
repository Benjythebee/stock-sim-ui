import { useState } from "react";
import { usePowerStore } from "../../context/game.context";
import { Portal } from "../ui/portal";
import { useWebsocketContext } from "../../context/ws.context";
import { HandOfCards } from "../PowerCards/handOfCards";
import { useGameActions } from "../../hooks/useGameActions";


export const PowerButton = () => {
  const {currentOffers,clearOffers} = usePowerStore()
  const {isSpectate} = useWebsocketContext();
  const {selectPower, skipPowers} = useGameActions();
  const [open, setOpen] = useState(false);
  const hasOffers = currentOffers.length > 0;

  // The offers are used up (picked or skipped): forget them and close.
  const finish = () => {
    clearOffers();
    setOpen(false)
  }

  const onSkip = () => {
    skipPowers();
    finish();
  }

  const onSelectCard = (index: number) => {
    selectPower(index);
    finish();
  }

  if(isSpectate) return null;

  return <>
    <button className="btn btn-sm btn-amber" data-active={hasOffers} disabled={!hasOffers} onClick={() => setOpen(true)}>
      {hasOffers
        ? <img src="/briefcase_opened.webp" className="w-8 h-8 animate-wiggle" alt="Open Hand of Cards"/>
        : <img src="/closed_briefcase.webp" className="w-7 h-7" alt="No power available"/>}
      {hasOffers ? 'Open' : 'No Power'}
    </button>
    {hasOffers && <Portal>
      {/* Esc only hides the hand: the offers stay and the briefcase can reopen it. */}
      <HandOfCards cards={currentOffers} open={open} onDismiss={() => setOpen(false)} onSelectCard={onSelectCard} onSkip={onSkip} />
    </Portal>}
  </>
}
