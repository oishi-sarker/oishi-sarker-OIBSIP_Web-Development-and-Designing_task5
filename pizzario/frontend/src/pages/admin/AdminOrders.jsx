import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi } from '../../api';
import { formatINR, formatDate, STATUS_LABELS } from '../../utils/format.js';
import StatusBadge, { StatusTimeline } from '../../components/StatusBadge.jsx';
import { useSocket } from '../../context/SocketContext.jsx';

const STATUS_FILTERS = ['all', 'pending', 'received', 'in_kitchen', 'sent_to_delivery', 'delivered', 'cancelled'];

const NEXT_STATUS = {
  pending: 'received',
  received: 'in_kitchen',
  in_kitchen: 'sent_to_delivery',
  sent_to_delivery: 'delivered',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const { latestEvent } = useSocket();

  const load = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await orderApi.all(params);
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter, latestEvent]);

  const handleAdvance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) {
      toast('Order is already delivered.', { icon: 'ℹ️' });
      return;
    }
    try {
      await orderApi.updateStatus(order._id, next);
      toast.success(`Marked as ${STATUS_LABELS[next]}`);
      load();
      if (selected?._id === order._id) {
        const { data: updated } = await orderApi.get(order._id);
        setSelected(updated);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCancel = async (order) => {
    if (!confirm('Cancel this order? This cannot be undone.')) return;
    try {
      await orderApi.updateStatus(order._id, 'cancelled', 'Cancelled by admin');
      toast.success('Order cancelled');
      load();
      if (selected?._id === order._id) {
        const { data: updated } = await orderApi.get(order._id);
        setSelected(updated);
      }
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-pulse h-96 bg-char-700 rounded-lg" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-4xl text-char-50 mb-6">Orders Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              filter === f ? 'bg-ember-500 text-char-950 shadow-md' : 'bg-char-800 text-char-200 hover:bg-char-700 border border-char-700'
            }`}
          >
            {f === 'all' ? 'All Orders' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Orders table */}
      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <h3 className="text-xl text-char-50">No orders found</h3>
          <p className="text-char-300 mt-1">Try a different filter or check back later.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-char-900 text-char-400 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3">Order ID</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Items</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Payment</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Time</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o._id}
                    className="border-t border-char-700 hover:bg-char-900 cursor-pointer"
                    onClick={() => setSelected(o)}
                  >
                    <td className="px-4 py-3 font-mono text-xs">#{o._id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-char-400">{o.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {o.items.length} item{o.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatINR(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${o.payment.status === 'paid' ? 'bg-green-900/40 text-green-300' : 'bg-yellow-900/40 text-yellow-300'}`}>
                        {o.payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-xs text-char-400">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {NEXT_STATUS[o.status] && o.payment.status === 'paid' && (
                        <button
                          onClick={() => handleAdvance(o)}
                          className="text-xs px-3 py-1.5 bg-ember-500 text-char-950 rounded hover:bg-ember-400 font-semibold mr-1"
                        >
                          → {STATUS_LABELS[NEXT_STATUS[o.status]]}
                        </button>
                      )}
                      {o.status !== 'delivered' && o.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(o)}
                          className="text-xs px-2 py-1.5 bg-red-950 text-red-400 rounded hover:bg-red-900 font-semibold"
                        >Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-char-800 border border-char-700 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl text-char-50">Order #{selected._id.slice(-6).toUpperCase()}</h3>
                <p className="text-sm text-char-400">{formatDate(selected.createdAt)}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-char-50 mb-1">Customer</h4>
                <p className="text-sm">{selected.user?.name}</p>
                <p className="text-sm text-char-300">{selected.user?.email}</p>
              </div>
              <div>
                <h4 className="font-semibold text-char-50 mb-1">Delivery Address</h4>
                <p className="text-sm">{selected.deliveryAddress?.name}</p>
                <p className="text-sm text-char-300">{selected.deliveryAddress?.line1}</p>
                <p className="text-sm text-char-300">{selected.deliveryAddress?.city}, {selected.deliveryAddress?.state} {selected.deliveryAddress?.pincode}</p>
                <p className="text-sm text-char-300">📞 {selected.deliveryAddress?.phone}</p>
              </div>
            </div>

            <h4 className="font-semibold text-char-50 mb-2">Items</h4>
            <div className="space-y-2 mb-4">
              {selected.items.map((item, i) => (
                <div key={i} className="text-sm bg-char-900 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.quantity}× {item.name} <span className="text-xs text-char-400 capitalize">({item.size})</span></span>
                    <span className="font-semibold">{formatINR(item.price * item.quantity)}</span>
                  </div>
                  {item.isCustom && item.customization && (
                    <div className="text-xs text-char-400 mt-1">
                      🍞 {item.customization.base} • 🍅 {item.customization.sauce} • 🧀 {item.customization.cheese}
                      {item.customization.veggies?.length > 0 && ` • 🥬 ${item.customization.veggies.join(', ')}`}
                      {item.customization.meat?.length > 0 && ` • 🍖 ${item.customization.meat.join(', ')}`}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-between font-bold border-t border-char-700 pt-2">
                <span>Total</span>
                <span className="text-ember-400">{formatINR(selected.total)}</span>
              </div>
            </div>

            <h4 className="font-semibold text-char-50 mb-2">Status History</h4>
            <StatusTimeline history={selected.statusHistory} current={selected.status} />

            <div className="flex gap-2 mt-6 pt-4 border-t border-char-700">
              {NEXT_STATUS[selected.status] && selected.payment.status === 'paid' && (
                <button
                  onClick={() => handleAdvance(selected)}
                  className="btn-primary flex-1"
                >
                  → Mark as {STATUS_LABELS[NEXT_STATUS[selected.status]]}
                </button>
              )}
              {selected.status !== 'delivered' && selected.status !== 'cancelled' && (
                <button onClick={() => handleCancel(selected)} className="btn-secondary text-red-400">Cancel Order</button>
              )}
              <button onClick={() => setSelected(null)} className="btn-ghost">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
