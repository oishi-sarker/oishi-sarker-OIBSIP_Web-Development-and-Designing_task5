import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { inventoryApi } from '../../api';
import { formatINR } from '../../utils/format.js';

const CATEGORIES = [
  { key: 'base', label: 'Pizza Bases', icon: '🍞' },
  { key: 'sauce', label: 'Sauces', icon: '🍅' },
  { key: 'cheese', label: 'Cheeses', icon: '🧀' },
  { key: 'veggie', label: 'Veggies', icon: '🥬' },
  { key: 'meat', label: 'Meats', icon: '🍖' },
];

export default function AdminInventory() {
  const [data, setData] = useState({});
  const [active, setActive] = useState('base');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState(10);

  const load = async () => {
    try {
      const { data: list } = await inventoryApi.list();
      const byCat = {};
      list.forEach((inv) => { byCat[inv.category] = inv; });
      setData(byCat);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const currentInv = data[active];
  const items = currentInv?.items || [];

  const handleAdd = async (formData) => {
    try {
      await inventoryApi.addItem(active, formData);
      toast.success('Item added');
      setShowAddForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleRestock = async () => {
    if (!restockItem || restockQty <= 0) return;
    try {
      await inventoryApi.restockItem(active, restockItem._id, restockQty);
      toast.success(`Restocked +${restockQty}`);
      setRestockItem(null);
      setRestockQty(10);
      load();
    } catch (err) {
      toast.error('Failed to restock');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await inventoryApi.deleteItem(active, item._id);
      toast.success('Item deleted');
      load();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleUpdateThreshold = async (item, threshold) => {
    try {
      await inventoryApi.updateItem(active, item._id, { threshold: Number(threshold) });
      toast.success('Threshold updated');
      load();
    } catch (err) {
      toast.error('Failed to update threshold');
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-pulse h-96 bg-char-700 rounded-lg" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl text-char-50">Inventory Management</h1>
          <p className="text-char-300 mt-1">Manage pizza bases, sauces, cheeses, veggies, and meat.</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary">+ Add Item</button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-char-700">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition -mb-px ${
              active === c.key ? 'border-ember-500 text-ember-400' : 'border-transparent text-char-300 hover:text-char-50'
            }`}
          >
            {c.icon} {c.label}
            {data[c.key]?.items && <span className="ml-1 text-xs text-char-500">({data[c.key].items.length})</span>}
          </button>
        ))}
      </div>

      {/* Items table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-char-900 text-char-400 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Stock</th>
                <th className="text-left px-4 py-3">Threshold</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const low = item.stock <= item.threshold;
                return (
                  <tr key={item._id} className="border-t border-char-700 hover:bg-char-900">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">{formatINR(item.price)}</td>
                    <td className={`px-4 py-3 font-bold ${low ? 'text-red-400' : 'text-char-50'}`}>{item.stock}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue={item.threshold}
                        onBlur={(e) => e.target.value != item.threshold && handleUpdateThreshold(item, e.target.value)}
                        className="w-16 px-2 py-1 border border-char-600 bg-char-900 text-char-50 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {low ? (
                        <span className="badge bg-red-900/40 text-red-300 border border-red-700/40">⚠️ LOW</span>
                      ) : (
                        <span className="badge bg-green-900/40 text-green-300 border border-green-700/40">✓ OK</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => { setRestockItem(item); setRestockQty(10); }}
                        className="text-xs px-2 py-1 bg-ember-950 text-ember-400 rounded hover:bg-ember-900 font-semibold"
                      >+ Restock</button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-xs px-2 py-1 bg-red-950 text-red-400 rounded hover:bg-red-900 font-semibold"
                      >Delete</button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-char-400">No items in this category.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add item modal */}
      {showAddForm && (
        <Modal title={`Add ${active} item`} onClose={() => setShowAddForm(false)}>
          <AddItemForm onSubmit={handleAdd} onCancel={() => setShowAddForm(false)} />
        </Modal>
      )}

      {/* Restock modal */}
      {restockItem && (
        <Modal title={`Restock: ${restockItem.name}`} onClose={() => setRestockItem(null)}>
          <div className="space-y-4">
            <p className="text-sm text-char-300">Current stock: <strong>{restockItem.stock}</strong></p>
            <div>
              <label className="label">Quantity to add</label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Number(e.target.value))}
                className="input"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleRestock} className="btn-primary flex-1">Confirm Restock</button>
              <button onClick={() => setRestockItem(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-char-800 border border-char-700 rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl text-char-50">{title}</h3>
          <button onClick={onClose} className="text-char-500 hover:text-char-200">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddItemForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: '', price: 0, stock: 50, threshold: 20, isVeg: true });
  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }));
  };
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="space-y-3"
    >
      <div>
        <label className="label">Name</label>
        <input name="name" type="text" required className="input" value={form.name} onChange={update} placeholder="e.g. Stuffed Crust" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Price (₹)</label>
          <input name="price" type="number" min="0" required className="input" value={form.price} onChange={update} />
        </div>
        <div>
          <label className="label">Initial Stock</label>
          <input name="stock" type="number" min="0" required className="input" value={form.stock} onChange={update} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Threshold</label>
          <input name="threshold" type="number" min="0" required className="input" value={form.threshold} onChange={update} />
        </div>
        <div>
          <label className="label">Vegetarian?</label>
          <label className="flex items-center gap-2 mt-2">
            <input name="isVeg" type="checkbox" checked={form.isVeg} onChange={update} className="rounded border-char-600" />
            <span className="text-sm">Veg</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary flex-1">Add Item</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
