import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import { orderApi, paymentApi } from '../api';
import { formatINR } from '../utils/format.js';

export default function Checkout() {
  const { items, subtotal, tax, deliveryFee, total, clear } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ name: '', phone: '', line1: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [placing, setPlacing] = useState(false);

  const update = (e) => setAddress((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validateAddress = () => {
    for (const k of ['name', 'phone', 'line1', 'city', 'state', 'pincode']) {
      if (!address[k]?.trim()) {
        toast.error(`Please fill in ${k}`);
        return false;
      }
    }
    if (!/^\d{10}$/.test(address.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (!validateAddress()) return;

    setPlacing(true);
    try {
      // 1. Create the order in the backend (also reduces inventory)
      const { data: order } = await orderApi.create({
        items: items.map((i) => ({
          pizza: i.pizza,
          name: i.name,
          isCustom: i.isCustom,
          size: i.size,
          customization: i.customization,
          quantity: i.quantity,
          price: i.price,
        })),
        deliveryAddress: address,
        paymentMethod,
      });

      // 2. If COD — done
      if (paymentMethod === 'cod') {
        clear();
        toast.success('Order placed! Pay on delivery.');
        navigate(`/orders/${order._id}`);
        return;
      }

      // 3. Razorpay flow — create Razorpay order
      const { data: rpData } = await paymentApi.createRazorpayOrder(order._id);

      // 4. Open Razorpay checkout
      const options = {
        key: rpData.keyId,
        amount: rpData.amount,
        currency: rpData.currency || 'INR',
        name: 'Pizzario',
        description: 'Pizza order payment',
        order_id: rpData.mock ? undefined : rpData.razorpayOrderId,
        // mock mode: skip order_id since the order isn't real
        handler: async (response) => {
          try {
            const { data: verified } = await paymentApi.verifyPayment({
              orderId: order._id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            clear();
            toast.success('Payment successful! 🍕');
            navigate(`/orders/${verified.order._id}`);
          } catch (err) {
            console.error('Payment verify error:', err);
            toast.error('Payment verification failed. Please contact support.');
            navigate(`/orders/${order._id}`);
          }
        },
        prefill: { name: address.name, contact: address.phone },
        theme: { color: '#ff6b35' },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled. You can retry from your order page.', { icon: '⚠️' });
            navigate(`/orders/${order._id}`);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        toast.error(`Payment failed: ${resp.error.description}`);
        navigate(`/orders/${order._id}`);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h1 className="text-3xl text-char-50 mb-2">Nothing to checkout</h1>
        <Link to="/dashboard" className="btn-primary mt-4">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-4xl text-char-50 mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: address + payment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h2 className="text-xl text-char-50 mb-4">Delivery Address</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="name">Full Name</label>
                <input id="name" name="name" className="input" value={address.name} onChange={update} placeholder="John Doe" />
              </div>
              <div>
                <label className="label" htmlFor="phone">Phone Number</label>
                <input id="phone" name="phone" className="input" value={address.phone} onChange={update} placeholder="9999999999" maxLength="10" />
              </div>
              <div>
                <label className="label" htmlFor="pincode">Pincode</label>
                <input id="pincode" name="pincode" className="input" value={address.pincode} onChange={update} placeholder="400001" maxLength="6" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="line1">Address</label>
                <textarea id="line1" name="line1" rows="2" className="input" value={address.line1} onChange={update} placeholder="Flat / House no, Street, Area"></textarea>
              </div>
              <div>
                <label className="label" htmlFor="city">City</label>
                <input id="city" name="city" className="input" value={address.city} onChange={update} placeholder="Mumbai" />
              </div>
              <div>
                <label className="label" htmlFor="state">State</label>
                <input id="state" name="state" className="input" value={address.state} onChange={update} placeholder="Maharashtra" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-xl text-char-50 mb-4">Payment Method</h2>
            <div className="space-y-2">
              <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'razorpay' ? 'border-ember-500 bg-ember-950' : 'border-char-700'}`}>
                <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="text-ember-500" />
                <span className="text-2xl">💳</span>
                <div>
                  <div className="font-semibold">Razorpay (Test Mode)</div>
                  <div className="text-xs text-char-400">Pay via UPI, Card, NetBanking. Use test cards.</div>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'cod' ? 'border-ember-500 bg-ember-950' : 'border-char-700'}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-ember-500" />
                <span className="text-2xl">💵</span>
                <div>
                  <div className="font-semibold">Cash on Delivery</div>
                  <div className="text-xs text-char-400">Pay with cash when your pizza arrives.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h3 className="text-xl text-char-50 mb-3">Order Summary</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto text-sm mb-3">
              {items.map((i) => (
                <div key={i._key} className="flex justify-between">
                  <span className="text-char-200 truncate pr-2">{i.quantity}× {i.name} <span className="text-xs text-char-500">({i.size})</span></span>
                  <span className="font-medium">{formatINR(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-char-700 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-char-300">Subtotal</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-char-300">GST</span><span>{formatINR(tax)}</span></div>
              <div className="flex justify-between"><span className="text-char-300">Delivery</span><span>{deliveryFee === 0 ? 'FREE' : formatINR(deliveryFee)}</span></div>
            </div>
            <div className="border-t border-char-700 mt-3 pt-3 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold text-ember-400 text-xl">{formatINR(total)}</span>
            </div>
            <button onClick={placeOrder} disabled={placing} className="btn-primary w-full mt-4">
              {placing ? 'Placing Order…' : paymentMethod === 'razorpay' ? `Pay ${formatINR(total)}` : 'Place Order'}
            </button>
            <Link to="/cart" className="btn-ghost w-full mt-2 text-sm">← Back to Cart</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
