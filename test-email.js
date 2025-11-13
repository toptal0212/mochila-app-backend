/**
 * Test script to verify email configuration
 * Run: node test-email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const createTransporter = () => {
  // Option 1: Using Gmail SMTP
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
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

  // Default: Console transport
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
};

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');
  
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testCode = '123456';
  
  console.log('Configuration:');
  console.log('- Email Service:', process.env.EMAIL_SERVICE || 'console (testing mode)');
  console.log('- From:', process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@mochila.com');
  console.log('- To:', testEmail);
  console.log('- Code:', testCode);
  console.log('');

  try {
    const transporter = createTransporter();
    
    // Verify connection
    if (process.env.EMAIL_SERVICE || process.env.SMTP_HOST) {
      console.log('🔍 Verifying SMTP connection...');
      await transporter.verify();
      console.log('✅ SMTP connection verified!\n');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@mochila.com',
      to: testEmail,
      subject: '認証コード - Test',
      html: `
        <div style="font-family: 'Noto Sans JP', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6758E8; text-align: center;">認証コード</h2>
          <p style="font-size: 16px; color: #4A4A4A; line-height: 1.6;">
            こんにちは、<br/><br/>
            あなたの認証コードは以下の通りです：
          </p>
          <div style="background-color: #e9f2f2; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h1 style="color: #6758E8; font-size: 32px; letter-spacing: 8px; margin: 0;">${testCode}</h1>
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

${testCode}

このコードは10分間有効です。
このメールに心当たりがない場合は、無視してください。
      `,
    };

    console.log('📤 Sending test email...');
    const info = await transporter.sendMail(mailOptions);

    if (!process.env.EMAIL_SERVICE && !process.env.SMTP_HOST) {
      console.log('\n═══════════════════════════════════════');
      console.log('📧 EMAIL CONTENT (Console Mode)');
      console.log('═══════════════════════════════════════');
      console.log('To:', testEmail);
      console.log('Subject:', mailOptions.subject);
      console.log('Code:', testCode);
      console.log('\n--- Text Content ---');
      console.log(mailOptions.text);
      console.log('═══════════════════════════════════════\n');
      console.log('ℹ️  To actually send emails, configure EMAIL_SERVICE in .env file');
      console.log('    See setup-email.md for instructions\n');
    } else {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      console.log('📬 Check your inbox at:', testEmail);
      console.log('\n💡 To test with a different email, set TEST_EMAIL in .env\n');
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your .env file configuration');
    console.error('2. Verify email service credentials');
    console.error('3. See setup-email.md for detailed instructions');
    process.exit(1);
  }
}

testEmail();

