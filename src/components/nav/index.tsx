import { useNavigate } from "react-router";
import { useWebsocketContext } from "../../context/ws.context";
import { ThemeController } from "../ThemeController";


export const HomeNavigation = () => {

    const {status,room} = useWebsocketContext();
    const navigate = useNavigate();

    if(status === 'CONNECTED' && (room && room!=='')){
        return null;
    }


    return <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
            <a className="btn btn-ghost text-xl" href="/"><img src="/stonk-lord_alpha.webp" alt="Stonk Lords Logo" className="w-12 h-12"/>
           </a>
            <ThemeController />
        </div>
        <div className="navbar-center">
        </div>
        <div className="navbar-end">
            <ul className="menu menu-horizontal px-1">
                <li><a onClick={() => navigate("/about")}>About</a></li>
            </ul>
        </div>
    </div>
}
