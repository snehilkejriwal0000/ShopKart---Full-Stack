# ShopKart — Full Project (Labs 01–06)

A complete MERN e-commerce flow: Auth → Products → Wishlist → Cart → Checkout → Razorpay Payment → Orders.

## Folder structure

```
shopkart-full/
├── backend/     Node + Express + MongoDB API
└── frontend/    React (Vite) client
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your MongoDB Atlas connection string (use the **non-SRV** format if `mongodb+srv://` fails on your network — Atlas → Connect → Drivers → toggle off "SRV Connection String")
- `JWT_SECRET` — any long random string
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from your Razorpay dashboard, **Test Mode** keys only (razorpay.com → Settings → API Keys)
- `CLIENT_URL` — leave as `http://localhost:5173` unless you change the frontend port

Seed some demo products, then start the server:

```bash
npm run seed   # loads 8 sample products into MongoDB
npm run dev    # starts on http://localhost:3000
```

You should see `Connected to MongoDB` then `ShopKart server running on http://localhost:3000`.

## 2. Frontend setup

Open a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Opens on `http://localhost:5173`. The `.env`'s `VITE_API_URL` already points at the backend above — change it only if you changed the backend's `PORT`.

## 3. Using the app

1. Register a new account at `/register`
2. Log in
3. Browse products (seeded by `npm run seed`), search by name
4. Add to Wishlist and/or Cart from a product card
5. Open Cart, adjust quantities, remove items
6. Proceed to Checkout, fill shipping details
7. Place Order → Razorpay Test Checkout opens
8. Use a Razorpay **test card**: `4111 1111 1111 1111`, any future expiry, any CVV, any OTP (Test Mode never charges real money)
9. On success you land on the Order Confirmation page, cart is cleared, and the order appears under "My Orders"

## 4. API reference

| Area | Method | Endpoint | Auth |
|---|---|---|:---:|
| Auth | POST | `/customers/register` | ❌ |
| Auth | POST | `/customers/login` | ❌ |
| Auth | GET | `/customers/me` | ✅ |
| Auth | POST | `/customers/logout` | ✅ |
| Auth | PATCH | `/customers/change-password` | ✅ |
| Products | GET | `/products?search=&category=&minPrice=&maxPrice=` | ❌ |
| Products | GET | `/products/:id` | ❌ |
| Products | POST | `/products` | ❌ (demo-only, no admin system in this lab series) |
| Wishlist | POST | `/wishlist/:productId` | ✅ |
| Wishlist | GET | `/wishlist` | ✅ |
| Wishlist | DELETE | `/wishlist/:productId` | ✅ |
| Cart | POST | `/cart/:productId` | ✅ |
| Cart | GET | `/cart` | ✅ |
| Cart | PATCH | `/cart/:productId` `{quantity}` | ✅ |
| Cart | DELETE | `/cart/:productId` | ✅ |
| Orders | POST | `/orders/create-payment-order` `{shippingAddress}` | ✅ |
| Orders | POST | `/orders/verify-payment` | ✅ |
| Orders | GET | `/orders` | ✅ |
| Orders | GET | `/orders/:id` | ✅ |

## 5. What to study per lab for the viva

- **Lab 01 (Auth)** — bcrypt hashing, JWT payload contents, HttpOnly cookies, auth middleware
- **Lab 03 (Products)** — REST querying/filtering with Mongoose `$regex`, `$gte`/`$lte`
- **Lab 04 (Wishlist)** — array of ObjectId refs on the User doc, `.populate()`
- **Lab 05 (Cart)** — `CartContext.jsx` is the single shared state (see `cart.controller.js` for the increment-on-duplicate-add logic and stock validation; see `CartContext.jsx` for why subtotal/itemCount are *derived*, never stored)
- **Lab 06 (Checkout/Orders)** — `order.controller.js` is where to focus: server recalculates total from live Product data (ignores anything the client sends), creates a `PENDING_PAYMENT` order BEFORE the Razorpay order, and the HMAC-SHA256 signature check in `verifyPayment` is what actually marks a payment trusted — study that function line by line, it's the centerpiece of the TA viva for this lab

## 6. Common pitfalls already handled in this code (don't "fix" them away)

- Cart is **not** cleared when Razorpay Checkout merely opens — only after `verify-payment` succeeds
- `totalAmount` is always computed server-side in `createPaymentOrder`, never trusted from the frontend
- Signature verification uses the `razorpayOrderId` **stored in MongoDB**, not just whatever the browser callback returns
- An order snapshots `name`/`price`/`image` at purchase time — changing a Product later doesn't rewrite past orders
- `GET /orders/:id` checks `order.user.toString() === req.user._id.toString()` so no one can view another customer's order by guessing an ID
