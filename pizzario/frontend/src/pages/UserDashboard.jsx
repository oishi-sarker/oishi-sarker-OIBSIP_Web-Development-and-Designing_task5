import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { pizzaApi } from '../api';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatINR } from '../utils/format.js';

export default function UserDashboard() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await pizzaApi.list({ available: true });
        setPizzas(data);
      } catch (err) {
        toast.error('Failed to load pizzas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = category === 'all' ? pizzas : pizzas.filter((p) => p.category === category);

  const handleAdd = (pizza, size) => {
    addItem({
      pizza: pizza._id,
      name: pizza.name,
      image: pizza.image,
      size,
      price: pizza.price[size],
      isCustom: false,
    });
    toast.success(`${pizza.name} (${size}) added to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Greeting */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl text-char-50">Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-char-300 mt-1">What would you like to bite into today?</p>
        </div>
        <Link to="/custom-pizza" className="btn-primary">
          🛠️ Build Your Own Pizza
        </Link>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'veg', 'non-veg', 'specialty'].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              category === c
                ? 'bg-ember-500 text-char-950 shadow-md shadow-ember-500/30'
                : 'bg-char-800 text-char-200 hover:bg-char-700 border border-char-700'
            }`}
          >
            {c === 'all' ? 'All Pizzas' : c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Pizza grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-48 bg-char-700 rounded-lg mb-3"></div>
              <div className="h-5 bg-char-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-char-700 rounded w-full mb-1"></div>
              <div className="h-4 bg-char-700 rounded w-2/3 mb-3"></div>
              <div className="h-9 bg-char-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">🤷</div>
          <h3 className="text-xl text-char-50">No pizzas in this category yet</h3>
          <p className="text-char-300 mt-2">Check back later or build your own custom pizza!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pizza) => (
            <PizzaCard key={pizza._id} pizza={pizza} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  );
}

function PizzaCard({ pizza, onAdd }) {
  const [size, setSize] = useState('medium');
  const isVeg = pizza.category === 'veg' || pizza.category === 'specialty';

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-48 bg-char-800 overflow-hidden">
        {pizza.image ? (
          <img src={pizza.image} alt={pizza.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🍕</div>
        )}
        <div className="absolute top-3 left-3">
          <span className={isVeg ? 'badge-veg' : 'badge-nonveg'}>
            {isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-char-900/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          ⭐ {pizza.rating}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl text-char-50 mb-1">{pizza.name}</h3>
        <p className="text-sm text-char-300 mb-3 line-clamp-2">{pizza.description}</p>

        <div className="flex gap-2 mb-3">
          {['small', 'medium', 'large'].map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold uppercase transition ${
                size === s ? 'bg-ember-500 text-char-950' : 'bg-char-800 text-char-200 hover:bg-char-700'
              }`}
            >
              {s.charAt(0)}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-char-400 block">Price</span>
            <span className="text-xl font-bold text-ember-400">{formatINR(pizza.price[size])}</span>
          </div>
          <button onClick={() => onAdd(pizza, size)} className="btn-primary !py-2 !px-4 text-sm">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
