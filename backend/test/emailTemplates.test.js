import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAdminOrderEmail,
  buildCheckoutOtpEmail,
  buildCustomerConfirmationEmail,
  buildProfileOtpEmail,
} from "../utils/emailTemplates.js";

const sampleOrder = {
  orderId: "order-12345678",
  address: {
    firstName: "Alex",
    lastName: "Listener",
    email: "alex@example.com",
    phone: "+923001234567",
    street: "12 Record Lane",
    city: "Lahore",
    state: "Punjab",
    zipcode: "54000",
    country: "Pakistan",
  },
  items: [
    {
      name: "Premium Poster",
      quantity: 1,
      posterQuantity: 4,
      posterTotalPrice: 1000,
      designs: [{ type: "upload" }, { type: "upload" }, { type: "upload" }, { type: "upload" }],
    },
    {
      name: "Standard Poster",
      quantity: 1,
      posterQuantity: 10,
      posterTotalPrice: 2000,
      designs: Array.from({ length: 10 }, (_, index) => ({
        type: index < 6 ? "gallery" : "upload",
      })),
    },
  ],
  subtotal: 3000,
  discountAmount: 300,
  deliveryCharge: 200,
  amount: 2900,
  paymentMethod: "COD",
};

const outgoingTemplates = [
  ["Admin new-order notification", () => buildAdminOrderEmail(sampleOrder)],
  ["Checkout verification OTP", () => buildCheckoutOtpEmail({ otp: "482913", firstName: "Alex" })],
  ["Customer order confirmation", () => buildCustomerConfirmationEmail(sampleOrder, sampleOrder.orderId)],
  ["Guest order-history OTP", () => buildProfileOtpEmail({ otp: "726154" })],
];

test("every outgoing email template uses responsive Sleeve email-safe branding", () => {
  for (const [name, build] of outgoingTemplates) {
    const message = build();
    assert.match(message.subject, /Sleeve|order received/i, `${name} has a branded subject`);
    assert.match(message.html, /SLEEVE/, `${name} has the Sleeve wordmark`);
    assert.match(message.html, /max-width:640px/, `${name} uses a centered responsive email width`);
    assert.match(message.html, /@media only screen and \(max-width: 640px\)/, `${name} has a mobile layout rule`);
    assert.match(message.html, /role="presentation"/, `${name} uses email-safe table layout`);
    assert.doesNotMatch(`${message.subject}\n${message.html}\n${message.text}`, /GEAR|gaming|accessories/i, `${name} contains no old gaming branding`);
    assert.doesNotMatch(message.html, /display\s*:\s*(?:flex|grid)/i, `${name} does not depend on flexbox or grid`);
  }
});

test("order emails preserve order, batch, design-source, and financial details", () => {
  const admin = buildAdminOrderEmail(sampleOrder);
  const customer = buildCustomerConfirmationEmail(sampleOrder, sampleOrder.orderId);
  const content = `${admin.subject}\n${admin.html}\n${admin.text}\n${customer.subject}\n${customer.html}\n${customer.text}`;

  assert.match(content, /12345678/);
  assert.match(content, /Premium Poster/);
  assert.match(content, /Standard Poster/);
  assert.match(content, /4 PCS/);
  assert.match(content, /10 PCS/);
  assert.match(content, /4 custom designs/);
  assert.match(content, /6 Gallery designs/);
  assert.match(content, /PKR 3,000/);
  assert.match(content, /PKR 200/);
  assert.match(content, /PKR 2,900/);
});

test("dynamic HTML text is escaped without changing the email OTP", () => {
  const message = buildCheckoutOtpEmail({
    otp: "482913",
    firstName: '<img src=x onerror="alert(1)">',
  });

  assert.match(message.html, /482913/);
  assert.match(message.text, /482913/);
  assert.match(message.html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.doesNotMatch(message.html, /<img src=x onerror=/);
});
