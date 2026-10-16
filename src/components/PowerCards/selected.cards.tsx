import { useState } from "react"
import { usePowerStore } from "../../context/game.context"
import type { PowerDescription } from "../../types/types"
import { Portal } from "../portal"
import { PowerMiniCard } from "./card.mini"
import { HandOfCards } from "./handOfCards"
import { useWebsocketContext } from "../../context/ws.context"
import { MessageType } from "../../types/messages"

// const fakepower = {
//     rarity:0.2,
//     durationTicks:30,
//     iconSlug:'talk',title:'Talk',description:'Communicate with other players to strategize and share information.',type:'all',isInstant:false,id:'1'}

export const SelectedCards = () => {
    const {sendMessage} = useWebsocketContext()
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
        sendMessage({
            type: MessageType.POWER_CONSUME,
            id: selected.id!
        })
        closeModal();
    }

    return <div className="flex gap-3 sm:gap-4 mx-2 items-center">
            {/** Selected cards max 5. Index keys: the same power can be held twice. */}
            {inventory.slice(0,5).map((power, index)=>(
                <PowerMiniCard key={`${power.id}-${index}`} power={power} onClick={()=>onSelectCard(power)} />
            ))}
              {/* <PowerMiniCard power={fakepower} onClick={()=>onSelectCard(fakepower)} /> */}

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
