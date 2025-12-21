import { useCallback, useMemo, useState } from "react";
import { useGameStore, type GameSettings } from "../../context/game.context";
import { useWebsocketContext } from "../../context/ws.context";
import { MessageType } from "../../types/messages";
import { usePriceStore } from "../../context/stock.store";
import { useShallow } from "zustand/shallow";
import { SettingTabs, type AdminSettingsTab } from "./tabs";
import { BotsSettings } from "./bots-settings";
import { GeneralSettings } from "./general-settings";
import { PowerSettings } from "./power-settings";



export const AdminModal = () => {
    const {prices} = usePriceStore(useShallow((state) => ({prices: state.prices})));
    const {paused,isAdmin, onlineUsers} = useGameStore(useShallow((state) => ({paused: state.paused, isAdmin: state.isAdmin, onlineUsers: state.onlineUsers})));
    const {sendMessage} = useWebsocketContext();
    const {saveGameSettings} = useGameStore(useShallow((state) => ({saveGameSettings: state.saveGameSettings, gameSettings: state.gameSettings})));

    const setGameSettings = useCallback((settings: Partial<GameSettings>) => {
        sendMessage({type: MessageType.ADMIN_SETTINGS, settings});
        saveGameSettings(settings);
    }, [sendMessage, saveGameSettings]);
    const [tab, setTab] = useState<AdminSettingsTab>('general');

    const onStartGame = () => {
        sendMessage({type: MessageType.TOGGLE_PAUSE});
        setTimeout(()=>{
            useGameStore.getState().setPaused(!paused);
        })
    }
    // console.log('AdminModal render', {isAdmin, pricesLength: prices.length, paused});
    const visibleSettings = useMemo(() => isAdmin && prices.length >= 1 && paused, [isAdmin, prices.length, paused]);

    if(visibleSettings){
        return (
            <>
            <div className="card absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-base-100 shadow-xl z-50">
                <div className="card-body items-center ">
                    <h1 className="text-4xl font-bold text-center bg-clip-text text-primary">
                        Admin Settings
                    </h1>
                    <p className="text-center text-base-content/70 mb-2">
                        Modify game settings below
                    </p>
                    <SettingTabs tab={tab} setTab={setTab} />

                    {tab === 'general' && (<GeneralSettings setGameSettings={setGameSettings} />)}
                    {tab === 'bots' && (<BotsSettings setGameSettings={setGameSettings} />)}
                    {tab === 'powers' && (<PowerSettings setGameSettings={setGameSettings} />)}         

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
        return (<div className="card absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-base-100 shadow-xl z-50">
        <div className="card-body items-center bg-white">
            <h1 className="text-4xl font-bold text-center bg-clip-text text-primary">
                Game Paused
            </h1>

            {isAdmin ? <div className="card-actions">
                <button className="btn btn-primary" onClick={onStartGame}>Resume</button>
            </div> :  <p className="text-center text-base-content/70 mb-6">
                Wait for your admin to resume the game.
                </p>}
        </div>
    </div>
        )
    }


  return null;


}