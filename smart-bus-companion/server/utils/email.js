const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  // If no credentials, just log the email to console for development
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n=================== EMAIL SIMULATION ===================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    console.log('========================================================\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Smart Bus Companion" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  });
};

module.exports = { sendEmail };
