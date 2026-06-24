import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import { startLowStockCron } from './config/cron.js';

import authRoutes from './routes/auth.js';
import pizzaRoutes from './routes/pizza.js';
import inventoryRoutes from './routes/inventory.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';

import { errorHandler, notFound } from './middleware/error.js';

const app = express();
const httpServer = http.createServer(app);

// ---------- Middlewares ----------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// ---------- Routes ----------
app.get('/', (_req, res) => res.json({ status: 'ok', service: 'pizza-delivery-api', version: '1.0.0' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use('/api/auth', authRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// ---------- 404 + error ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Bootstrap ----------
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  initSocket(httpServer);
  startLowStockCron();
  httpServer.listen(PORT, () => {
    console.log(`\n🍕 Pizza Delivery API running on http://localhost:${PORT}`);
    console.log(`   Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`   Socket.io: enabled`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  httpServer.close(() => process.exit(0));
});
