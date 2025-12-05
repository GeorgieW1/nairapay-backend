
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Fallback to Nodemailer if RESEND_API_KEY not set (for local development)
let nodemailerTransporter = null;
if (!process.env.RESEND_API_KEY && process.env.SMTP_USER) {
    const nodemailer = await import('nodemailer');
    nodemailerTransporter = nodemailer.default.createTransport({
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
}

/**
 * Send OTP email for email verification
 */
export const sendOTPEmail = async (email, otp, fullName = 'User') => {
    try {
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

        // Use Resend if API key is available (production), otherwise use Nodemailer (local)
        if (process.env.RESEND_API_KEY) {
            const { data, error } = await resend.emails.send({
                from: 'NairaPay <onboarding@resend.dev>',
                to: email,
                subject: '✉️ Email Verification Code - NairaPay',
                html: htmlContent
            });

            if (error) {
                console.error('❌ Failed to send OTP email via Resend:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ OTP email sent via Resend to:', email);
            return { success: true };
        } else if (nodemailerTransporter) {
            // Fallback to Nodemailer for local development
            await nodemailerTransporter.sendMail({
                from: `"NairaPay" <${process.env.SMTP_USER}>`,
                to: email,
                subject: '✉️ Email Verification Code - NairaPay',
                html: htmlContent
            });

            console.log('✅ OTP email sent via Nodemailer to:', email);
            return { success: true };
        } else {
            throw new Error('No email service configured. Set RESEND_API_KEY or SMTP credentials.');
        }
    } catch (error) {
        console.error('❌ Failed to send OTP email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send transaction receipt email
 */
export const sendTransactionReceipt = async (email, transaction, user) => {
    try {
        const mailOptions = {
            from: `"NairaPay" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `✅ Transaction Receipt - ${transaction.type.toUpperCase()}`,
            html: `
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
      `
        };

        if (nodemailerTransporter) {
            await nodemailerTransporter.sendMail(mailOptions);
            console.log('✅ Receipt email sent to:', email);
            return { success: true };
        } else {
            console.warn('⚠️ No email transporter available');
            return { success: false, error: 'Email service not configured' };
        }
    } catch (error) {
        console.error('❌ Failed to send receipt email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send admin alert email for new transactions
 */
export const sendAdminAlert = async (transaction, user) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.warn('⚠️ ADMIN_EMAIL not configured, skipping admin alert');
            return { success: false, error: 'Admin email not configured' };
        }

        const mailOptions = {
            from: `"NairaPay Alerts" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `🔔 New Transaction Alert - ${transaction.type.toUpperCase()}`,
            html: `
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
      `
        };

        if (nodemailerTransporter) {
            await nodemailerTransporter.sendMail(mailOptions);
            console.log('✅ Admin alert sent');
            return { success: true };
        } else {
            console.warn('⚠️ No email transporter available');
            return { success: false, error: 'Email service not configured' };
        }
    } catch (error) {
        console.error('❌ Failed to send admin alert:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send E-pin purchase email
 */
export const sendEpinEmail = async (email, pins, category, fullName = 'User') => {
    try {
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

        const mailOptions = {
            from: `"NairaPay" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `🎓 Your ${category.toUpperCase()} E-pin Purchase - NairaPay`,
            html: `
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
      `
        };

        if (nodemailerTransporter) {
            await nodemailerTransporter.sendMail(mailOptions);
            console.log('✅ E-pin email sent to:', email);
            return { success: true };
        } else {
            console.warn('⚠️ No email transporter available');
            return { success: false, error: 'Email service not configured' };
        }
    } catch (error) {
        console.error('❌ Failed to send E-pin email:', error);
        return { success: false, error: error.message };
    }
};
