import type { LucideIcon } from "lucide-react";
import { Bot, ChartCandlestick, Gamepad2, Settings2, Tv, Zap } from "lucide-react";

export type AdminSettingsTab = 'general' | 'gameplay' | 'market' | 'bots' | 'powers' | 'cast';

export type AdminSettingsSection = {
    label: string;
    value: AdminSettingsTab;
    icon: LucideIcon;
    /** One line under the section's heading. */
    description: string;
};

export const ADMIN_SETTINGS_TABS: AdminSettingsSection[] = [
    { label: 'General', value: 'general', icon: Settings2, description: "What's traded, how much everyone starts with, and how long the game lasts." },
    { label: 'Gameplay', value: 'gameplay', icon: Gamepad2, description: 'Which order types players get, whether headlines shake the market, and what the bank lends.' },
    { label: 'Market', value: 'market', icon: ChartCandlestick, description: 'Where the stock opens and how wildly it moves.' },
    { label: 'Bots', value: 'bots', icon: Bot, description: 'AI traders that fill the room. More bots means more liquidity and more competition.' },
    { label: 'Powers', value: 'powers', icon: Zap, description: 'The items briefcases can offer.' },
    { label: 'Cast to TV', value: 'cast', icon: Tv, description: 'Show the market on a big screen for the whole room.' },
];
