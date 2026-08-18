# CampusMart — Setup & Run Guide

This guide walks you through running CampusMart locally: a MERN-stack (MongoDB, Express, React, Node) marketplace with real-time chat.

## 1. Prerequisites

Install these first:

- **Node.js** v18+ and npm — https://nodejs.org
- **MongoDB** — either:
  - Install locally (https://www.mongodb.com/try/download/community), or
  - Use a free cloud database at https://www.mongodb.com/cloud/atlas (recommended for beginners)
- **Git** (optional, if you want to version-control the project)
- A **Cloudinary** account (free tier) for image uploads — https://cloudinary.com/users/register/free
- A **Gmail account with an App Password** (or any SMTP provider) for sending verification/reset emails — optional for local testing, the app still works without it (email sending just logs a warning)

## 2. Project Structure

```
campusmart/
├── backend/          # Node + Express + MongoDB API
│   ├── config/        # DB and Cloudinary configuration
│   ├── controllers/    # Route handler logic
│   ├── middleware/     # Auth, admin, upload, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── utils/           # Helpers (JWT, email, seed script)
│   └── server.js        # App entry point + Socket.IO setup
├── frontend/          # React + Vite + Tailwind CSS
│   └── src/
│       ├── api/          # Axios instance
│       ├── components/    # Reusable UI components
│       ├── context/        # Auth context (global state)
│       ├── pages/           # Route-level pages
│       └── App.jsx           # Router setup
├── README.md
└── SETUP.md          # (this file)
```

## 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Now open `.env` and fill in your real values:

```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb://127.0.0.1:27017/campusmart
# OR use MongoDB Atlas connection string, e.g.:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/campusmart

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=CampusMart <no-reply@campusmart.com>

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**Getting Razorpay credentials (for the "Buy Now" payment button):** Sign up at https://dashboard.razorpay.com/signup, then go to Settings → API Keys → Generate Test Key. Use the **Test Mode** keys while developing — test card number `4111 1111 1111 1111`, any future expiry, any CVV, works for test payments. Switch to live keys only when you're ready to accept real payments.

**Getting Cloudinary credentials:** Sign up, then your Dashboard shows Cloud Name, API Key, and API Secret directly.

**Getting a Gmail App Password:** Enable 2-Step Verification on your Google account, then go to https://myaccount.google.com/apppasswords and generate a password specifically for this app.

Start the backend:

```bash
npm run dev
```

You should see:
```
MongoDB Connected: ...
Server running in development mode on port 5000
```

Test it's alive by visiting: http://localhost:5000/api/health

### Create an admin account (optional but recommended)

```bash
npm run seed
```

This creates an admin login: `admin@campusmart.com` / `admin123`. Change this password after first login (or edit `utils/seed.js` before running).

## 4. Frontend Setup

Open a **new terminal window/tab** (keep the backend running):

```bash
cd frontend
npm install
cp .env.example .env
```

The default `.env` values already point to the local backend:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Visit **http://localhost:5173** in your browser. The Vite dev server also proxies `/api` calls to the backend (see `vite.config.js`), so both ports work together seamlessly.

## 5. Using the App

1. **Register** a new account (choose your college, stream, branch, year).
2. **Verify your ID** from your Profile page — required before you can post any listing (see Section 6).
3. **Post a listing** — click "Sell" in the navbar, fill the form, upload photos.
4. **Browse & filter** listings from the homepage — search, category, price, condition, location.
5. **Buy Now** — click a product, then "Buy Now" to pay securely through Razorpay. On success you're taken to a payment confirmation / receipt page with the payment ID, order ID, and full price breakdown.
6. **Wishlist** products with the ♥ button, view them under "Wishlist".
7. **Dark / Light mode** — toggle the sun/moon icon in the navbar (desktop and mobile). Your preference is remembered on this device.
8. **Admin panel** — log in as the seeded admin (or promote a user's `role` to `"admin"` directly in MongoDB) and visit `/admin` to moderate listings, manage users, approve seller ID verifications, and view reports.

## 6. Payment Configuration (Razorpay) — Required for Buy Now

The "Buy Now" button will not work until you configure real Razorpay keys. Without them, the backend throws `key_id or oauthToken is mandatory` on startup.

**Step 1 — Create a Razorpay account**
Sign up free at https://dashboard.razorpay.com/signup (no business verification needed for Test Mode).

**Step 2 — Get your Test API keys**
Dashboard → Settings → API Keys → Generate Test Key. You'll get a `Key Id` (starts with `rzp_test_`) and a `Key Secret`.

**Step 3 — Add them to `backend/.env`**
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_key_secret
```
Restart the backend (`npm run dev`) after saving.

**Step 4 — Test a payment**
Use Razorpay's test card during checkout:
```
Card Number: 4111 1111 1111 1111
Expiry:      Any future date
CVV:         Any 3 digits
OTP:         Any 6 digits (test mode auto-accepts)
```
For UPI test payments, use the ID `success@razorpay`.

**Step 5 — Understand the money flow (current MVP)**
- The buyer pays `item price + platform fee` (5% by default — adjustable via `PLATFORM_FEE_PERCENT` in `backend/controllers/paymentController.js`).
- The **full amount lands in your Razorpay account** — there is no automatic split to the seller yet. `Order.sellerPayout` in MongoDB tracks what you owe each seller; you settle that manually (UPI/bank transfer) or build a payout job later.
- Every successful payment is verified server-side via HMAC signature check (`verifyPayment` in `paymentController.js`) before the item is marked `Sold` — never trust the frontend's "payment succeeded" callback alone.
- Payment confirmation page (`/order-confirmation/:orderId`) shows the buyer their Razorpay Payment ID, Order ID, item price, platform fee, and total — and can be printed/saved as a receipt.

**Step 6 — Going live (real payments)**
1. Complete Razorpay's KYC/business verification in their dashboard.
2. Switch `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` in your **production** `.env` to the Live Mode keys (they start with `rzp_live_`).
3. Never commit real keys to source control — keep them only in your hosting provider's environment variable settings.

## 7. Common Issues

| Problem | Fix |
|---|---|
| `MongoDB Connected` never prints / connection error | Make sure MongoDB is running locally (`mongod`) or your Atlas connection string/IP allowlist is correct |
| Images fail to upload | Double-check Cloudinary credentials in `backend/.env`, and confirm `backend/config/cloudinary.js` exports the **full** `cloudinary` module (not just `.v2`) — `multer-storage-cloudinary` needs the whole module |
| `key_id or oauthToken is mandatory` crash on startup | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are missing from `backend/.env` — see Section 6 |
| Emails don't send | This is non-blocking — registration/login still work. Fix Gmail App Password or just ignore for local dev |
| CORS errors in browser console | Confirm `CLIENT_URL` in `backend/.env` matches the URL your frontend runs on (default `http://localhost:5173`) |
| Dark mode doesn't stick after refresh | Check that `localStorage` isn't blocked/cleared by browser privacy settings — the theme choice is stored under the `theme` key |

## 8. Building for Production

Frontend:
```bash
cd frontend
npm run build
```
This outputs static files to `frontend/dist`, which you can deploy to Vercel, Netlify, or serve via any static host.

Backend: deploy the `backend/` folder to any Node host (Render, Railway, an EC2/VM, etc.), set the same environment variables in that host's dashboard (including the Razorpay Live keys — see Section 6, Step 6), and point `VITE_API_URL` in the frontend's production `.env` to your deployed backend URL.

## 9. What's Implemented (MVP) vs. Roadmap

**Implemented in this codebase:**
- JWT auth (register, login, email verification, forgot/reset password)
- User profiles (college/stream/branch/year, profile picture, seller rating)
- Product CRUD with multi-image upload (Cloudinary)
- Search, category/price/condition/location filters, sort, pagination
- Wishlist
- **Razorpay "Buy Now" checkout** with **race-condition-safe reservation** — if two buyers click Buy Now on the same item at the same time, MongoDB's atomic update guarantees only one gets checkout; the other sees a friendly "already reserved" message. Reservations auto-expire after 10 minutes (and are actively released if a buyer closes checkout or payment fails).
- **Payment confirmation / receipt page** (`/order-confirmation/:orderId`) — shows Razorpay Payment ID, Order ID, date, item price, platform fee, and total, with a print/save option
- **Dark / Light mode** — toggle in the navbar (desktop + mobile), respects system preference on first visit, persists per-device via `localStorage`
- **Smart price suggestion** for sellers — auto-suggests a fair resale price from original price, purchase date (age-based depreciation), and condition
- **Seller ID verification (KYC)** — sellers must upload a government/college ID and get admin approval before they can post any listing, blocking dummy/fake sellers. Admin gets a dedicated review queue with zoomable ID images and approve/reject actions.
- Post-login **Dashboard** with stats (active listings, sold, wishlist, purchases), quick actions, and recent activity
- Toast notifications across the app (login/register success, wishlist updates, reports, and automatic error toasts on any failed request)
- Interactive animations (Framer Motion) — animated navbar, page transitions, hover effects on product cards and buttons
- Reviews & seller ratings
- Reports (spam/fake listing flagging)
- Admin dashboard: analytics, user ban/unban, listing approval/removal, ID verification review, report management

**Removed by request:** real-time chat and call/WhatsApp seller contact (Socket.IO, `Conversation`/`Message` models, and the `/api/chat/*` routes were fully removed from the backend). Buying now happens exclusively through the in-app Razorpay checkout, like a standard e-commerce flow.

**Not yet implemented (see project brief's "Future Features"):** AI description/spam-detection generation, push notifications, mobile app, delivery integration, voice search, QR codes, multi-language, recommendation engine, auctions, subscriptions, automatic seller payout splitting. These are good next milestones once the MVP is validated.

## 10. Important: Handling Seller ID Documents (Privacy & Compliance)

The seller verification feature stores uploaded ID card images on Cloudinary via the same upload pipeline as product photos. Before going to production with real users' ID documents:

- **Use a private/restricted Cloudinary folder** for ID uploads (not the public `campusmart` folder used for product images), and serve them via signed URLs so only admins can view them.
- **Set a data retention policy** — delete ID images after verification is approved/rejected, or after a fixed retention period, rather than keeping them indefinitely.
- **Check local data protection law requirements** (e.g. India's DPDP Act) for collecting and storing government ID images — you may need explicit consent language and a documented purpose limitation.
- Restrict the `/api/admin/id-verifications` endpoints to admin accounts only (already enforced via the `admin` middleware) and audit-log who reviewed each submission.

This MVP wires up the full approve/reject workflow but uses the same public-folder Cloudinary setup as product images for simplicity — swap in a private folder + signed URLs before handling real user IDs in production.
