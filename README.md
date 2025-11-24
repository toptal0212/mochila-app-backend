# Mochila Backend Server

Backend server for the Mochila dating/social app.

## Project Structure

```
mochila-backend/
├── index.js          # Main server file
├── routes/           # API route handlers
│   ├── user.js      # User profile routes
│   └── members.js   # Members list and profile routes
├── utils/            # Utility functions
│   └── dataStore.js # Database operations (Prisma Client)
├── prisma/           # Prisma configuration
│   └── schema.prisma # Database schema definition
├── scripts/          # Database scripts (legacy SQL)
│   └── init-db.sql  # Legacy SQL schema (not needed with Prisma)
├── uploads/          # Uploaded images directory (created automatically)
├── package.json      # Dependencies
└── README.md         # This file
```

## Setup

1. **Install dependencies:**
   ```bash
   cd mochila-backend
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file (for local development):
   ```env
   PORT=3000
   NODE_ENV=development
   API_BASE_URL=http://localhost:3000
   FRONTEND_URL=*
   
   # Email Service Configuration (optional)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@mochila.com
   ```

   **For Vercel deployment:**
   Set environment variables in Vercel Dashboard:
   ```env
   API_BASE_URL=https://mochila-app-backend.vercel.app
   FRONTEND_URL=*
   NODE_ENV=production
   ```

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:3000` by default.

## API Endpoints

### User Profile

- **POST `/api/user/profile`** - Create/Update user profile
- **GET `/api/user/profile/:email`** - Get user profile by email
- **POST `/api/user/profile/photo`** - Upload profile photo

### Members

- **GET `/api/members?sort=popular`** - Get members list (sort: popular, login, recommended, new)
- **GET `/api/members/:memberId`** - Get member profile by ID
- **GET `/api/members/likes/received/:userId`** - Get likes received by user
- **GET `/api/members/footprints/:userId`** - Get profile views (footprints) for user
- **POST `/api/members/likes`** - Add a like

### Email

- **POST `/api/send-verification-email`** - Send verification email

## Image Upload

**⚠️ Important for Vercel Deployment:**

Vercel is a serverless platform, and files uploaded to the local filesystem (`uploads/` directory) are **NOT persistent**. They will be lost when:
- The serverless function restarts
- A new deployment is made
- The function goes idle

**For production on Vercel, you need to use cloud storage:**

1. **Vercel Blob Storage** (Recommended)
   - Install: `npm install @vercel/blob`
   - Set `BLOB_READ_WRITE_TOKEN` in Vercel environment variables

2. **Cloudinary** (Alternative)
   - Install: `npm install cloudinary`
   - Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

3. **AWS S3** (Alternative)
   - Use `aws-sdk` or `@aws-sdk/client-s3`

**Local Development:**
Images are uploaded to the `uploads/` directory and served statically at `/uploads/:filename`.
The API returns absolute URLs like `http://localhost:3000/uploads/profile-photo-1234567890.jpg`.

**Vercel Production:**
The API returns absolute URLs like `https://mochila-app-backend.vercel.app/uploads/profile-photo-1234567890.jpg` (but files won't persist without cloud storage).

## Database Setup (Vercel Postgres + Prisma)

This project uses **Vercel Postgres** with **Prisma ORM** for data persistence.

### 1. Create Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database** → Select **Postgres**
4. Choose a name for your database (e.g., `mochila-db`)
5. Select a region closest to your users
6. Click **Create**

### 2. Environment Variables

Vercel automatically provides the following environment variables when you create a Postgres database:
- `POSTGRES_URL` - Connection string
- `POSTGRES_PRISMA_URL` - Prisma connection string (for Prisma Client)
- `POSTGRES_URL_NON_POOLING` - Direct connection string (for migrations)

These are automatically available in your Vercel functions. No manual configuration needed!

### 3. Deploy to Vercel (Automatic Prisma Setup)

**Vercel will automatically:**
- Install dependencies (`npm install`)
- Generate Prisma Client (via `postinstall` script)
- Run your application

**Steps:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Vercel will automatically detect and build your project
4. Prisma Client will be generated automatically during build

**No local setup required!** 🎉

### 4. Run Database Migrations

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your project
vercel link

# Run migrations
vercel env pull .env.local  # Get environment variables
npx prisma migrate deploy
```

**Option B: Using Vercel Dashboard**
1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Ensure `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are set
4. Go to **Deployments** tab
5. Click on the latest deployment → **Functions** tab
6. You can run migrations via Vercel's built-in terminal or use the CLI

**Option C: First Migration via Vercel Dashboard Query Tab**
1. Go to your database in Vercel Dashboard
2. Click on **Query** tab
3. Copy the SQL from `prisma/migrations` (if you created one locally)
4. Or use Prisma's migration SQL format

### 5. Local Development (Optional)

**Note:** You can develop entirely on Vercel, but if you want local development:

**Option A: Use Vercel Postgres (Recommended)**
1. Get your connection strings from Vercel Dashboard:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
2. Add them to your local `.env` file:
   ```env
   POSTGRES_PRISMA_URL=your-vercel-prisma-url
   POSTGRES_URL_NON_POOLING=your-vercel-non-pooling-url
   ```
3. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

**Option B: Use Local PostgreSQL**
1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb mochila_dev
   ```
3. Add to `.env`:
   ```env
   POSTGRES_PRISMA_URL=postgresql://user:password@localhost:5432/mochila_dev?schema=public&pgbouncer=true
   POSTGRES_URL_NON_POOLING=postgresql://user:password@localhost:5432/mochila_dev?schema=public
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

### 6. Prisma Studio (Optional)

To view and edit your database data visually:
```bash
npx prisma studio
```

This will open Prisma Studio at `http://localhost:5555`

### Database Schema

The database schema is defined in `prisma/schema.prisma` and includes:

- **User** - User profiles and information
- **UserPhoto** - Multiple photos per user
- **Like** - Like relationships between users
- **Footprint** - Profile view tracking

All relationships are properly defined with foreign keys and cascading deletes.

### Prisma Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply migrations (dev)
- `npm run prisma:deploy` - Apply migrations (production)
- `npm run prisma:studio` - Open Prisma Studio

## Features

- ✅ **Vercel Postgres + Prisma ORM** - Type-safe database access
- ✅ **Prisma Migrations** - Version-controlled database schema
- ✅ Dynamic user and member data
- ✅ Image upload and storage
- ✅ Likes and footprints tracking
- ✅ Profile views tracking
- ✅ Multiple photos support
- ✅ Absolute URL generation for images
- ✅ Automatic database connection management
- ✅ Type-safe database queries
