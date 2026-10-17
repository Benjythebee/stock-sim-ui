import { useEffect } from "react";
import { useStreamerStore } from "../context/streamer.store";
import { useGameActions } from "./useGameActions";
import { useRoomConnection } from "./useRoomConnection";

/**
 * Tells the room whether our own streamer mode is on, on every (re)connect and whenever it changes, so
 * everyone else gets it on by default (PLAYERS.streamer). Only our own choice: a room default we got
 * from someone else isn't passed on, or it would stay on after they turn theirs off.
 */
export const useReportStreamerMode = () => {
    const { connected, isSpectate } = useRoomConnection();
    const streamerMode = useStreamerStore((state) => state.streamerMode);
    const { reportStreamerMode } = useGameActions();

    useEffect(() => {
        if (connected && !isSpectate) reportStreamerMode(streamerMode);
    }, [connected, isSpectate, streamerMode, reportStreamerMode]);
};
