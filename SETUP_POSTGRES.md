# How to Add POSTGRES_PRISMA_URL in Vercel

## Step-by-Step Guide

### Step 1: Create Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`mochila-app-backend`)
3. Click on the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Enter a database name (e.g., `mochila-db`)
7. Select a region (choose closest to your users)
8. Click **Create**

### Step 2: Get Environment Variables

After creating the database, Vercel automatically provides environment variables. To view them:

**Option A: From Database Page**
1. Go to **Storage** → Click on your database
2. Click on the **.env.local** tab
3. You'll see all the connection strings:
   ```
   POSTGRES_URL=postgres://...
   POSTGRES_PRISMA_URL=postgres://...?pgbouncer=true&connect_timeout=15
   POSTGRES_URL_NON_POOLING=postgres://...
   ```

**Option B: From Project Settings**
1. Go to your project → **Settings** → **Environment Variables**
2. Check if `POSTGRES_PRISMA_URL` is already there (it should be auto-added)

### Step 3: Verify Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Ensure these variables exist:
   - ✅ `POSTGRES_PRISMA_URL`
   - ✅ `POSTGRES_URL_NON_POOLING`
   - ✅ `POSTGRES_URL` (optional, but usually auto-added)

3. Make sure they are enabled for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Step 4: Manual Setup (If Not Auto-Added)

If the environment variables are not automatically added:

1. Go to **Storage** → Your database → **.env.local** tab
2. Copy the `POSTGRES_PRISMA_URL` value
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key**: `POSTGRES_PRISMA_URL`
   - **Value**: Paste the copied URL
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

Repeat for `POSTGRES_URL_NON_POOLING` if needed.

### Step 5: Run Database Migrations ⚠️ IMPORTANT!

**This is the most important step!** Without migrations, your database tables won't exist.

**Option A: Using Vercel CLI (Recommended)**

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Link your project:
   ```bash
   cd mochila-backend
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

**Option B: Using Vercel Dashboard Query Tab**

1. Go to **Storage** → Your database → **Query** tab
2. Copy the SQL from `prisma/schema.prisma` and convert it to SQL
3. Or use this SQL (from `scripts/init-db.sql`):
   ```sql
   -- Run the SQL from scripts/init-db.sql
   ```
4. Paste and execute the SQL

**Option C: Create Migration Locally and Push**

1. Get environment variables from Vercel Dashboard
2. Create `.env` file locally with the connection strings
3. Run:
   ```bash
   npx prisma migrate dev --name init
   ```
4. This creates a migration in `prisma/migrations/`
5. Push the migration files to GitHub
6. In Vercel, the migration will run automatically on next deploy

### Step 6: Verify Database Setup

Check if migrations ran successfully:

**Using Vercel CLI:**
```bash
node scripts/check-migration.js
```

**Or manually check in Vercel Dashboard:**
1. Go to **Storage** → Your database → **Tables** tab
2. You should see: `users`, `user_photos`, `likes`, `footprints`

### Step 7: Redeploy

After running migrations:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** (or push a new commit to trigger auto-deploy)

## For Local Development

If you want to develop locally:

1. Get the connection strings from Vercel Dashboard (Step 2, Option A)
2. Create a `.env` file in `mochila-backend/` directory:
   ```env
   POSTGRES_PRISMA_URL=your-vercel-prisma-url-here
   POSTGRES_URL_NON_POOLING=your-vercel-non-pooling-url-here
   ```
3. Run:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

## Troubleshooting

### Environment variables not showing up?
- Make sure the database is linked to your project
- Check if you're in the correct project
- Try refreshing the page

### Connection errors?
- Verify the URLs are correct (no extra spaces)
- Check if the database is active (not paused)
- Ensure the environment variables are set for the correct environment (Production/Preview/Development)

### "表示名の保存に失敗しました" Error?

This usually means **database migrations haven't been run**:

1. ✅ Check if tables exist:
   - Go to **Storage** → Your database → **Tables** tab
   - If no tables exist, run migrations (Step 5)

2. ✅ Verify migrations:
   ```bash
   vercel env pull .env.local
   node scripts/check-migration.js
   ```

3. ✅ Check Vercel logs:
   - **Deployments** → Click deployment → **Functions** → View logs
   - Look for Prisma errors like "table does not exist"

4. ✅ Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Still having issues?
- Check Vercel logs: **Deployments** → Click deployment → **Functions** → View logs
- Verify Prisma schema is correct: `prisma/schema.prisma`
- Run `npx prisma validate` to check schema
- Ensure `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are set correctly

