# TrainingPlatform

Online training platform inspired by [NETFIT](https://www.netfit.ee/), where users can watch workout videos, buy subscription packages, create playlists, and manage their training content through a modern bilingual frontend.

## Project structure

```text
treeningute_platvorm/
  client/   # React + Vite + TypeScript frontend
  server/   # Express + Prisma + PostgreSQL backend
  README.md
```

## Tech stack

### Frontend

- React
- Vite
- TypeScript
- Responsive custom CSS
- English / Estonian UI

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT authentication
- Zod validation
- Swagger documentation

## What already works

### User side

- register
- login
- logout
- load current user from JWT token
- browse workout videos from backend
- filter videos by trainer and category
- search videos by title and description
- view subscription plans
- create subscriptions
- create playlists
- rename playlists
- add and remove videos from playlists
- delete playlists

### Admin side

- manage categories
- manage trainers
- manage subscription packages
- manage videos
- manage users

## API entities

The backend contains CRUD-style routes for:

- users
- categories
- trainers
- videos
- subscription plans
- playlists
- subscriptions

Swagger UI:

`http://localhost:3000/api/docs`

Health check:

`http://localhost:3000/health`

## Backend setup

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Create environment file

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Example values:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@host:5432/db_name?schema=books_api"
JWT_SECRET=super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@treening.ee
ADMIN_PASSWORD=Admin123!
```

### 3. Generate Prisma client

```bash
npm run prisma:generate
```

### 4. Seed initial data

```bash
npm run seed
```

The seed creates:

- default admin user
- starter categories
- starter trainers
- starter subscription plans

Default admin credentials after seed:

- email: `admin@treening.ee`
- password: `Admin123!`

### 5. Start backend

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

## Frontend setup

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Start frontend

```bash
npm run dev
```

By default Vite runs on:

`http://localhost:5173`

## Frontend and backend integration

The frontend is already connected to the backend API.

### Default local setup

- backend: `http://127.0.0.1:3000`
- frontend: `http://127.0.0.1:5173` or `http://localhost:5173`

### Vite proxy

The frontend sends `/api/*` requests through the Vite proxy.

Default proxy target:

`http://127.0.0.1:3000`

If needed, you can override it with:

```env
VITE_API_PROXY_TARGET=http://127.0.0.1:3000
```

## Full local run

Open two terminals.

### Terminal 1

```bash
cd server
npm install
cp .env.example .env
npm run prisma:generate
npm run seed
npm run dev
```

### Terminal 2

```bash
cd client
npm install
npm run dev
```

Then open:

`http://localhost:5173`

## Useful backend routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Data

- `GET /api/categories`
- `GET /api/trainers`
- `GET /api/videos`
- `GET /api/packages`
- `GET /api/playlists`
- `GET /api/subscriptions`

## Database project documentation

For the university database project materials, see: