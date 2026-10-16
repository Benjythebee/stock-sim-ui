import { useGameStore, type GameSettings } from "../../context/game.context";
import { useShallow } from "zustand/shallow";




export const GeneralSettings = ({setGameSettings}:{ setGameSettings: (settings: Partial<GameSettings>) => void}) => {
    const {gameSettings} = useGameStore(useShallow((state) => ({saveGameSettings: state.saveGameSettings, gameSettings: state.gameSettings})));

    return (
        <>
         <div className="form-control w-full mb-2">
            <label className="label">
                <span className="label-text font-semibold">Stock Ticker</span>
            </label>
            <input
                type="text"
                placeholder="Enter stock ticker"
                className="input input-bordered input-primary w-full"
                aria-placeholder="AAPL"
                maxLength={4}
                minLength={1}
                required
                value={gameSettings.ticketName || ''}
                onChange={(e) => setGameSettings({ticketName: e.target.value})}
            />
        </div>

        <div className="form-control w-full mb-2 grid grid-cols-2 gap-2">
            <div>
                <label className="label">
                    <span className="label-text font-semibold">Starting Cash</span>
                </label>
                <input
                    type="number"
                    required
                    placeholder="Enter starting cash amount"
                    className="input input-bordered input-primary w-full"
                    value={gameSettings.startingCash || ''}
                    max={999_999_999}
                    min={1}
                    onChange={(e) => setGameSettings({startingCash: parseInt(e.target.value)})}
                />
            </div>
            <div>
                <label className="label">
                    <span className="label-text font-semibold">Opening Price</span>
                </label>
                <input
                    type="number"
                    required
                    placeholder="Enter opening price"
                    className="input input-bordered input-primary w-full"
                    max={10_000}
                    min={0.01}
                    value={gameSettings.openingPrice || ''}
                    onChange={(e) => setGameSettings({openingPrice: parseInt(e.target.value)})}
                />
            </div>

        </div>

        <div className="form-control w-full mb-2 grid grid-cols-2 gap-2">
            <div>
                <label className="label">
                    <span className="label-text font-semibold">Market Volatility (%)</span>
                </label>
                <input
                    type="number"
                    placeholder="Enter market volatility (%)"
                    className="input input-bordered input-primary w-full"
                    value={(gameSettings.marketVolatility*100) || ''}
                    min={0.001}
                    max={100}
                    onChange={(e) => setGameSettings({marketVolatility: parseInt(e.target.value)})}
                />
            </div>
            <div>
                <label className="label">
                    <span className="label-text font-semibold">Game Duration (mins)</span>
                </label>
                <input
                    type="number"
                    required
                    min={1}
                    max={60}
                    placeholder="Enter game duration in minutes"
                    className="input input-bordered input-primary w-full"
                    value={gameSettings.gameDuration || ''}
                    onChange={(e) => setGameSettings({gameDuration: parseInt(e.target.value)})}
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