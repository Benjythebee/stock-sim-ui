import { useGameStore, type GameSettings } from "../../context/game.context";
import { useShallow } from "zustand/shallow";
import { SettingToggle } from "./setting-toggle";

export const GameplaySettings = ({setGameSettings}:{ setGameSettings: (settings: Partial<GameSettings>) => void}) => {
    const {gameSettings} = useGameStore(useShallow((state) => ({gameSettings: state.gameSettings})));

    return (
        <div className="w-full mb-2 flex flex-col gap-3">
            <SettingToggle
                label="Disable limit orders"
                checked={!!gameSettings.disableLimitOrders}
                onChange={(disableLimitOrders) => setGameSettings({disableLimitOrders})}
            >
                A limit order buys or sells only at the price you choose (or better), and waits on the order book until someone matches it. With them off, players can only place market orders, which fill instantly at whatever the book offers.
            </SettingToggle>

            <SettingToggle
                label="Enable news events"
                checked={!!gameSettings.enableRandomNews}
                onChange={(enableRandomNews) => setGameSettings({enableRandomNews})}
            >
                Random headlines every 30 to 45 seconds. Some of them quietly move the stock's fair value.
            </SettingToggle>
        </div>
    )
}
