import { Check, Copy, TriangleAlert, UserPlus } from "lucide-react";
import { useWebsocketContext } from "../../context/ws.context";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import { cn } from "../../utils/cn";

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/** The room code, an invite link and how friends get in. Shown in the lobby, to the host and to waiting players. */
export const InvitePanel = ({className}: {className?: string}) => {
    const {room} = useWebsocketContext();
    const code = useCopyToClipboard();
    const link = useCopyToClipboard();

    if (!room) return null;
    const host = window.location.host;
    const inviteUrl = `${window.location.origin}/${room}`;
    // Friends on the LAN can't reach "localhost": that's their own machine.
    const isLocal = LOCAL_HOSTS.has(window.location.hostname);

    return (
        <div className={cn("flex flex-col gap-4 text-base", className)}>
            <h2 className="font-bold text-lg flex items-center gap-2"><UserPlus size={20} /> Invite players</h2>

            <div className="rounded-box bg-base-100 border border-base-300 p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <div className="text-sm uppercase tracking-wide text-base-content/60">Room code</div>
                    <div className="font-mono text-3xl font-bold tracking-[0.2em] text-primary truncate">{room}</div>
                </div>
                <button className="btn btn-ghost btn-sm btn-square" onClick={() => code.copy(room)} aria-label="Copy room code" title="Copy code">
                    {code.copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
            </div>

            <div className="flex flex-col gap-1">
                <span className="font-semibold">How to join</span>
                <ol className="list-decimal list-outside ml-5 flex flex-col gap-1 text-base-content/80">
                    <li>Open <span className="font-mono">{host}</span> on a phone or computer.</li>
                    <li>Type a name and the room code <span className="font-mono font-semibold">{room}</span>, then press Join.</li>
                    <li>Or skip both steps: send them the link below.</li>
                </ol>
            </div>

            <div className="join w-full">
                <input
                    className="input input-bordered input-sm join-item flex-1 min-w-0"
                    readOnly
                    value={inviteUrl}
                    aria-label="Invite link"
                    onFocus={(e) => e.target.select()}
                />
                <button className="btn btn-primary btn-sm join-item" onClick={() => link.copy(inviteUrl)} aria-label="Copy invite link">
                    {link.copied ? <Check size={16} /> : <Copy size={16} />}
                    {link.copied ? 'Copied' : 'Copy link'}
                </button>
            </div>

            {isLocal && (
                <div role="alert" className="alert alert-warning alert-soft text-sm items-start p-3">
                    <TriangleAlert size={16} className="shrink-0" />
                    <span>
                        This page is on <span className="font-mono">{window.location.hostname}</span>, which only works on this computer.
                        Friends on your Wi-Fi need your computer's IP address instead, e.g. <span className="font-mono">http://192.168.x.x:{window.location.port || 80}/{room}</span>.
                    </span>
                </div>
            )}
        </div>
    );
};
