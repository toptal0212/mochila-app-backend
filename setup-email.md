# Email Setup Guide

This guide will help you configure the email service for sending verification codes.

## Quick Setup (Development)

### Option 1: Gmail (Easiest for Development)

1. **Enable 2-Step Verification:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Mochila Backend" as the name
   - Copy the generated 16-character password

3. **Create `.env` file:**
   ```bash
   cp env.example .env
   ```

4. **Edit `.env` file:**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

5. **Test the setup:**
   ```bash
   npm start
   ```

## Production Setup

### Option 2: SendGrid (Recommended for Production)

1. **Sign up for SendGrid:**
   - Go to https://sendgrid.com
   - Create a free account (100 emails/day free)

2. **Create API Key:**
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Name it "Mochila Backend"
   - Select "Full Access" or "Restricted Access" with Mail Send permissions
   - Copy the API key (you won't see it again!)

3. **Verify Sender:**
   - Go to Settings > Sender Authentication
   - Verify Single Sender or Domain
   - Use verified email as EMAIL_FROM

4. **Update `.env`:**
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   EMAIL_FROM=your-verified-email@domain.com
   ```

### Option 3: Mailgun (Alternative)

1. **Sign up for Mailgun:**
   - Go to https://www.mailgun.com
   - Create account (5,000 emails/month free)

2. **Get SMTP Credentials:**
   - Go to Sending > Domain Settings
   - Copy SMTP credentials

3. **Update `.env`:**
   ```env
   EMAIL_SERVICE=mailgun
   MAILGUN_SMTP_USER=your-mailgun-user
   MAILGUN_SMTP_PASSWORD=your-mailgun-password
   EMAIL_FROM=your-verified-email@domain.com
   ```

## Testing Without Email Service

If you don't want to configure an email service yet, the backend will use console transport by default. This means emails will be logged to the console instead of being sent.

To see the email content in console:
```bash
npm start
```

The email will be printed to the console when a request is made.

## Troubleshooting

### Gmail Issues:
- Make sure you're using an App Password, not your regular password
- App Passwords are only available if 2-Step Verification is enabled
- Check that "Less secure app access" is not blocking (though App Passwords is preferred)

### SendGrid Issues:
- Verify your sender email/domain
- Check API key has correct permissions
- Ensure you haven't exceeded daily limits

### General Issues:
- Check `.env` file is in the correct location (mochila-backend/)
- Restart the server after changing `.env`
- Check console for error messages
- Verify all required environment variables are set

## Testing the Email Function

1. Start the backend:
   ```bash
   cd mochila-backend
   npm start
   ```

2. Test with curl (or Postman):
   ```bash
   curl -X POST http://localhost:3000/api/send-verification-email \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "code": "123456",
       "subject": "認証コード",
       "message": "テストメッセージ"
     }'
   ```

3. Check your email inbox (or console if using console transport)

## Next Steps

Once email is configured, update your frontend `.env` file:
```env
EXPO_PUBLIC_EMAIL_API_URL=http://localhost:3000/api/send-verification-email
```

For production, replace `localhost:3000` with your deployed backend URL.

