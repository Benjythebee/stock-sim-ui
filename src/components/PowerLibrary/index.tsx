import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { PowerDescription } from "../../types/types";
import { useInstalledPowers } from "../../hooks/useCatalogs";
import { cn } from "../../utils/cn";
import { powerColor } from "../../utils/powerIcon";
import { byRarity, dropChance, rarityOf } from "../../utils/rarity";
import { PowerIcon } from "../PowerCards/power-icon";
import { Tabs, type TabOption } from "../ui/tabs";

type TargetFilter = "any" | NonNullable<PowerDescription["type"]>;
type SortOrder = "rarity" | "common" | "name";

/** Who a power hits, in the players' words. */
const TARGET_LABEL: Record<NonNullable<PowerDescription["type"]>, string> = {
    client: "You",
    others: "Opponents",
    all: "Everyone",
    market: "Market",
};

const TARGET_TABS: TabOption<TargetFilter>[] = [
    { label: "All", value: "any" },
    { label: "You", value: "client" },
    { label: "Opponents", value: "others" },
    { label: "Everyone", value: "all" },
    { label: "Market", value: "market" },
];

const SORTS: Record<SortOrder, { label: string; compare: (a: PowerDescription, b: PowerDescription) => number }> = {
    rarity: { label: "Rarest first", compare: byRarity },
    common: { label: "Most common first", compare: (a, b) => byRarity(b, a) },
    name: { label: "A to Z", compare: (a, b) => a.title.localeCompare(b.title) },
};

const formatDuration = (seconds: number) =>
    seconds >= 60 && seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds}s`;

/** Every installed power (built-ins and server mods) as a searchable catalog: name, rarity, description. */
export const PowerLibrary = ({ className }: { className?: string }) => {
    const { powers, isLoading, isError } = useInstalledPowers();
    const [query, setQuery] = useState("");
    const [target, setTarget] = useState<TargetFilter>("any");
    const [sort, setSort] = useState<SortOrder>("rarity");

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        return powers
            .filter((p) => target === "any" || (p.type ?? "market") === target)
            .filter((p) => !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
            .sort(SORTS[sort].compare); // filter() already copied the store's array
    }, [powers, query, target, sort]);

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            <div className="flex flex-col sm:flex-row gap-2">
                <label className="input w-full sm:flex-1">
                    <Search size={16} className="opacity-50" />
                    <input type="search" placeholder="Search powers" value={query} onChange={(e) => setQuery(e.target.value)} />
                </label>
                <select className="select w-full sm:w-48" aria-label="Sort powers" value={sort} onChange={(e) => setSort(e.target.value as SortOrder)}>
                    {Object.entries(SORTS).map(([value, s]) => <option key={value} value={value}>{s.label}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto">
                <Tabs tabs={TARGET_TABS} value={target} onChange={setTarget} className="w-max min-w-full" />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-6"><span className="loading loading-dots loading-lg"></span></div>
            ) : isError && powers.length === 0 ? (
                <div role="alert" className="alert alert-warning">Couldn't reach the game server to list its powers. Try again in a moment.</div>
            ) : shown.length === 0 ? (
                <p className="text-center opacity-70 p-6">{powers.length === 0 ? "This server has no powers installed." : "No power matches."}</p>
            ) : (
                <>
                    <p className="text-sm opacity-70">{shown.length} of {powers.length} powers</p>
                    <ul className="grid md:grid-cols-2 gap-3">
                        {shown.map((p) => <PowerEntry key={p.id} power={p} all={powers} />)}
                    </ul>
                </>
            )}
        </div>
    );
};

const PowerEntry = ({ power, all }: { power: PowerDescription; all: PowerDescription[] }) => {
    const rarity = rarityOf(power.rarity);
    const chance = dropChance(power, all);
    const type = power.type ?? "market";
    return (
        <li className="flex gap-3 rounded-box bg-base-200 p-3">
            <div className={cn("power-swatch", powerColor(type))}>
                <PowerIcon power={power} />
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="font-semibold leading-tight flex flex-wrap items-center gap-x-2 gap-y-1">
                    {power.title}
                    <span
                        className={cn("badge badge-sm", rarity.badge)}
                        title={chance === null ? "Never offered in a briefcase" : `About ${(chance * 100).toFixed(1)}% of briefcase cards`}
                    >
                        {rarity.label}
                    </span>
                </h3>
                <p className="text-sm opacity-80 mt-1">{power.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                    <span className="badge badge-ghost badge-sm">Targets: {TARGET_LABEL[type]}</span>
                    <span className="badge badge-ghost badge-sm">{power.isInstant ? "Instant" : "Keep and use later"}</span>
                    {power.durationTicks > 0 && <span className="badge badge-ghost badge-sm">Lasts {formatDuration(power.durationTicks)}</span>}
                </div>
            </div>
        </li>
    );
};
