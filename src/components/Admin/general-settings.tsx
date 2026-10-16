import { SettingInput } from "./setting-input";
import { SettingToggle } from "./setting-toggle";
import { NumberSetting } from "./number-setting";
import { Field } from "../ui/field";
import { useGameSettings } from "../../hooks/useGameSettings";

const parseTicker = (text: string) => text.trim() || undefined;

export const GeneralSettings = () => {
    const [gameSettings, setGameSettings] = useGameSettings();

    return (
        <>
        <Field label="Stock Ticker" className="mb-2">
            <SettingInput
                type="text"
                placeholder="Enter stock ticker"
                className="input input-bordered input-primary w-full uppercase text-base"
                aria-placeholder="AAPL"
                maxLength={8}
                minLength={1}
                required
                value={gameSettings.ticketName || ''}
                parse={parseTicker}
                onCommit={(ticketName) => setGameSettings({ticketName})}
            />
        </Field>

        <div className="w-full mb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <NumberSetting
                label="Starting Cash"
                required
                placeholder="Enter starting cash amount"
                value={gameSettings.startingCash ?? ''}
                max={999_999_999}
                min={1}
                step={1}
                onCommit={(startingCash) => setGameSettings({startingCash})}
            />
            <NumberSetting
                label="Game Duration (mins)"
                required
                min={1}
                max={60}
                placeholder="Enter game duration in minutes"
                value={gameSettings.gameDuration ?? ''}
                onCommit={(gameDuration) => setGameSettings({gameDuration})}
            />
        </div>

        <div className="w-full mb-2">
            <SettingToggle
                label="Reveal hidden prices (practice mode)"
                color="toggle-warning"
                tooltipPosition="right"
                checked={!!gameSettings.revealPrices}
                onChange={(revealPrices) => setGameSettings({revealPrices})}
            >
                Plots the stock's hidden fair value and guide price for every player. Great for learning, but it gives the game away.
            </SettingToggle>
        </div>
        </>
    )
}
