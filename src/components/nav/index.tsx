import { Link } from "react-router";
import { ThemeController } from "../ThemeController";


/** Nav for the non-room pages. Layout picks it by path; leaving a room always disconnects first. */
export const HomeNavigation = () => {

    return <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
            <Link className="btn btn-ghost text-xl" to="/" aria-label="Tendies Brawl home"><img src="/tendies-brawl-icon.webp" alt="Tendies Brawl" width={48} height={48} className="w-12 h-12"/>
           </Link>
            <ThemeController />
        </div>
        <div className="navbar-center">
        </div>
        <div className="navbar-end">
            <ul className="menu menu-horizontal px-1">
                <li><Link to="/about">How to play</Link></li>
            </ul>
        </div>
    </div>
}
