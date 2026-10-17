import { SettingToggle } from "./setting-toggle";
import { NumberSetting } from "./number-setting";
import { useGameSettings } from "../../hooks/useGameSettings";

export const GameplaySettings = () => {
    const [gameSettings, setGameSettings] = useGameSettings();

    return (
        <div className="w-full mb-2 flex flex-col gap-3">
            <SettingToggle
                label="Disable limit orders"
                tooltipPosition="right"
                checked={!!gameSettings.disableLimitOrders}
                onChange={(disableLimitOrders) => setGameSettings({disableLimitOrders})}
            >
                A limit order buys or sells only at the price you choose (or better), and waits on the order book until someone matches it. With them off, players can only place market orders, which fill instantly at whatever the book offers.
            </SettingToggle>

            <SettingToggle
                label="Enable news events"
                tooltipPosition="right"
                checked={!!gameSettings.enableRandomNews}
                onChange={(enableRandomNews) => setGameSettings({enableRandomNews})}
            >
                Random headlines every 30 to 45 seconds. Some of them quietly move the stock's fair value.
            </SettingToggle>

            <SettingToggle
                label="Allow bank loans"
                tooltipPosition="right"
                checked={gameSettings.enableBorrowing ?? true}
                onChange={(enableBorrowing) => setGameSettings({enableBorrowing})}
            >
                Players can borrow a fixed amount from the bank, one loan at a time. Interest builds up from the moment they borrow until the game ends: repay early and you pay only part of it. Loans still open at the end are collected automatically, even if that leaves the player in the red.
            </SettingToggle>

            {(gameSettings.enableBorrowing ?? true) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <NumberSetting
                        label="Loan amount ($)"
                        required
                        placeholder="Enter loan amount"
                        min={1}
                        max={999_999_999}
                        step={1}
                        value={gameSettings.loanAmount ?? ''}
                        onCommit={(loanAmount) => setGameSettings({loanAmount})}
                    />
                    <NumberSetting
                        label="Interest if kept to the end (%)"
                        required
                        placeholder="Enter interest (%)"
                        min={0}
                        max={1000}
                        step={0.5}
                        value={gameSettings.loanInterestPercent ?? ''}
                        onCommit={(loanInterestPercent) => setGameSettings({loanInterestPercent})}
                    />
                </div>
            )}
        </div>
    )
}
