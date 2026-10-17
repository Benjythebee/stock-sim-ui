import { useState } from "react";
import { useGameStore } from "../../context/game.context";
import { cn } from "../../utils/cn";
import { formatTime } from "../../utils/time";
import { Panel } from "../ui/panel";
import { TableEmptyRow } from "../ui/table";

export const News = ({className}: {className?: string}) => {
  const news = useGameStore((state) => state.news);
  // Headlines already there when the panel mounted don't flash; only ones that arrive afterwards do.
  const [seenOnMount, setSeenOnMount] = useState(news.length);
  if (news.length < seenOnMount) setSeenOnMount(news.length); // the list was cleared (lobby rebuilt)

  return (
    <Panel className={className} title="News">
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Time</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {news.length === 0 && <TableEmptyRow colSpan={2}>No news available</TableEmptyRow>}
            {/* Newest first. Headlines repeat (e.g. Rumor Mill), so key by position in the append-only list:
                existing rows keep their key, and only the new top row mounts (and flashes). */}
            {news.map((item, index) => (
              <tr key={`${item.timestamp}-${index}`} className={cn({"animate-news-flash": index >= seenOnMount})}>
                <td>{formatTime(item.timestamp)}</td>
                <td>{item.description}</td>
              </tr>
            )).reverse()}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
