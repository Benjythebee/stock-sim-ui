import type { TabOption } from "../ui/tabs";

export type AdminSettingsTab = 'general' | 'gameplay' | 'market' | 'bots' | 'powers' | 'cast';

export const ADMIN_SETTINGS_TABS: TabOption<AdminSettingsTab>[] = [
    { label: 'General', value: 'general' },
    { label: 'Gameplay', value: 'gameplay' },
    { label: 'Market', value: 'market' },
    { label: 'Bots', value: 'bots' },
    { label: 'Powers', value: 'powers' },
    { label: 'Cast to TV', value: 'cast' },
];
