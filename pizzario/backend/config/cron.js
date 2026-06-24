import cron from 'node-cron';
import Inventory from '../models/Inventory.js';
import sendEmail from './email.js';
import { lowStockTemplate } from '../utils/emailTemplates.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL_DEFAULT || 'admin@pizza.com';
const THRESHOLD = Number(process.env.STOCK_THRESHOLD) || 20;

/**
 * Every 30 minutes, scan inventory for items at/below threshold.
 * Send a consolidated email alert to the admin if any low-stock items are found.
 *
 * In production you might run this every hour or once a day; 30 min keeps the
 * demo responsive while avoiding spam.
 */
export const startLowStockCron = () => {
  // Format: minute hour day-of-month month day-of-week
  cron.schedule('*/30 * * * *', async () => {
    try {
      const low = await Inventory.getLowStockItems();
      // Also flag items below the global threshold
      const belowGlobal = await Inventory.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.stock': { $lte: THRESHOLD } } },
        { $project: { _id: 0, category: 1, name: '$items.name', stock: '$items.stock', threshold: '$items.threshold' } },
      ]);
      // Merge & dedupe
      const map = new Map();
      [...low, ...belowGlobal].forEach((i) => map.set(`${i.category}:${i.name}`, i));
      const finalLow = Array.from(map.values());

      if (finalLow.length === 0) return;
      console.log(`📉 Low stock detected (${finalLow.length} items). Sending alert to ${ADMIN_EMAIL}`);
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `⚠️ Low Stock Alert — ${finalLow.length} item(s) below threshold`,
        html: lowStockTemplate(finalLow),
        text: `Low stock items: ${finalLow.map((l) => `${l.category}/${l.name}=${l.stock}`).join(', ')}`,
      });
    } catch (err) {
      console.error('Low stock cron error:', err.message);
    }
  });
  console.log('⏰ Low-stock alert cron scheduled (every 30 minutes)');
};
