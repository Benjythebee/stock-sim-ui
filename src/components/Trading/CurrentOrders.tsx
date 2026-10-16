import { useShallow } from "zustand/shallow";
import { useGameStore } from "../../context/game.context";
import { useWebsocketContext } from "../../context/ws.context";
import { MessageType, ORDER_CANCEL_ALL, type OrderInfo } from "../../types/messages";
import { money } from "../../utils/math";

export const SideBadge: React.FC<{ action: OrderInfo['action'] }> = ({ action }) => (
  <span className={`badge badge-sm ${action === 'BUY' ? 'badge-success' : 'badge-error'}`}>{action}</span>
);

/** Our resting limit orders and how much of each is still waiting to fill. */
export const CurrentOrders: React.FC<{ className?: string }> = ({ className }) => {
  const { sendMessage } = useWebsocketContext();
  const { orders, canCancel } = useGameStore(useShallow((state) => ({
    orders: state.openOrders,
    // The server only accepts cancels while the game runs and our trading isn't locked.
    canCancel: !state.paused && !state.ended && !state.tradingDisabled,
  })));

  const cancel = (id: number) => sendMessage({ type: MessageType.ORDER_CANCEL, id });

  return (
    <div className={`card bg-base-200 ${className}`}>
      <div className="card-body">
        <div className="flex items-center justify-between gap-2">
          <h2 className="card-title">
            Current Orders
            {orders.length > 0 && <span className="badge badge-sm badge-neutral">{orders.length}</span>}
          </h2>
          {orders.length > 1 && (
            <button className="btn btn-xs btn-ghost" disabled={!canCancel} onClick={() => cancel(ORDER_CANCEL_ALL)}>
              Cancel all
            </button>
          )}
        </div>
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
              {orders.length === 0 && <tr><td colSpan={6} className="text-center opacity-60">No open orders</td></tr>}
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="hidden sm:table-cell">{new Date(order.time).toLocaleTimeString()}</td>
                  <td><SideBadge action={order.action} /></td>
                  <td className="text-right tabular-nums">${money(order.price ?? 0)}</td>
                  <td>
                    <div className="flex items-center gap-2" title={`${order.filled} of ${order.quantity} filled`}>
                      <progress
                        className={`progress w-14 ${order.action === 'BUY' ? 'progress-success' : 'progress-error'}`}
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
                      onClick={() => cancel(order.id)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
