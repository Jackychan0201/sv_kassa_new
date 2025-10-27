# SV KASSA - final internship project
## A project for analysing shops' storages efficiency

## Project description
  
SV KASSA is a full-stack point-of-sale / inventory reporting application. It includes a Next.js frontend and a NestJS backend with PostgreSQL (TypeORM). The app stores monetary values in cents (integers) and exposes REST endpoints plus Next.js proxy API routes used by the frontend.

## Tech stack

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, Recharts, Sonner (toasts)
  - Main frontend entry: [frontend/src/app/layout.tsx](frontend/src/app/layout.tsx)
- Backend: NestJS, TypeScript, TypeORM, PostgreSQL
  - Main backend entry: [backend/src/main.ts](backend/src/main.ts)
- DB: PostgreSQL (migrations with TypeORM)
  - Data source config: [backend/src/config/orm.config.ts](backend/src/config/orm.config.ts)
- Auth: JWT (cookie-based)
  - JWT config: [`jwtConfig`](backend/src/config/jwt.config.ts)
- Dev tools: concurrently (runs frontend and backend together)

## Key features

- Authentication: login/logout with JWT cookies
  - Frontend API proxy for profile
- Role-based access control (RBAC):
  - Roles
  - JWT payload
  - Guards:
    - JWT guard
    - Roles guard
    - Roles decorator
- Daily records (CRUD + range queries)
  - Service
  - Frontend API route
  - Frontend components that interact with records:
    - Statistics page & charts
    - Table export dialog
    - Edit / create day sheets
- Shop management (CEO only)
  - Manage shops page
  - Create shop sheet
- Account management
  - Edit account sheet
- Dashboard UI components & providers
  - Dashboard context/provider
  - User provider
  - Sidebar
  - Visual components

## RBAC (Role-Based Access Control)

- Two roles: `CEO` and `SHOP`
- `CEO` can:
  - View and fetch records across all shops.
  - Manage shops (create, list).
  - See additional UI selectors for choosing shops in statistics and dashboard.
- `SHOP` can:
  - Operate only on its own shop data; endpoints enforce this in services.
- Guarding implemented via:
  - JWT guard
  - Roles guard & decorator

## Environment variables

Relevant env vars:

- Backend:
  - JWT_SECRET, JWT_EXPIRES_IN
  - DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, DB_SCHEMA, DB_SSL
  - PORT (server port)
- Frontend:
  - NEXT_PUBLIC_BASE_URL

## Notes / conventions

- Monetary values stored as integer cents (README root note).
- recordDate stored in DB as YYYY-MM-DD, DTO accepts and returns DD.MM.YYYY.
- Division rounding: floor semantics for integer division (README root note).

## Running the application locally

In order to run the application locally, complete the following steps:

- Clone the repo:
```bash
git clone https://github.com/Jackychan0201/sv_kassa_new
```

- Start the db:
```bash
docker-compose up -d
```

- Install the dependencies:
```bash
cd backend
npm install

cd frontend
npm install
```

- Run the project:
```bash
npm run dev
```

[!NOTE]
Both frontend and backend are started concurrently. 
You can access frontend via localhost:3000

## Application deployment

The application is deployed with the database running on Neon and both frontend and backend deployed on Vercel. To access the project, use the https://sv-kassa-new-frontend.vercel.app route


## Found a bug?
If you find an issue while testing the API or have suggestions for improvements, please contact me via email: y.budzko@softteco.eu
