import Inventory from '../models/Inventory.js';

/**
 * Get entire inventory grouped by category (admin only).
 */
export const getInventory = async (req, res) => {
  try {
    const all = await Inventory.find({}).sort({ category: 1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get inventory for a single category — used by the custom pizza builder.
 */
export const getInventoryByCategory = async (req, res) => {
  try {
    const inv = await Inventory.findOne({ category: req.params.category });
    if (!inv) return res.status(404).json({ message: 'Category not found' });
    res.json(inv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Add a new item to a category (admin only).
 * Body: { name, price, stock, threshold, isVeg }
 */
export const addItem = async (req, res) => {
  try {
    const { category } = req.params;
    const inv = await Inventory.findOne({ category });
    if (!inv) return res.status(404).json({ message: 'Category not found' });

    const existing = inv.items.find((i) => i.name === req.body.name);
    if (existing) return res.status(400).json({ message: 'Item already exists' });

    inv.items.push(req.body);
    await inv.save();
    res.status(201).json(inv);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Update an existing item (admin only).
 */
export const updateItem = async (req, res) => {
  try {
    const { category, itemId } = req.params;
    const inv = await Inventory.findOne({ category });
    if (!inv) return res.status(404).json({ message: 'Category not found' });

    const item = inv.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    Object.assign(item, req.body);
    await inv.save();
    res.json(inv);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Restock an item — adds the given quantity to current stock (admin only).
 * Body: { quantity: number }
 */
export const restockItem = async (req, res) => {
  try {
    const { category, itemId } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) return res.status(400).json({ message: 'Quantity must be positive' });

    const inv = await Inventory.findOne({ category });
    if (!inv) return res.status(404).json({ message: 'Category not found' });

    const item = inv.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.stock += Number(quantity);
    await inv.save();
    res.json({ message: 'Restocked successfully', item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Delete an item (admin only).
 */
export const deleteItem = async (req, res) => {
  try {
    const { category, itemId } = req.params;
    const inv = await Inventory.findOne({ category });
    if (!inv) return res.status(404).json({ message: 'Category not found' });

    inv.items.id(itemId).deleteOne();
    await inv.save();
    res.json({ message: 'Item deleted', inventory: inv });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
