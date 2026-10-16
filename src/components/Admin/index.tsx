import { useCallback, useState } from "react";
import { useGameStore, type GameSettings } from "../../context/game.context";
import { useWebsocketContext } from "../../context/ws.context";
import { MessageType } from "../../types/messages";
import { useShallow } from "zustand/shallow";
import { SettingTabs, type AdminSettingsTab } from "./tabs";
import { BotsSettings } from "./bots-settings";
import { GeneralSettings } from "./general-settings";
import { GameplaySettings } from "./gameplay-settings";
import { MarketSettings } from "./market-settings";
import { PowerSettings } from "./power-settings";
import { CastSettings } from "./cast-settings";



export const AdminModal = () => {
    const {paused,started,ended,isAdmin, onlineUsers} = useGameStore(useShallow((state) => ({paused: state.paused, started: state.started, ended: state.ended, isAdmin: state.isAdmin, onlineUsers: state.onlineUsers})));
    const {sendMessage} = useWebsocketContext();
    const saveGameSettings = useGameStore((state) => state.saveGameSettings);

    const setGameSettings = useCallback((settings: Partial<GameSettings>) => {
        // ADMIN_SETTINGS takes volatility as a percentage; the store (like ROOM_STATE) holds a fraction.
        sendMessage({type: MessageType.ADMIN_SETTINGS, settings});
        saveGameSettings(settings.marketVolatility === undefined ? settings : {...settings, marketVolatility: settings.marketVolatility / 100});
    }, [sendMessage, saveGameSettings]);
    const [tab, setTab] = useState<AdminSettingsTab>('general');

    const onStartGame = () => {
        sendMessage({type: MessageType.TOGGLE_PAUSE});
        setTimeout(()=>{
            useGameStore.getState().setPaused(!paused);
        })
    }
    // Settings can only change in the lobby: the server rejects ADMIN_SETTINGS once the game has started.
    if(ended) return null;
    if(isAdmin && !started){
        return (
            <>
            <div className="card fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-w-[calc(100vw-1rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto bg-base-100 shadow-xl z-50">
                <div className="card-body items-center ">
                    <h1 className="text-3xl sm:text-4xl font-bold text-center bg-clip-text text-primary">
                        Admin Settings
                    </h1>
                    <p className="text-center text-base-content/70 mb-2">
                        Modify game settings below
                    </p>
                    <SettingTabs tab={tab} setTab={setTab} />

                    {tab === 'general' && (<GeneralSettings setGameSettings={setGameSettings} />)}
                    {tab === 'gameplay' && (<GameplaySettings setGameSettings={setGameSettings} />)}
                    {tab === 'market' && (<MarketSettings setGameSettings={setGameSettings} />)}
                    {tab === 'bots' && (<BotsSettings setGameSettings={setGameSettings} />)}
                    {tab === 'powers' && (<PowerSettings />)}
                    {tab === 'cast' && (<CastSettings />)}         

                    <p className="text-center text-base-content/70 mb-6">
                        There are currently {onlineUsers} clients connected.
                    </p>

                    <div className="card-actions">
                        <button className="btn btn-primary" onClick={onStartGame}>Save & Start</button>
                    </div>

            </div>
            </div>
            </>
        );
    }else if (paused){
        return (<div className="card fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-w-[calc(100vw-1rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto bg-base-100 shadow-xl z-50">
        <div className="card-body items-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-center bg-clip-text text-primary">
                {started ? 'Game Paused' : 'Waiting to start'}
            </h1>

            {isAdmin ? <div className="card-actions">
                <button className="btn btn-primary" onClick={onStartGame}>Resume</button>
            </div> :  <p className="text-center text-base-content/70 mb-6">
                Wait for your admin to {started ? 'resume' : 'start'} the game.
                </p>}
        </div>
    </div>
        )
    }


  return null;


}