const getReportEmailTemplate = (name, itemName, reason) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Report Submitted</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6f8;">
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 40px 0;">
          
          <table width="500" style="background:#ffffff; border-radius:10px; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#FF5722; color:#fff; padding:20px; text-align:center;">
                <h2 style="margin:0;">SecureFind 🔐</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;">
                <h3>Hello ${name}, 👋</h3>

                <p style="color:#555;">
                  Your report has been successfully submitted.
                  Our team will review it shortly.
                </p>

                <table width="100%" style="margin:20px 0; border-collapse:collapse;">
                  <tr>
                    <td style="padding:10px; border:1px solid #eee;"><strong>Item</strong></td>
                    <td style="padding:10px; border:1px solid #eee;">${itemName}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px; border:1px solid #eee;"><strong>Reason</strong></td>
                    <td style="padding:10px; border:1px solid #eee;">${reason}</td>
                  </tr>
                </table>

                <p style="color:#777;">
                  Thank you for helping keep SecureFind safe and trustworthy 🙌
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

module.exports = getReportEmailTemplate;
