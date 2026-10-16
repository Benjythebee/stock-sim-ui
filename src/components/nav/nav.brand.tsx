import { Link } from "react-router";
import { ThemeController } from "../ThemeController";

/** The navbar's left side: the logo (home link) and the theme switch. */
export const NavBrand = () => (
    <div className="navbar-start w-auto shrink-0">
        <Link className="btn btn-ghost px-1 sm:px-2" to="/" aria-label="Tendies Brawl home">
            <img src="/tendies-brawl-icon.webp" alt="Tendies Brawl" width={48} height={48} className="w-10 h-10 sm:w-12 sm:h-12"/>
        </Link>
        <ThemeController />
    </div>
);
