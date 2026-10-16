import { Link } from "react-router";
import { ExternalLink } from "../ui/external-link";

export const DISCORD_URL = "https://discord.gg/VKrqQQ7UzR";
export const X_URL = "https://x.com/jybendev";

/** Site-wide footer: secondary links (About, Credits) and socials. */
export const SiteFooter = () => (
  <footer className="footer footer-center grid-flow-row sm:grid-flow-col bg-base-300 text-base-content p-6">
    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
      <Link className="link link-hover" to="/">Play</Link>
      <Link className="link link-hover" to="/about">About</Link>
      <Link className="link link-hover" to="/about#credits">Credits</Link>
      <ExternalLink className="link link-hover" href={DISCORD_URL}>Discord</ExternalLink>
      <ExternalLink className="link link-hover" href={X_URL}>Twitter / X</ExternalLink>
    </nav>
    <aside className="text-sm opacity-70">
      <p>Tendies Brawl · a multiplayer trading game with a twist</p>
    </aside>
  </footer>
);
