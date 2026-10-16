import { useGameStore } from "../../context/game.context";
import { formatTime } from "../../utils/time";
import { Panel } from "../ui/panel";
import { TableEmptyRow } from "../ui/table";

export const News = ({className}: {className?: string}) => {
  const news = useGameStore((state) => state.news);

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
            {/* Headlines repeat (e.g. Rumor Mill), so key by position in the append-only list. */}
            {news.map((item, index) => (
              <tr key={`${item.timestamp}-${index}`}>
                <td>{formatTime(item.timestamp)}</td>
                <td>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
