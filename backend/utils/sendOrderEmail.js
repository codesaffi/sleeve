import nodemailer from "nodemailer";
import {
  buildAdminOrderEmail,
  buildCheckoutOtpEmail,
  buildCustomerConfirmationEmail,
  buildProfileOtpEmail,
} from "./emailTemplates.js";

let transporterInstance = null;

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

const sendEmail = async (message, recipient) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Sleeve" <${process.env.EMAIL_USER}>`,
    to: recipient,
    ...message,
  });
};

const sendOrderEmail = async (orderData) => {
  await sendEmail(buildAdminOrderEmail(orderData), process.env.EMAIL_RECEIVER);
};

const sendOtpEmail = async (email, otp, firstName = "") => {
  await sendEmail(buildCheckoutOtpEmail({ otp, firstName }), email);
};

const sendCustomerConfirmationEmail = async (orderData, orderId) => {
  await sendEmail(buildCustomerConfirmationEmail(orderData, orderId), orderData.address.email);
};

const sendProfileOtpEmail = async (email, otp) => {
  await sendEmail(buildProfileOtpEmail({ otp }), email);
};

export default sendOrderEmail;
export { sendOtpEmail, sendCustomerConfirmationEmail, sendProfileOtpEmail };
