const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

/**
 * Sends an email. Fails silently with a logged error in development if SMTP
 * isn't configured, so local development isn't blocked by missing credentials.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'ExpenseFlow AI <no-reply@expenseflow.ai>',
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${to}: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

const passwordResetTemplate = (resetUrl, name) => `
  <div style="font-family: Inter, Arial, sans-serif; background:#0B1220; padding:32px; color:#E5E7EB;">
    <div style="max-width:480px;margin:0 auto;background:#111827;border-radius:16px;padding:32px;border:1px solid #1F2937;">
      <h1 style="color:#818CF8;font-size:22px;margin-bottom:8px;">ExpenseFlow AI</h1>
      <p style="font-size:15px;line-height:1.6;">Hi ${name},</p>
      <p style="font-size:15px;line-height:1.6;">We received a request to reset your password. This link expires in ${
        process.env.RESET_TOKEN_EXPIRES_MINUTES || 15
      } minutes.</p>
      <a href="${resetUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:white;text-decoration:none;border-radius:10px;font-weight:600;">Reset Password</a>
      <p style="font-size:13px;color:#9CA3AF;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  </div>
`;

const inviteTemplate = (inviteUrl, groupName, inviterName) => `
  <div style="font-family: Inter, Arial, sans-serif; background:#0B1220; padding:32px; color:#E5E7EB;">
    <div style="max-width:480px;margin:0 auto;background:#111827;border-radius:16px;padding:32px;border:1px solid #1F2937;">
      <h1 style="color:#818CF8;font-size:22px;margin-bottom:8px;">ExpenseFlow AI</h1>
      <p style="font-size:15px;line-height:1.6;">${inviterName} invited you to join the group <strong>${groupName}</strong> on ExpenseFlow AI.</p>
      <a href="${inviteUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:linear-gradient(135deg,#10B981,#6366F1);color:white;text-decoration:none;border-radius:10px;font-weight:600;">Join Group</a>
    </div>
  </div>
`;

module.exports = { sendEmail, passwordResetTemplate, inviteTemplate };
