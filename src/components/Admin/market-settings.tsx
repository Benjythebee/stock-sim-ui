import { useGameStore, type GameSettings } from "../../context/game.context";
import { useShallow } from "zustand/shallow";
import { SettingInput } from "./setting-input";
import { SettingToggle } from "./setting-toggle";
import { parseNumber, round } from "../../utils/math";

export const MarketSettings = ({setGameSettings}:{ setGameSettings: (settings: Partial<GameSettings>) => void}) => {
    const {gameSettings} = useGameStore(useShallow((state) => ({gameSettings: state.gameSettings})));

    return (
        <>
        <div className="form-control w-full mb-2 grid grid-cols-2 gap-2">
            <div>
                <label className="label">
                    <span className="label-text font-semibold">Opening Price</span>
                </label>
                <SettingInput
                    type="number"
                    required
                    placeholder="Enter opening price"
                    className="input input-bordered input-primary w-full"
                    max={10_000}
                    min={0.01}
                    step={0.01}
                    value={gameSettings.openingPrice ?? ''}
                    parse={parseNumber}
                    onCommit={(openingPrice) => setGameSettings({openingPrice})}
                />
            </div>
            <div>
                <label className="label">
                    <span className="label-text font-semibold">Volatility (%)</span>
                </label>
                {/* The store holds a fraction (0.05); ADMIN_SETTINGS takes a percentage (5). */}
                <SettingInput
                    type="number"
                    placeholder="Enter market volatility (%)"
                    className="input input-bordered input-primary w-full"
                    value={gameSettings.marketVolatility === undefined ? '' : round(gameSettings.marketVolatility * 100, 4)}
                    min={0.01}
                    max={50}
                    step={0.1}
                    parse={parseNumber}
                    onCommit={(marketVolatility) => setGameSettings({marketVolatility})}
                />
            </div>
        </div>

        <div className="w-full mb-2">
            <SettingToggle
                label="Disable random walk"
                checked={!!gameSettings.disableRandomWalk}
                onChange={(disableRandomWalk) => setGameSettings({disableRandomWalk})}
            >
                Normally the price wanders randomly on its own, step after step (a "random walk"), and its hidden fair value drifts too. With it off, the price only moves on news, powers and trades, so every move has a cause. Volatility Storms still shake it.
            </SettingToggle>
        </div>
        </>
    )
}
