import { useQuery } from "@tanstack/react-query";
import type { PowerDescription } from "../../types/types";
import { apiUrl } from "../../utils/server";
import { MISSING_ICON, serverAsset } from "../../utils/powerIcon";
import { GAME_ICONS_LICENSE, powerCardIcons, type IconCredit } from "../PowerCards/card.icons";

type IconRow = { key: string; src: string; credit?: IconCredit; usedBy: string[] };

/** What to call bundled icons that no power currently uses. */
const ICON_LABELS: Record<string, string> = { missing: "Placeholder when an icon can't load", default: "Default power icon" };

/**
 * One row per distinct icon: the icons bundled with the UI, plus every icon shipped by a mod
 * installed on the game server (each power carries its own `iconCredit`).
 */
function buildRows(powers: PowerDescription[]): IconRow[] {
  const rows = new Map<string, IconRow>();
  for (const [slug, credit] of Object.entries(powerCardIcons)) {
    rows.set(`slug:${slug}`, { key: slug, src: `/powers/${slug}.svg`, credit, usedBy: [] });
  }

  for (const power of powers) {
    const key = power.iconUrl ? `url:${power.iconUrl}` : `slug:${power.iconSlug || "default"}`;
    let row = rows.get(key);
    if (!row) {
      row = power.iconUrl
        ? { key, src: serverAsset(power.iconUrl), credit: power.iconCredit, usedBy: [] }
        : { key, src: `/powers/${power.iconSlug}.svg`, usedBy: [] };
      rows.set(key, row);
    }
    if (!row.credit && power.iconCredit) row.credit = power.iconCredit;
    row.usedBy.push(power.title);
  }
  // Icons in use first, then the rest; alphabetical by author within each group.
  return [...rows.values()].sort(
    (a, b) => Number(b.usedBy.length > 0) - Number(a.usedBy.length > 0) || (a.credit?.author ?? "").localeCompare(b.credit?.author ?? ""),
  );
}

export const Credits = () => {
  const { data: powers = [], isError } = useQuery({
    queryKey: ["powers-catalog"],
    queryFn: async () => {
      const response = await fetch(apiUrl("/api/powers.json"));
      if (!response.ok) throw new Error("Failed to load powers");
      return (await response.json()) as PowerDescription[];
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const rows = buildRows(powers);

  return (
    <div className="flex flex-col gap-4">
      <p className="opacity-80">
        Power icons are by the artists of{" "}
        <a className="link" href="https://game-icons.net" target="_blank" rel="noopener noreferrer">game-icons.net</a>, licensed under{" "}
        <a className="link" href={GAME_ICONS_LICENSE.url} target="_blank" rel="noopener noreferrer">{GAME_ICONS_LICENSE.name}</a>. Thank you!
      </p>
      {isError && <p className="text-sm opacity-60">Icons from mods installed on the game server will show here when it's reachable.</p>}

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-3 rounded-box bg-base-200 p-3">
            <div className="w-14 h-14 shrink-0 rounded-full bg-white/90 flex items-center justify-center">
              <img
                src={row.src}
                alt=""
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  if (!e.currentTarget.src.endsWith(MISSING_ICON)) e.currentTarget.src = MISSING_ICON;
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="font-semibold break-words">{row.usedBy.length ? row.usedBy.join(", ") : (ICON_LABELS[row.key] ?? "Unused")}</div>
              <div className="text-sm">
                {row.credit ? (
                  <>
                    by{" "}
                    {row.credit.url ? (
                      <a className="link" href={row.credit.url} target="_blank" rel="noopener noreferrer">{row.credit.author}</a>
                    ) : (
                      row.credit.author
                    )}
                    {row.credit.license && <span className="badge badge-ghost badge-sm ml-2">{row.credit.license}</span>}
                  </>
                ) : (
                  <span className="opacity-60">Author unknown</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
