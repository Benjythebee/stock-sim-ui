import { useGameStore } from "../../context/game.context";
import { money } from "../../utils/math";
import { formatTime } from "../../utils/time";
import { Panel } from "../ui/panel";
import { TableEmptyRow } from "../ui/table";
import { SideBadge } from "./side-badge";
import { useGameActions } from "../../hooks/useGameActions";
import { useCanTrade } from "../../hooks/useMarketStatus";

/** Our resting limit orders and how much of each is still waiting to fill. */
export const CurrentOrders: React.FC<{ className?: string }> = ({ className }) => {
  const orders = useGameStore((state) => state.openOrders);
  // The server only accepts cancels while the game runs and our trading isn't locked.
  const canCancel = useCanTrade();
  const { cancelOrder, cancelAllOrders } = useGameActions();

  return (
    <Panel
      className={className}
      title={<>
        Current Orders
        {orders.length > 0 && <span className="badge badge-sm badge-neutral">{orders.length}</span>}
      </>}
      actions={orders.length > 1 && (
        <button className="btn btn-xs btn-ghost" disabled={!canCancel} onClick={cancelAllOrders}>
          Cancel all
        </button>
      )}
    >
      <div className="overflow-auto max-h-72">
        <table className="table table-sm table-pin-rows">
          <thead>
            <tr>
              <th className="hidden sm:table-cell">Time</th>
              <th>Side</th>
              <th className="text-right">Price</th>
              <th>Filled</th>
              <th className="text-right">Remaining</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && <TableEmptyRow colSpan={6}>No open orders</TableEmptyRow>}
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="hidden sm:table-cell">{formatTime(order.time)}</td>
                <td><SideBadge action={order.action} /></td>
                <td className="text-right tabular-nums">${money(order.price ?? 0)}</td>
                <td>
                  <div className="flex items-center gap-2" title={`${order.filled} of ${order.quantity} filled`}>
                    <progress
                      className={order.action === 'BUY' ? 'progress w-14 progress-success' : 'progress w-14 progress-error'}
                      value={order.filled}
                      max={order.quantity}
                    />
                    <span className="tabular-nums text-xs opacity-70">{order.filled}/{order.quantity}</span>
                  </div>
                </td>
                <td className="text-right tabular-nums font-semibold">{order.quantity - order.filled}</td>
                <td className="text-right">
                  <button
                    className="btn btn-xs btn-ghost btn-square"
                    aria-label="Cancel order"
                    title="Cancel order"
                    disabled={!canCancel}
                    onClick={() => cancelOrder(order.id)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
