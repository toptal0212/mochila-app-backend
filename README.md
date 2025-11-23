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
│   └── dataStore.js # Database operations (Vercel Postgres)
├── scripts/          # Database scripts
│   └── init-db.sql  # Database schema initialization
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

## Database Setup (Vercel Postgres)

This project uses **Vercel Postgres** for data persistence.

### 1. Create Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database** → Select **Postgres**
4. Choose a name for your database (e.g., `mochila-db`)
5. Select a region closest to your users
6. Click **Create**

### 2. Initialize Database Schema

After creating the database, run the initialization script:

**Option A: Using Vercel Dashboard**
1. Go to your database in Vercel Dashboard
2. Click on **Query** tab
3. Copy and paste the contents of `scripts/init-db.sql`
4. Execute the SQL script

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your project
vercel link

# Run the SQL script
vercel db execute scripts/init-db.sql
```

### 3. Environment Variables

Vercel automatically provides the following environment variables when you create a Postgres database:
- `POSTGRES_URL` - Connection string
- `POSTGRES_PRISMA_URL` - Prisma connection string (if using Prisma)
- `POSTGRES_URL_NON_POOLING` - Direct connection string

These are automatically available in your Vercel functions. No manual configuration needed!

### 4. Local Development

For local development, you can:

**Option A: Use Vercel Postgres (Recommended)**
1. Get your `POSTGRES_URL` from Vercel Dashboard
2. Add it to your local `.env` file:
   ```env
   POSTGRES_URL=your-vercel-postgres-url
   ```

**Option B: Use Local PostgreSQL**
1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb mochila_dev
   ```
3. Run the schema:
   ```bash
   psql mochila_dev < scripts/init-db.sql
   ```
4. Add to `.env`:
   ```env
   POSTGRES_URL=postgresql://user:password@localhost:5432/mochila_dev
   ```

### Database Schema

The database includes the following tables:
- `users` - User profiles and information
- `user_photos` - Multiple photos per user
- `likes` - Like relationships between users
- `footprints` - Profile view tracking

See `scripts/init-db.sql` for the complete schema definition.

## Features

- ✅ **Vercel Postgres Database** - Persistent data storage
- ✅ Dynamic user and member data
- ✅ Image upload and storage
- ✅ Likes and footprints tracking
- ✅ Profile views tracking
- ✅ Multiple photos support
- ✅ Absolute URL generation for images
- ✅ Automatic database connection management
