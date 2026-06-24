import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

let razorpayInstance = null;

const getInstance = () => {
  if (razorpayInstance) return razorpayInstance;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId.includes('YOUR_KEY')) {
    console.warn('⚠️  Razorpay keys not configured. Payment endpoints will return mock responses.');
    return null;
  }
  razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpayInstance;
};

/**
 * Create a Razorpay order for a given pizza order.
 * If Razorpay keys are not configured, returns a mock order (for dev).
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (order.payment.status === 'paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    const instance = getInstance();
    if (!instance) {
      // Dev mock — pretend we created a razorpay order
      const mockId = `order_mock_${order._id.toString().slice(-8)}`;
      order.payment.razorpayOrderId = mockId;
      await order.save();
      return res.json({
        razorpayOrderId: mockId,
        amount: order.total * 100,
        currency: 'INR',
        keyId: 'rzp_test_MOCK_KEY',
        mock: true,
      });
    }

    const options = {
      amount: Math.round(order.total * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${order._id.toString().slice(-12)}`,
      notes: { orderId: String(order._id), userId: String(order.user) },
    };
    const rpOrder = await instance.orders.create(options);

    order.payment.razorpayOrderId = rpOrder.id;
    await order.save();

    res.json({
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay create order error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Verify the Razorpay payment signature. Marks the order as paid.
 * In mock/dev mode, skips signature verification and marks paid immediately.
 */
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const instance = getInstance();
    // Only ever run the mock (no-signature-check) path when the SERVER has no
    // real Razorpay credentials configured. Previously this also trusted a
    // client-supplied `mock` flag in the request body, which meant anyone
    // could skip signature verification on a live, fully-configured server
    // simply by sending `mock: true` — a critical payment-bypass vulnerability.
    if (!instance) {
      order.payment.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
      order.payment.status = 'paid';
      order.status = 'received';
      order.statusHistory.push({ status: 'received', note: 'Payment confirmed (mock)' });
      await order.save();
      return res.json({ message: 'Payment verified (mock)', order });
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.payment.razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expected !== razorpaySignature) {
      order.payment.status = 'failed';
      await order.save();
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.razorpaySignature = razorpaySignature;
    order.payment.status = 'paid';
    if (order.status === 'pending') {
      order.status = 'received';
      order.statusHistory.push({ status: 'received', note: 'Payment confirmed' });
    }
    await order.save();

    res.json({ message: 'Payment verified successfully', order });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ message: err.message });
  }
};
