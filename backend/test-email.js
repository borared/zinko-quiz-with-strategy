const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log("Testing email with user:", process.env.SMTP_USER);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: "Test Email from Zinko Server",
      text: "If you get this, SMTP is working perfectly!"
    });
    console.log("Success! Message ID:", info.messageId);
  } catch (err) {
    console.error("Failed to send email:", err.message);
  }
}

testEmail();
