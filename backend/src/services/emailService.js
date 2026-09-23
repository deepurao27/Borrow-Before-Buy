import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let transporter;

try {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
  });
} catch (err) {
  logger.warn('SMTP transporter initialization deferred');
}

/**
 * Send Email Verification Token Link
 */
export const sendVerificationEmail = async ({ to, name, token }) => {
  const verifyUrl = `${env.CLIENT_URL}/verify?token=${token}`;

  // Log in development console for instant developer convenience
  logger.info(`=========================================`);
  logger.info(`📧 EMAIL VERIFICATION LINK FOR ${to}:`);
  logger.info(`🔗 ${verifyUrl}`);
  logger.info(`=========================================`);

  const mailOptions = {
    from: env.SMTP_FROM,
    to,
    subject: 'Verify your college email - Borrow Before Buy',
    text: `Hi ${name},\n\nWelcome to Borrow Before Buy! Please verify your college email address by visiting this link:\n${verifyUrl}\n\nThis link is valid for 24 hours.\n\nCheers,\nBorrow Before Buy Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FBF7F0; color: #1E2A3A; border-radius: 12px; border: 1px solid #E8DFD0;">
        <h2 style="font-family: Georgia, serif; color: #D9663A;">Borrow Before Buy (BBB)</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Welcome to your campus peer-to-peer sharing community. Please verify your college email address by clicking the link below:</p>
        <p style="margin: 25px 0;">
          <a href="${verifyUrl}" style="background-color: #D9663A; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Verify My College Email</a>
        </p>
        <p style="font-size: 12px; color: #607085;">Or copy and paste this URL into your browser:<br/>${verifyUrl}</p>
        <p style="font-size: 12px; color: #8E9BAE; margin-top: 30px; border-top: 1px solid #E8DFD0; padding-top: 15px;">
          BBB never handles money. All items are shared peer-to-peer between students.
        </p>
      </div>
    `
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      logger.warn({ err: err.message }, 'Failed to deliver email to Mailpit SMTP server (printed to console above)');
    }
  }
};

/**
 * Send Password Reset Link
 */
export const sendPasswordResetEmail = async ({ to, name, token }) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  logger.info(`=========================================`);
  logger.info(`🔑 PASSWORD RESET LINK FOR ${to}:`);
  logger.info(`🔗 ${resetUrl}`);
  logger.info(`=========================================`);

  const mailOptions = {
    from: env.SMTP_FROM,
    to,
    subject: 'Reset your password - Borrow Before Buy',
    text: `Hi ${name},\n\nYou requested a password reset for Borrow Before Buy. Visit this link to set a new password:\n${resetUrl}\n\nThis link is valid for 1 hour.\n\nBorrow Before Buy Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FBF7F0; color: #1E2A3A; border-radius: 12px; border: 1px solid #E8DFD0;">
        <h2 style="font-family: Georgia, serif; color: #D9663A;">Borrow Before Buy (BBB)</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We received a request to reset your password. Click the link below to choose a new password:</p>
        <p style="margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #D9663A; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
        </p>
        <p style="font-size: 12px; color: #607085;">Or copy and paste this URL into your browser:<br/>${resetUrl}</p>
        <p style="font-size: 12px; color: #8E9BAE; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      logger.warn({ err: err.message }, 'Failed to deliver email to Mailpit SMTP server (printed to console above)');
    }
  }
};

/**
 * Send 6-digit Login OTP Email
 */
export const sendOtpEmail = async ({ to, name, otp }) => {
  logger.info(`=========================================`);
  logger.info(`🔑 LOGIN OTP FOR ${to}: [ ${otp} ]`);
  logger.info(`=========================================`);

  const mailOptions = {
    from: env.SMTP_FROM,
    to,
    subject: `${otp} is your Borrow Before Buy verification code`,
    text: `Hi ${name || 'Student'},\n\nYour 6-digit verification login code for Borrow Before Buy is:\n\n${otp}\n\nThis code expires in 10 minutes.\n\nCheers,\nBorrow Before Buy Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #FBF7F0; color: #1E2A3A; border-radius: 12px; border: 1px solid #E8DFD0;">
        <h2 style="font-family: Georgia, serif; color: #D9663A; margin-top: 0;">Borrow Before Buy (BBB)</h2>
        <p>Hi <strong>${name || 'Student'}</strong>,</p>
        <p>Use the 6-digit verification code below to securely sign in to your Borrow Before Buy account:</p>
        <div style="margin: 25px 0; padding: 18px; background-color: #ffffff; border: 2px dashed #D9663A; border-radius: 8px; text-align: center;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #D9663A;">${otp}</span>
        </div>
        <p style="font-size: 13px; color: #607085;">This code will expire in 10 minutes. If you did not request this login code, you can safely ignore this email.</p>
        <p style="font-size: 12px; color: #8E9BAE; margin-top: 30px; border-top: 1px solid #E8DFD0; padding-top: 15px;">
          BBB never handles money. All items are shared peer-to-peer between students.
        </p>
      </div>
    `
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      logger.warn({ err: err.message }, 'Failed to deliver OTP to SMTP server (code printed to console above)');
    }
  }
};

