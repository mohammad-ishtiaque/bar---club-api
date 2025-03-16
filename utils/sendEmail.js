const nodemailer = require('nodemailer');

const sendResetCode = async (email, code) => {
  // Create Ethereal test account automatically
  const testAccount = await nodemailer.createTestAccount();

  // Create reusable transporter
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  const mailOptions = {
    from: `"Test Server" <${testAccount.user}>`, // Uses Ethereal test email
    to: email,
    subject: 'Password Reset Code',
    text: `Your password reset code is: ${code}`,
    html: `<b>${code}</b>` // HTML version
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);

  // Log for testing (only in development)
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
};

module.exports = { sendResetCode };