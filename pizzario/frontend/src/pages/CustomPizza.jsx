import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { inventoryApi } from '../api';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../utils/format.js';

const STEPS = [
  { key: 'base', title: 'Choose Your Base', icon: '🍞', single: true, min: 1 },
  { key: 'sauce', title: 'Pick a Sauce', icon: '🍅', single: true, min: 1 },
  { key: 'cheese', title: 'Select Cheese', icon: '🧀', single: true, min: 1 },
  { key: 'veggie', title: 'Add Veggies', icon: '🥬', single: false, min: 0 },
  { key: 'meat', title: 'Add Meat (Optional)', icon: '🍖', single: false, min: 0 },
];

const SIZES = [
  { id: 'small', label: 'Small', multiplier: 0.7 },
  { id: 'medium', label: 'Medium', multiplier: 1.0 },
  { id: 'large', label: 'Large', multiplier: 1.4 },
];

export default function CustomPizza() {
  const [inventory, setInventory] = useState({ base: [], sauce: [], cheese: [], veggie: [], meat: [] });
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [size, setSize] = useState('medium');
  const [selection, setSelection] = useState({ base: null, sauce: null, cheese: null, veggie: [], meat: [] });
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await inventoryApi.list();
        const byCat = { base: [], sauce: [], cheese: [], veggie: [], meat: [] };
        data.forEach((inv) => {
          byCat[inv.category] = inv.items.filter((i) => i.stock > 0);
        });
        setInventory(byCat);
      } catch (err) {
        toast.error('Failed to load ingredients');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const currentStep = STEPS[step];
  const currentItems = inventory[currentStep.key] || [];

  const toggleSingle = (item) => {
    setSelection((p) => ({ ...p, [currentStep.key]: item.name === p[currentStep.key] ? null : item.name }));
  };
  const toggleMulti = (item) => {
    setSelection((p) => {
      const arr = p[currentStep.key];
      const exists = arr.includes(item.name);
      return { ...p, [currentStep.key]: exists ? arr.filter((n) => n !== item.name) : [...arr, item.name] };
    });
  };

  const isSelected = (name) => {
    if (currentStep.single) return selection[currentStep.key] === name;
    return selection[currentStep.key].includes(name);
  };

  const canProceed = () => {
    if (currentStep.single) return !!selection[currentStep.key];
    return true; // veggies and meat are optional
  };

  const next = () => {
    if (!canProceed()) {
      toast.error(`Please select at least one ${currentStep.title.toLowerCase()}`);
      return;
    }
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleAddToCart();
  };
  const prev = () => step > 0 && setStep(step - 1);

  const computePrice = () => {
    let total = 0;
    STEPS.forEach((s) => {
      const sel = selection[s.key];
      if (!sel) return;
      const arr = Array.isArray(sel) ? sel : [sel];
      arr.forEach((name) => {
        const item = inventory[s.key]?.find((i) => i.name === name);
        if (item) total += item.price;
      });
    });
    const sizeMult = SIZES.find((s) => s.id === size).multiplier;
    return Math.round(total * sizeMult);
  };

  const handleAddToCart = () => {
    if (!selection.base || !selection.sauce || !selection.cheese) {
      toast.error('Please select a base, sauce, and cheese');
      return;
    }
    const price = computePrice();
    const item = {
      name: 'Custom Pizza',
      isCustom: true,
      size,
      price,
      customization: {
        base: selection.base,
        sauce: selection.sauce,
        cheese: selection.cheese,
        veggies: selection.veggie,
        meat: selection.meat,
      },
    };
    addItem(item);
    toast.success('Custom pizza added to cart! 🍕');
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-char-700 rounded w-1/3 mb-6"></div>
          <div className="h-10 bg-char-700 rounded mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-char-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl text-char-50">🛠️ Build Your Dream Pizza</h1>
        <p className="text-char-300 mt-2">Pick your favourites — step by step, just the way you like it.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 max-w-3xl mx-auto">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition ${
                i < step ? 'bg-green-500 text-char-950' : i === step ? 'bg-ember-500 text-char-950 shadow-lg shadow-ember-500/40 scale-110' : 'bg-char-700 text-char-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs mt-1 hidden sm:block text-char-300">{s.title.split(' ')[0]}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded ${i < step ? 'bg-green-500' : 'bg-char-700'}`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Size selector */}
      <div className="card p-4 mb-6">
        <label className="label">Pizza Size</label>
        <div className="flex gap-3">
          {SIZES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSize(s.id)}
              className={`flex-1 py-3 rounded-lg border-2 transition ${
                size === s.id ? 'border-ember-500 bg-ember-950 text-ember-400' : 'border-char-700 hover:border-ember-700'
              }`}
            >
              <div className="font-bold">{s.label}</div>
              <div className="text-xs text-char-400">{s.multiplier === 0.7 ? '7 inch' : s.multiplier === 1 ? '10 inch' : '14 inch'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current step */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{currentStep.icon}</span>
          <div>
            <h2 className="text-2xl text-char-50">{currentStep.title}</h2>
            <p className="text-sm text-char-300">
              {currentStep.single ? 'Select one option' : `Select any number of options (optional)`}
            </p>
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="text-center py-8 text-char-400">No items available in this category.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {currentItems.map((item) => {
              const selected = isSelected(item.name);
              return (
                <button
                  key={item.name}
                  onClick={() => (currentStep.single ? toggleSingle(item) : toggleMulti(item))}
                  className={`relative p-3 rounded-lg border-2 text-left transition ${
                    selected ? 'border-ember-500 bg-ember-950' : 'border-char-700 hover:border-ember-500 bg-char-800'
                  }`}
                >
                  {selected && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-ember-500 text-char-950 rounded-full flex items-center justify-center text-xs">✓</span>
                  )}
                  <div className="font-semibold text-char-50 text-sm">{item.name}</div>
                  <div className="text-xs text-char-400 mt-1">Stock: {item.stock}</div>
                  <div className="text-sm font-bold text-ember-400 mt-1">+{formatINR(item.price)}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Live preview & navigation */}
      <div className="sticky bottom-0 mt-6 bg-char-900 border-t border-char-700 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-char-400">Current Total</div>
            <div className="text-2xl font-bold text-ember-400">{formatINR(computePrice())}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={prev} disabled={step === 0} className="btn-secondary">
              ← Back
            </button>
            <button onClick={next} disabled={!canProceed()} className="btn-primary">
              {step === STEPS.length - 1 ? `Add to Cart 🍕` : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
