import { useState, type ReactNode } from "react";
import { useGameStore } from "../../context/game.context";
import { useBotsCatalog, useInstalledPowers } from "../../hooks/useCatalogs";
import { money, round } from "../../utils/math";
import { cn } from "../../utils/cn";
import { ADMIN_SETTINGS_TABS, type AdminSettingsTab } from "./tabs";

const onOff = (on: boolean | undefined) => (on ? 'On' : 'Off');

/** Shows a value, and flashes it when it changes (the host editing it live). */
const LiveValue = ({value, children}: {value: string, children?: ReactNode}) => {
    // "Adjusting state on a prop change" (no effect): count changes, and remount the span to replay the flash.
    const [prev, setPrev] = useState(value);
    const [changes, setChanges] = useState(0);
    if (prev !== value) {
        setPrev(value);
        setChanges(changes + 1);
    }
    return (
        <span key={changes} className={cn("rounded px-1 -mx-1", {"animate-setting-flash": changes > 0})}>
            {children ?? value}
        </span>
    );
};

const Row = ({label, value}: {label: string, value: string}) => (
    <div className="flex items-baseline justify-between gap-3 py-1.5 border-b border-base-300 last:border-b-0">
        <dt className="text-base-content/70">{label}</dt>
        <dd className="font-semibold text-right"><LiveValue value={value} /></dd>
    </div>
);

const Group = ({section, children}: {section: AdminSettingsTab, children: ReactNode}) => {
    const {label, icon: Icon} = ADMIN_SETTINGS_TABS.find((s) => s.value === section)!;
    return (
        <div className="rounded-box border border-base-300 p-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-1"><Icon size={18} /> {label}</h3>
            <dl className="text-base">{children}</dl>
        </div>
    );
};

/** The room's settings, read-only and live: what waiting players see while the host sets the game up. */
export const SettingsSummary = () => {
    const settings = useGameStore((state) => state.gameSettings);
    const {data: bots} = useBotsCatalog();
    const {powers} = useInstalledPowers();

    // An empty selection means every strategy.
    const selected = settings.botSelection?.length
        ? settings.botSelection.map((id) => bots?.find((b) => b.id === id)?.name ?? id).join(', ')
        : 'Random mix';

    // Only powers a briefcase can hold (weight > 0) count.
    const offerable = powers.filter((p) => p.rarity > 0);
    const disabled = settings.disabledPowers ?? [];
    const off = offerable.filter((p) => disabled.includes(p.id));
    const powersValue = off.length === 0 ? 'All' : `${offerable.length - off.length} of ${offerable.length}`;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Group section="general">
                <Row label="Ticker" value={settings.ticketName || '-'} />
                <Row label="Starting cash" value={`$${money(settings.startingCash ?? 0)}`} />
                <Row label="Duration" value={`${settings.gameDuration ?? '-'} min`} />
                <Row label="Hidden prices" value={settings.revealPrices ? 'Revealed' : 'Hidden'} />
            </Group>
            <Group section="market">
                <Row label="Opening price" value={`$${money(settings.openingPrice ?? 0)}`} />
                <Row label="Volatility" value={`${round((settings.marketVolatility ?? 0) * 100, 2)}%`} />
                <Row label="Background activity"value={onOff(!settings.disableRandomWalk)} />
            </Group>
            <Group section="gameplay">
                <Row label="Orders" value={settings.disableLimitOrders ? 'Market only' : 'Limit and market'} />
                <Row label="News events" value={onOff(settings.enableRandomNews)} />
            </Group>
            <Group section="bots">
                <Row label="Bots" value={String(settings.bots ?? 0)} />
                {!!settings.bots && <Row label="Strategies" value={selected} />}
            </Group>
            <Group section="powers">
                <Row label="Briefcases" value={onOff(settings.enablePowers ?? true)} />
                {settings.enablePowers !== false && offerable.length > 0 && <Row label="Powers" value={powersValue} />}
                {settings.enablePowers !== false && off.length > 0 && off.length <= 5 && (
                    <Row label="Turned off" value={off.map((p) => p.title).join(', ')} />
                )}
            </Group>
        </div>
    );
};
