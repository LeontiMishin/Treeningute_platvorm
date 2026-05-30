# FitNest

FitNest is a bilingual full-stack fitness platform for watching workout videos, managing playlists, and simulating subscription payments.

The project is split into two main parts:

- backend - Express, Prisma, PostgreSQL, JWT authentication, Zod validation, and Swagger API docs
- frontend - React, Vite, TypeScript, and responsive custom CSS

The backend handles data, authentication, role checks, CRUD operations, and report queries. The frontend renders the user interface, language switching, playlists, checkout simulation, and the admin panel.

## Project Structure

```text
Treeningute_platvorm/
|-- client/
|   |-- src/
|   |   |-- App.tsx           # Main React application
|   |   |-- App.css           # Global styling and responsive layout
|   |   |-- api.ts            # API client for backend requests
|   |   |-- appCopy.ts        # UI text in English and Estonian
|   |   |-- appDefaults.ts    # Default form values
|   |   |-- appHelpers.ts     # Shared helper functions
|   |   |-- appTypes.ts       # Frontend UI types
|   |   |-- components/
|   |   |   `-- Common.tsx     # Shared UI components
|   |   `-- types.ts           # Shared API entity types
|   |-- vite.config.ts
|   `-- package.json
|-- server/
|   |-- prisma/
|   |   |-- schema.prisma      # Database schema
|   |   `-- seed.ts            # Demo data and database setup
|   |-- src/
|   |   |-- app.ts             # Express app setup
|   |   |-- server.ts          # Server entry point
|   |   |-- config/            # Environment configuration
|   |   |-- controllers/       # HTTP handlers
|   |   |-- middlewares/       # Auth, validation, and error handling
|   |   |-- routes/            # API routes
|   |   |-- utils/             # Shared backend helpers
|   |   |-- lib/               # Prisma client
|   |   |-- docs/              # Swagger config
|   |   `-- types/             # Express type augmentation
|   `-- package.json
|-- docs/
|   |-- Dokumentatsioon_Mishin_Maslov.docx
|   |-- database-ddl.sql
|   `-- database-support.sql
`-- README.md
```

The general rule is simple: routes connect the endpoints, controllers handle HTTP details, utils keep shared backend logic, and the frontend components stay reusable and small.

## Features

- register, log in, and log out
- load the current user from JWT
- bilingual interface: English and Estonian
- overview page with access summary and role-aware content
- workout library with search, trainer filter, category filter, and video modal playback
- playlists with create, select, delete, add video, remove video, and watch-from-playlist flow
- plan selection with simulated checkout popup
- admin panel for categories, trainers, packages, videos, and users
- toast confirmations and destructive-action confirmation dialogs
- trainer-specific dashboard block on the overview page

## Roles

- Guest - can see the landing overview, but cannot use protected pages
- User - can browse videos, manage playlists, and choose plans
- Trainer - a regular authenticated user linked to a trainer profile; sees an extra trainer dashboard block and trainer-specific reporting context
- Admin - has access to the full admin panel and all management actions

Admin notes:

- the admin page is visible only to the admin account
- destructive actions use a confirmation dialog before applying changes
- admin role is resolved from `roleCode = ADMIN` or from `ADMIN_EMAIL` in the backend env
- the trainer role is not a separate login role; it is derived from the linked trainer profile

## Requirements

- Node.js
- npm
- PostgreSQL

## Backend Setup

Go to the backend folder:

```bash
cd server
npm install
```

Create `server/.env` using the backend environment variables below:

```env
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=treeningute_platvorm"
JWT_SECRET="change-this-secret"
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@treening.ee
ADMIN_PASSWORD=Admin123!
```

Notes:

- `ADMIN_EMAIL` defaults to `admin@treening.ee` if not set
- `ADMIN_PASSWORD` is used by the seed script when present; otherwise the seed falls back to `Admin123!`
- do not commit real `.env` files

Generate the Prisma client:

```bash
npm run prisma:generate
```

Create or reset the demo data:

```bash
npm run seed
```

Start the backend in development:

```bash
npm run dev
```

Build the backend:

```bash
npm run build
```

Run the built backend:

```bash
npm run start
```

The local API is available at:

`http://localhost:3000/api`

Health check:

`http://localhost:3000/health`

Swagger documentation:

`http://localhost:3000/api/docs`

## Frontend Setup

Go to the client folder:

```bash
cd client
npm install
```

Create `client/.env` if you want to override the API proxy target:

```env
VITE_API_PROXY_TARGET=http://127.0.0.1:3000
```

Start the frontend in development:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

By default the frontend runs on:

`http://localhost:5173`

## Full Local Run

Open two terminals.

### Terminal 1

```bash
cd server
npm install
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

## Main API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Content

- `GET /api/categories`
- `GET /api/trainers`
- `GET /api/videos`
- `GET /api/packages`
- `GET /api/playlists`
- `GET /api/subscriptions`

### Admin and reports

- `GET /api/users`
- `GET /api/reports/member/access`
- `GET /api/reports/member/progress`
- `GET /api/reports/trainer/programs`
- `GET /api/reports/trainer/videos`
- `GET /api/reports/admin/revenue`
- `GET /api/reports/admin/content-quality`

## Database Project Materials

The university database materials are stored in the `docs/` folder:

- [Word documentation](docs/Dokumentatsioon_Mishin_Maslov.docx)
- [Database DDL](docs/database-ddl.sql)
- [Database support SQL](docs/database-support.sql)

These files cover:

- project overview
- roles and users
- ERD and normalization notes
- table definitions and constraints
- indexes and their purpose
- views by role
- functions and triggers
- test data generation
- NoSQL example notes

## Security Notes

- passwords are stored as bcrypt hashes
- API access uses JWT bearer tokens
- protected routes require authentication
- admin actions require admin access
- trainer-specific information is derived from the linked trainer profile
- destructive frontend actions use confirmation dialogs
- success and error toasts appear on the current screen and disappear automatically

## Useful Commands

### Backend

```bash
cd server
npm run prisma:generate
npm run seed
npm run build
npm run dev
```

### Frontend

```bash
cd client
npm run build
npm run dev
npm run preview
```

## Verification

This project is currently verified with:

- `npm run build` in `client`
- `npm run build` in `server`

If you change the database schema or seed data, run the backend seed again before testing the frontend.
