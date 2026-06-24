import express from 'express';
import {
  getInventory,
  getInventoryByCategory,
  addItem,
  updateItem,
  restockItem,
  deleteItem,
} from '../controllers/inventoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public: read categories for the custom pizza builder
router.get('/', getInventory);
router.get('/category/:category', getInventoryByCategory);

// Admin-only: write operations
router.post('/:category/items', protect, adminOnly, addItem);
router.put('/:category/items/:itemId', protect, adminOnly, updateItem);
router.post('/:category/items/:itemId/restock', protect, adminOnly, restockItem);
router.delete('/:category/items/:itemId', protect, adminOnly, deleteItem);

export default router;
