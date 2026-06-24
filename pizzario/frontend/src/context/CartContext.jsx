import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'pizza_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    setItems((prev) => {
      // Group by name+size+customization hash for cart de-duplication
      const key = cartItemKey(item);
      const existing = prev.find((p) => cartItemKey(p) === key);
      if (existing) {
        return prev.map((p) => (cartItemKey(p) === key ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...item, quantity: 1, _key: key }];
    });
  };

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) {
      removeItem(key);
      return;
    }
    setItems((prev) => prev.map((p) => (cartItemKey(p) === key ? { ...p, quantity } : p)));
  };

  const removeItem = (key) => setItems((prev) => prev.filter((p) => cartItemKey(p) !== key));

  const clear = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = subtotal >= 500 ? 0 : subtotal > 0 ? 40 : 0;
  const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;
  const totalQuantity = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clear, subtotal, tax, deliveryFee, total, totalQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

const cartItemKey = (item) => {
  if (item.isCustom) {
    const c = item.customization || {};
    return `custom|${item.size}|${c.base}|${c.sauce}|${c.cheese}|${(c.veggies || []).sort().join('-')}|${(c.meat || []).sort().join('-')}`;
  }
  return `pizza|${item.pizza}|${item.size}`;
};

export const useCart = () => useContext(CartContext);
