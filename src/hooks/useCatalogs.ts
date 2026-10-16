import { useQuery } from "@tanstack/react-query";
import type { PowerDescription } from "../types/types";
import { fetchJson } from "../utils/fetch";

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
export const usePowersCatalog = () => useQuery({
    queryKey: ['powers-catalog'],
    queryFn: () => fetchJson<PowerDescription[]>('/api/powers.json'),
    retry: false,
    refetchOnWindowFocus: false,
});
