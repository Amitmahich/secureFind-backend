// const nodemailer = require("nodemailer");

// const sendEmail = async ({ to, subject, html }) => {
//   // ⚡ Create the transporter HERE, inside the function
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     family: 4,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//   });

//   try {
//     const info = await transporter.sendMail({
//       from: `"SecureFind" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });
//     console.log("✅ Email sent:", info.response);
//   } catch (error) {
//     console.error("❌ Email sending error:", error);
//     throw error;
//   }
// };

// module.exports = sendEmail;
const SibApiV3Sdk = require("sib-api-v3-sdk");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const client = SibApiV3Sdk.ApiClient.instance;

    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const response = await apiInstance.sendTransacEmail({
      sender: {
        email: "amit15a25a@gmail.com", // 👈 apni email
        name: "SecureFind",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    console.log("✅ Email sent:", response);
  } catch (error) {
    console.error("❌ Email sending error:", error.response?.body || error);
    throw error;
  }
};

module.exports = sendEmail;
