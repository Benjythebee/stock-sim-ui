import { Fragment, useState } from "react";
import { useToast } from "../Toast/useToast";
import { NumberSetting } from "./number-setting";
import { Field } from "../ui/field";
import { Toggle } from "../ui/toggle";
import { useGameSettings } from "../../hooks/useGameSettings";
import { useBotsCatalog } from "../../hooks/useCatalogs";


export const BotsSettings = () => {
    const [gameSettings, setGameSettings] = useGameSettings();
    // An empty/missing botSelection means "every strategy" on the server, which is what Random Bots is.
    // Derive it from the server's settings so it survives remounts; `picking` only covers the moment
    // between switching it off and ticking the first box (nothing is sent until then).
    const [picking, setPicking] = useState(false);
    const randomBots = !picking && !gameSettings.botSelection?.length;
    const addToast = useToast((state) => state.addToast);
    const {data, isLoading, isFetching} = useBotsCatalog();

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
        const newSelection = currentBotSelection.includes(botId)
            ? currentBotSelection.filter((id) => id !== botId)
            : [...currentBotSelection, botId];
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
            <div className="w-full mb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <NumberSetting
                    label="Bot Count"
                    placeholder="Enter bot count"
                    value={gameSettings.bots ?? 0}
                    min={0}
                    max={50}
                    step={1}
                    onCommit={(bots) => setGameSettings({bots})}
                />
                <Toggle label="Random Bots" checked={randomBots} onChange={onRandomBotsEnabled} />
            </div>

            {!randomBots && (
                <Field label="Select Type of Bots" className="mb-2">
                    <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto border border-base-300 rounded-box p-3">
                        {isLoading || isFetching ? (
                            <span>Loading bot types...</span>
                        ) : data && data.length > 0 ? (
                            data.map((bot) => (
                                <Fragment key={bot.id}>
                                    <Toggle label={bot.name} color="toggle-secondary" checked={currentBotSelection.includes(bot.id)} onChange={() => onBotTypeChange(bot.id)} />
                                    <p className="text-sm opacity-60 ml-2">{bot.description}</p>
                                </Fragment>
                            ))
                        ) : (
                            <span>No bots available</span>
                        )}
                    </div>
                </Field>
            )}
        </>)
}
