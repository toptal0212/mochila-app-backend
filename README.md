# Mochila Backend Server

Backend server for the Mochila dating/social app.

> **Why is the backend needed?** See [WHY_BACKEND_NEEDED.md](./WHY_BACKEND_NEEDED.md) for a detailed explanation.

## Project Structure

```
mochila-backend/
├── index.js          # Main server file
├── routes/           # API route handlers
│   ├── user.js      # User profile routes
│   └── members.js   # Members list and profile routes
├── utils/            # Utility functions
│   ├── dataStore.js # Database operations (Prisma Client)
│   └── s3Upload.js  # AWS S3 upload utilities
├── prisma/           # Prisma configuration
│   └── schema.prisma # Database schema definition
├── scripts/          # Database scripts (legacy SQL)
│   └── init-db.sql  # Legacy SQL schema (not needed with Prisma)
├── uploads/          # Uploaded images directory (local dev only)
├── test-s3.js        # S3 configuration test script
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
   
   # AWS S3 Configuration (for image uploads)
   USE_S3_STORAGE=true
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_S3_BUCKET=mochila-app-images
   AWS_REGION=ap-northeast-1
   
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
   
   # AWS S3 (Required for image uploads on Vercel!)
   USE_S3_STORAGE=true
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_S3_BUCKET=mochila-app-images
   AWS_REGION=ap-northeast-1
   ```

   > 📘 **AWS S3 Setup:** See [QUICKSTART_S3.md](./QUICKSTART_S3.md) for a quick setup guide or [AWS_S3_SETUP.md](./AWS_S3_SETUP.md) for detailed instructions.

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**Test S3 configuration:**
```bash
npm run test-s3
```

The server will run on `http://localhost:3000` by default.

### Health Check

Visit `http://localhost:3000/health` to verify server status and configuration:
```json
{
  "status": "ok",
  "timestamp": "2025-12-25T...",
  "storage": {
    "s3Enabled": true,
    "s3Configured": true,
    "bucket": "mochila-app-images",
    "region": "ap-northeast-1"
  },
  "email": {
    "service": "gmail"
  }
}
```

## Using ngrok to Share Backend with Clients

ngrok creates a public HTTPS tunnel to your local backend, allowing clients to test the API from anywhere.

### Step-by-Step Guide

1. **Start your backend server:**
   ```bash
   cd mochila-backend
   npm run dev
   ```
   Your server should be running on `http://localhost:3000`

2. **Start ngrok in a new terminal:**
   ```bash
   ngrok http 3000
   ```
   
   You'll see output like:
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:3000
   ```

3. **Copy the HTTPS URL** from the ngrok output (the `https://` URL, not the `http://` one)

4. **Share the URL with your client:**
   - Send them the full URL: `https://abc123.ngrok.io`
   - They can use this URL as their API base URL
   - Example API endpoint: `https://abc123.ngrok.io/api/user/profile`

### Monitoring Requests (Optional)

ngrok provides a web interface to monitor all incoming requests:

1. While ngrok is running, open your browser to: `http://localhost:4040`
2. You'll see:
   - All incoming requests in real-time
   - Request/response details
   - Request history
   - Useful for debugging and showing clients what's happening

### Using a Stable URL (Recommended for Client Sharing)

**Free ngrok accounts** can use a custom domain that doesn't change:

1. Sign up for a free ngrok account at https://dashboard.ngrok.com
2. Get your authtoken from the dashboard
3. Configure ngrok:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```
4. Reserve a free domain in the ngrok dashboard
5. Start ngrok with your custom domain:
   ```bash
   ngrok http 3000 --domain=your-custom-domain.ngrok-free.app
   ```

This way, the URL stays the same every time you start ngrok, so your client doesn't need to update their configuration.

### What to Share with Your Client

Send them:
- **API Base URL:** `https://your-domain.ngrok.io` (or your custom domain)
- **API Endpoints:** List of available endpoints (see API Endpoints section below)
- **Important:** Let them know this is a development/testing URL and may be temporary

### Security Considerations

⚠️ **Important for Client Sharing:**
- ngrok URLs are publicly accessible - anyone with the URL can access your backend
- Only share the URL with trusted clients
- Consider adding authentication/API keys for production use
- The tunnel is active only while ngrok is running
- For production, use your Vercel deployment URL instead

### Troubleshooting

- **Client can't connect:** Make sure both your backend server AND ngrok are running
- **URL changed:** If you restarted ngrok without a custom domain, you'll get a new URL - share the new one
- **Connection timeout:** Check that your backend is running on port 3000 and ngrok is forwarding to the correct port

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

### AWS S3 (Recommended for Vercel)

**⚠️ Important:** Vercel has a **read-only filesystem**. Uploaded files to the local `uploads/` directory will be lost immediately. You **MUST** use AWS S3 for persistent image storage on Vercel.

**Quick Setup:**
1. Create AWS account and S3 bucket
2. Configure IAM user with S3 permissions
3. Add AWS credentials to Vercel environment variables
4. Enable S3: `USE_S3_STORAGE=true`

📘 **Detailed Guide:** [QUICKSTART_S3.md](./QUICKSTART_S3.md)

**Features:**
- ✅ Persistent image storage
- ✅ Automatic upload to S3
- ✅ Automatic deletion of old images
- ✅ Public URLs for images
- ✅ Works seamlessly on Vercel
- ✅ Automatic fallback to local storage (dev mode)

**Testing:**
```bash
npm run test-s3
```

### Local Development (Filesystem)

For local development without S3:
1. Set `USE_S3_STORAGE=false` in `.env` (or omit it)
2. Images will be saved to `uploads/` directory
3. Served at `/uploads/:filename`

**Note:** Local storage won't work on Vercel!

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

- ✅ **AWS S3 Integration** - Persistent image storage for Vercel
- ✅ **Vercel Postgres + Prisma ORM** - Type-safe database access
- ✅ **Prisma Migrations** - Version-controlled database schema
- ✅ Dynamic user and member data
- ✅ Image upload and storage (S3 + local fallback)
- ✅ Likes and footprints tracking
- ✅ Profile views tracking
- ✅ Multiple photos support
- ✅ Absolute URL generation for images
- ✅ Automatic database connection management
- ✅ Type-safe database queries
- ✅ Email verification support

## Documentation

- 📘 [Quick S3 Setup](./QUICKSTART_S3.md) - Get S3 working in 15 minutes
- 📗 [Detailed S3 Guide](./AWS_S3_SETUP.md) - Complete AWS S3 setup instructions
- 📙 [Deployment Checklist](./DEPLOYMENT_CHECKLIST_S3.md) - Vercel deployment with S3
- 📕 [Why Backend Needed](./WHY_BACKEND_NEEDED.md) - Architecture explanation

## Testing

```bash
npm run dev           # Start development server
npm run test-email    # Test email configuration
npm run test-s3       # Test S3 configuration
npm run prisma:studio # Open database GUI
```
