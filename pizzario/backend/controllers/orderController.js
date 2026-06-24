import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';
import sendEmail from '../config/email.js';
import { lowStockTemplate, orderStatusTemplate } from '../utils/emailTemplates.js';
import { getIO } from '../config/socket.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL_DEFAULT || 'admin@pizza.com';

/**
 * Validate the order payload and compute the total.
 * Reduces stock for each custom ingredient immediately on order creation.
 */
const computeOrderTotals = (items) => {
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
  const deliveryFee = subtotal >= 500 ? 0 : 40;
  const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;
  return { subtotal, tax, deliveryFee, total };
};

/**
 * Reduce inventory stock for every ingredient in custom pizzas.
 * Returns the list of items affected (for low-stock checks).
 */
const consumeInventory = async (items) => {
  const consumed = [];
  for (const item of items) {
    if (!item.isCustom || !item.customization) continue;
    const { base, sauce, cheese, veggies = [], meat = [] } = item.customization;
    const qty = item.quantity || 1;

    for (const [category, name] of [
      ['base', base],
      ['sauce', sauce],
      ['cheese', cheese],
      ...veggies.map((v) => ['veggie', v]),
      ...meat.map((m) => ['meat', m]),
    ]) {
      if (name) {
        const updated = await Inventory.reduceStock(category, name, qty);
        if (updated) consumed.push({ category, name, stock: updated.stock, threshold: updated.threshold });
      }
    }
  }
  return consumed;
};

/**
 * Create a new order. Inventory stock is reduced at this point.
 * Payment status is 'pending' until Razorpay confirmation.
 */
export const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod = 'razorpay' } = req.body;
    if (!items || !items.length) return res.status(400).json({ message: 'Order must contain at least one item' });

    // Check inventory availability before consuming
    for (const item of items) {
      if (item.isCustom && item.customization) {
        const { base, sauce, cheese, veggies = [], meat = [] } = item.customization;
        for (const [category, name] of [
          ['base', base],
          ['sauce', sauce],
          ['cheese', cheese],
          ...veggies.map((v) => ['veggie', v]),
          ...meat.map((m) => ['meat', m]),
        ]) {
          if (name) {
            const inv = await Inventory.findOne({ category });
            const stockItem = inv?.items.find((i) => i.name === name);
            if (!stockItem || stockItem.stock < (item.quantity || 1)) {
              return res.status(400).json({ message: `Insufficient stock for ${category}: ${name}` });
            }
          }
        }
      }
    }

    const totals = computeOrderTotals(items);

    const order = await Order.create({
      user: req.user._id,
      items,
      ...totals,
      payment: { method: paymentMethod, status: 'pending' },
      deliveryAddress,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    // Consume inventory
    const consumed = await consumeInventory(items);

    // Notify admin via socket.io
    const io = getIO();
    io.to('admins').emit('new_order', { orderId: order._id, total: order.total });

    // Trigger low-stock email if any consumed item fell at or below threshold
    const low = consumed.filter((c) => c.stock <= c.threshold);
    if (low.length) {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: '⚠️ Low Stock Alert — Pizza Delivery',
        html: lowStockTemplate(low),
        text: `Low stock: ${low.map((l) => `${l.category}/${l.name}=${l.stock}`).join(', ')}`,
      });
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Get all orders for the current user.
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('items.pizza', 'name image');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get a single order by id (must belong to user or be admin).
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.pizza', 'name image')
      .populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Admin — list all orders with filters.
 */
export const getAllOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .populate('user', 'name email')
      .populate('items.pizza', 'name');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Admin — update order status.
 * Status changes are pushed to statusHistory, broadcast via socket.io,
 * and an email notification is sent to the customer.
 *
 * Allowed transitions:
 *   pending → received → in_kitchen → sent_to_delivery → delivered
 *   (any state → cancelled)
 */
const STATUS_FLOW = {
  pending: 'received',
  received: 'in_kitchen',
  in_kitchen: 'sent_to_delivery',
  sent_to_delivery: 'delivered',
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note = '' } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Always allow cancel; otherwise enforce forward flow
    if (status !== 'cancelled') {
      const expected = STATUS_FLOW[order.status];
      if (expected !== status) {
        return res.status(400).json({
          message: `Invalid status transition from '${order.status}' to '${status}'. Expected '${expected}'.`,
        });
      }
    }

    await order.pushStatus(status, note);

    // Notify user via socket.io
    const io = getIO();
    io.to(`user:${order.user._id}`).emit('order_status_update', {
      orderId: order._id,
      status,
      note,
    });
    // Also notify admins (so other admin tabs update)
    io.to('admins').emit('order_status_update', { orderId: order._id, status, note });

    // Email the customer about the status change
    if (order.user?.email) {
      await sendEmail({
        to: order.user.email,
        subject: `🍕 Order #${order._id.toString().slice(-6).toUpperCase()} — ${status.replace(/_/g, ' ')}`,
        html: orderStatusTemplate(order.user.name, order._id.toString().slice(-6).toUpperCase(), status),
        text: `Your order status is now: ${status}`,
      });
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
