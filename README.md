# SV KASSA

A full-stack point-of-sale and inventory reporting system designed for analyzing shop storage efficiency, daily records, and business performance.

The application includes a modern Next.js frontend, a NestJS backend, PostgreSQL database integration, JWT authentication, and role-based access control (RBAC).

---

## Overview

SV KASSA is a business management platform focused on:

- Inventory and storage efficiency analysis
- Daily financial record tracking
- Shop management
- Dashboard analytics
- Role-based access management

The system is built with a scalable architecture using Next.js and NestJS, with PostgreSQL as the primary database.

---

## Live Application

**Frontend:**  
https://sv-kassa-new-frontend.vercel.app

**GitHub Repository:**  
https://github.com/YauheniBudzko/sv_kassa_new

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Recharts
- Sonner

### Backend
- NestJS
- TypeScript
- TypeORM
- PostgreSQL

### Authentication & Security
- JWT Authentication
- Cookie-based authentication
- Role-Based Access Control (RBAC)

### Infrastructure & Tools
- Docker
- Docker Compose
- Neon Database
- Vercel Deployment
- Concurrently

---

## Architecture

```bash
sv_kassa_new/
│
├── frontend/
│   ├── src/
│   └── app/
│
├── backend/
│   ├── src/
│   ├── config/
│   └── migrations/
│
├── docker-compose.yml
└── README.md
```

## Features

### Authentication System
- Login / Logout functionality
- JWT-based authentication
- Secure cookie storage
- Protected API routes

### Role-based Access Controll(RBAC)
The application supports three user roles:
| Role   | Permissions                                                   |
| ------ | ------------------------------------------------------------- |
| `CEO`  | Access all shops, statistics, dashboards, and shop management |
| `SHOP` | Access only own shop data                                     |
| `READ` | Read all shops, statistics, dashboards, and shop management   |

RBAC implementation includes:
- JWT Guard
- Roles Guard
- Roles Decorator
- Protected backend services

### Daily Records Management

Users can:
- Create records
- Edit records
- Delete records
- Fetch records by date range
- Analyze shop performance

Additional features:
- Statistics dashboard
- Interactive charts
- Table export functionality
- Day sheet management

### Shop Management

CEO users can:
- Create shops
- Manage shop data
- Access cross-shop statistics
- View centralized reporting

### Dashboard & Analytics

The application includes:
- Interactive dashboards
- Financial charts
- Storage efficiency analysis
- Responsive visual components
- Dynamic statistics pages

## Database conventions

### Monetary Values

All monetary values are stored as integer cents for precision and consistency.
```bash
$10.50 = 1050
```

### Date Format

Database format: `YYYY-MM-DD`

API DTO format: `DD.MM.YYYY`

## Installation

### 1. Clone git repository

```bash
git clone https://github.com/YauheniBudzko/sv_kassa_new.git
```

### 2. Navigate to the project directory

```bash
cd sv_kassa_new
```

### 3. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 6. Run from the project root

```bash
npm run dev
```

#### Local development
- frontend - [http://localhost:3000]
- backend - [http://localhost:5000]

## Deployment
The project is fully deployed:
| Service  | Platform |
| -------- | -------- |
| Frontend | Vercel   |
| Backend  | Vercel   |
| Database | Neon     |

### API & Backend

The backend exposes:
- REST API endpoints
- JWT-secured routes
- Shop-scoped business logic
- Statistics and reporting endpoints

The frontend communicates through:
- Next.js proxy API routes
- Secure cookie authentication
- Dashboard services

## Author

Full-stack business analytics and inventory management application built with Next.js, NestJS, PostgreSQL, and TypeScript.
Created by Yauheni Budzko
