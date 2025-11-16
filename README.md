# Buy2Enjoy monorepo

Quick start

1) Install dependencies
- Ensure Node.js and npm are installed
- Run: npm install

2) Start local services (optional)
- Requires Docker Desktop
- Run: docker compose up -d

3) Run apps in dev
- API: npm run api:dev
- Web: npm run web:dev

4) Build
- API: npm run api:build
- Web: npm run web:build

Notes
- Env files: apps/web/.env.local, apps/api/.env.local
- API default port: 4000

Environment
- apps/api .env (copy from .env.example):
  - DATABASE_URL=postgres://postgres:postgres@localhost:5432/buy2enjoy
  - MONGO_URL=mongodb://localhost:27017/buy2enjoy
  - JWT_SECRET=devsecret (for local only; switch to RS256 in prod)
  - STRIPE_SECRET_KEY=sk_test_...
  - STRIPE_WEBHOOK_SECRET=whsec_...
- apps/web .env:
  - NEXT_PUBLIC_API_URL=http://localhost:4000/api

Database & services
- If you have Docker Desktop: docker compose up -d
- Then run migrations: cmd /c npm run -w api prisma:migrate
- Seed sample products: cmd /c npm run -w api seed
- If you don’t use Docker, point DATABASE_URL and MONGO_URL to your local instances.
