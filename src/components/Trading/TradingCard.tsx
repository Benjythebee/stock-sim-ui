import { useEffect, useState } from "react";
import { useWebsocketContext } from "../../context/ws.context";
import { MessageType } from "../../types/messages";
import { usePriceStore } from "../../context/stock.store";
import { MarketStateIndicator } from "./MarketClose";
import { useGameStore } from "../../context/game.context";
import { cn } from "../../utils/cn";

export const TradingCard: React.FC = () => {
  const { sendMessage } = useWebsocketContext();
  const tradingDisabled = useGameStore((state) => state.tradingDisabled);
  const shares = useGameStore((state) => state.shares);
  const cash = useGameStore((state) => state.cash);
  const price = usePriceStore((state) => state.price);
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const disabledSell = tradingDisabled || shares <= 0 || !amount || Number(amount) <= 0 || Number(amount) > shares;
  const disabledBuy = tradingDisabled || !amount || Number(amount) <= 0 || Number(amount) * (orderType === "limit" ? Number(limitPrice) : price) > cash;

  const handleOrder = (side: "buy" | "sell") => {
    // console.log(`Placing ${side} order:`, {
    //     type: orderType,
    //     price: orderType === 'limit' ? limitPrice : 'market',

    //     amount
    // });

    if (!amount || Number(amount) <= 0) {
      return;
    }

    if(tradingDisabled) return

    sendMessage({
      type: MessageType.STOCK_ACTION,
      action: side == "buy" ? "BUY" : "SELL",
      orderType: orderType === "limit" ? "LIMIT" : "MARKET",
      quantity: Number(amount),
      price: orderType === "limit" ? Number(limitPrice) : 100,
    });
  };

  // Prefill the limit price with the current price, and fill it in once the first price arrives
  // (the card can mount before it, when the price is still 0).
  const hasPrice = price > 0;
  useEffect(() => {
    if (orderType === "limit" && hasPrice) {
      setLimitPrice(usePriceStore.getState().price.toString());
    }
  }, [orderType, hasPrice]);

  return (
    // tradingDisabled only comes from a DDoS (the server's only trading lock), so the form looks hacked.
    <div className={cn("card bg-base-200", { hacked: tradingDisabled })}>
      {tradingDisabled && (
        <div
          role="status"
          className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none rounded-box border border-green-500/60 bg-black/85 p-3 font-mono text-xs text-green-400 shadow-lg"
        >
          <div className="font-bold">&gt; SYSTEM COMPROMISED</div>
          <div>DDoS attack in progress.</div>
          <div>Trading offline<span className="hacked-cursor">_</span></div>
        </div>
      )}
      <div className="card-body">
        <MarketStateIndicator />
        <h2 className="card-title">{tradingDisabled ? "Pl4c3 0rd3r" : "Place Order"}</h2>

        {/* Order Type Selector */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Order Type</span>
          </label>
          <div className="join w-full">
            <button
              className={`btn join-item flex-1 ${
                orderType === "limit" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setOrderType("limit")}
            >
              Limit
            </button>
            <button
              className={`btn join-item flex-1 ${
                orderType === "market" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setOrderType("market")}
            >
              Market
            </button>
          </div>
        </div>

        {/* Price Input (only for limit orders) */}
        {orderType === "limit" && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Price</span>
            </label>
            <input
              type="number"
              placeholder="0.00"
              min={0.01}
              step={0.01}
              className="input input-bordered"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
            />
          </div>
        )}

        {/* Amount Input */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Amount</span>
          </label>
          {/* Whole shares only: the server floors quantities, so 0.5 would become 0. */}
          <input
            type="number"
            placeholder="0"
            min={1}
            step={1}
            className="input input-bordered"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[.,].*$/, ""))}
          />
        </div>

        {/* Buy/Sell Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            className="btn btn-success"
            disabled={disabledBuy}
            onClick={() => handleOrder("buy")}
          >
            Buy
          </button>
          <button className="btn btn-error" 
          disabled={disabledSell}
          onClick={() => handleOrder("sell")}>
            Sell
          </button>
        </div>
      </div>
    </div>
  );
};
