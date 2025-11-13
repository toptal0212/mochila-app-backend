# Mochila Backend Server

Backend server for sending verification emails in the Mochila app.

## Project Structure

```
mochila-backend/
├── index.js          # Main server file
├── package.json      # Dependencies
├── .env              # Environment variables (create from .env.example)
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Setup

1. **Install dependencies:**
   ```bash
   cd mochila-backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp env.example .env
   ```
   Then edit `.env` with your email service credentials.
   
   **📖 For detailed setup instructions, see [setup-email.md](./setup-email.md)**
   
   Quick example (Gmail):
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Email Service Configuration
   # Options: 'gmail', 'sendgrid', 'mailgun', or 'custom'
   EMAIL_SERVICE=gmail

   # Gmail Configuration (if using Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password

   # SendGrid Configuration (if using SendGrid)
   # SENDGRID_API_KEY=your-sendgrid-api-key

   # Mailgun Configuration (if using Mailgun)
   # MAILGUN_SMTP_USER=your-mailgun-user
   # MAILGUN_SMTP_PASSWORD=your-mailgun-password

   # Custom SMTP Configuration (if using custom SMTP)
   # SMTP_HOST=smtp.example.com
   # SMTP_PORT=587
   # SMTP_SECURE=false
   # SMTP_USER=your-smtp-user
   # SMTP_PASSWORD=your-smtp-password

   # Email From Address
   EMAIL_FROM=noreply@mochila.com
   ```

## Email Service Options

### Option 1: Gmail (Development/Testing)

1. Enable 2-Step Verification on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

### Option 2: SendGrid (Production Recommended)

1. Sign up at https://sendgrid.com
2. Create an API key
3. Update `.env`:
   ```
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your-sendgrid-api-key
   EMAIL_FROM=your-verified-email@domain.com
   ```

### Option 3: Mailgun (Production)

1. Sign up at https://www.mailgun.com
2. Get SMTP credentials
3. Update `.env`:
   ```
   EMAIL_SERVICE=mailgun
   MAILGUN_SMTP_USER=your-mailgun-user
   MAILGUN_SMTP_PASSWORD=your-mailgun-password
   EMAIL_FROM=your-verified-email@domain.com
   ```

### Option 4: Custom SMTP

1. Update `.env` with your SMTP server details:
   ```
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-smtp-user
   SMTP_PASSWORD=your-smtp-password
   EMAIL_FROM=noreply@yourdomain.com
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

### POST `/api/send-verification-email`

Sends a verification code email to the specified address.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "subject": "認証コード",
  "message": "あなたの認証コードは 123456 です。"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Verification email sent successfully",
  "messageId": "..."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Testing Email Configuration

Before connecting the frontend, test your email setup:

```bash
npm run test-email
```

This will:
- Verify your SMTP connection
- Send a test email (or display it in console if using console mode)
- Show any configuration errors

You can also test with a specific email:
```bash
TEST_EMAIL=your-email@example.com npm run test-email
```

## Connecting to Frontend

The frontend (Mochila app) should be configured to connect to this backend.

**For development:**
- Frontend runs on a different port (Expo default)
- Backend runs on `http://localhost:3000`
- Update frontend `.env`:
  ```
  EXPO_PUBLIC_EMAIL_API_URL=http://localhost:3000/api/send-verification-email
  ```

**For production:**
- Deploy backend to a hosting service (Heroku, Railway, AWS, etc.)
- Update frontend `.env` with production backend URL:
  ```
  EXPO_PUBLIC_EMAIL_API_URL=https://your-backend-domain.com/api/send-verification-email
  ```

## Deployment

### Option 1: Railway
1. Connect your GitHub repository
2. Railway will auto-detect Node.js
3. Add environment variables in Railway dashboard
4. Deploy!

### Option 2: Heroku
```bash
heroku create mochila-backend
heroku config:set EMAIL_SERVICE=gmail EMAIL_USER=... EMAIL_PASSWORD=...
git push heroku main
```

### Option 3: AWS / DigitalOcean
- Follow standard Node.js deployment procedures
- Ensure environment variables are set
- Use PM2 or similar for process management

