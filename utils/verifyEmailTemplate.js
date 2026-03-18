const getVerificationEmailTemplate = (verifyUrl, name) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6f8;">
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 40px 0;">
          
          <table width="500" style="background:#ffffff; border-radius:10px; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#4CAF50; color:#fff; padding:20px; text-align:center;">
                <h2 style="margin:0;">SecureFind 🔐</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;">
                <h3>Hello ${name}, 👋</h3>
                <p style="color:#555;">
                  Thank you for registering on <b>SecureFind</b>.
                  Please verify your email address to activate your account.
                </p>

                <div style="text-align:center; margin:30px 0;">
                  <a href="${verifyUrl}"
                    style="background:#4CAF50; color:#fff; padding:12px 25px;
                    text-decoration:none; border-radius:5px; font-weight:bold;">
                    Verify Email
                  </a>
                </div>

                <p style="color:#777;">
                  If you did not create this account, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f1f1f1; text-align:center; padding:15px; font-size:12px; color:#888;">
                © ${new Date().getFullYear()} SecureFind. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

module.exports = getVerificationEmailTemplate;
