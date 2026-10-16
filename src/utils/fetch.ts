import { apiUrl } from "./server";

/** GET a JSON file from the game server's HTTP API. Throws on a non-2xx response. */
export const fetchJson = async <T>(path: string): Promise<T> => {
    const response = await fetch(apiUrl(path));
    if (!response.ok) throw new Error(`Failed to fetch ${path} (${response.status})`);
    return (await response.json()) as T;
};
