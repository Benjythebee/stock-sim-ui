import { useState } from "react";


type OrderType = 'market' | 'limit';
type OrderSide = 'buy' | 'sell';

interface Order {
  id: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  timestamp: Date;
  status: string;
}

export const OrderHistory: React.FC = () => {
  // Mock order history
  const [orders] = useState<Order[]>([
    {
      id: '1',
      side: 'buy',
      type: 'limit',
      price: 50200,
      amount: 0.5,
      timestamp: new Date('2025-10-20T10:30:00'),
      status: 'Filled'
    },
    {
      id: '2',
      side: 'sell',
      type: 'market',
      price: 50220,
      amount: 0.3,
      timestamp: new Date('2025-10-20T09:15:00'),
      status: 'Filled'
    },
  ]);
  
    return ( <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">Order History</h2>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Side</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.timestamp.toLocaleTimeString()}</td>
                        <td>
                          <span className={`badge ${order.side === 'buy' ? 'badge-success' : 'badge-error'}`}>
                            {order.side.toUpperCase()}
                          </span>
                        </td>
                        <td>{order.type}</td>
                        <td>${order.price.toLocaleString()}</td>
                        <td>{order.amount}</td>
                        <td>
                          <span className="badge badge-outline">{order.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>)
}