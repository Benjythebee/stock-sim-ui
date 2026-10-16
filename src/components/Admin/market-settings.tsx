import { SettingToggle } from "./setting-toggle";
import { NumberSetting } from "./number-setting";
import { round } from "../../utils/math";
import { useGameSettings } from "../../hooks/useGameSettings";

export const MarketSettings = () => {
    const [gameSettings, setGameSettings] = useGameSettings();

    return (
        <>
        <div className="w-full mb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <NumberSetting
                label="Opening Price"
                required
                placeholder="Enter opening price"
                max={10_000}
                min={0.01}
                step={0.01}
                value={gameSettings.openingPrice ?? ''}
                onCommit={(openingPrice) => setGameSettings({openingPrice})}
            />
            {/* The store holds a fraction (0.05); ADMIN_SETTINGS takes a percentage (5). */}
            <NumberSetting
                label="Volatility (%)"
                placeholder="Enter market volatility (%)"
                value={gameSettings.marketVolatility === undefined ? '' : round(gameSettings.marketVolatility * 100, 4)}
                min={0.01}
                max={50}
                step={0.1}
                onCommit={(marketVolatility) => setGameSettings({marketVolatility})}
            />
        </div>

        <div className="w-full mb-2">
            <SettingToggle
                label="Disable random walk"
                tooltipPosition="right"
                checked={!!gameSettings.disableRandomWalk}
                onChange={(disableRandomWalk) => setGameSettings({disableRandomWalk})}
            >
                Normally the price wanders randomly on its own, step after step (a "random walk"), and its hidden fair value drifts too. With it off, the price only moves on news, powers and trades, so every move has a cause. Volatility Storms still shake it.
            </SettingToggle>
        </div>
        </>
    )
}
