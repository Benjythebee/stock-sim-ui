import { Check, Copy, ExternalLink as ExternalLinkIcon, Tv } from "lucide-react";
import { useWebsocketContext } from "../../context/ws.context";
import { CastButton } from "../cast/button";
import { ExternalLink } from "../ui/external-link";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

/** How to put the game on a big screen: Chromecast, or the spectator page in any browser. Not a setting. */
export const CastSettings = () => {
    const {room} = useWebsocketContext();
    const {copied, copy} = useCopyToClipboard();

    if (!room) return null;
    const spectateUrl = `${window.location.origin}/${room}/spectate`;

    return (
        <div className="w-full mb-2 flex flex-col gap-3 text-base">
            <p className="text-base-content/80">
                The TV shows the live chart, order book and news, without anyone's cash or shares.
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
                    <button className="btn btn-sm join-item" onClick={() => copy(spectateUrl)} aria-label="Copy spectator link" title="Copy">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <ExternalLink className="btn btn-sm join-item" href={spectateUrl} aria-label="Open spectator view" title="Open">
                        <ExternalLinkIcon size={16} />
                    </ExternalLink>
                </div>
            </div>
        </div>
    );
};
