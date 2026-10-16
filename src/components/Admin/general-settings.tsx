import { useGameStore, type GameSettings } from "../../context/game.context";
import { useShallow } from "zustand/shallow";
import { SettingInput } from "./setting-input";
import { parseNumber, round } from "../../utils/math";

const parseTicker = (text: string) => text.trim() || undefined;




export const GeneralSettings = ({setGameSettings}:{ setGameSettings: (settings: Partial<GameSettings>) => void}) => {
    const {gameSettings} = useGameStore(useShallow((state) => ({gameSettings: state.gameSettings})));

    return (
        <>
         <div className="form-control w-full mb-2">
            <label className="label">
                <span className="label-text font-semibold">Stock Ticker</span>
            </label>
            <SettingInput
                type="text"
                placeholder="Enter stock ticker"
                className="input input-bordered input-primary w-full uppercase"
                aria-placeholder="AAPL"
                maxLength={8}
                minLength={1}
                required
                value={gameSettings.ticketName || ''}
                parse={parseTicker}
                onCommit={(ticketName) => setGameSettings({ticketName})}
            />
        </div>

        <div className="form-control w-full mb-2 grid grid-cols-2 gap-2">
            <div>
                <label className="label">
                    <span className="label-text font-semibold">Starting Cash</span>
                </label>
                <SettingInput
                    type="number"
                    required
                    placeholder="Enter starting cash amount"
                    className="input input-bordered input-primary w-full"
                    value={gameSettings.startingCash ?? ''}
                    max={999_999_999}
                    min={1}
                    step={1}
                    parse={parseNumber}
                    onCommit={(startingCash) => setGameSettings({startingCash})}
                />
            </div>
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

        </div>

        <div className="form-control w-full mb-2 grid grid-cols-2 gap-2">
            <div>
                <label className="label">
                    <span className="label-text font-semibold">Market Volatility (%)</span>
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
            <div>
                <label className="label">
                    <span className="label-text font-semibold">Game Duration (mins)</span>
                </label>
                <SettingInput
                    type="number"
                    required
                    min={1}
                    max={60}
                    placeholder="Enter game duration in minutes"
                    className="input input-bordered input-primary w-full"
                    value={gameSettings.gameDuration ?? ''}
                    parse={parseNumber}
                    onCommit={(gameDuration) => setGameSettings({gameDuration})}
                />
            </div>
        </div>

        <div>
            <label className="label">
                <input type="checkbox" checked={!!gameSettings.enableRandomNews} className={`toggle ${gameSettings.enableRandomNews ? 'toggle-primary' : ''}`} onChange={(e) => setGameSettings({enableRandomNews: e.target.checked})} />
                <span className="label-text font-semibold ml-2">Enable News Events</span>
            </label>
        </div>

        <div>
            <label className="label" title="Plots the stock's hidden fair value and guide price for every player. Great for learning, but it gives the game away.">
                <input type="checkbox" checked={!!gameSettings.revealPrices} className={`toggle ${gameSettings.revealPrices ? 'toggle-warning' : ''}`} onChange={(e) => setGameSettings({revealPrices: e.target.checked})} />
                <span className="label-text font-semibold ml-2">Reveal hidden prices (practice mode)</span>
            </label>
        </div>
            </>
    )
}