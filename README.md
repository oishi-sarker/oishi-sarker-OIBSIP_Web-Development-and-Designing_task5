# 🍕 Pizzario — Full-Stack Pizza Delivery Application

A complete MERN-stack pizza delivery app with custom pizza builder, Razorpay payments, admin inventory management, low-stock email alerts, and real-time order status tracking.

Built with **React + Vite + Tailwind CSS** on the frontend, **Node.js + Express + MongoDB (Mongoose)** on the backend, and **Socket.io** for real-time updates.

---

## ✨ Features

### 👤 User
- 🔐 Register / login with email verification & forgot-password flow
- 🍕 Browse pizza menu (veg / non-veg / specialty filters)
- 🛠️ Build custom pizza — 5 bases, 5 sauces, 5 cheeses, 8+ veggies, 5 meats
- 🛒 Cart with size-aware pricing
- 💳 Razorpay test-mode checkout (or Cash on Delivery)
- 📍 Real-time order tracking (pending → received → in kitchen → out for delivery)
- 📦 Order history with live status updates

### 👨‍💼 Admin
- 📊 Dashboard with revenue, order count, low-stock summary
- 📦 Mini inventory management — add / edit / delete / restock ingredients
- 🚦 Adjustable threshold per item; global threshold via env
- 📋 Orders management with one-click status advancement
- 🔔 Email alerts when any ingredient falls at/below threshold (cron-based)
- 📨 Customer gets email on every status change

---

## 🏗️ Tech Stack

| Layer       | Tech                                             |
|-------------|--------------------------------------------------|
| Frontend    | React 18, Vite 5, Tailwind CSS 3, React Router 6 |
| Backend     | Node.js, Express 4                               |
| Database    | MongoDB with Mongoose 8                          |
| Auth        | JWT (jsonwebtoken), bcryptjs                      |
| Real-time   | Socket.io 4                                      |
| Payments    | Razorpay (test mode)                             |
| Email       | Nodemailer (Gmail or Ethereal test account)      |
| Cron        | node-cron (every 30 min low-stock scan)          |

---

## 📁 Project Structure

```
pizza-delivery-app/
├── package.json                # root — convenience scripts
├── README.md
├── backend/
│   ├── server.js               # Express + Socket.io bootstrap
│   ├── seed.js                 # Seeds admin, sample user, pizzas, inventory
│   ├── config/
│   │   ├── db.js               # Mongoose connection
│   │   ├── email.js            # Nodemailer transporter (real or Ethereal)
│   │   ├── socket.js           # Socket.io server + JWT auth
│   │   └── cron.js             # Low-stock alert cron job
│   ├── models/
│   │   ├── User.js
│   │   ├── Pizza.js
│   │   ├── Inventory.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── pizza.js
│   │   ├── inventory.js
│   │   ├── order.js
│   │   └── payment.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── pizzaController.js
│   │   ├── inventoryController.js
│   │   ├── orderController.js
│   │   └── paymentController.js
│   ├── middleware/
│   │   ├── auth.js             # protect, adminOnly, requireVerifiedEmail
│   │   └── error.js
│   └── utils/
│       ├── tokens.js
│       └── emailTemplates.js
└── frontend/
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/                # axios client + API wrappers
    │   ├── context/            # Auth, Cart, Socket
    │   ├── components/         # Navbar, Footer, StatusBadge, ProtectedRoute
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── VerifyEmail.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── UserDashboard.jsx
    │   │   ├── CustomPizza.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── MyOrders.jsx
    │   │   ├── OrderTracking.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminInventory.jsx
    │   │       └── AdminOrders.jsx
    │   └── utils/format.js
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ and npm
- **MongoDB** — either locally (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- (Optional) A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for sending emails
- (Optional) A [Razorpay test account](https://dashboard.razorpay.com/) for real test-mode payments

### 1. Install dependencies

```bash
# from project root
npm run install:all
```

Or manually:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure backend environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

| Variable                  | Description                                                        | Default                                   |
|---------------------------|--------------------------------------------------------------------|-------------------------------------------|
| `PORT`                    | Backend port                                                       | `5000`                                    |
| `MONGO_URI`               | MongoDB connection string                                          | `mongodb://localhost:27017/pizza_delivery` |
| `JWT_SECRET`              | Secret used to sign JWTs (change in production!)                   | (placeholder)                              |
| `EMAIL_USER` / `EMAIL_APP_PASSWORD` | Gmail credentials (skip to use Ethereal test inbox)     | (placeholder)                              |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay test keys (skip to use mock mode)        | (placeholder)                              |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin credentials used by the seed script        | `admin@pizza.com` / `Admin@123`            |
| `STOCK_THRESHOLD`         | Global low-stock threshold                                         | `20`                                       |

> 💡 **You can run the app without configuring email or Razorpay** — the backend gracefully falls back to an Ethereal test inbox (preview URLs are logged) and a mock Razorpay payment flow.

### 3. Configure frontend environment

```bash
cp frontend/.env.example frontend/.env
```

Defaults to `VITE_API_URL=http://localhost:5000/api` which works for local development.

### 4. Seed the database

Make sure MongoDB is running, then:

```bash
npm run seed
```

This will create:
- **Admin user**: `admin@pizza.com` / `Admin@123`
- **Sample user**: `user@pizza.com` / `User@123`
- 6 sample pizzas with images
- Full inventory (5 bases, 5 sauces, 5 cheeses, 8 veggies, 5 meats) with stock & thresholds

### 5. Run the app

```bash
# from project root — runs both backend & frontend concurrently
npm run dev
```

Or run separately:

```bash
# terminal 1
npm run dev:backend

# terminal 2
npm run dev:frontend
```

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:5000>
- API health check: <http://localhost:5000/api/health>

---

## 🧪 Testing the Full Flow

1. **Register a new user** at `/register` — a verification email is sent (check the backend console for an Ethereal preview URL if real SMTP isn't configured).
2. **Verify the email** by pasting the token at `/verify-email`.
3. **Browse pizzas** at `/dashboard` and add to cart, **or** build a custom pizza at `/custom-pizza`.
4. **Checkout** at `/checkout` — fill in a delivery address and pay with Razorpay (test mode) or COD.
   - For Razorpay test cards: `4111 1111 1111 1111`, any future expiry, any CVV.
5. **Track the order** in real time at `/orders/:id`.
6. **Log in as admin** (`admin@pizza.com` / `Admin@123`) at `/login`.
7. Open **Admin Dashboard** → see stats & low-stock items.
8. Go to **Admin Orders** → click "→ Mark as ..." to advance the status. The user's order page will update in real time via Socket.io.
9. Go to **Admin Inventory** → adjust thresholds, restock items, watch the dashboard reflect changes.
10. To test the **low-stock email alert**: reduce an item's stock to ≤ its threshold (or modify `STOCK_THRESHOLD` env to a higher value), then wait up to 30 minutes for the cron job — or trigger a manual check by placing an order that consumes the ingredient.

---

## 🔌 API Reference

### Auth
| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| POST   | `/api/auth/register`      | Register a new user                  |
| POST   | `/api/auth/login`         | Login (user or admin)                |
| POST   | `/api/auth/verify-email`  | Verify email with token              |
| POST   | `/api/auth/forgot-password` | Request password reset email        |
| POST   | `/api/auth/reset-password` | Reset password with token            |
| GET    | `/api/auth/me`            | Get current user (requires JWT)      |

### Pizzas
| Method | Endpoint            | Auth   | Description            |
|--------|---------------------|--------|------------------------|
| GET    | `/api/pizzas`       | Public | List all pizzas        |
| GET    | `/api/pizzas/:id`   | Public | Get a single pizza     |
| POST   | `/api/pizzas`       | Admin  | Create a pizza         |
| PUT    | `/api/pizzas/:id`   | Admin  | Update a pizza         |
| DELETE | `/api/pizzas/:id`   | Admin  | Delete a pizza         |

### Inventory
| Method | Endpoint                                              | Auth   | Description                       |
|--------|------------------------------------------------------|--------|-----------------------------------|
| GET    | `/api/inventory`                                     | Public | List all inventory categories     |
| GET    | `/api/inventory/category/:category`                  | Public | Get items in a category           |
| POST   | `/api/inventory/:category/items`                     | Admin  | Add a new item                    |
| PUT    | `/api/inventory/:category/items/:itemId`             | Admin  | Update an item                    |
| POST   | `/api/inventory/:category/items/:itemId/restock`     | Admin  | Restock an item                   |
| DELETE | `/api/inventory/:category/items/:itemId`             | Admin  | Delete an item                    |

### Orders
| Method | Endpoint                    | Auth          | Description                       |
|--------|-----------------------------|---------------|-----------------------------------|
| POST   | `/api/orders`               | User          | Create an order                   |
| GET    | `/api/orders/my`            | User          | List current user's orders        |
| GET    | `/api/orders/:id`           | User/Admin    | Get single order                  |
| GET    | `/api/orders`               | Admin         | List all orders (with filters)    |
| PUT    | `/api/orders/:id/status`    | Admin         | Update order status               |

### Payments
| Method | Endpoint                              | Auth | Description                          |
|--------|---------------------------------------|------|--------------------------------------|
| POST   | `/api/payments/razorpay/create-order` | User | Create a Razorpay order              |
| POST   | `/api/payments/razorpay/verify`       | User | Verify Razorpay payment signature    |

### Real-time Events (Socket.io)
| Event                  | Direction  | Payload                              | Recipients             |
|------------------------|------------|--------------------------------------|------------------------|
| `new_order`            | Server→    | `{ orderId, total }`                 | `admins` room          |
| `order_status_update`  | Server→    | `{ orderId, status, note }`          | `user:<id>` + `admins` |

---

## 🛡️ Security Notes

- Passwords are hashed with bcrypt (10 salt rounds)
- JWTs are used for both REST API auth and Socket.io handshake
- `helmet` and `express-rate-limit` are enabled by default
- Passwords are never returned in API responses (`.select(false)` on the model)
- Always change `JWT_SECRET` and admin credentials before deploying

---

## 🐳 Production Deployment Tips

- Set `NODE_ENV=production` in the backend `.env`
- Use a real MongoDB Atlas cluster and update `MONGO_URI`
- Configure real Gmail credentials (or any SMTP provider)
- Set real Razorpay live keys (after testing with test keys)
- Build the frontend: `npm run build:frontend` → serve `frontend/dist/` with nginx or Vercel
- Run the backend with `npm start` (or use PM2 / Docker)
- Consider replacing in-memory Socket.io with the Redis adapter for multi-instance scaling
- Set up a real cron monitoring service to make sure the low-stock job keeps running

---

## 🧭 Roadmap / Extensibility

- Coupons & discount codes
- Pizza ratings & reviews
- Delivery agent app / driver tracking
- Multi-restaurant support
- Push notifications (web/mobile)
- Analytics dashboard with charts

---

## 📜 License

MIT — free to use, modify, and distribute.

Built with 🍕 for pizza lovers everywhere.
