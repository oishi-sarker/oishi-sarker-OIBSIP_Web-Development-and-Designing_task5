import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderApi } from '../api';
import { useSocket } from '../context/SocketContext.jsx';
import { formatINR, formatDate } from '../utils/format.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { latestEvent } = useSocket();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await orderApi.myOrders();
        setOrders(data);
      } catch (err) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [latestEvent]); // refetch on socket event

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-char-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-4xl text-char-50 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-3">📦</div>
          <h3 className="text-xl text-char-50">No orders yet</h3>
          <p className="text-char-300 mt-2 mb-4">When you place an order, it will show up here.</p>
          <Link to="/dashboard" className="btn-primary">Browse Pizzas</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className="card p-4 hover:shadow-md transition-shadow block">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs text-char-400">Order ID</div>
                  <div className="font-mono text-sm font-semibold">#{order._id.slice(-6).toUpperCase()}</div>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="space-y-1 mb-3">
                {order.items.slice(0, 2).map((item, i) => (
                  <div key={i} className="text-sm text-char-200">
                    {item.quantity}× {item.name} <span className="text-char-500 capitalize">({item.size})</span>
                    {item.isCustom && <span className="ml-1 text-xs text-ember-400">[Custom]</span>}
                  </div>
                ))}
                {order.items.length > 2 && <div className="text-xs text-char-400">+ {order.items.length - 2} more</div>}
              </div>
              <div className="flex items-center justify-between text-sm border-t border-char-700 pt-3">
                <div>
                  <span className="text-char-400">Placed: </span>
                  <span className="text-char-200">{formatDate(order.createdAt)}</span>
                </div>
                <div className="font-bold text-ember-400">{formatINR(order.total)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
