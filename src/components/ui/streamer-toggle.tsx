import { useStreamerMode, useStreamerStore } from "../../context/streamer.store";
import { HelpButton } from "./help-tooltip";
import { Toggle } from "./toggle";

/** The streamer mode switch: hides the room code on screen. */
export const StreamerToggle = () => {
    const streamerMode = useStreamerMode();
    const setStreamerMode = useStreamerStore((state) => state.setStreamerMode);
    return (
        <div className="flex items-center gap-1">
            <Toggle label="Streamer mode" checked={streamerMode} onChange={setStreamerMode} />
            <HelpButton label="Streamer mode">Hides the room code on screen, so your viewers can't join. The copy buttons still copy it. It comes on by itself in a room where someone else has it on.</HelpButton>
        </div>
    );
};
