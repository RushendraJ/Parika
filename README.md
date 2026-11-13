# Parika — Jewels & Ethnic Wear (MERN)

Imitation jewellery and ethnic wear storefront. Converted from a Lovable (TanStack Start + Supabase) project into a standard MERN stack:

- **MongoDB + Mongoose** — database
- **Express (Node 18+)** — REST API, MVC structure
- **React 19 + Vite + React Router + Tailwind v4** — frontend (TypeScript)

```
parika-jewels-mern/
├── backend/
│   ├── .env.example
│   ├── uploads/                 # product photos uploaded by the admin
│   └── src/
│       ├── server.js            # entry: connects to MongoDB, starts Express
│       ├── app.js               # middleware + route mounting
│       ├── config/              # env + db connection
│       ├── models/              # M  User, Product, CartItem, WishlistItem, Order
│       ├── controllers/         # C  auth, user, product, cart, wishlist, order
│       ├── routes/              # route definitions -> controllers
│       ├── middleware/          # auth (JWT), validate (zod), upload (multer), errors
│       ├── services/            # mailer (nodemailer), razorpay
│       ├── validations/         # zod schemas
│       ├── utils/
│       └── seed/seed.js         # starter products + admin account
└── frontend/
    ├── .env.example
    └── src/
        ├── pages/               # Home, Jewellery, EthnicWear, Auth, Cart, Checkout, Wishlist, Profile, Admin...
        ├── components/          # header, footer, product card, ui/ (shadcn)
        ├── context/AuthContext  # login state (JWT in localStorage)
        ├── lib/                 # api client, react-query hooks, catalog, pricing
        └── App.tsx / main.tsx   # routes + providers
```

## Run it locally

You need Node 18+ and a MongoDB (local install or a free MongoDB Atlas cluster).

```bash
# 1. Backend
cd backend
cp .env.example .env        # fill in MONGODB_URI, JWT_SECRET (+ the optional keys below)
npm install
npm run seed                # inserts the 15 starter products (+ admin account, see below)
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env        # defaults work for local development
npm install
npm run dev                 # http://localhost:5173
```

In development Vite proxies `/api` and `/uploads` to the backend, so no CORS setup is needed.

## Environment keys

**backend/.env**

| Key | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Long random string used to sign login tokens |
| `CLIENT_URL` | yes | Frontend origin(s) for CORS and reset-email links (comma separated) |
| `ADMIN_EMAIL` | recommended | This account becomes the shop admin (on signup, or via `npm run seed`) |
| `ADMIN_PASSWORD` / `ADMIN_NAME` | optional | `npm run seed` creates the admin account with these |
| `GOOGLE_CLIENT_ID` | optional | Enables "Continue with Google" |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | optional | Enables card/UPI checkout. Without them the option shows "Coming soon" and Cash on Delivery works |
| `SMTP_HOST/PORT/USER/PASS`, `MAIL_FROM` | optional | Sends password-reset emails. Without them the reset link is printed in the backend console |

**frontend/.env**

| Key | Purpose |
| --- | --- |
| `VITE_API_URL` | Leave empty in dev. In production set to the deployed API origin |
| `VITE_GOOGLE_CLIENT_ID` | Same Google client ID as the backend (button is hidden when empty) |

## API overview

| Method & path | Auth | Description |
| --- | --- | --- |
| `POST /api/auth/signup` · `login` · `google` | – | Returns `{ token, user }` |
| `POST /api/auth/forgot-password` · `reset-password` | – | Password reset by emailed link |
| `GET /api/auth/me` | user | Current user |
| `GET/PUT /api/users/me` | user | Profile |
| `GET /api/products?section=` | – | List products |
| `POST /api/products` (multipart, `image`) · `PATCH/DELETE /api/products/:id` | admin | Manage products |
| `GET/POST /api/cart` · `PATCH/DELETE /api/cart/:id` | user | Cart |
| `GET /api/wishlist` · `POST /api/wishlist/toggle` | user | Wishlist |
| `GET /api/orders/payment-config` | – | Is online payment enabled? |
| `POST /api/orders` · `POST /api/orders/verify-payment` · `GET /api/orders/mine` | user | Checkout (prices read from DB, never from the client) |
| `GET /api/orders` · `PATCH /api/orders/:id/status` | admin | Order management |

## Deploying

- **Frontend**: `cd frontend && npm run build`, host `dist/` on Netlify/Vercel/etc. (a `_redirects` file for SPA routing is included; on Vercel add a rewrite of everything to `/index.html`). Set `VITE_API_URL` before building.
- **Backend**: any Node host (Render, Railway, VPS). Set the env keys above and `NODE_ENV=production`; `CLIENT_URL` must be your deployed frontend URL. Product photos are saved to `backend/uploads/`, which is **wiped on hosts with ephemeral disks** — attach a persistent volume, or switch the upload middleware to S3/Cloudinary.

## What changed from the Lovable version

- Supabase Auth → JWT auth (bcrypt passwords) with Google sign-in via Google Identity Services.
- Supabase tables + RLS → Mongoose models + ownership/admin checks in middleware and controllers (`has_role` → `user.role`).
- TanStack server functions (`placeOrder`, `verifyPayment`) → `orderController`.
- Supabase Storage → local `uploads/` via multer.
- TanStack Router → React Router; same UI, styling and components.
- Email confirmation on signup was dropped: accounts are active immediately.
- Three images that Lovable hosted remotely (`parika-banner.jpg`, `parika-peacock-ear-chain.jpg`, `categories/earrings-chandbali.jpg`) weren't in the export, so labelled **placeholders** are in `frontend/src/assets/` — overwrite those files with the real photos (same names).
- Existing Supabase users/orders are not migrated (passwords can't be exported); only the starter products are re-seeded.
