import { useState } from "react";
import { useGameStore } from "../../context/game.context";
import { useShallow } from "zustand/shallow";
import { ADMIN_SETTINGS_TABS, type AdminSettingsTab } from "./tabs";
import { BotsSettings } from "./bots-settings";
import { GeneralSettings } from "./general-settings";
import { GameplaySettings } from "./gameplay-settings";
import { MarketSettings } from "./market-settings";
import { PowerSettings } from "./power-settings";
import { CastSettings } from "./cast-settings";
import { OverlayCard } from "../ui/overlay-card";
import { Tabs } from "../ui/tabs";
import { useGameActions } from "../../hooks/useGameActions";

export const AdminModal = () => {
    const {paused,started,ended,isAdmin, onlineUsers} = useGameStore(useShallow((state) => ({paused: state.paused, started: state.started, ended: state.ended, isAdmin: state.isAdmin, onlineUsers: state.onlineUsers})));
    const {togglePause} = useGameActions();
    const [tab, setTab] = useState<AdminSettingsTab>('general');

    // Settings can only change in the lobby: the server rejects ADMIN_SETTINGS once the game has started.
    if(ended) return null;
    if(isAdmin && !started){
        return (
            <OverlayCard
                title="Admin Settings"
                subtitle="Modify game settings below"
                actions={<button className="btn btn-primary" onClick={togglePause}>Save & Start</button>}
            >
                <Tabs tabs={ADMIN_SETTINGS_TABS} value={tab} onChange={setTab} />

                {tab === 'general' && <GeneralSettings />}
                {tab === 'gameplay' && <GameplaySettings />}
                {tab === 'market' && <MarketSettings />}
                {tab === 'bots' && <BotsSettings />}
                {tab === 'powers' && <PowerSettings />}
                {tab === 'cast' && <CastSettings />}

                <p className="text-center text-base-content/70 mb-6">
                    There are currently {onlineUsers} clients connected.
                </p>
            </OverlayCard>
        );
    }
    if (paused){
        return (
            <OverlayCard
                title={started ? 'Game Paused' : 'Waiting to start'}
                actions={isAdmin && <button className="btn btn-primary" onClick={togglePause}>Resume</button>}
            >
                {!isAdmin && (
                    <p className="text-center text-base-content/70 mb-6">
                        Wait for your admin to {started ? 'resume' : 'start'} the game.
                    </p>
                )}
            </OverlayCard>
        );
    }
    return null;
}
