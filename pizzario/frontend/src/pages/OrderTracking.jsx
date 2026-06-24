import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderApi, paymentApi } from '../api';
import { useSocket } from '../context/SocketContext.jsx';
import { formatINR, formatDate, STATUS_LABELS } from '../utils/format.js';
import StatusBadge, { StatusTimeline } from '../components/StatusBadge.jsx';

const STATUS_FLOW = ['pending', 'received', 'in_kitchen', 'sent_to_delivery', 'delivered'];

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { latestEvent } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const toastShown = useRef(false);

  const load = async () => {
    try {
      const { data } = await orderApi.get(id);
      setOrder(data);
    } catch (err) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  // Listen for socket events targeting this order
  useEffect(() => {
    if (!latestEvent) return;
    if (latestEvent.type === 'order_status_update' && latestEvent.payload.orderId === id) {
      load();
      toast(`Order status: ${STATUS_LABELS[latestEvent.payload.status] || latestEvent.payload.status}`, { icon: '📍' });
    }
  }, [latestEvent, id]);

  const handleRetryPayment = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const { data: rpData } = await paymentApi.createRazorpayOrder(order._id);
      const options = {
        key: rpData.keyId,
        amount: rpData.amount,
        currency: rpData.currency || 'INR',
        name: 'Pizzario',
        description: 'Pizza order payment',
        order_id: rpData.mock ? undefined : rpData.razorpayOrderId,
        handler: async (response) => {
          try {
            const { data: verified } = await paymentApi.verifyPayment({
              orderId: order._id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            setOrder(verified.order);
            toast.success('Payment successful! 🍕');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#ff6b35' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Failed to initiate payment');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse h-64 bg-char-700 rounded-lg"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl">Order not found</h2>
        <Link to="/orders" className="btn-primary mt-4">Back to Orders</Link>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl text-char-50">Track Order</h1>
          <p className="text-char-300 text-sm mt-1">Order ID: <span className="font-mono">#{order._id.slice(-6).toUpperCase()}</span></p>
          <p className="text-char-300 text-sm">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Payment pending banner */}
      {order.payment.method === 'razorpay' && order.payment.status !== 'paid' && !isCancelled && (
        <div className="card p-4 mb-4 bg-yellow-900/30 border-yellow-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-yellow-300">⚠️ Payment Pending</p>
              <p className="text-sm text-yellow-200/80">Complete your payment to confirm the order.</p>
            </div>
            <button onClick={handleRetryPayment} disabled={paying} className="btn-primary !py-2">
              {paying ? 'Opening…' : `Pay ${formatINR(order.total)}`}
            </button>
          </div>
        </div>
      )}

      {/* Progress tracker (only when not cancelled) */}
      {!isCancelled && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg text-char-50 mb-6">Order Progress</h3>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-char-700 rounded-full">
              <div
                className="h-full bg-ember-500 rounded-full transition-all duration-500"
                style={{ width: `${(currentIndex / (STATUS_FLOW.length - 1)) * 100}%` }}
              />
            </div>
            <div className="relative flex justify-between">
              {STATUS_FLOW.map((s, i) => {
                const done = i <= currentIndex;
                const active = i === currentIndex;
                return (
                  <div key={s} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ${
                      done ? 'bg-ember-500 text-char-950 border-ember-500' : 'bg-char-800 text-char-500 border-char-700'
                    } ${active ? 'ring-4 ring-ember-800 scale-110' : ''}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs mt-2 text-center ${done ? 'text-ember-400 font-semibold' : 'text-char-400'}`}>
                      {STATUS_LABELS[s]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Items + address */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="font-semibold text-char-50 mb-2">Items</h3>
          {order.items.map((item, i) => (
            <div key={i} className="text-sm py-2 border-b border-char-700 last:border-0">
              <div className="flex justify-between">
                <span>{item.quantity}× {item.name} <span className="text-xs text-char-400 capitalize">({item.size})</span></span>
                <span className="font-medium">{formatINR(item.price * item.quantity)}</span>
              </div>
              {item.isCustom && item.customization && (
                <div className="text-xs text-char-400 mt-0.5 ml-3">
                  🍞 {item.customization.base} • 🍅 {item.customization.sauce} • 🧀 {item.customization.cheese}
                  {item.customization.veggies?.length > 0 && ` • 🥬 ${item.customization.veggies.join(', ')}`}
                  {item.customization.meat?.length > 0 && ` • 🍖 ${item.customization.meat.join(', ')}`}
                </div>
              )}
            </div>
          ))}
          <div className="border-t border-char-700 mt-3 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-char-300">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-char-300">GST</span><span>{formatINR(order.tax)}</span></div>
            <div className="flex justify-between"><span className="text-char-300">Delivery</span><span>{order.deliveryFee === 0 ? 'FREE' : formatINR(order.deliveryFee)}</span></div>
            <div className="flex justify-between font-bold pt-1 border-t border-char-700"><span>Total</span><span className="text-ember-400">{formatINR(order.total)}</span></div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-char-50 mb-2">Delivery Address</h3>
          <div className="text-sm text-char-200 space-y-1">
            <p className="font-medium">{order.deliveryAddress?.name}</p>
            <p>{order.deliveryAddress?.line1}</p>
            <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.pincode}</p>
            <p>📞 {order.deliveryAddress?.phone}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-char-700">
            <h4 className="font-semibold text-char-50 mb-1 text-sm">Payment</h4>
            <p className="text-sm text-char-200 capitalize">{order.payment.method} — <span className={`font-semibold ${order.payment.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>{order.payment.status}</span></p>
            {order.payment.razorpayPaymentId && <p className="text-xs text-char-400 mt-1">ID: {order.payment.razorpayPaymentId}</p>}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold text-char-50 mb-3">Status History</h3>
        <StatusTimeline history={order.statusHistory} current={order.status} />
      </div>

      <div className="flex gap-3">
        <Link to="/orders" className="btn-secondary">← All Orders</Link>
        <Link to="/dashboard" className="btn-ghost">Order Another</Link>
      </div>
    </div>
  );
}
