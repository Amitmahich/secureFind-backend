const getApprovalEmailTemplate = (name, itemName, ownerName, phone) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Claim Approved</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial; background:#f4f6f8;">
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 0;">
          
          <table width="500" style="background:#fff; border-radius:10px;">
            
            <!-- Header -->
            <tr>
              <td style="background:#4CAF50; color:#fff; padding:20px; text-align:center;">
                <h2>SecureFind 🔐</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;">
                <h3>Hello ${name} 🎉</h3>

                <p>Your response has been <b>approved</b>!</p>

                <p><b>Item:</b> ${itemName}</p>

                <p>You can now contact the owner:</p>

                <p><b>Owner:</b> ${ownerName}</p>
                <p><b>Phone:</b> ${phone}</p>

                <br/>
                <p>Please coordinate and collect your item safely 🙌</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f1f1f1; text-align:center; padding:15px;">
                © ${new Date().getFullYear()} SecureFind
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

module.exports = { getApprovalEmailTemplate };