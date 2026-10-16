import { Link } from "react-router";
import { NavBrand } from "./nav.brand";


/** Nav for the non-room pages. Layout picks it by path; leaving a room always disconnects first. */
export const HomeNavigation = () => {

    return <div className="navbar bg-base-100 shadow-sm">
        <NavBrand />
        <div className="navbar-end flex-1">
            <ul className="menu menu-horizontal px-1">
                <li><Link to="/about">How to play</Link></li>
            </ul>
        </div>
    </div>
}
