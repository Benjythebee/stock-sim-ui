/** Credit for an icon. `url` points at the icon's page on its source site. */
export type IconCredit = {
    author: string;
    url?: string;
    license?: string;
};

export const GAME_ICONS_LICENSE = { name: "CC BY 3.0", url: "https://creativecommons.org/licenses/by/3.0/" };

/**
 * Credits for the icons bundled with the UI (public/powers/<slug>.svg).
 * Icons shipped by server mods carry their own `iconCredit` (see the power catalog).
 * Shown on the About page under "Credits", so keep it complete when adding an icon.
 */
export const powerCardIcons: Record<string, IconCredit> = {
    "talk": { author: "Skoll", url: "https://game-icons.net/1x1/skoll/talk.html", license: "CC BY 3.0" },
    "default": { author: "Seregacthtuf", url: "https://game-icons.net/1x1/seregacthtuf/pouch-with-beads.html", license: "CC BY 3.0" },
    "volatility-storm": { author: "Lorc", url: "https://game-icons.net/1x1/lorc/entangled-typhoon.html", license: "CC BY 3.0" },
    "present": { author: "Delapouite", url: "https://game-icons.net/1x1/delapouite/present.html", license: "CC BY 3.0" },
    "stop": { author: "Delapouite", url: "https://game-icons.net/1x1/delapouite/stop-sign.html", license: "CC BY 3.0" },
    // Drawn for this project: shown when a power's icon fails to load.
    "missing": { author: "Tendies Brawl" },
};
