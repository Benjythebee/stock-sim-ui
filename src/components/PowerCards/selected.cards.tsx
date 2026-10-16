import { useState } from "react"
import { usePowerStore } from "../../context/game.context"
import type { PowerDescription } from "../../types/types"
import { Portal } from "../ui/portal"
import { PowerMiniCard } from "./card.mini"
import { HandOfCards } from "./handOfCards"
import { useGameActions } from "../../hooks/useGameActions"

export const SelectedCards = () => {
    const {consumePower} = useGameActions()
    const {inventory} = usePowerStore()
    const [selected, setSelected] = useState<PowerDescription | null>(null);

    const onSelectCard = (power: PowerDescription) => {
        setSelected(power);
    }

    const closeModal = () => {
        setSelected(null);
    }

    const onSubmitCard = () => {
        if(!selected) return;
        consumePower(selected.id)
        closeModal();
    }

    return <div className="flex gap-3 sm:gap-4 mx-2 items-center">
            {/** Selected cards max 5. Index keys: the same power can be held twice. */}
            {inventory.slice(0,5).map((power, index)=>(
                <PowerMiniCard key={`${power.id}-${index}`} power={power} onClick={()=>onSelectCard(power)} />
            ))}

           {selected &&  <Portal>
                <HandOfCards
                cards={[selected]}
                open
                onDismiss={closeModal} // Esc: clear `selected` so the same card can be reopened
                onClose={closeModal} // close the modal
                onSelectCard={onSubmitCard} // on card click consume it
                title="Click to consume"/>
            </Portal>}
          </div>
}
