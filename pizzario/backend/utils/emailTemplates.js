/**
 * Simple HTML email templates.
 * Kept inline-style for max email client compatibility.
 */

const baseStyle = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#16110d; padding:32px; color:#1a202c;`;
const cardStyle = `max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,.3);border-top:4px solid #ff6b35;`;
const btnStyle = `display:inline-block;background:#ff6b35;color:#ffffff!important;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;`;
const footerStyle = `text-align:center;color:#a3917a;font-size:12px;margin-top:24px;`;

export const verifyEmailTemplate = (name, url) => `
<div style="${baseStyle}">
  <div style="${cardStyle}">
    <h1 style="margin:0 0 8px;color:#e6491a;font-size:24px;">🍕 Pizzario</h1>
    <p style="margin:0 0 16px;color:#4a5568;font-size:14px;">Verify your email address</p>
    <p>Hi ${name},</p>
    <p>Thanks for registering! Please verify your email address to start ordering delicious pizzas.</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="${url}" style="${btnStyle}">Verify Email</a>
    </p>
    <p style="font-size:13px;color:#718096;">Or copy this link into your browser:<br/>
      <span style="word-break:break-all;color:#3182ce;">${url}</span>
    </p>
    <p style="font-size:13px;color:#718096;">This link expires in 1 hour.</p>
    <p style="margin-top:24px;">If you did not create an account, you can safely ignore this email.</p>
  </div>
  <p style="${footerStyle}">© ${new Date().getFullYear()} Pizzario. All rights reserved.</p>
</div>`;

export const resetPasswordTemplate = (name, url) => `
<div style="${baseStyle}">
  <div style="${cardStyle}">
    <h1 style="margin:0 0 8px;color:#e6491a;font-size:24px;">🍕 Pizzario</h1>
    <p style="margin:0 0 16px;color:#4a5568;font-size:14px;">Password reset request</p>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to set a new password.</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="${url}" style="${btnStyle}">Reset Password</a>
    </p>
    <p style="font-size:13px;color:#718096;">Or copy this link into your browser:<br/>
      <span style="word-break:break-all;color:#3182ce;">${url}</span>
    </p>
    <p style="font-size:13px;color:#718096;">This link expires in 1 hour.</p>
    <p style="margin-top:24px;">If you didn't request a password reset, you can safely ignore this email.</p>
  </div>
  <p style="${footerStyle}">© ${new Date().getFullYear()} Pizzario. All rights reserved.</p>
</div>`;

export const lowStockTemplate = (lowStockItems) => {
  const rows = lowStockItems
    .map(
      (i) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-transform:capitalize;">${i.category}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${i.name}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#e6491a;font-weight:600;">${i.stock}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${i.threshold}</td>
      </tr>`
    )
    .join('');

  return `
<div style="${baseStyle}">
  <div style="${cardStyle}">
    <h1 style="margin:0 0 8px;color:#e6491a;font-size:24px;">⚠️ Low Stock Alert</h1>
    <p>The following ingredients have reached or fallen below their threshold. Please restock soon.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
      <thead>
        <tr style="background:#fff1ea;">
          <th style="padding:10px;text-align:left;border-bottom:2px solid #ffc2a3;">Category</th>
          <th style="padding:10px;text-align:left;border-bottom:2px solid #ffc2a3;">Item</th>
          <th style="padding:10px;text-align:left;border-bottom:2px solid #ffc2a3;">Current Stock</th>
          <th style="padding:10px;text-align:left;border-bottom:2px solid #ffc2a3;">Threshold</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:24px;">Please log in to the admin dashboard to restock.</p>
  </div>
  <p style="${footerStyle}">© ${new Date().getFullYear()} Pizzario. All rights reserved.</p>
</div>`;
};

export const orderStatusTemplate = (name, orderId, status) => `
<div style="${baseStyle}">
  <div style="${cardStyle}">
    <h1 style="margin:0 0 8px;color:#e6491a;font-size:24px;">🍕 Order Update</h1>
    <p>Hi ${name},</p>
    <p>Your order <strong>#${orderId}</strong> status has been updated to:</p>
    <p style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;background:#ffe0d1;color:#bf3814;padding:10px 20px;border-radius:6px;font-weight:600;text-transform:uppercase;font-size:14px;">
        ${status.replace(/_/g, ' ')}
      </span>
    </p>
    <p>You can view live updates in your dashboard.</p>
  </div>
  <p style="${footerStyle}">© ${new Date().getFullYear()} Pizzario. All rights reserved.</p>
</div>`;
