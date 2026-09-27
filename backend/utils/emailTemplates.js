const COLORS = {
  paper: "#F8F2E7",
  page: "#F1EBDD",
  ink: "#29251F",
  muted: "#62594E",
  rule: "#D9CEBD",
  accent: "#8E3D36",
  gold: "#B1843F",
  white: "#FFFDF8",
};

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const text = (value) => escapeHtml(value);

const formatAmount = (value) => {
  if (value === undefined || value === null || value === "") return "—";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `PKR ${new Intl.NumberFormat("en-PK").format(amount)}`
    : "—";
};

const emailDocument = (preheader, content) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <title>Sleeve</title>
      <style>
        body { margin: 0 !important; padding: 0 !important; }
        table { border-collapse: collapse; }
        img { border: 0; display: block; height: auto; max-width: 100%; }
        @media only screen and (max-width: 640px) {
          .email-padding { padding-left: 20px !important; padding-right: 20px !important; }
          .email-header { padding: 24px 20px !important; }
          .email-code { font-size: 32px !important; letter-spacing: 6px !important; }
          .email-title { font-size: 26px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:${COLORS.page};font-family:Arial,Helvetica,sans-serif;color:${COLORS.ink};">
      <div style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;max-height:0;max-width:0;overflow:hidden;mso-hide:all;">
        ${text(preheader)}
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:${COLORS.page};">
        <tr>
          <td align="center" style="padding:24px 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;background-color:${COLORS.white};border:1px solid ${COLORS.rule};">
              <tr>
                <td class="email-header" align="center" style="padding:30px 32px 24px;background-color:${COLORS.paper};border-bottom:3px double ${COLORS.ink};">
                  <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:bold;letter-spacing:5px;line-height:1.2;color:${COLORS.ink};">SLEEVE</div>
                  <div style="padding-top:8px;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${COLORS.accent};">Posters &bull; Frames &bull; Music Art</div>
                </td>
              </tr>
              ${content}
              <tr>
                <td class="email-padding" align="center" style="padding:20px 32px;background-color:${COLORS.paper};border-top:1px solid ${COLORS.rule};">
                  <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:bold;letter-spacing:2px;color:${COLORS.ink};">SLEEVE</p>
                  <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:${COLORS.muted};">Posters &bull; Frames &bull; Music Art</p>
                  <p style="margin:0;font-size:12px;line-height:1.6;color:${COLORS.muted};">Made for people who keep album covers on their walls.</p>
                  <p style="margin:12px 0 0;font-size:11px;color:${COLORS.muted};">&copy; ${new Date().getFullYear()} Sleeve</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

const contentSection = (body) => `
  <tr>
    <td class="email-padding" style="padding:32px 40px;">
      ${body}
    </td>
  </tr>`;

const heading = (value) => `
  <h1 class="email-title" style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:bold;color:${COLORS.ink};">
    ${value}
  </h1>`;

const paragraph = (value, marginBottom = 22) => `
  <p style="margin:0 0 ${marginBottom}px;font-size:15px;line-height:1.65;color:${COLORS.muted};">
    ${value}
  </p>`;

const orderItemDescription = (item) => {
  const designs = Array.isArray(item.designs) ? item.designs : [];
  const galleryCount = designs.filter((design) => design?.type === "gallery").length;
  const customCount = designs.filter((design) => design?.type === "upload").length;
  const descriptions = [];

  if (galleryCount) descriptions.push(`${galleryCount} Gallery ${galleryCount === 1 ? "design" : "designs"}`);
  if (customCount) descriptions.push(`${customCount} custom ${customCount === 1 ? "design" : "designs"}`);

  if (!descriptions.length && item.designCount) {
    const count = Number(item.designCount);
    if (item.designSource === "Gallery" || item.galleryDesignId) {
      descriptions.push(`${count} Gallery ${count === 1 ? "design" : "designs"}`);
    } else if (item.customImageUrl || item.designSource === "Custom") {
      descriptions.push(`${count} custom ${count === 1 ? "design" : "designs"}`);
    }
  }

  return descriptions;
};

const itemRows = (items = []) => items.map((item) => {
  const name = text(item.name || "Item");
  const size = item.size && item.size !== "Default" ? ` <span style="font-size:12px;color:${COLORS.muted};">(${text(item.size)})</span>` : "";
  const quantity = item.posterQuantity
    ? `${text(item.posterQuantity)} PCS`
    : `Qty: ${text(item.quantity ?? 1)}`;
  const descriptions = orderItemDescription(item)
    .map((description) => `<div style="padding-top:3px;font-size:12px;line-height:1.5;color:${COLORS.muted};">${text(description)}</div>`)
    .join("");
  const price = formatAmount((item.posterTotalPrice ?? item.price) * (item.quantity ?? 1));

  return `
    <tr>
      <td style="padding:13px 8px 13px 0;border-bottom:1px solid ${COLORS.rule};vertical-align:top;color:${COLORS.ink};font-size:14px;line-height:1.5;overflow-wrap:anywhere;">
        <strong>${name}</strong>${size}
        <div style="padding-top:3px;font-size:12px;color:${COLORS.muted};">${quantity}</div>
        ${descriptions}
      </td>
      <td align="right" style="width:110px;padding:13px 0 13px 8px;border-bottom:1px solid ${COLORS.rule};vertical-align:top;color:${COLORS.ink};font-size:14px;font-weight:bold;white-space:nowrap;">
        ${price}
      </td>
    </tr>`;
}).join("");

const buildItemsTable = (items) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-top:1px solid ${COLORS.rule};">
    ${itemRows(items)}
  </table>`;

const buildFinancialSummary = ({ subtotal, discountAmount = 0, deliveryCharge, amount }) => {
  const summaryRow = (label, value, emphasized = false) => `
    <tr>
      <td style="padding:7px 0;font-size:${emphasized ? 16 : 14}px;line-height:1.4;color:${emphasized ? COLORS.ink : COLORS.muted};${emphasized ? "font-weight:bold;border-top:1px solid " + COLORS.rule + ";" : ""}">${label}</td>
      <td align="right" style="padding:7px 0;font-size:${emphasized ? 16 : 14}px;line-height:1.4;color:${emphasized ? COLORS.ink : COLORS.muted};white-space:nowrap;${emphasized ? "font-weight:bold;border-top:1px solid " + COLORS.rule + ";" : ""}">${value}</td>
    </tr>`;

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:14px;">
      ${summaryRow("Subtotal", formatAmount(subtotal))}
      ${summaryRow("Discount", `- ${formatAmount(discountAmount)}`)}
      ${summaryRow("Delivery", formatAmount(deliveryCharge))}
      ${summaryRow("Total", formatAmount(amount), true)}
    </table>`;
};

const orderDetails = ({ paymentMethod, orderId, includeDate = false }) => {
  const date = new Date().toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const values = [];

  if (orderId) values.push(["Order", `#${text(String(orderId).slice(-8).toUpperCase())}`]);
  if (includeDate) values.push(["Date", text(date)]);
  if (paymentMethod) values.push(["Payment", text(paymentMethod)]);

  return values.length ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 22px;background-color:${COLORS.paper};border:1px solid ${COLORS.rule};">
      ${values.map(([label, value]) => `
        <tr>
          <td style="padding:10px 12px;font-size:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.rule};">${label}</td>
          <td align="right" style="padding:10px 12px;font-size:13px;font-weight:bold;color:${COLORS.ink};border-bottom:1px solid ${COLORS.rule};overflow-wrap:anywhere;">${value}</td>
        </tr>`).join("")}
    </table>` : "";
};

const otpContent = ({ title, intro, otp, label, warning }) => contentSection(`
  ${heading(text(title))}
  ${paragraph(intro)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 22px;background-color:${COLORS.paper};border:1px solid ${COLORS.gold};">
    <tr>
      <td align="center" style="padding:20px 12px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${COLORS.muted};">${text(label)}</p>
        <p class="email-code" style="margin:0;font-family:Courier New,monospace;font-size:38px;font-weight:bold;letter-spacing:9px;line-height:1.3;color:${COLORS.accent};">${text(otp)}</p>
      </td>
    </tr>
  </table>
  ${paragraph(text(warning), 10)}
  ${paragraph("If you did not request this code, you can safely ignore this email.", 0)}
`);

const buildPlainOrderText = (orderData, orderId, title, intro) => {
  const lines = [
    "SLEEVE — Posters, Frames & Music Art",
    "",
    title,
    intro,
    ...(orderId ? [`Order #${String(orderId).slice(-8).toUpperCase()}`] : []),
    "",
    "Items:",
    ...(orderData.items || []).map((item) => {
      const details = orderItemDescription(item);
      return `- ${item.name || "Item"} — ${item.posterQuantity ? `${item.posterQuantity} PCS` : `Qty ${item.quantity ?? 1}`}${details.length ? ` (${details.join(", ")})` : ""} — ${formatAmount((item.posterTotalPrice ?? item.price) * (item.quantity ?? 1))}`;
    }),
    "",
    `Subtotal: ${formatAmount(orderData.subtotal)}`,
    `Discount: - ${formatAmount(orderData.discountAmount ?? 0)}`,
    `Delivery: ${formatAmount(orderData.deliveryCharge)}`,
    `Total: ${formatAmount(orderData.amount)}`,
    "",
    "Made for people who keep album covers on their walls.",
  ];
  return lines.join("\n");
};

const buildAdminOrderEmail = (orderData) => {
  const address = orderData.address || {};
  const fullName = `${address.firstName || ""} ${address.lastName || ""}`.trim();
  const title = "New order received";
  const intro = `${fullName ? `Customer: ${fullName}. ` : ""}A new Sleeve order is ready for review.`;
  const addressLines = [
    `${address.street || ""}`,
    [address.city, address.state, address.zipcode].filter(Boolean).join(", "),
    address.country || "",
  ].filter(Boolean);
  const contactLines = [
    address.email ? `<a href="mailto:${text(address.email)}" style="color:${COLORS.accent};">${text(address.email)}</a>` : "",
    address.phone ? `<a href="tel:${text(address.phone)}" style="color:${COLORS.accent};">${text(address.phone)}</a>` : "",
  ].filter(Boolean);
  const addressMarkup = `
    <h2 style="margin:24px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:19px;color:${COLORS.ink};">Customer details</h2>
    <p style="margin:0;font-size:14px;line-height:1.6;color:${COLORS.muted};">
      ${text(fullName)}${contactLines.length ? `<br>${contactLines.join("<br>")}` : ""}${addressLines.length ? `<br>${addressLines.map(text).join("<br>")}` : ""}
    </p>`;
  const payment = orderData.paymentMethod
    ? `<p style="margin:16px 0 0;font-size:13px;color:${COLORS.muted};">Payment: ${text(orderData.paymentMethod)}</p>`
    : "";
  const content = contentSection(`
    ${heading("New order received")}
    ${paragraph(intro)}
    ${orderDetails({ paymentMethod: orderData.paymentMethod, orderId: orderData.orderId, includeDate: true })}
    <h2 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:19px;color:${COLORS.ink};">Order items</h2>
    ${buildItemsTable(orderData.items)}
    ${buildFinancialSummary(orderData)}
    ${payment}
    ${addressMarkup}
  `);

  return {
    subject: `New Sleeve order received — ${formatAmount(orderData.amount)}`,
    html: emailDocument("A new Sleeve order is ready for review.", content),
    text: buildPlainOrderText(orderData, orderData.orderId, title, intro),
  };
};

const buildCheckoutOtpEmail = ({ otp, firstName = "" }) => {
  const title = "Verify your order";
  const intro = `${firstName ? `Hello ${text(firstName)}, ` : ""}Use the verification code below to verify your email address and confirm your order. It expires in 10 minutes and can only be used once.`;
  const warning = "For your security, never share this code. Sleeve will never ask you to disclose it.";

  return {
    subject: "Your Sleeve order verification code",
    html: emailDocument(
      "Your Sleeve verification code is inside.",
      otpContent({ title, intro, otp, label: "Verification code", warning })
    ),
    text: [
      "SLEEVE — Posters, Frames & Music Art",
      "",
      title,
      firstName ? `Hello ${firstName},` : "",
      "Use this code to verify your email and confirm your order:",
      String(otp),
      "It expires in 10 minutes and can only be used once.",
      warning,
      "If you did not request this code, you can safely ignore this email.",
    ].filter(Boolean).join("\n"),
  };
};

const buildCustomerConfirmationEmail = (orderData, orderId) => {
  const address = orderData.address || {};
  const customerName = `${address.firstName || ""} ${address.lastName || ""}`.trim();
  const title = "Your order is confirmed";
  const intro = `${customerName ? `Thank you, ${text(customerName)}. ` : "Thank you for choosing Sleeve. "}We've received your order and we're getting everything ready.`;
  const addressLines = [
    `${address.street || ""}`,
    [address.city, address.state, address.zipcode].filter(Boolean).join(", "),
    address.country || "",
    address.phone || "",
  ].filter(Boolean);
  const content = contentSection(`
    ${heading(title)}
    ${paragraph(intro)}
    ${orderDetails({ paymentMethod: orderData.paymentMethod, orderId, includeDate: true })}
    <h2 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:19px;color:${COLORS.ink};">Your prints</h2>
    ${buildItemsTable(orderData.items)}
    ${buildFinancialSummary(orderData)}
    ${addressLines.length ? `
      <h2 style="margin:26px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:19px;color:${COLORS.ink};">Delivery address</h2>
      <p style="margin:0;font-size:14px;line-height:1.65;color:${COLORS.muted};">${text(customerName)}<br>${addressLines.map(text).join("<br>")}</p>` : ""}
    ${paragraph("Questions about your order? Reply to this email and our team will help.", 0)}
  `);

  return {
    subject: `Your Sleeve order is confirmed — #${String(orderId || "").slice(-8).toUpperCase()}`,
    html: emailDocument("Your Sleeve order has been confirmed.", content),
    text: buildPlainOrderText(orderData, orderId, title, "Thanks for choosing Sleeve. We've received your order and we're getting everything ready."),
  };
};

const buildProfileOtpEmail = ({ otp }) => {
  const title = "Access your order history";
  const intro = "Use the code below to view orders associated with this email. It expires in 10 minutes.";
  const warning = "If you did not request an order-history code, you can safely ignore this email.";

  return {
    subject: "Your Sleeve order history access code",
    html: emailDocument(
      "Your Sleeve order-history access code is inside.",
      otpContent({ title, intro, otp, label: "Access code", warning })
    ),
    text: [
      "SLEEVE — Posters, Frames & Music Art",
      "",
      title,
      intro,
      String(otp),
      warning,
    ].join("\n"),
  };
};

export {
  buildAdminOrderEmail,
  buildCheckoutOtpEmail,
  buildCustomerConfirmationEmail,
  buildProfileOtpEmail,
};
