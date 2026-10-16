import { CastIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";


const waitForCastScript = (): Promise<void> => {
    let attempts = 0;
    return new Promise((resolve,reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checkCast = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((window as any).cast && (window as any).chrome) {
                resolve();
            } else {
                attempts++;
                if (attempts >= 10) {
                    reject(new Error("Cast script not loaded after 10 seconds")); // Stop trying after 10 attempts
                    return;
                }
                setTimeout(checkCast, 1000);
            }
        };
        checkCast();
    });
}

/** Renders nothing until the Cast sender SDK is ready (Chrome on desktop or Android only). */
export const CastButton = ({room, className = "btn btn-ghost", children}: {room: string, className?: string, children?: React.ReactNode}) => {
    
    const [castScriptLoaded, setCastScriptLoaded] =  useState(false);
    const loadedOnce = useRef(false);

    useEffect(() => {
        if(loadedOnce.current){
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if((window as any).cast && (window as any).chrome){
            setCastScriptLoaded(true);
            return;
        }
        if(!room || room===''){
            return;
        }
        if(document.head.querySelector('script[src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"]')){
            return;
        }
        loadedOnce.current = true;
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
        document.head.appendChild(script);

        script.onload = () =>{
            waitForCastScript().then(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const cast = (window as any).cast
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const chrome = (window as any).chrome
                const instance = cast.framework.CastContext.getInstance()
                instance.setOptions({
                    receiverApplicationId: "6030BF63",
                    autoJoinPolicy: chrome.cast.AutoJoinPolicy.PAGE_SCOPED,
                    resumeSavedSession: false
                });
                
                setCastScriptLoaded(true);

            });

        }

        return () => {
            document.head.removeChild(script);
        };
    }, []);


    const castRoom = async (room: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cast = (window as any).cast
        const context = cast.framework.CastContext.getInstance();
        await context.requestSession();

        const session = context.getCurrentSession();
        session.sendMessage(
            "urn:x-cast:com.tendiesbrawl.room",
            { room }
        );
    }
    

    return castScriptLoaded && <button className={className} onClick={() => castRoom(room!)} title="Cast Room to Device" >
                <CastIcon className=" cursor-pointer" size={24} />
                {children}
            </button>
}