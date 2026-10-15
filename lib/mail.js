import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer transporter for Gmail
 */
function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('EMAIL_USER or EMAIL_PASS not configured in environment.');
    return null;
  }

  // Gmail SMTP transporter with app password
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ''), // Strip spaces in 16-char app password if present
    },
  });
}

/**
 * Send 6-Digit OTP verification code email
 */
export async function sendOtpEmail({ toEmail, otp, fullName = 'Business Owner', type = 'register' }) {
  const transporter = getTransporter();

  const isPasswordReset = type === 'reset';
  const subject = isPasswordReset
    ? `🔐 [ZERIC] ${otp} is your Password Reset Code`
    : `✨ [ZERIC] ${otp} is your Account Verification Code`;

  const title = isPasswordReset ? 'Password Reset Verification' : 'Verify Your Owner Account';
  const actionText = isPasswordReset
    ? 'Use the 6-digit code below to reset your ZERIC password.'
    : 'Welcome to ZERIC! Use the 6-digit code below to verify your email and activate your business terminal.';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(94, 23, 235, 0.08);">
              <!-- Header -->
              <tr>
                <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, #5E17EB 0%, #7C3AED 100%); text-align: center;">
                  <div style="display: inline-block; background-color: #ffffff; width: 48px; height: 48px; border-radius: 14px; line-height: 48px; font-size: 24px; font-weight: 900; color: #5E17EB; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    Z
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">ZERIC</h1>
                  <p style="margin: 4px 0 0 0; color: rgba(255, 255, 255, 0.85); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Made Simpler And Much Faster</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 32px;">
                  <p style="margin: 0 0 8px 0; font-size: 15px; color: #334155;">Hello <strong>${fullName}</strong>,</p>
                  <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b; line-height: 1.6;">${actionText}</p>

                  <!-- OTP Display Box -->
                  <div style="background-color: #f5f3ff; border: 2px dashed #c4b5fd; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 12px; font-weight: 800; color: #6d28d9; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your 6-Digit Verification Code</div>
                    <div style="font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #5E17EB; font-family: monospace;">${otp}</div>
                    <div style="font-size: 12px; color: #8b5cf6; margin-top: 8px; font-weight: 600;">Valid for 10 minutes only</div>
                  </div>

                  <p style="margin: 0 0 16px 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                    🛡️ <strong>Security Tip:</strong> ZERIC representatives will never ask you for this OTP code. Do not share it with anyone.
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                    If you did not initiate this request, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                    &copy; ${new Date().getFullYear()} ZERIC &bull; Smart Queue Management System
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!transporter) {
    console.warn(`[Nodemailer Simulated] Transporter not ready. OTP for ${toEmail}: ${otp}`);
    return { success: true, simulated: true, otp };
  }

  try {
    const fromEmail = process.env.EMAIL_USER?.trim() || 'theinsightfact04@gmail.com';
    const info = await transporter.sendMail({
      from: `"ZERIC" <${fromEmail}>`,
      to: toEmail.trim(),
      subject,
      text: `Your ZERIC verification code is ${otp}. Valid for 10 minutes.`,
      html,
    });
    console.log(`[Nodemailer] Email sent to ${toEmail}:`, info.messageId);
    return { success: true, messageId: info.messageId, otp };
  } catch (error) {
    console.error(`[Nodemailer Error] Failed to send email to ${toEmail}:`, error.message);
    // Don't break registration flow if SMTP fails on local network, return simulated fallback
    return { success: false, error: error.message, otp };
  }
}
