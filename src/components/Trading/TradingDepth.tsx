import { cn } from "../../utils/cn";
import { useShallow } from "zustand/shallow"
import { usePriceStore } from "../../context/stock.store"
import { useMemo } from "react";
import { Panel } from "../ui/panel";



export const TradingDepth = ({className}: {className?: string}) => {
    const {asks, bids} = usePriceStore(useShallow((state) => ({asks:state.asks, bids:state.bids})));

    
    const rows = useMemo(() => {
      // Copy first: the arrays belong to the store.
      const sortedAsks= [...asks].sort((a,b) => a[0] - b[0]).slice(0,10);
      const sortedBids= [...bids].sort((a,b) => b[0] - a[0]).slice(0,10);
        const max = Math.max(sortedAsks.length, sortedBids.length);
        const combined = [];
        for (let i = 0; i < max; i++) {
            combined.push({
                ask: sortedAsks[i] || null,
                bid: sortedBids[i] || null,
            });
        }
        return combined;
    }, [asks, bids]);

    const asksPrice = rows?.[0]?.ask?.[0] || 0;
    const bidsPrice = rows?.[0]?.bid?.[0] || 0;

  return (
    <Panel className={cn("flex-1", className)} title="Order Book">
      {asks.length > 0 && bids.length > 0 && <div className="divider my-1">Spread: {(asksPrice - bidsPrice).toFixed(2)}</div>}

      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr>
              <th className="text-error">$</th>
              <th>Q.</th>
              <th></th>
              <th>Q.</th>
              <th className="text-success">$</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="hover">
                <td className="bg-error/20">{row.ask?.[0]}</td>
                <td className="bg-error/20">{row.ask?.[1]}</td>
                <td></td>
                <td className="bg-success/20">{row.bid?.[1]}</td>
                <td className="bg-success/20">{row.bid?.[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
