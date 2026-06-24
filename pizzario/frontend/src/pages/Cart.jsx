import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../utils/format.js';

export default function Cart() {
  const { items, updateQuantity, removeItem, clear, subtotal, tax, deliveryFee, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h1 className="text-3xl text-char-50 mb-2">Your cart is empty</h1>
        <p className="text-char-300 mb-6">Add some pizzas from the menu or build your own!</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/dashboard" className="btn-primary">Browse Menu</Link>
          <Link to="/custom-pizza" className="btn-secondary">Build Your Pizza</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl text-char-50">Your Cart</h1>
        <button onClick={clear} className="btn-ghost text-red-400 hover:bg-red-950/40">Clear cart</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item._key} className="card p-4 flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-char-800 overflow-hidden flex-shrink-0">
                {item.isCustom ? (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🍕</div>
                ) : item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🍕</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-char-50">{item.name}</h3>
                    <p className="text-xs text-char-400 capitalize">Size: {item.size}</p>
                    {item.isCustom && item.customization && (
                      <div className="text-xs text-char-300 mt-1 space-y-0.5">
                        <p>🍞 {item.customization.base} • 🍅 {item.customization.sauce} • 🧀 {item.customization.cheese}</p>
                        {item.customization.veggies?.length > 0 && (
                          <p>🥬 {item.customization.veggies.join(', ')}</p>
                        )}
                        {item.customization.meat?.length > 0 && (
                          <p>🍖 {item.customization.meat.join(', ')}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeItem(item._key)} className="text-char-500 hover:text-red-500 p-1" aria-label="Remove">
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item._key, item.quantity - 1)}
                      className="w-8 h-8 rounded-md bg-char-800 hover:bg-char-700 font-bold"
                    >−</button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._key, item.quantity + 1)}
                      className="w-8 h-8 rounded-md bg-char-800 hover:bg-char-700 font-bold"
                    >+</button>
                  </div>
                  <span className="font-bold text-ember-400">{formatINR(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h3 className="text-xl text-char-50 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-char-300">Subtotal</span>
                <span className="font-medium">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-char-300">GST (5%)</span>
                <span className="font-medium">{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-char-300">Delivery Fee</span>
                <span className="font-medium">
                  {deliveryFee === 0 ? <span className="text-green-400">FREE</span> : formatINR(deliveryFee)}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-char-400 bg-char-900 p-2 rounded">
                  💡 Add {formatINR(500 - subtotal)} more to get free delivery!
                </p>
              )}
            </div>
            <div className="border-t border-char-700 mt-4 pt-4 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold text-ember-400 text-xl">{formatINR(total)}</span>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full mt-4">
              Proceed to Checkout →
            </button>
            <Link to="/dashboard" className="btn-ghost w-full mt-2 text-sm">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
