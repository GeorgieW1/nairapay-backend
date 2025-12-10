import { Resend } from 'resend';
import dotenv from 'dotenv';
import { createTransport } from 'nodemailer';

dotenv.config();

// Initialize Resend with API key (lazy initialization to avoid startup errors)
let resend;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (e) {
  console.warn("⚠️ Resend API key missing or invalid on startup");
}

// Fallback to Nodemailer if RESEND_API_KEY not set (for local development)
let nodemailerTransporter = null;
if (!process.env.RESEND_API_KEY && process.env.SMTP_USER) {
  try {
    nodemailerTransporter = createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } catch (err) {
    console.error("Failed to load nodemailer:", err);
  }
}

// Config
// Use the verified domain or fallback to Resend's testing domain
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'NairaPay <info@virtualworkslimited.com.ng>';

/**
 * Shared Helper: Send Email via Resend or Nodemailer
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    // 1. Try Resend First (Production/Preferred)
    if (process.env.RESEND_API_KEY) {
      if (!resend) resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: SENDER_EMAIL,
        to: to,
        subject: subject,
        html: html
      });

      if (error) {
        // If Resend fails, log it and try fallback? 
        // For now, let's treat it as a hard failure so we know something is wrong with Resend.
        throw new Error(`Resend Error: ${error.message}`);
      }
      return { success: true, provider: 'resend' };
    }

    // 2. Fallback to Nodemailer (Local)
    else if (nodemailerTransporter) {
      await nodemailerTransporter.sendMail({
        from: `"NairaPay" <${process.env.SMTP_USER}>`,
        to: to,
        subject: subject,
        html: html
      });
      return { success: true, provider: 'nodemailer' };
    }

    // 3. No Provider Found
    else {
      throw new Error('No email service configured. Set RESEND_API_KEY or SMTP credentials.');
    }
  } catch (error) {
    console.error(`❌ Email failed (${subject}):`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP email for email verification
 */
export const sendOTPEmail = async (email, otp, fullName = 'User') => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Email Verification</h1>
        </div>
        <div class="content">
          <h2>Hello ${fullName}!</h2>
          <p>Thank you for registering with NairaPay. Please use the verification code below to activate your account:</p>
          <div class="otp-box">
            <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code</p>
            <p class="otp-code">${otp}</p>
          </div>
          <p><strong>⏰ This code will expire in 10 minutes.</strong></p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            Need help? Contact us at support@nairapay.com
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} NairaPay. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail({
    to: email,
    subject: '✉️ Email Verification Code - NairaPay',
    html: htmlContent
  });

  if (result.success) console.log('✅ OTP email sent to:', email);
  return result;
};

/**
 * Send transaction receipt email
 */
export const sendTransactionReceipt = async (email, transaction, user) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .receipt-box { background: white; border-left: 4px solid #11998e; padding: 20px; margin: 20px 0; }
        .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .receipt-label { font-weight: bold; color: #666; }
        .receipt-value { color: #333; }
        .success-badge { background: #38ef7d; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Transaction Successful!</h1>
        </div>
        <div class="content">
          <p>Hello ${user.fullName || user.name || 'User'},</p>
          <p>Your transaction has been completed successfully.</p>
          
          <div class="receipt-box">
            <h3 style="margin-top: 0;">Transaction Details</h3>
            <div class="receipt-row">
              <span class="receipt-label">Transaction ID:</span>
              <span class="receipt-value">${transaction._id}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Type:</span>
              <span class="receipt-value">${transaction.type.toUpperCase()}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Amount:</span>
              <span class="receipt-value">₦${transaction.amount.toLocaleString()}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Status:</span>
              <span class="success-badge">${transaction.status.toUpperCase()}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Date:</span>
              <span class="receipt-value">${new Date(transaction.createdAt).toLocaleString()}</span>
            </div>
            <div class="receipt-row" style="border-bottom: none;">
              <span class="receipt-label">New Balance:</span>
              <span class="receipt-value" style="font-size: 18px; font-weight: bold; color: #11998e;">₦${transaction.balanceAfter?.toLocaleString() || 'N/A'}</span>
            </div>
          </div>
          
          <p style="font-size: 12px; color: #666;">
            Keep this receipt for your records. If you have any questions, contact our support team.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} NairaPay. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail({
    to: email,
    subject: `✅ Transaction Receipt - ${transaction.type.toUpperCase()}`,
    html: htmlContent
  });

  if (result.success) console.log('✅ Receipt email sent to:', email);
  return result;
};

/**
 * Send admin alert email for new transactions
 */
export const sendAdminAlert = async (transaction, user) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('⚠️ ADMIN_EMAIL not configured, skipping admin alert');
    return { success: false, error: 'Admin email not configured' };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .alert-box { background: white; border-left: 4px solid #f5576c; padding: 15px; margin: 15px 0; }
        .info-row { padding: 8px 0; border-bottom: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔔 New Transaction Alert</h2>
        </div>
        <div class="content">
          <div class="alert-box">
            <h3>Transaction Details</h3>
            <div class="info-row"><strong>User:</strong> ${user.fullName || user.name || 'N/A'} (${user.email})</div>
            <div class="info-row"><strong>Type:</strong> ${transaction.type.toUpperCase()}</div>
            <div class="info-row"><strong>Amount:</strong> ₦${transaction.amount.toLocaleString()}</div>
            <div class="info-row"><strong>Status:</strong> ${transaction.status.toUpperCase()}</div>
            <div class="info-row"><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleString()}</div>
            <div class="info-row" style="border-bottom: none;"><strong>Transaction ID:</strong> ${transaction._id}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail({
    to: adminEmail,
    subject: `🔔 New Transaction Alert - ${transaction.type.toUpperCase()}`,
    html: htmlContent
  });

  if (result.success) console.log('✅ Admin alert sent');
  return result;
};

/**
 * Send E-pin purchase email
 */
export const sendEpinEmail = async (email, pins, category, fullName = 'User') => {
  const pinListHtml = pins.map((pin, index) => `
          <div style="background: #f0f4f8; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0; font-size: 12px; color: #666;">PIN ${index + 1}</p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #333;">${pin}</p>
          </div>
      `).join('');

  const instructions = {
    'WAEC': 'Visit <a href="https://www.waecdirect.org" target="_blank">www.waecdirect.org</a> to check your results.',
    'NECO': 'Visit <a href="https://result.neco.gov.ng" target="_blank">result.neco.gov.ng</a> to check your results.',
    'JAMB': 'Visit <a href="https://portal.jamb.gov.ng/efacility" target="_blank">portal.jamb.gov.ng</a> to check your results.'
  };

  const instructionText = instructions[category.toUpperCase()] || 'Visit the official exam body website to use your PIN.';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 E-pin Purchase Successful</h1>
        </div>
        <div class="content">
          <h2>Hello ${fullName}!</h2>
          <p>Here are your purchased ${category.toUpperCase()} E-pins:</p>
          
          ${pinListHtml}
          
          <div style="background: #fff; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #eee;">
            <h3 style="margin-top: 0; color: #667eea;">How to use:</h3>
            <p>${instructionText}</p>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Thank you for choosing NairaPay!
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} NairaPay. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail({
    to: email,
    subject: `🎓 Your ${category.toUpperCase()} E-pin Purchase - NairaPay`,
    html: htmlContent
  });

  if (result.success) console.log('✅ E-pin email sent to:', email);
  return result;
};
