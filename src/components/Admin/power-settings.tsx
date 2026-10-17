import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { PowerDescription } from "../../types/types";
import { useGameSettings } from "../../hooks/useGameSettings";
import { useInstalledPowers } from "../../hooks/useCatalogs";
import { cn } from "../../utils/cn";
import { powerColor, TARGET_LABEL } from "../../utils/powerIcon";
import { rarityOf } from "../../utils/rarity";
import { PowerIcon } from "../PowerCards/power-icon";
import { SettingToggle } from "./setting-toggle";

/**
 * The global powers switch, then one toggle per power with its description. The server stores the
 * powers that are *off* (`disabledPowers`), so a power a mod adds later starts on.
 */
export const PowerSettings = () => {
    const [gameSettings, setGameSettings] = useGameSettings();
    const { powers, isLoading } = useInstalledPowers();
    const [query, setQuery] = useState("");

    const enabled = gameSettings.enablePowers ?? true;
    const disabled = useMemo(() => gameSettings.disabledPowers ?? [], [gameSettings.disabledPowers]);
    // Weight 0 powers are never in a briefcase, so there's nothing to switch.
    const offerable = useMemo(() => powers.filter((p) => p.rarity > 0).sort((a, b) => a.title.localeCompare(b.title)), [powers]);
    const onCount = offerable.filter((p) => !disabled.includes(p.id)).length;

    const q = query.trim().toLowerCase();
    const shown = q ? offerable.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) : offerable;

    const setPower = (id: string, on: boolean) =>
        setGameSettings({ disabledPowers: on ? disabled.filter((d) => d !== id) : [...disabled, id] });

    return (
        <div className="w-full mb-2 flex flex-col gap-3">
            <SettingToggle
                label="Enable powers"
                tooltipPosition="right"
                checked={enabled}
                onChange={(enablePowers) => setGameSettings({ enablePowers })}
            >
                Briefcases drop 8 times during the game, and each one offers every player 3 random powers to pick from. Turn this off for a pure trading game.
            </SettingToggle>

            <fieldset disabled={!enabled} className={cn("flex flex-col gap-3", { "opacity-50": !enabled })}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                        {onCount} of {offerable.length} powers in briefcases
                    </p>
                    <div className="flex gap-1">
                        <button type="button" className="btn btn-xs btn-ghost" disabled={disabled.length === 0} onClick={() => setGameSettings({ disabledPowers: [] })}>
                            Enable all
                        </button>
                        <button type="button" className="btn btn-xs btn-ghost" disabled={onCount === 0} onClick={() => setGameSettings({ disabledPowers: offerable.map((p) => p.id) })}>
                            Disable all
                        </button>
                    </div>
                </div>

                {enabled && !isLoading && onCount === 0 && (
                    <div role="alert" className="alert alert-warning">Every power is off, so no briefcase will drop.</div>
                )}

                <label className="input w-full">
                    <Search size={16} className="opacity-50" />
                    <input type="search" placeholder="Search powers" value={query} onChange={(e) => setQuery(e.target.value)} />
                </label>

                {isLoading ? (
                    <div className="flex justify-center p-6"><span className="loading loading-dots loading-lg"></span></div>
                ) : shown.length === 0 ? (
                    <p className="text-center opacity-70 p-6">{offerable.length === 0 ? "This server has no powers installed." : "No power matches."}</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {shown.map((p) => (
                            <PowerRow key={p.id} power={p} on={!disabled.includes(p.id)} onChange={(on) => setPower(p.id, on)} />
                        ))}
                    </ul>
                )}
            </fieldset>
        </div>
    );
};

const PowerRow = ({ power, on, onChange }: { power: PowerDescription; on: boolean; onChange: (on: boolean) => void }) => {
    const rarity = rarityOf(power.rarity);
    const type = power.type ?? "market";
    return (
        <li>
            {/* The whole row is the toggle's label, so a click anywhere on it flips the power. */}
            <label className={cn("flex gap-3 rounded-box bg-base-200 p-3 cursor-pointer transition-opacity", { "opacity-50": !on })}>
                <div className={cn("power-swatch",powerColor(type))}>
                    <PowerIcon power={power} />
                </div>
                <div className="min-w-0 flex-1">
                    <span className="font-semibold leading-tight flex flex-wrap items-center gap-x-2 gap-y-1">
                        {power.title}
                        <span className={cn("badge badge-sm", rarity.badge)}>{rarity.label}</span>
                        <span className="badge badge-ghost badge-sm">{TARGET_LABEL[type]}</span>
                    </span>
                    <span className="block text-sm opacity-80 mt-1">{power.description}</span>
                </div>
                <input
                    type="checkbox"
                    className={cn("toggle self-center", { "toggle-primary": on })}
                    aria-label={`${power.title} in briefcases`}
                    checked={on}
                    onChange={(e) => onChange(e.target.checked)}
                />
            </label>
        </li>
    );
};
