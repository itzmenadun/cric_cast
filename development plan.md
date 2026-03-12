# Supabase Database Hosting - Development Plan

This guide outlines the steps to host the CricCast PostgreSQL database on Supabase and configure the Prisma ORM in the backend to securely connect to it.

## 1. Create a Supabase Project
1. Go to the [Supabase Dashboard](https://supabase.com/dashboard) and sign in.
2. Click **New Project**.
3. Select an Organization (or create a new one).
4. Provide a **Project Name** (e.g., `criccast-db`).
5. Generate a strong **Database Password** and save it securely. You will need it later.
6. Choose a **Region** close to your users or hosted backend.
7. Click **Create New Project**. (It will take a few minutes for the database to provision).

## 2. Retrieve Connection Strings
Supabase provides connection pooling (Supavisor). For Prisma, you optimally need two connection strings: one for connection pooling (for general queries) and one direct connection (for applying migrations).

1. In your Supabase dashboard, go to **Project Settings** -> **Database**.
2. Scroll to the **Connection string** section. 
3. Note down the **Transaction Pooler** string and the **Direct** connection string.

## 3. Configure the Backend Environment
Open `d:\cric_cast\backend\.env` (create it if it doesn't exist) and set up your connection variables:

```env
# Connection pooler string (used for application queries)
# Appends ?pgbouncer=true to tell Prisma to handle pooling correctly
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection string (used for Prisma migrations)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@[region].pooler.supabase.com:5432/postgres"
```
*(Ensure you replace `[project-ref]`, `[password]`, and `[region]` with your actual Supabase credentials).*

## 4. Update Prisma Schema
Modify `d:\cric_cast\backend\prisma\schema.prisma` to include the `directUrl` pointing to your environment variable. 

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## 5. Push Schema & Run Migrations
Run the following commands in the `d:\cric_cast\backend` directory to apply your schema to the Supabase database:

1. Create and apply the migration:
   ```bash
   npx prisma migrate dev --name init_supabase
   ```
   *(Note: If you already have a history of migrations in a `prisma/migrations` folder and just want to apply them, use `npx prisma migrate deploy` instead).*

2. Regenerate the Prisma Client just to be safe:
   ```bash
   npx prisma generate
   ```

3. (Optional) Run your seed script to populate initial dummy data or static configurations:
   ```bash
   npm run seed
   ```

## 6. Verify Connection
1. You can view your successfully migrated tables using Prisma Studio:
   ```bash
   npm run prisma:studio
   ```
2. Start up the backend to ensure no database connection errors occur:
   ```bash
   npm run dev
   ```
3. Alternatively, check the **Table Editor** inside the Supabase Dashboard to confirm your schemas exist.

## Important Notes
- **Security**: Double check that `backend/.env` is in your `.gitignore` to prevent leaking production database passwords.
- **Connection Limit**: Supabase enforces connection limits. If you see connection timeout warnings in the backend, tune your database connection string and connection pooling sizing on your Supabase dashboard.
