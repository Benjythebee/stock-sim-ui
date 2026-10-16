import { useState, type ReactNode } from "react";
import { Play } from "lucide-react";
import { useGameStore } from "../../context/game.context";
import { useShallow } from "zustand/shallow";
import { ADMIN_SETTINGS_TABS, type AdminSettingsTab } from "./tabs";
import { BotsSettings } from "./bots-settings";
import { GeneralSettings } from "./general-settings";
import { GameplaySettings } from "./gameplay-settings";
import { MarketSettings } from "./market-settings";
import { PowerSettings } from "./power-settings";
import { CastSettings } from "./cast-settings";
import { InvitePanel } from "./invite-panel";
import { SettingsSummary } from "./settings-summary";
import { PlayerName } from "./player-name";
import { PlayerList } from "./player-list";
import { OverlayCard, OverlayShell } from "../ui/overlay-card";
import { useGameActions } from "../../hooks/useGameActions";
import { cn } from "../../utils/cn";
import { PowerLibraryButton } from "../PowerLibrary/library.button";

const SECTIONS: Record<AdminSettingsTab, () => ReactNode> = {
    general: GeneralSettings,
    gameplay: GameplaySettings,
    market: MarketSettings,
    bots: BotsSettings,
    powers: PowerSettings,
    cast: CastSettings,
};

export const AdminModal = () => {
    const {paused,started,ended,isAdmin} = useGameStore(useShallow((state) => ({paused: state.paused, started: state.started, ended: state.ended, isAdmin: state.isAdmin})));
    const {togglePause} = useGameActions();

    // Settings can only change in the lobby: the server rejects ADMIN_SETTINGS once the game has started.
    if(ended) return null;
    if(!started) return isAdmin ? <LobbySettings onStart={togglePause} /> : <LobbyWaiting />;
    if (paused){
        return (
            <OverlayCard
                title="Game Paused"
                actions={<>
                    <PowerLibraryButton className="btn btn-ghost" label="Powers" />
                    {isAdmin && <button className="btn btn-primary" onClick={togglePause}>Resume</button>}
                </>}
            >
                {!isAdmin && (
                    <p className="text-center text-base-content/70 mb-2">
                        Wait for your host to resume the game.
                    </p>
                )}
            </OverlayCard>
        );
    }
    return null;
}

/** The wide lobby card: title and player count on top, a body the caller lays out, and a footer that stays in view. */
const LobbyShell = ({title, subtitle, footer, children}: {title: ReactNode, subtitle: ReactNode, footer: ReactNode, children: ReactNode}) => {
    return (
        <OverlayShell className="w-[64rem] lg:h-[min(42rem,calc(100dvh-2rem))] lg:overflow-hidden flex flex-col">
            <header className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-base-300">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary">{title}</h1>
                    <p className="text-base text-base-content/70">{subtitle}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <PlayerName />
                    <PlayerList />
                    <PowerLibraryButton className="btn btn-sm btn-ghost" label="Powers" />
                </div>
            </header>

            {children}

            {/* Sticky so it stays in reach while the whole card scrolls (below lg). */}
            <footer className="sticky bottom-0 bg-base-100 flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3 border-t border-base-300">
                {footer}
            </footer>
        </OverlayShell>
    );
}

const INVITE_ASIDE = "bg-base-200 p-5 border-t lg:border-t-0 lg:border-l border-base-300 lg:overflow-y-auto";

/**
 * The host's lobby screen: section menu on the left, the section's settings in the middle,
 * and how friends join on the right (under the settings on narrow screens).
 */
const LobbySettings = ({onStart}: {onStart: () => void}) => {
    const [tab, setTab] = useState<AdminSettingsTab>('general');
    const section = ADMIN_SETTINGS_TABS.find((s) => s.value === tab)!;
    const Section = SECTIONS[tab];

    return (
        <LobbyShell
            title="Game setup"
            subtitle="You're the host. Set up the game, invite your friends, then start."
            footer={<>
                <p className="text-sm text-base-content/60">
                    Changes apply right away, and everyone in the room sees them. Text fields save when you leave them or press Enter.
                </p>
                <button className="btn btn-primary" onClick={onStart}><Play size={16} /> Start game</button>
            </>}
        >
            <div className="lg:flex-1 lg:min-h-0 grid grid-cols-1 md:grid-cols-[12rem_1fr] lg:grid-cols-[12rem_1fr_20rem]">
                <nav aria-label="Settings sections" className="border-b md:border-b-0 md:border-r border-base-300 p-2 overflow-x-auto">
                    <ul className="menu menu-horizontal md:menu-vertical flex-nowrap md:w-full gap-1 p-0 text-base">
                        {ADMIN_SETTINGS_TABS.map(({label, value, icon: Icon}) => (
                            <li key={value}>
                                <button
                                    className={cn("whitespace-nowrap", {"menu-active": value === tab})}
                                    aria-current={value === tab ? 'page' : undefined}
                                    onClick={() => setTab(value)}
                                >
                                    <Icon size={18} /> {label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <section className="p-5 sm:p-6 lg:overflow-y-auto min-w-0">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><section.icon size={22} /> {section.label}</h2>
                    <p className="text-base text-base-content/70 mb-5">{section.description}</p>
                    <Section />
                </section>

                <aside className={cn("md:col-span-2 lg:col-span-1", INVITE_ASIDE)}>
                    <InvitePanel />
                </aside>
            </div>
        </LobbyShell>
    );
}

/** What everyone but the host sees in the lobby (spectators and the TV too): the settings as the host edits them, and the invite. */
const LobbyWaiting = () => {
    // Until ROOM_STATE, the store holds local defaults: showing them would flash every value on arrival.
    const hasRoomState = useGameStore((state) => state.hasRoomState);
    return (
        <LobbyShell
            title="Waiting for the host"
            subtitle="The host is setting up the game. It starts as soon as they press Start."
            footer={<>
                <p className="text-sm text-base-content/60">Settings can change until the game starts. Changes flash as they happen.</p>
                <span className="flex items-center gap-2 text-base text-base-content/70">
                    <span className="loading loading-dots loading-sm"></span> Waiting to start
                </span>
            </>}
        >
            <div className="lg:flex-1 lg:min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_20rem]">
                <section className="p-5 sm:p-6 lg:overflow-y-auto min-w-0">
                    <h2 className="text-2xl font-bold mb-1">Game settings</h2>
                    <p className="text-base text-base-content/70 mb-5">What the host has picked so far.</p>
                    {hasRoomState ? <SettingsSummary /> : <span className="loading loading-dots loading-md"></span>}
                </section>

                <aside className={INVITE_ASIDE}>
                    <InvitePanel />
                </aside>
            </div>
        </LobbyShell>
    );
}
