/**
 * Email sending via the Resend HTTP API (https://resend.com).
 *
 * Why not SMTP: Render's free web services block outbound traffic on SMTP
 * ports 25, 465 and 587 (since Sept 2025). Any nodemailer/SMTP setup will
 * silently time out on Render's free tier no matter how correct the
 * credentials are. Resend sends over plain HTTPS (port 443), which is never
 * blocked, so it works on free hosting too.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

// Values that are still the unedited placeholders from .env.example.
const PLACEHOLDER_VALUES = new Set(['your_resend_api_key', 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxx']);

/**
 * Validates that the Resend API key has actually been configured (not left
 * as a placeholder, and not missing entirely). Throws a clear, specific
 * error instead of letting the API call fail with a confusing 401.
 */
const assertResendConfigured = () => {
  const { RESEND_API_KEY } = process.env;

  if (!RESEND_API_KEY) {
    throw new Error(
      'RESEND_API_KEY is not set. Sign up at https://resend.com, create an API key, and set ' +
        'RESEND_API_KEY in your environment variables.'
    );
  }

  if (PLACEHOLDER_VALUES.has(RESEND_API_KEY)) {
    throw new Error('RESEND_API_KEY is still set to a placeholder value. Replace it with your real Resend API key.');
  }
};

/**
 * Sends an email via the Resend API. Always throws on failure (in every
 * environment) so the caller can react correctly and the real cause is
 * never hidden behind a fake "success" response to the client.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    assertResendConfigured();

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'ExpenseFlow AI <onboarding@resend.dev>',
        to,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Resend API responded with ${response.status}: ${errorBody}`);
    }
  } catch (error) {
    // Full detail goes to the server logs only — never exposed to the client.
    console.error(`[EmailService] Failed to send email to ${to}: ${error.message}`);
    throw error;
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