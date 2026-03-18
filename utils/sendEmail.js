const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  // ⚡ Create the transporter HERE, inside the function
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"SecureFind" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Email sending error:", error);
    throw error;
  }
};

module.exports = sendEmail;
