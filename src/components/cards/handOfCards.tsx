import { useEffect, useState } from "react"
import { PowerCard } from "./card"
import { usePowerStore } from "../../context/game.context";
import type { PowerDescription } from "../../types/types";

export const HandOfCards = () => {
    const {setPowers,data,currentOffers,clearOffers} = usePowerStore();
    const [opened,setOpened] = useState(false);
    
    useEffect(() => {
       fetch('http://localhost:3000/api/powers.json').then((r)=>{
        return r.json()
       }).then((data: PowerDescription[])=>{
        console.log("Fetched powers:", data);
        setPowers(data);
       })
    }, []);

    const onClose = () => {
        clearOffers();
        (document.getElementById('hand-cards-modal')! as HTMLDialogElement).close()
    }
    
    
    return (
        <>
        <dialog className="modal" id="hand-cards-modal">
            <div className="btn btn-error btn-lg absolute top-10 left-1/2 -translate-x-1/2 pointer-events-auto" onClick={onClose}>
                Skip Selection
            </div>
            <div className="hand-of-cards-background"></div>
            <div className="hand-of-cards-wrapper">
                <div className="hand-of-cards pointer-events-auto">
                    {
                        /**
                         * Todo: replace with actual data
                         */
                    }
                    <PowerCard power={{iconSlug:'talk',title:'Talk',description:'Communicate with other players to strategize and share information.'}} />
                    <PowerCard power={{iconSlug:'default',title:'Default Power',description:'This is a default power description for testing purposes.'}} />
                    <PowerCard power={{iconSlug:'default',title:'Default Power',description:'This is a default power description for testing purposes.'}} />
                </div>
            </div>

            
        </dialog>

        {/* <div className={`absolute z-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full overflow-hidden pointer-events-auto select-none ${visible ? '' : 'pointer-events-none hidden'}`}>
            <div className="relative w-full h-full z-100">
                <div className="btn btn-error btn-lg absolute top-10 left-1/2 -translate-x-1/2 pointer-events-auto" onClick={clearOffers}>
                    Skip Selection
                </div>
                <div className="hand-of-cards-background"></div>
                <div className="hand-of-cards-wrapper">
                    <div className="hand-of-cards pointer-events-auto">

                        <PowerCard power={{iconSlug:'talk',title:'Talk',description:'Communicate with other players to strategize and share information.'}} />
                        <PowerCard power={{iconSlug:'default',title:'Default Power',description:'This is a default power description for testing purposes.'}} />
                        <PowerCard power={{iconSlug:'default',title:'Default Power',description:'This is a default power description for testing purposes.'}} />
                    </div>
                </div>

            </div>
        </div> */}
        </>


    )
}