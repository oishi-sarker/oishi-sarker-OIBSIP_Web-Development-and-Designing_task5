import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderApi, inventoryApi } from '../../api';
import { formatINR, formatDate } from '../../utils/format.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useSocket } from '../../context/SocketContext.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, pending: 0, lowStock: 0 });
  const [recent, setRecent] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const { latestEvent } = useSocket();

  const load = async () => {
    try {
      const [ordersRes, invRes] = await Promise.all([orderApi.all(), inventoryApi.list()]);
      const orders = ordersRes.data;
      const inventory = invRes.data;
      const revenue = orders.filter((o) => o.payment.status === 'paid').reduce((s, o) => s + o.total, 0);
      const pending = orders.filter((o) => ['pending', 'received', 'in_kitchen'].includes(o.status)).length;

      const low = [];
      inventory.forEach((inv) => {
        inv.items.forEach((item) => {
          if (item.stock <= item.threshold) low.push({ category: inv.category, ...(item.toObject ? item.toObject() : item) });
        });
      });

      setStats({ totalOrders: orders.length, revenue, pending, lowStock: low.length });
      setRecent(orders.slice(0, 5));
      setLowStock(low);
    } catch (err) {
      toast.error('Failed to load dashboard');
    }
  };

  useEffect(() => { load(); }, [latestEvent]);

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'bg-blue-600' },
    { label: 'Revenue (Paid)', value: formatINR(stats.revenue), icon: '💰', color: 'bg-green-600' },
    { label: 'Active Orders', value: stats.pending, icon: '🔥', color: 'bg-ember-500' },
    { label: 'Low Stock Items', value: stats.lowStock, icon: '⚠️', color: 'bg-red-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl text-char-50">Admin Dashboard</h1>
          <p className="text-char-300 mt-1">Monitor orders, inventory, and revenue.</p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <Link to="/admin/inventory" className="btn-secondary">Manage Inventory</Link>
          <Link to="/admin/orders" className="btn-primary">View All Orders</Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <div className="text-2xl font-bold text-char-50">{s.value}</div>
            <div className="text-xs text-char-400 uppercase tracking-wide mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-char-50">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-ember-400 hover:underline">View all →</Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-char-400 text-sm py-4 text-center">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-char-700 text-char-400 uppercase text-xs">
                      <th className="text-left py-2">Order ID</th>
                      <th className="text-left py-2">Customer</th>
                      <th className="text-left py-2">Total</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((o) => (
                      <tr key={o._id} className="border-b border-char-700 hover:bg-char-900">
                        <td className="py-2 font-mono text-xs">#{o._id.slice(-6).toUpperCase()}</td>
                        <td className="py-2">{o.user?.name || 'Unknown'}</td>
                        <td className="py-2 font-semibold">{formatINR(o.total)}</td>
                        <td className="py-2"><StatusBadge status={o.status} /></td>
                        <td className="py-2 text-xs text-char-400">{formatDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div>
          <div className="card p-5">
            <h2 className="text-xl text-char-50 mb-4">⚠️ Low Stock</h2>
            {lowStock.length === 0 ? (
              <p className="text-char-400 text-sm py-4 text-center">All items well stocked ✅</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lowStock.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-red-900/30 border border-red-800/40 rounded-lg">
                    <div>
                      <div className="text-sm font-medium capitalize text-char-100">{item.category}: {item.name}</div>
                      <div className="text-xs text-char-400">Threshold: {item.threshold}</div>
                    </div>
                    <div className="text-red-400 font-bold">{item.stock}</div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/admin/inventory" className="btn-secondary w-full mt-4 text-sm">Manage Inventory →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
