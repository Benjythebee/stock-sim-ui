import { Link } from "react-router";
import { ExternalLink } from "../ui/external-link";
import { useServerVersion } from "../../hooks/useCatalogs";
import { APP_REVISION, APP_VERSION, SUPPORTED_MOD_API } from "../../utils/version";

export const DISCORD_URL = "https://discord.gg/VKrqQQ7UzR";
export const X_URL = "https://x.com/jybendev";

/** Site-wide footer: secondary links (How to play, About, Credits) and socials. */
export const SiteFooter = () => (
  <footer className="footer footer-center grid-flow-row sm:grid-flow-col bg-base-300 text-base-content p-6">
    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
      <Link className="link link-hover" to="/">Play</Link>
      <Link className="link link-hover" to="/how-to-play">How to play</Link>
      <Link className="link link-hover" to="/about">About</Link>
      <Link className="link link-hover" to="/powers">Powers</Link>
      <Link className="link link-hover" to="/about#credits">Credits</Link>
      <ExternalLink className="link link-hover" href={DISCORD_URL}>Discord</ExternalLink>
      <ExternalLink className="link link-hover" href={X_URL}>Twitter / X</ExternalLink>
    </nav>
    <aside className="text-sm opacity-70">
      <p>Tendies Brawl · a multiplayer trading game with a twist</p>
      <Versions />
    </aside>
  </footer>
);

/**
 * App and server versions, and the mod API version: what mods can use that this app can show.
 * Warns when the server's mods need a newer app (e.g. an animation this build doesn't have).
 */
const Versions = () => {
  const { data: server } = useServerVersion();
  const outdated = server !== undefined && server.modApi > SUPPORTED_MOD_API;
  return (
    <p className="text-xs flex flex-wrap justify-center gap-x-3">
      <span title={`Built from ${APP_REVISION}`}>App v{APP_VERSION} ({APP_REVISION})</span>
      {server && <span title={`Running ${server.revision}`}>Server v{server.version} ({server.revision})</span>}
      <span title="The mod features this app can show (powers' animations, ...)">Mods API v{SUPPORTED_MOD_API}</span>
      {outdated && (
        <span className="text-warning font-semibold">
          This server's mods need mods API v{server.modApi}: refresh to update the app.
        </span>
      )}
    </p>
  );
};
