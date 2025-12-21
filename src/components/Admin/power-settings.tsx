import type { GameSettings } from "../../context/game.context"


export const PowerSettings = ({setGameSettings}:{ setGameSettings: (settings: Partial<GameSettings>) => void}) => {

    return (
        <>
        <div className="form-control w-full mb-2">
            <div className="alert alert-info">Power settings coming soon...</div>
        </div>
        </>
    )
}