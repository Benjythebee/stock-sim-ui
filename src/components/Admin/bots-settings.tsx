import { useGameStore, type GameSettings } from "../../context/game.context";
import { useShallow } from "zustand/shallow";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { useToast } from "../Toast/useToast";
import { apiUrl } from "../../utils/server";
import { SettingInput } from "./setting-input";
import { parseNumber } from "../../utils/math";


export const BotsSettings = ({setGameSettings}:{ setGameSettings: (settings: Partial<GameSettings>) => void}) => {
    const {gameSettings} = useGameStore(useShallow((state) => ({gameSettings: state.gameSettings})));
    // An empty/missing botSelection means "every strategy" on the server, which is what Random Bots is.
    // Derive it from the server's settings so it survives remounts; `picking` only covers the moment
    // between switching it off and ticking the first box (nothing is sent until then).
    const [picking, setPicking] = useState(false);
    const randomBots = !picking && !gameSettings.botSelection?.length;
    const {addToast} = useToast();
    const {data,isLoading,isFetching} = useQuery({
        queryKey: ['bots-available'],
        queryFn: async () => {
            const response = await fetch(apiUrl('/api/bots.json'));
            if(!response.ok){
                throw new Error('Failed to fetch bots');
            }
            return await response.json();
        },
        select: (data) => {
            return data.data as {name: string, id: string, description: string}[];
        },
        refetchOnMount:true,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    })

    const allBotIds = data?.map((bot) => bot.id) || [];
    // What the server will actually draw from.
    const currentBotSelection = gameSettings.botSelection?.length ? gameSettings.botSelection : allBotIds;

    const onRandomBotsEnabled = (enabled: boolean) => {
        setPicking(!enabled);
        if(enabled && gameSettings.botSelection?.length){
            setGameSettings({botSelection: []});
        }
    }
    
    const onBotTypeChange = (botId: string) => {
        let newSelection: string[] = [];
        if(currentBotSelection.includes(botId)){
            newSelection = currentBotSelection.filter((id) => id !== botId);
        } else {
            newSelection = [...currentBotSelection, botId];
        }
        if(newSelection.length === 0){
            addToast({
                type: 'error',
                title: 'Invalid Bot Selection',
                description: 'At least one bot type must be selected.'
            })
            return; // Prevent empty selection
        }
        setGameSettings({botSelection: newSelection});
    }

    return (<>
    
            <div className="form-control w-full mb-2 grid grid-cols-2 gap-2">
                <div>
                    <label className="label">
                        <span className="label-text font-semibold">Bot Count</span>
                    </label>
                    <SettingInput
                        type="number"
                        placeholder="Enter bot count"
                        className="input input-bordered input-primary w-full"
                        value={gameSettings.bots ?? 0}
                        min={0}
                        max={50}
                        step={1}
                        parse={parseNumber}
                        onCommit={(bots) => setGameSettings({bots})}
                    />
                </div>

                <label className="label">
                    <input type="checkbox" checked={!!randomBots} className={`toggle ${randomBots ? 'toggle-primary' : ''}`} onChange={(e) => onRandomBotsEnabled(e.target.checked)} />
                    <span className="label-text font-semibold ml-2">Random Bots</span>
                </label>
                
            </div>

            {!randomBots && (
                <div className="form-control w-full mb-2">
                    <label className="label">
                        <span className="label-text font-semibold">Select Type of Bots</span>
                    </label>

                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-scroll border border-white/25 rounded-md p-2">
                        {isLoading || isFetching ? (
                            <span>Loading bot types...</span>
                        ) : data && data.length > 0 ? (
                            data.map((bot) => (
                                <Fragment key={bot.id}>
                                <label className="label" >
                                    <input type="checkbox" checked={currentBotSelection.includes(bot.id)} className={`toggle ${randomBots ? 'toggle-secondary' : ''}`} onChange={() => onBotTypeChange(bot.id)} />
                                    <span className="label-text font-semibold ml-2">{bot.name}</span>
                                </label>
                                <p className="text-xs opacity-55 ml-2">{bot.description}</p>
                                </Fragment>
                            ))
                        ) : (
                            <span>No bots available</span>
                        )}
                    </div>

                </div>
            )}

        </>)
}