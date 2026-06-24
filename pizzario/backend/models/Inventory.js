import mongoose from 'mongoose';

/**
 * Inventory schema — one document per ingredient category.
 * Categories: base, sauce, cheese, veggie, meat
 *
 * Each document holds an `items` array of { name, price, stock, threshold }.
 * When stock drops at or below threshold, a low-stock email is triggered.
 */
const inventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 50, min: 0 },
    threshold: { type: Number, default: 20 },
    isVeg: { type: Boolean, default: true },
  },
  { _id: true }
);

const inventorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'],
      required: true,
      unique: true,
    },
    items: [inventoryItemSchema],
  },
  { timestamps: true }
);

/**
 * Reduce stock for a single ingredient after an order is placed.
 * Returns the updated item, or null if not found / insufficient stock.
 */
inventorySchema.statics.reduceStock = async function (category, itemName, qty = 1) {
  const inv = await this.findOne({ category });
  if (!inv) return null;
  const item = inv.items.find((i) => i.name === itemName);
  if (!item || item.stock < qty) return null;
  item.stock -= qty;
  await inv.save();
  return item;
};

/**
 * Get all ingredients whose stock is at or below their threshold.
 */
inventorySchema.statics.getLowStockItems = async function () {
  const all = await this.find({});
  const low = [];
  all.forEach((inv) => {
    inv.items.forEach((item) => {
      if (item.stock <= item.threshold) {
        low.push({ category: inv.category, ...item.toObject() });
      }
    });
  });
  return low;
};

export default mongoose.model('Inventory', inventorySchema);
