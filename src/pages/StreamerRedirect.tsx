import { Navigate } from "react-router";
import { maskedRoomPath } from "../hooks/useMaskedRoomUrl";

/**
 * STREAMER_PATH: what the address bar shows for a room in streamer mode. A refresh or Back lands here
 * and goes back to the room this tab was in; anyone else (a viewer typing the URL) gets Home.
 */
export const StreamerRedirect = () => <Navigate to={maskedRoomPath() ?? "/"} replace />;
