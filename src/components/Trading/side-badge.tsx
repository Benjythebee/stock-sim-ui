import type { OrderInfo } from "../../types/messages";

/** BUY (green) or SELL (red). */
export const SideBadge: React.FC<{ action: OrderInfo['action'] }> = ({ action }) => (
  <span className={action === 'BUY' ? 'badge badge-sm badge-success' : 'badge badge-sm badge-error'}>{action}</span>
);
