# TrainingPlatform

Online training platform (like NETFIT - https://www.netfit.ee/) where users can watch training videos, buy packages, create training plans, and save playlists

## Projekti struktuur

```text
treeningute_platvorm/
  client/
  server/
  .gitignore
  README.md
```

## Backend stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT autentimine
- Swagger dokumentatsioon

## Mida backend sisaldab

- kasutaja registreerimine, sisselogimine ja väljalogimine
- rollid `ADMIN` ja `USER`
- privaatmarsruudid
- CRUD API järgmistele üksustele:
  - users
  - categories
  - trainers
  - videos
  - subscription plans
  - playlists
  - subscriptions
- vigade käsitlemine
- Zod valideerimine
- Swagger UI

## Kiire käivitus

```bash
cd server
npm install
cp .env.example .env
npm run prisma:generate
npm run seed
npm run dev
```

Swagger:

`http://localhost:3000/api/docs`

Health check:

`http://localhost:3000/health`