import nodemailer from "nodemailer";

let transporterInstance = null;

// Shared transporter factory — keeps credentials in backend env only
const createTransporter = () => {
  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporterInstance;
};

// ──────────────────────────────────────────
// ADMIN ORDER NOTIFICATION EMAIL (existing)
// ──────────────────────────────────────────
const sendOrderEmail = async (orderData) => {
  const transporter = createTransporter();
  const { address, items, amount, paymentMethod } = orderData;
  const orderDate = new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #E5E7EB;color:#111318;font-size:14px;">
          ${item.name}${item.size && item.size !== "Default" ? ` <span style="color:#6B7280;font-size:12px;">(${item.size})</span>` : ""}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #E5E7EB;text-align:center;color:#6B7280;font-size:14px;">
          x${item.quantity}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #E5E7EB;text-align:right;font-weight:600;color:#111318;font-size:14px;">
          Rs${new Intl.NumberFormat('en-PK').format(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const mailOptions = {
    from: `"GEAR. Orders" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_RECEIVER,
    subject: `New Order Received - Rs${new Intl.NumberFormat('en-PK').format(amount)}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#F7F8FA;font-family:'Inter',Arial,sans-serif;">
        <div style="max-width:580px;margin:40px auto;background:#fff;border-radius:24px;border:1px solid #E5E7EB;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,0.06);">
          
          <!-- Header -->
          <div style="background:#111318;padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;">
              <div style="width:32px;height:32px;background:#2563EB;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-weight:900;font-size:18px;line-height:1;">G</span>
              </div>
              <span style="color:#fff;font-weight:700;font-size:20px;letter-spacing:-0.5px;">GEAR<span style="color:#2563EB;">.</span></span>
            </div>
            <div style="background:#22C55E;display:inline-block;border-radius:50px;padding:8px 20px;">
              <span style="color:#fff;font-size:13px;font-weight:600;letter-spacing:0.5px;">🔔 NEW ORDER RECEIVED</span>
            </div>
          </div>

          <!-- Body -->
          <div style="padding:40px;">
            <h2 style="margin:0 0 28px;font-size:22px;font-weight:700;color:#111318;">Customer Details</h2>
            
            <div style="background:#F7F8FA;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0 0 4px;font-weight:600;color:#111318;">${address.firstName} ${address.lastName}</p>
              <p style="margin:0 0 4px;color:#6B7280;font-size:14px;"><a href="mailto:${address.email}" style="color:#2563EB;text-decoration:none;">${address.email}</a></p>
              <p style="margin:0 0 12px;color:#6B7280;font-size:14px;"><a href="tel:${address.phone}" style="color:#2563EB;text-decoration:none;">${address.phone}</a></p>
              <p style="margin:0 0 4px;color:#6B7280;font-size:14px;">${address.street}</p>
              <p style="margin:0 0 4px;color:#6B7280;font-size:14px;">${address.city}, ${address.state} ${address.zipcode}</p>
              <p style="margin:0;color:#6B7280;font-size:14px;">${address.country}</p>
            </div>

            <!-- Order Info -->
            <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:28px;">
              <div>
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Date</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#111318;">${orderDate}</p>
              </div>
              <div>
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Payment</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#111318;">${paymentMethod || 'N/A'}</p>
              </div>
            </div>

            <!-- Items Table -->
            <h3 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#111318;">Order Items</h3>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:2px solid #E5E7EB;">Product</th>
                  <th style="text-align:center;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:2px solid #E5E7EB;">Qty</th>
                  <th style="text-align:right;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:2px solid #E5E7EB;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>

            <!-- Total -->
            <div style="background:#111318;border-radius:12px;padding:16px 20px;margin-top:20px;display:flex;justify-content:space-between;align-items:center;">
              <span style="color:#fff;font-weight:600;font-size:15px;">Total Amount</span>
              <span style="color:#22C55E;font-weight:800;font-size:20px;">Rs${new Intl.NumberFormat('en-PK').format(amount)}</span>
            </div>
            
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ──────────────────────────────────────────
// OTP EMAIL — sent to customer during checkout
// Never log the OTP value in production
// ──────────────────────────────────────────
const sendOtpEmail = async (email, otp, firstName = "") => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"GEAR. Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Order Verification Code — GEAR.",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#F7F8FA;font-family:'Inter',Arial,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:24px;border:1px solid #E5E7EB;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,0.06);">
          
          <!-- Header -->
          <div style="background:#111318;padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:8px;">
              <div style="width:32px;height:32px;background:#2563EB;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-weight:900;font-size:18px;line-height:1;">G</span>
              </div>
              <span style="color:#fff;font-weight:700;font-size:20px;letter-spacing:-0.5px;">GEAR<span style="color:#2563EB;">.</span></span>
            </div>
          </div>

          <!-- Body -->
          <div style="padding:40px;">
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111318;">Verify Your Order</h2>
            <p style="margin:0 0 28px;color:#6B7280;font-size:15px;line-height:1.6;">
              ${firstName ? `Hi ${firstName},<br><br>` : ""}
              Use the code below to verify your email address and confirm your order. This code expires in <strong>10 minutes</strong> and can only be used once.
            </p>

            <!-- OTP Box -->
            <div style="background:#F7F8FA;border:2px solid #2563EB;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Verification Code</p>
              <p style="margin:0;font-size:44px;font-weight:900;color:#2563EB;letter-spacing:12px;font-family:monospace;">${otp}</p>
            </div>

            <p style="margin:0 0 8px;color:#6B7280;font-size:13px;">
              ⚠️ Do not share this code with anyone. GEAR. will never ask for your verification code.
            </p>
            <p style="margin:0;color:#6B7280;font-size:13px;">
              If you did not request this, please ignore this email — no order will be placed.
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#F7F8FA;border-top:1px solid #E5E7EB;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;">© ${new Date().getFullYear()} GEAR. Gaming Commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ──────────────────────────────────────────
// CUSTOMER ORDER CONFIRMATION EMAIL
// Sent after successful OTP verification
// ──────────────────────────────────────────
const sendCustomerConfirmationEmail = async (orderData, orderId) => {
  const transporter = createTransporter();
  const { address, items, amount, paymentMethod } = orderData;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #E5E7EB;color:#111318;font-size:14px;">
          ${item.name}${item.size && item.size !== "Default" ? ` <span style="color:#6B7280;font-size:12px;">(${item.size})</span>` : ""}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #E5E7EB;text-align:center;color:#6B7280;font-size:14px;">
          x${item.quantity}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #E5E7EB;text-align:right;font-weight:600;color:#111318;font-size:14px;">
          Rs${new Intl.NumberFormat('en-PK').format(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const orderIdShort = orderId ? orderId.substring(orderId.length - 8).toUpperCase() : "N/A";
  const orderDate = new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });

  const mailOptions = {
    from: `"GEAR. Store" <${process.env.EMAIL_USER}>`,
    to: address.email,
    subject: `Order Confirmed #${orderIdShort} — GEAR.`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#F7F8FA;font-family:'Inter',Arial,sans-serif;">
        <div style="max-width:580px;margin:40px auto;background:#fff;border-radius:24px;border:1px solid #E5E7EB;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,0.06);">

          <!-- Header -->
          <div style="background:#111318;padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;">
              <div style="width:32px;height:32px;background:#2563EB;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-weight:900;font-size:18px;line-height:1;">G</span>
              </div>
              <span style="color:#fff;font-weight:700;font-size:20px;letter-spacing:-0.5px;">GEAR<span style="color:#2563EB;">.</span></span>
            </div>
            <div style="background:#2563EB;display:inline-block;border-radius:50px;padding:8px 20px;">
              <span style="color:#fff;font-size:13px;font-weight:600;letter-spacing:0.5px;">✓ ORDER CONFIRMED</span>
            </div>
          </div>

          <!-- Body -->
          <div style="padding:40px;">
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111318;">Thank you, ${address.firstName}!</h2>
            <p style="margin:0 0 28px;color:#6B7280;font-size:15px;line-height:1.6;">
              Your order has been confirmed and is being processed. You'll receive updates as your gear ships.
            </p>

            <!-- Order Info -->
            <div style="background:#F7F8FA;border-radius:16px;padding:20px;margin-bottom:28px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;">
              <div>
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Order ID</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#2563EB;font-family:monospace;">#${orderIdShort}</p>
              </div>
              <div>
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Date</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#111318;">${orderDate}</p>
              </div>
              <div>
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Payment</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#111318;">${paymentMethod}</p>
              </div>
              <div>
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Status</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#2563EB;">Order Placed</p>
              </div>
            </div>

            <!-- Items Table -->
            <h3 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#111318;">Order Items</h3>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:2px solid #E5E7EB;">Product</th>
                  <th style="text-align:center;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:2px solid #E5E7EB;">Qty</th>
                  <th style="text-align:right;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:2px solid #E5E7EB;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>

            <!-- Total -->
            <div style="background:#111318;border-radius:12px;padding:16px 20px;margin-top:20px;display:flex;justify-content:space-between;align-items:center;">
              <span style="color:#fff;font-weight:600;font-size:15px;">Total Amount</span>
              <span style="color:#2563EB;font-weight:800;font-size:20px;">Rs${new Intl.NumberFormat('en-PK').format(amount)}</span>
            </div>

            <!-- Delivery Address -->
            <h3 style="margin:28px 0 12px;font-size:16px;font-weight:700;color:#111318;">Delivery Address</h3>
            <div style="background:#F7F8FA;border-radius:12px;padding:16px 20px;">
              <p style="margin:0 0 4px;font-weight:600;color:#111318;">${address.firstName} ${address.lastName}</p>
              <p style="margin:0 0 4px;color:#6B7280;font-size:14px;">${address.street}</p>
              <p style="margin:0 0 4px;color:#6B7280;font-size:14px;">${address.city}, ${address.state} ${address.zipcode}</p>
              <p style="margin:0 0 4px;color:#6B7280;font-size:14px;">${address.country}</p>
              <p style="margin:0;color:#6B7280;font-size:14px;">${address.phone}</p>
            </div>

            <p style="margin:28px 0 0;color:#6B7280;font-size:13px;line-height:1.6;">
              Questions about your order? Reply to this email and our team will help you out.
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#F7F8FA;border-top:1px solid #E5E7EB;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;">© ${new Date().getFullYear()} GEAR. Gaming Commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ──────────────────────────────────────────
// GUEST PROFILE EMAIL OTP
// Sent when a guest wants to view their orders
// ──────────────────────────────────────────
const sendProfileOtpEmail = async (email, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"GEAR. Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Order History Access Code — GEAR.",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#F7F8FA;font-family:'Inter',Arial,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:24px;border:1px solid #E5E7EB;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,0.06);">
          <div style="background:#111318;padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:8px;">
              <div style="width:32px;height:32px;background:#2563EB;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-weight:900;font-size:18px;line-height:1;">G</span>
              </div>
              <span style="color:#fff;font-weight:700;font-size:20px;letter-spacing:-0.5px;">GEAR<span style="color:#2563EB;">.</span></span>
            </div>
          </div>
          <div style="padding:40px;">
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111318;">Access Your Order History</h2>
            <p style="margin:0 0 28px;color:#6B7280;font-size:15px;line-height:1.6;">
              Use the code below to view orders associated with this email. It expires in <strong>10 minutes</strong>.
            </p>
            <div style="background:#F7F8FA;border:2px solid #2563EB;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Access Code</p>
              <p style="margin:0;font-size:44px;font-weight:900;color:#2563EB;letter-spacing:12px;font-family:monospace;">${otp}</p>
            </div>
            <p style="margin:0;color:#6B7280;font-size:13px;">
              If you did not request this, please ignore this email.
            </p>
          </div>
          <div style="background:#F7F8FA;border-top:1px solid #E5E7EB;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;">© ${new Date().getFullYear()} GEAR. Gaming Commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendOrderEmail;
export { sendOtpEmail, sendCustomerConfirmationEmail, sendProfileOtpEmail };
