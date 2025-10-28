import { useShallow } from "zustand/shallow"
import { usePriceStore } from "../../context/stock.store"
import { useMemo } from "react";



export const TradingDepth = () => {
    const {asks, bids} = usePriceStore(useShallow((state) => ({asks:state.asks, bids:state.bids})));

    
    const rows = useMemo(() => {
      const sortedAsks= asks.sort((a,b) => a[0] - b[0]).slice(0,10);
      const sortedBids= bids.sort((a,b) => b[0] - a[0]).slice(0,10);
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

  return (<div className="card bg-base-200 flex-1">
            <div className="card-body">
              <h2 className="card-title">Order Book</h2>
               {asks.length > 0 && bids.length > 0 && bids[0].length && asks[0].length && <div className="divider my-1">Spread: {asksPrice - bidsPrice}</div>}
              
              {/* Asks */}
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
            </div>
          </div>)
}