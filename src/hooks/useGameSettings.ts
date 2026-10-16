import { useGameStore, type GameSettings } from "../context/game.context";
import { useGameActions } from "./useGameActions";

/** The room's settings and the host's way to change them (`marketVolatility` is sent as a percentage). */
export const useGameSettings = (): [GameSettings, (settings: Partial<GameSettings>) => void] => {
    const settings = useGameStore((state) => state.gameSettings);
    const { updateSettings } = useGameActions();
    return [settings, updateSettings];
};
