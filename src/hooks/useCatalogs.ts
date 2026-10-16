import { useQuery } from "@tanstack/react-query";
import type { PowerDescription } from "../types/types";
import { fetchJson } from "../utils/fetch";
import type { ServerVersion } from "../utils/version";
import { useGameStore } from "../context/game.context";

export type BotDescription = { id: string, name: string, description: string };

/** The bot strategies the server can spawn (/api/bots.json). */
export const useBotsCatalog = () => useQuery({
    queryKey: ['bots-available'],
    queryFn: () => fetchJson<{ data: BotDescription[] }>('/api/bots.json'),
    select: (data) => data.data,
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
});

/** Every power installed on the server, built-ins and mods (/api/powers.json). */
export const usePowersCatalog = ({ enabled = true }: { enabled?: boolean } = {}) => useQuery({
    queryKey: ['powers-catalog'],
    queryFn: () => fetchJson<PowerDescription[]>('/api/powers.json'),
    retry: false,
    refetchOnWindowFocus: false,
    enabled,
});

/**
 * The installed powers wherever we are: in a room, the CONTENT_MANIFEST the server sent on connect
 * (titles use the room's ticker); elsewhere, or before it arrives, /api/powers.json.
 */
export const useInstalledPowers = () => {
    const manifest = useGameStore((s) => s.powers.data);
    const query = usePowersCatalog({ enabled: manifest.length === 0 });
    if (manifest.length > 0) return { powers: manifest, isLoading: false, isError: false };
    return { powers: query.data ?? [], isLoading: query.isLoading, isError: query.isError };
};

/** The game server's version and mod API version (/api/version.json), for the footer. */
export const useServerVersion = () => useQuery({
    queryKey: ['server-version'],
    queryFn: () => fetchJson<ServerVersion>('/api/version.json'),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
});
