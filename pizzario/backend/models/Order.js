import mongoose from 'mongoose';

const customizationSchema = new mongoose.Schema(
  {
    base: { type: String, required: true },
    sauce: { type: String, required: true },
    cheese: { type: String, required: true },
    veggies: [{ type: String }],
    meat: [{ type: String }],
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    pizza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pizza',
      default: null,
    },
    name: { type: String, required: true },
    isCustom: { type: Boolean, default: false },
    size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    customization: customizationSchema,
    quantity: { type: Number, default: 1, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'received', 'in_kitchen', 'sent_to_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    payment: {
      method: { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    },
    deliveryAddress: {
      name: String,
      phone: String,
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

orderSchema.methods.pushStatus = function (status, note = '') {
  this.status = status;
  this.statusHistory.push({ status, note });
  return this.save();
};

export default mongoose.model('Order', orderSchema);
