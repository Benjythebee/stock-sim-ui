import { useEffect, useState } from "react";
import { usePriceStore } from "../../context/stock.store";
import { MarketStateIndicator } from "./MarketClose";
import { HackedOverlay } from "./hacked.overlay";
import { useGameStore } from "../../context/game.context";
import { cn } from "../../utils/cn";
import { Field } from "../ui/field";
import { useGameActions, type OrderKind, type OrderSide } from "../../hooks/useGameActions";

export const TradingCard: React.FC = () => {
  const { placeOrder } = useGameActions();
  const tradingDisabled = useGameStore((state) => state.tradingDisabled);
  const shares = useGameStore((state) => state.shares);
  const cash = useGameStore((state) => state.cash);
  const price = usePriceStore((state) => state.price);
  const limitOrdersDisabled = useGameStore((state) => !!state.gameSettings.disableLimitOrders);
  const [pickedOrderType, setOrderType] = useState<OrderKind>("LIMIT");
  // The host can turn limit orders off for the game (the server rejects them then).
  const orderType = limitOrdersDisabled ? "MARKET" : pickedOrderType;
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const quantity = Number(amount);
  const noAmount = !amount || quantity <= 0;
  const disabledSell = tradingDisabled || shares <= 0 || noAmount || quantity > shares;
  const disabledBuy = tradingDisabled || noAmount || quantity * (orderType === "LIMIT" ? Number(limitPrice) : price) > cash;

  const handleOrder = (side: OrderSide) => {
    if (noAmount || tradingDisabled) return;
    placeOrder(side, orderType, quantity, Number(limitPrice));
  };

  // Prefill the limit price with the current price, and fill it in once the first price arrives
  // (the card can mount before it, when the price is still 0).
  const hasPrice = price > 0;
  useEffect(() => {
    if (orderType === "LIMIT" && hasPrice) {
      setLimitPrice(usePriceStore.getState().price.toString());
    }
  }, [orderType, hasPrice]);

  const orderTypeButton = (type: OrderKind) => cn("btn join-item flex-1", orderType === type ? "btn-primary" : "btn-outline");

  return (
    // tradingDisabled only comes from a DDoS (the server's only trading lock), so the form looks hacked.
    <div className={cn("card bg-base-200", { hacked: tradingDisabled })}>
      {tradingDisabled && <HackedOverlay />}
      <div className="card-body">
        <MarketStateIndicator />
        <h2 className="card-title">{tradingDisabled ? "Pl4c3 0rd3r" : "Place Order"}</h2>

        <Field label="Order Type" bold={false}>
          <div className="join w-full">
            <button
              className={orderTypeButton("LIMIT")}
              onClick={() => setOrderType("LIMIT")}
              disabled={limitOrdersDisabled}
              title={limitOrdersDisabled ? "The host disabled limit orders for this game" : undefined}
            >
              Limit
            </button>
            <button className={orderTypeButton("MARKET")} onClick={() => setOrderType("MARKET")}>
              Market
            </button>
          </div>
        </Field>

        {/* Price Input (only for limit orders) */}
        {orderType === "LIMIT" && (
          <Field label="Price" bold={false}>
            <input
              type="number"
              placeholder="0.00"
              min={0.01}
              step={0.01}
              className="input input-bordered w-full"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
            />
          </Field>
        )}

        <Field label="Amount" bold={false}>
          {/* Whole shares only: the server floors quantities, so 0.5 would become 0. */}
          <input
            type="number"
            placeholder="0"
            min={1}
            step={1}
            className="input input-bordered w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[.,].*$/, ""))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button className="btn btn-success" disabled={disabledBuy} onClick={() => handleOrder("BUY")}>
            Buy
          </button>
          <button className="btn btn-error" disabled={disabledSell} onClick={() => handleOrder("SELL")}>
            Sell
          </button>
        </div>
      </div>
    </div>
  );
};
