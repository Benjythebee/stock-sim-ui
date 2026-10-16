/**
 * Where the game server lives. Set VITE_SERVER_URL (see .env.example) to point elsewhere.
 * By default it's the same host as the page on port 3000, so friends on your LAN who open
 * http://<your-ip>:5173 reach your server too.
 */
const configured = import.meta.env.VITE_SERVER_URL?.trim();

export const SERVER_HTTP_URL = (configured || `${window.location.protocol}//${window.location.hostname}:3000`).replace(/\/+$/, "");

/** ws:// or wss:// twin of SERVER_HTTP_URL. */
export const SERVER_WS_URL = SERVER_HTTP_URL.replace(/^http/, "ws");

export const apiUrl = (path: string) => `${SERVER_HTTP_URL}${path.startsWith("/") ? path : `/${path}`}`;
