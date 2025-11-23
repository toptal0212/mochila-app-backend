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
│   └── dataStore.js # Centralized data storage
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

## Data Storage

Currently using in-memory storage via `utils/dataStore.js`. In production, replace with a database (MongoDB, PostgreSQL, etc.).

## Features

- ✅ Dynamic user and member data
- ✅ Image upload and storage
- ✅ Likes and footprints tracking
- ✅ Profile views tracking
- ✅ Multiple photos support
- ✅ Absolute URL generation for images
