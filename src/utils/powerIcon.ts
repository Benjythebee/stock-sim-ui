import type { PowerDescription } from "../types/types";
import { SERVER_HTTP_URL } from "./server";

/** Shown whenever a power's icon can't be loaded (missing file, unknown slug, server down). */
export const MISSING_ICON = "/powers/missing.svg";

/** Absolute URL for a server-relative asset path ("/assets/..."). */
export const serverAsset = (path: string) => (/^https?:\/\//.test(path) ? path : `${SERVER_HTTP_URL}${path}`);

/** Where to load a power's icon from: the mod's own file if it ships one, else a built-in UI icon. */
export function powerIconSrc(power: Pick<PowerDescription, "iconUrl" | "iconSlug">): string {
    if (power.iconUrl) return serverAsset(power.iconUrl);
    return `/powers/${power.iconSlug || "default"}.svg`;
}

export function iconCreditText(power: Pick<PowerDescription, "iconCredit">): string | undefined {
    const credit = power.iconCredit;
    if (!credit) return undefined;
    return `Icon by ${credit.author}${credit.license ? ` (${credit.license})` : ""}${credit.url ? ` - ${credit.url}` : ""}`;
}

const preloaded = new Set<string>();

/** Warm the browser cache so mod icons show instantly when a briefcase opens. */
export function preloadImages(urls: string[]): void {
    for (const url of urls) {
        if (preloaded.has(url)) continue;
        preloaded.add(url);
        const img = new Image();
        img.decoding = "async";
        img.src = url;
    }
}
