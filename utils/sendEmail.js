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
