import type { PowerDescription } from "../types/types";

export type Rarity = {
    label: string;
    /** DaisyUI badge color class. */
    badge: string;
};

/**
 * A power's rarity tier from its briefcase weight (`rarity` on the wire: lower = rarer, 0 = never offered).
 * The built-in and bundled mod powers use weights from 5 to 40.
 */
export function rarityOf(weight: number): Rarity {
    if (!(weight > 0)) return { label: "Not in briefcases", badge: "badge-outline" };
    if (weight <= 5) return { label: "Legendary", badge: "badge-warning" };
    if (weight <= 10) return { label: "Rare", badge: "badge-secondary" };
    if (weight <= 15) return { label: "Uncommon", badge: "badge-info" };
    return { label: "Common", badge: "badge-neutral" };
}

/** Chance that one briefcase card is this power (its share of all the weights), or null if it's never offered. */
export function dropChance(power: Pick<PowerDescription, "rarity">, all: Pick<PowerDescription, "rarity">[]): number | null {
    if (!(power.rarity > 0)) return null;
    const total = all.reduce((sum, p) => sum + (p.rarity > 0 ? p.rarity : 0), 0);
    return total > 0 ? power.rarity / total : null;
}

/** Rarest first; powers that are never offered go last. */
export const byRarity = (a: Pick<PowerDescription, "rarity" | "title">, b: Pick<PowerDescription, "rarity" | "title">) => {
    const wa = a.rarity > 0 ? a.rarity : Infinity;
    const wb = b.rarity > 0 ? b.rarity : Infinity;
    return wa === wb ? a.title.localeCompare(b.title) : wa - wb;
};
