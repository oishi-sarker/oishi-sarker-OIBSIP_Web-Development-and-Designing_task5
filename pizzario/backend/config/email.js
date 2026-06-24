import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Initialize the nodemailer transporter lazily.
 * Falls back to a test account (Ethereal) if no real credentials are configured,
 * so the app still runs in development without real email credentials.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD && process.env.EMAIL_APP_PASSWORD !== 'your_app_password_here') {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
    console.log('✅ Email transporter initialized (production mode)');
  } else {
    // Ethereal test account — preview URLs are logged to console
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('⚠️  Email transporter using Ethereal test account (dev mode). Preview URLs will be logged.');
  }
  return transporter;
};

/**
 * Send an email. Returns the preview URL when running on Ethereal.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transport = await getTransporter();
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@pizza.app';

    const info = await transport.sendMail({
      from: `Pizza Delivery <${from}>`,
      to,
      subject,
      text: text || '',
      html: html || text || '',
    });

    // nodemailer doesn't put the Ethereal preview link on `info` directly —
    // it has to be derived via getTestMessageUrl(). The previous code read
    // `info.messageUrl`, which is always undefined, so preview links never
    // printed in dev mode.
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    if (process.env.NODE_ENV !== 'production' && previewUrl) {
      console.log(`📧 Email preview URL: ${previewUrl}`);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

export default sendEmail;
