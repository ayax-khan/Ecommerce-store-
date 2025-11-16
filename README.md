# Buy2Enjoy E‑commerce Platform

Full‑stack stationery e‑commerce application built as a monorepo with **Next.js** (frontend) and **NestJS + Prisma + MongoDB** (backend).

This README explains how to **set up the project from zero**, **run it locally**, and **understand the main features**, including the **admin panel**.

---

## 1. Tech Stack

**Frontend**
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS

**Backend**
- NestJS (REST API)
- PostgreSQL via Prisma (users, orders, payments, carts, wishlist)
- MongoDB via Mongoose (products, categories)
- Stripe (checkout + payments)
- Nodemailer (SMTP – email verification & password reset)

**Monorepo**
- npm workspaces
- `apps/api` – backend
- `apps/web` – frontend

---

## 2. Prerequisites

- Node.js **>= 18** (recommended LTS)
- npm **>= 9**
- Docker Desktop **(recommended)**
  - for local **Postgres** and **MongoDB** via `docker-compose.yml`

If you don’t want Docker, you can run Postgres + Mongo manually and point env variables to your own instances.

---

## 3. Install Dependencies

From repo root:

```bash
npm install
```

This installs dependencies for both `apps/api` and `apps/web` (via workspaces).

---

## 4. Environment Variables

### 4.1 API (.env)

Create `apps/api/.env` based on the values below (or copy from `.env.example` if present):

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/buy2enjoy
MONGO_URL=mongodb://localhost:27017/buy2enjoy

JWT_SECRET=devsecret              # for local dev only

STRIPE_SECRET_KEY=sk_test_xxx     # optional (for real checkout)
STRIPE_WEBHOOK_SECRET=whsec_xxx   # optional (for webhooks)

SMTP_HOST=smtp.gmail.com          # example: Gmail SMTP
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="Buy2Enjoy <no-reply@yourdomain.com>"
```

> In production use a strong JWT secret or switch to RS256 keys and a proper SMTP provider.

### 4.2 Web (.env.local)

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

If you deploy the API elsewhere, update this URL.

---

## 5. Start Databases & Services (Docker)

From repo root:

```bash
docker compose up -d postgres mongo
```

This will start:
- PostgreSQL on `localhost:5432`
- MongoDB on `localhost:27017`

If you prefer your own DB instances, **skip this step** and adjust `DATABASE_URL` and `MONGO_URL` accordingly.

---

## 6. Database Migration & Seed

Run Prisma migrations for the API:

```bash
npm run -w api prisma:migrate
```

(If there is a dedicated script in `apps/api/package.json`, use that instead.)

Optionally seed sample products/orders (if a script exists):

```bash
npm run -w api seed
```

---

## 7. Running the Apps (Dev)

In **two terminals** from repo root:

### 7.1 Backend API

```bash
npm run api:dev
```

- Starts NestJS API on `http://localhost:4000`.
- Base URL used by frontend: `http://localhost:4000/api`.

### 7.2 Frontend Web

```bash
npm run web:dev
```

- Starts Next.js dev server (usually on `http://localhost:3000`).

Open `http://localhost:3000` in your browser.

---

## 8. Main Features

### 8.1 Customer‑facing Storefront

- Home page with sections:
  - **Hot Deals**, **Best Sellers**, **New Arrivals** (real data from backend)
- **Catalog** page (`/catalog`):
  - Search by text
  - Filter by category, brand, price range
  - Sort by newest / price (asc/desc)
- Product details page (`/product/[id]`)
- Cart & checkout flow:
  - Add to cart, update quantities
  - Checkout via Stripe (if configured)
- Wishlist
- User account area (`/account`):
  - Orders list for logged‑in user

### 8.2 Authentication & Emails

- Register / Login with JWT
- Roles: `customer`, `admin`
- Email verification flow
- Forgot password / reset password flow
- SMTP integration via Nodemailer (real emails if SMTP env is set).

---

## 9. Admin Panel

Access: `/admin`

Admin uses the same Next.js app but with a **separate layout** (sidebar, dark mode, etc.).

### 9.1 Admin Login

1. Register a user normally.
2. Manually change that user’s role to `admin` in Postgres (for now):
   - Set `role = 'admin'` in the `User` table.
3. Login in the web app; a JWT token is stored in `localStorage` (`b2e_token`).
4. Visit `/admin` to access the admin dashboard.

### 9.2 Admin Dashboard (Overview)

On `/admin` the dashboard shows:

- **Sales overview**:
  - Daily revenue
  - Weekly revenue
  - Monthly revenue
  - Total revenue
- **Orders overview**:
  - Total orders
  - Count by status (Pending, Processing, Shipped, Delivered, Cancelled, Returned)
- **Revenue graph** (last 7 days)
- **Pending orders** (latest pending orders)
- **Low‑stock products** (quantity ≤ 5)
- **Trending products** (simple heuristic based on product price, can be replaced with real sales ranking)
- Dark/light theme toggle in the admin sidebar.

### 9.3 Category & Sub‑category Management

Route: `/admin/categories`

Features:
- Create categories (name, slug, thumbnail URL)
- Parent/child categories (hierarchy) via `parentId`
- Sort order within the same parent
- Activate/deactivate via `isActive`
- Delete category (optionally removes direct children)

Backend:
- Mongo `Category` model (name, slug, thumbnail, parentId, sortOrder, isActive)
- Public endpoints:
  - `GET /categories` (flat list)
  - `GET /categories/tree` (hierarchical tree)
- Admin endpoints (JWT + admin role):
  - `GET /admin/categories`
  - `GET /admin/categories/:id`
  - `POST /admin/categories`
  - `PATCH /admin/categories/:id`
  - `DELETE /admin/categories/:id`

### 9.4 Product Management

Route: `/admin/products`

Features:
- List products with:
  - Title, brand
  - Regular/sale price display
  - Stock quantity & status
  - Active / inactive state
  - Quick search (by title or brand)
- Add new product (`/admin/products/new`):
  - Title & description
  - Category IDs (comma‑separated for now)
  - Tags
  - Pricing: regular price + optional sale price (with validation)
  - Image URLs (gallery as comma‑separated URLs)
  - Inventory: available quantity
  - Stock status: auto / in‑stock / out‑of‑stock / backorder
  - Variants: name, SKU, price, quantity (e.g. sizes/colors)
  - Shipping details: weight, dimensions (L/W/H)
  - Active / inactive flag
- Edit product (`/admin/products/[id]/edit`):
  - Same form, pre‑filled with existing data
- Delete product from list with confirmation dialog.

Backend:
- Mongo `Product` schema with advanced fields (price, regularPrice, salePrice, tags, stockStatus, variants, etc.)
- Admin endpoints under `AdminProductsController`:
  - `GET /admin/products`
  - `GET /admin/products/:id`
  - `POST /admin/products`
  - `PATCH /admin/products/:id`
  - `DELETE /admin/products/:id`
- Inventory snapshot synced with Postgres `Inventory` table.

### 9.5 Order Management

Route: `/admin/orders`

Features:
- View recent orders (from Postgres `Order` + `OrderItem` + `Payment`):
  - Order ID, date, total amount
  - Payment gateway + status + transaction ID (if present)
- Update order status via dropdown:
  - `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`, `Returned`
- Expand per‑order details:
  - Items list (productId, quantity, unit price)
  - Shipping & tracking (UI field for tracking number, backend extension planned)
  - Order notes textarea (UI placeholder for future admin ↔ customer notes)
- Print/download invoice:
  - Simple `Print Invoice` button opens a minimal invoice page and triggers `window.print()`.
- Print shipping label (placeholder button for future integration)
- Refund/cancel (placeholder button for future flow).

Backend:
- `AdminOrdersController` (JWT + admin):
  - `GET /admin/orders` – returns latest orders with `items` and `payment` included
  - `PATCH /admin/orders/:id` – updates `status`

---

## 10. Scripts & Commands

From repo root:

- Dev:
  - `npm run api:dev` – start API (NestJS)
  - `npm run web:dev` – start web (Next.js)
- Build:
  - `npm run api:build`
  - `npm run web:build`

Backend‑specific (run with `-w api`):
- `npm run -w api prisma:migrate` – run Prisma migrations
- `npm run -w api seed` – seed data (if script exists)

---

## 11. Project Structure

```text
buy2enjoy/
  apps/
    api/        # NestJS backend (Prisma, Mongo, SMTP, Stripe, admin APIs)
    web/        # Next.js frontend (storefront + admin UI)
  packages/     # Shared libraries (if any)
  docker-compose.yml
  package.json  # npm workspaces + root scripts
  README.md
```

---

## 12. Deployment Notes (High‑level)

- Run separate builds for `apps/api` and `apps/web`.
- Use environment variables appropriate to your hosting:
  - API: `DATABASE_URL`, `MONGO_URL`, `JWT_SECRET` (or keys), SMTP, Stripe.
  - Web: `NEXT_PUBLIC_API_URL` pointing to deployed API.
- Configure HTTPS and secure cookies for JWT in production.

---

## 13. Troubleshooting

- **API can’t connect to MongoDB**
  - Check `MONGO_URL` and that the Mongo container is running (`docker compose ps`).
- **API can’t connect to Postgres**
  - Check `DATABASE_URL` and Postgres container.
- **Stripe checkout fails**
  - Confirm `STRIPE_SECRET_KEY` is valid and webhooks are configured.
- **Emails not sending**
  - Check SMTP env vars and provider logs.

If something is unclear or you need more instructions (e.g. for deployment on a specific host), open an issue in the GitHub repo and describe your environment.
