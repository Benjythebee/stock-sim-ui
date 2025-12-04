import { useEffect, useState } from "react"
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
        console.log("Selected power:", power);
        setSelected(power);
    }

    const modal = ()=>{
        return (document.getElementById('hand-cards-modal')! as HTMLDialogElement)
    }

    const closeModal = () => {
        setSelected(null);
        modal()?.close()
    }
    
    const onSubmitCard = () => {
        if(!selected) return;
        sendMessage({
            type: MessageType.POWER_CONSUME,
            id: selected.id!
        })
        closeModal();
    }

    useEffect(() => {
        if(!selected) {
            modal()?.close()
            return;
        }
        modal()?.showModal()
    }, [selected]);


    return <div className="flex gap-4 mx-2 items-center">
            {/** Selected cards max 5 */}
            {inventory.slice(0,5).map((power)=>(
                <PowerMiniCard key={power.id} power={power} onClick={()=>onSelectCard(power)} />
            ))}
              {/* <PowerMiniCard power={fakepower} onClick={()=>onSelectCard(fakepower)} /> */}
          
           {selected &&  <Portal>
                <HandOfCards 
                cards={selected ? [selected] : []} 
                onClose={closeModal} // close the modal
                onSelectCard={onSubmitCard} // on card click do nothing here
                title="Click to consume"/>
            </Portal>}
          </div>
}