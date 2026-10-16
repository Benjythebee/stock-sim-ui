import { useGameStore } from "../../context/game.context";
import type { OrderInfo, OrderStatus } from "../../types/messages";
import { money } from "../../utils/math";
import { SideBadge } from "./CurrentOrders";

const STATUS: Record<Exclude<OrderStatus, 'open'>, { label: string; className: string }> = {
  filled: { label: 'Filled', className: 'badge-success badge-soft' },
  partial: { label: 'Partial', className: 'badge-warning badge-soft' },
  cancelled: { label: 'Cancelled', className: 'badge-ghost' },
};

const statusOf = (order: OrderInfo) => STATUS[order.status as Exclude<OrderStatus, 'open'>] ?? STATUS.cancelled;

/** Our finished orders: filled, partially filled market orders, and cancels. Newest first. */
export const OrderHistory: React.FC<{ className?: string }> = ({ className }) => {
  const orders = useGameStore((state) => state.orderHistory);

  return (
    <div className={`card bg-base-200 ${className}`}>
      <div className="card-body">
        <h2 className="card-title">Order History</h2>
        <div className="overflow-auto max-h-72">
          <table className="table table-sm table-pin-rows">
            <thead>
              <tr>
                <th className="hidden sm:table-cell">Time</th>
                <th>Side</th>
                <th>Type</th>
                <th className="text-right">Filled</th>
                <th className="text-right">Avg price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan={6} className="text-center opacity-60">No orders yet</td></tr>}
              {orders.map((order) => {
                const status = statusOf(order);
                return (
                  <tr key={order.id}>
                    <td className="hidden sm:table-cell">{new Date(order.updated).toLocaleTimeString()}</td>
                    <td><SideBadge action={order.action} /></td>
                    <td className="whitespace-nowrap">
                      {order.orderType === 'LIMIT' ? <>Limit <span className="opacity-60">@ ${money(order.price ?? 0)}</span></> : 'Market'}
                    </td>
                    <td className="text-right tabular-nums">{order.filled}/{order.quantity}</td>
                    <td className="text-right tabular-nums">{order.avgPrice === null ? '—' : `$${money(order.avgPrice)}`}</td>
                    <td><span className={`badge badge-sm ${status.className}`}>{status.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
