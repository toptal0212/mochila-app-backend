const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || 'https://mochila-app-backend.vercel.app';

// Middleware
// Configure CORS to allow requests from frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Allow all origins in development, set specific URL in production
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());

// Serve uploaded files statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
    // Option 1: Using Gmail SMTP (for development/testing)
    if (process.env.EMAIL_SERVICE === 'gmail') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
            },
        });
    }

    // Option 2: Using SendGrid SMTP
    if (process.env.EMAIL_SERVICE === 'sendgrid') {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY,
            },
        });
    }

    // Option 3: Using Mailgun SMTP
    if (process.env.EMAIL_SERVICE === 'mailgun') {
        return nodemailer.createTransport({
            host: 'smtp.mailgun.org',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILGUN_SMTP_USER,
                pass: process.env.MAILGUN_SMTP_PASSWORD,
            },
        });
    }

    // Option 4: Custom SMTP
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    // Default: Console transport for testing (logs email to console)
    return nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
        logger: true,
    });
};

// Email sending endpoint
app.post('/api/send-verification-email', async(req, res) => {
    try {
        const { email, code, subject, message } = req.body;

        // Validation
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                error: 'Email and code are required',
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
            });
        }

        const transporter = createTransporter();

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@mochila.com',
            to: email,
            subject: subject || 'mochilaアプリからの確認コード',
            html: `
        <div style="font-family: 'Noto Sans JP', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6758E8; text-align: center;">認証コード</h2>
          <p style="font-size: 16px; color: #4A4A4A; line-height: 1.6;">
            こんにちは、<br/><br/>
            あなたの認証コードは以下の通りです：
          </p>
          <div style="background-color: #e9f2f2; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h1 style="color: #6758E8; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h1>
          </div>
          <p style="font-size: 14px; color: #999; line-height: 1.6;">
            このコードは10分間有効です。<br/>
            このメールに心当たりがない場合は、無視してください。
          </p>
        </div>
      `,
            text: `
認証コード

あなたの認証コードは以下の通りです：

${code}

このコードは10分間有効です。
このメールに心当たりがない場合は、無視してください。
      `,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        // If using console transport, log the email content
        if (!process.env.EMAIL_SERVICE && !process.env.SMTP_HOST) {
            console.log('\n═══════════════════════════════════════');
            console.log('📧 EMAIL CONTENT (Console Mode)');
            console.log('═══════════════════════════════════════');
            console.log('To:', email);
            console.log('Subject:', mailOptions.subject);
            console.log('Code:', code);
            console.log('\n--- Text Content ---');
            console.log(mailOptions.text);
            console.log('\n--- HTML Content ---');
            console.log(mailOptions.html);
            console.log('═══════════════════════════════════════\n');
        } else {
            console.log('✅ Email sent successfully:', {
                to: email,
                code: code,
                messageId: info.messageId,
            });
        }

        res.json({
            success: true,
            message: 'Verification email sent successfully',
            messageId: info.messageId,
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send verification email',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// User profile routes
const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

// Members routes
const membersRoutes = require('./routes/members');
app.use('/api/members', membersRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Email service: ${process.env.EMAIL_SERVICE || 'console (testing mode)'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});