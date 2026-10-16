import { useState } from "react";
import { Check, Copy, ExternalLink, Tv } from "lucide-react";
import { useWebsocketContext } from "../../context/ws.context";
import { CastButton } from "../cast/button";
import { useToast } from "../Toast/useToast";

/** How to put the game on a big screen: Chromecast, or the spectator page in any browser. Not a setting. */
export const CastSettings = () => {
    const {room} = useWebsocketContext();
    const {addToast} = useToast();
    const [copied, setCopied] = useState(false);

    if (!room) return null;
    const spectateUrl = `${window.location.origin}/${room}/spectate`;

    const copy = async () => {
        try {
            // Only exists in a secure context (https or localhost), so not when friends join over LAN http.
            await navigator.clipboard.writeText(spectateUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            addToast({type: 'warning', title: 'Copy failed', description: 'Select the link and copy it by hand.'});
        }
    };

    return (
        <div className="w-full mb-2 flex flex-col gap-3 text-sm">
            <p className="text-base-content/80">
                Put the market on a TV so the whole room can watch: the live chart, order book and news, without anyone's cash or shares.
            </p>

            <div className="flex flex-col gap-1">
                <span className="font-semibold flex items-center gap-2"><Tv size={16} /> Chromecast or Google TV</span>
                <p className="text-base-content/70">
                    In Chrome (desktop or Android), press the cast button and pick your TV. It's also in the top bar during the game. Other browsers don't show it.
                </p>
                <CastButton room={room} className="btn btn-primary btn-sm self-start">Cast this room</CastButton>
            </div>

            <div className="flex flex-col gap-1">
                <span className="font-semibold">Any other screen</span>
                <p className="text-base-content/70">
                    Open the spectator link in the TV's browser, or on a laptop plugged into it. It also works on iPhone, Safari and Firefox, where casting isn't available.
                </p>
                <div className="join w-full">
                    <input
                        className="input input-bordered input-sm join-item flex-1 min-w-0"
                        readOnly
                        value={spectateUrl}
                        aria-label="Spectator link"
                        onFocus={(e) => e.target.select()}
                    />
                    <button className="btn btn-sm join-item" onClick={copy} aria-label="Copy spectator link" title="Copy">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <a className="btn btn-sm join-item" href={spectateUrl} target="_blank" rel="noopener noreferrer" aria-label="Open spectator view" title="Open">
                        <ExternalLink size={16} />
                    </a>
                </div>
            </div>
        </div>
    );
};
