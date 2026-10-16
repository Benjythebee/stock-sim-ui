/** This build of the app (see vite.config.ts). */
export const APP_VERSION = __APP_VERSION__;
export const APP_REVISION = __APP_REVISION__;

/**
 * The highest mod API version this UI can show (MOD_API_VERSION on the server, src/version.ts).
 * Bump it together with the server whenever mods gain something the UI renders (e.g. a new
 * presentation kind in components/Presentation).
 *
 *   1  powers, bots and news as of the v2 rewrite
 *   2  POWER_PRESENT: the "wheel" presentation
 */
export const SUPPORTED_MOD_API = 2;

/** GET /api/version.json on the game server. */
export type ServerVersion = { version: string; revision: string; modApi: number };
