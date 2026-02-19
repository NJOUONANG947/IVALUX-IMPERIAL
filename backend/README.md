# IVALUX IMPERIAL - Backend API

Node.js + Express + Supabase REST API.

## Setup

1. **Install dependencies**
   ```bash
   cd backend && npm install
   ```

2. **Configure Supabase**
   - Copy `.env.example` to `.env`
   - Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

3. **Run schema**
   - Open Supabase Dashboard → SQL Editor
   - Run `sql/schema.sql`

4. **Start server**
   ```bash
   npm run dev
   ```
   API runs on http://localhost:3001

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/login | No | Email + password login |
| POST | /auth/logout | No | Logout |
| GET | /auth/me | Bearer | Current user + profile |
| GET | /products | No | List products (?country=CA) |
| POST | /products | Admin | Create product |
| POST | /employee/handle-product | Employee+ | Register product handling |
| GET | /employee/my-products | Employee+ | My assigned products |
| GET | /admin/product-handlings | Admin | All handlings |
| GET | /admin/distributors | Admin | List distributors |
| POST | /admin/distributors | Admin | Create distributor |
| POST | /track/product-placement | Bearer | Record AI placement |
