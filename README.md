# CampusMart 🛒

A secure, student-focused marketplace for buying and selling second-hand items — built with the MERN stack (MongoDB, Express, React, Node.js) with Razorpay for payments and Cloudinary for image storage.

## Why CampusMart?

General second-hand marketplaces are full of fake listings, scams, and poor communication. CampusMart is built for a specific, trusted circle — students, local sellers, and small businesses — with college/stream-aware relevance, seller ratings, and admin moderation baked in from day one.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Tailwind CSS, React Hook Form, Axios, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Payments | Razorpay |
| Image Storage | Cloudinary |
| Email | Nodemailer |

## Quick Start

See **[SETUP.md](./SETUP.md)** for full step-by-step installation and run instructions.

```bash
# Backend
cd backend && npm install && cp .env.example .env && npm run dev

# Frontend (in a second terminal)
cd frontend && npm install && cp .env.example .env && npm run dev
```

Then open http://localhost:5173

## MVP Feature Set

- 🔐 JWT authentication with email verification & password reset
- 👤 Student profiles (college, stream, branch, academic year)
- 🪪 Seller ID verification (KYC) — blocks dummy/fake sellers
- 📦 Product listings with multi-image upload, categories, and condition
- 🔍 Search, filter (category/price/condition/location), and sort
- ❤️ Wishlist
- 💳 Razorpay "Buy Now" checkout with race-condition-safe reservations and a payment confirmation/receipt page
- 🌗 Dark / Light mode
- ⭐ Seller reviews & ratings
- 🚩 Reporting system for spam/fake listings
- 🛠️ Admin dashboard — analytics, user management, listing moderation, ID verification review, reports

## Project Structure

```
campusmart/
├── backend/     Node/Express API (see backend/README below for endpoints)
├── frontend/    React + Vite client
├── README.md
└── SETUP.md     Full setup instructions
```

## License

Built as a project scaffold — free to use and adapt.
