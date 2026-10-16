import { AdminModal } from "../Admin";
import { ConclusionModal } from "../Conclusion";
import { Backdrop } from "../ui/overlay-card";
import { useMarketOpen } from "../../hooks/useMarketStatus";

/** What covers a room page while the market is closed: the lobby/paused card or the leaderboard, over a dimmed page. */
export const RoomOverlays = () => {
  const marketOpen = useMarketOpen();
  return (
    <>
      {!marketOpen && <Backdrop />}
      <AdminModal />
      <ConclusionModal />
    </>
  );
};
