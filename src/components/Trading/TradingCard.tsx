import { useEffect, useState } from "react";
import { useWebsocketContext } from "../../context/ws.context";
import { MessageType } from "../../types/messages";
import { usePriceStore } from "../../context/stock.store";


export const TradingCard: React.FC = () => {
    const {sendMessage} = useWebsocketContext();
    const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
    const [limitPrice, setLimitPrice] = useState<string>('');
    const [amount, setAmount] = useState<string>('');


    const handleOrder = (side: 'buy' | 'sell') => {
        // console.log(`Placing ${side} order:`, {
        //     type: orderType,
        //     price: orderType === 'limit' ? limitPrice : 'market',
            
        //     amount
        // });

        sendMessage({type: MessageType.STOCK_ACTION, action:side=='buy'?'BUY':'SELL', orderType: orderType === 'limit' ? 'LIMIT' : 'MARKET', quantity:Number(amount),price:orderType === 'limit' ? Number(limitPrice) : 100 })

    }

    const sendShock = (target: 'intrinsic' | 'market')=>{
      sendMessage({type: MessageType.SHOCK, target })
    }

    useEffect(() => {
        if (orderType === 'limit') {
            setLimitPrice(usePriceStore.getState().price.toString());
        }
    }, [orderType]);

    return( <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">Place Order</h2>
              
              {/* Order Type Selector */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Order Type</span>
                </label>
                <div className="join w-full">
                  <button
                    className={`btn join-item flex-1 ${orderType === 'limit' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setOrderType('limit')}
                  >
                    Limit
                  </button>
                  <button
                    className={`btn join-item flex-1 ${orderType === 'market' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setOrderType('market')}
                  >
                    Market
                  </button>
                </div>
              </div>

              {/* Price Input (only for limit orders) */}
              {orderType === 'limit' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Price</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step={0.05}
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
                <input
                  type="number"
                  placeholder="0.00"
                  className="input input-bordered"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Buy/Sell Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  className="btn btn-success"
                  onClick={() => handleOrder('buy')}
                >
                  Buy
                </button>
                <button
                  className="btn btn-error"
                  onClick={() => handleOrder('sell')}
                >
                  Sell
                </button>
              </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  className="btn btn-accent btn-sm"
                  onClick={() => sendShock('intrinsic')}
                >
                  Send Value shock
                </button>
                <button
                  className="btn btn-accent btn-sm"
                  onClick={() => sendShock('market')}
                >
                  Send shock
                </button>
              </div>
            </div>
          </div>)
}