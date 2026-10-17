import { Repeat } from "lucide-react";
import { useGameStore } from "../../context/game.context";
import { useGameActions } from "../../hooks/useGameActions";
import { useCanTrade } from "../../hooks/useMarketStatus";
import type { OrderInfo, OrderStatus } from "../../types/messages";
import { money } from "../../utils/math";
import { formatTime } from "../../utils/time";
import { Panel } from "../ui/panel";
import { TableEmptyRow } from "../ui/table";
import { SideBadge } from "./side-badge";

const STATUS: Record<Exclude<OrderStatus, 'open'>, { label: string; className: string }> = {
  filled: { label: 'Filled', className: 'badge-success badge-soft' },
  partial: { label: 'Partial', className: 'badge-warning badge-soft' },
  cancelled: { label: 'Cancelled', className: 'badge-ghost' },
};

const statusOf = (order: OrderInfo) => STATUS[order.status as Exclude<OrderStatus, 'open'>] ?? STATUS.cancelled;

/** Our finished orders: filled, partially filled market orders, and cancels. Newest first. */
export const OrderHistory: React.FC<{ className?: string }> = ({ className }) => {
  const orders = useGameStore((state) => state.orderHistory);
  const limitOrdersDisabled = useGameStore((state) => !!state.gameSettings.disableLimitOrders);
  const canTrade = useCanTrade();
  const { placeOrder } = useGameActions();

  return (
    <Panel className={className} title="Order History">
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && <TableEmptyRow colSpan={7}>No orders yet</TableEmptyRow>}
            {orders.map((order) => {
              const status = statusOf(order);
              return (
                <tr key={order.id}>
                  <td className="hidden sm:table-cell">{formatTime(order.updated)}</td>
                  <td><SideBadge action={order.action} /></td>
                  <td className="whitespace-nowrap">
                    {order.orderType === 'LIMIT' ? <>Limit <span className="opacity-60">@ ${money(order.price ?? 0)}</span></> : 'Market'}
                  </td>
                  <td className="text-right tabular-nums">{order.filled}/{order.quantity}</td>
                  <td className="text-right tabular-nums">{order.avgPrice === null ? '—' : `$${money(order.avgPrice)}`}</td>
                  <td><span className={`badge badge-sm ${status.className}`}>{status.label}</span></td>
                  <td className="text-right">
                    <button
                      className="btn btn-xs btn-ghost btn-square"
                      aria-label="Repeat order"
                      title="Place the same order again"
                      disabled={!canTrade || (order.orderType === 'LIMIT' && limitOrdersDisabled)}
                      onClick={() => placeOrder(order.action, order.orderType, order.quantity, order.price ?? undefined)}
                    >
                      <Repeat className="size-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
