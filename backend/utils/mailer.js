// =============================================
// ✅ SECURE MAILER UTILITY FOR SMART CAMPUS APP
// =============================================
const nodemailer = require('nodemailer');

// ---------------------------------------------
// 📧 Create transporter using Gmail service
// ---------------------------------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your Gmail App Password (not normal password)
  },
});

// ---------------------------------------------
// ✉️ Send credentials email (includes password)
// ---------------------------------------------
async function sendCredentialsEmail(toEmail, username, password) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Smart Campus - Account Created Successfully 🎓',
      html: `
        <div style="font-family: Arial; color: #333; line-height: 1.6;">
          <h2>Welcome to Smart Campus Entry System 🎓</h2>
          <p>Hello <b>${username}</b>,</p>
          <p>Your account has been successfully created by the University Admin.</p>
          
          <p>Here are your login details:</p>
          <ul>
            <li><b>Username / Email:</b> ${toEmail}</li>
            <li><b>Temporary Password:</b> <span style="color:#d63384;">${password}</span></li>
          </ul>

          <p>
            Please log in to your Smart Campus account and
            <strong>change your password immediately</strong> upon first login.
          </p>

          <hr style="margin-top: 20px;">
          <p style="font-size: 0.9em; color: #666;">
            This is an automated email from the Smart Campus Entry System.<br>
            Do not share your credentials with anyone.
          </p>
        </div>
      `,
    });
    console.log(`📧 Credentials email sent successfully to ${toEmail}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending credentials email to ${toEmail}:`, error.message);
    throw error;
  }
}

// ---------------------------------------------
// 🔢 Send password reset OTP email
// ---------------------------------------------
async function sendResetOTP(toEmail, otp) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Smart Campus - Password Reset OTP',
      html: `
        <div style="font-family: Arial; color: #333; line-height: 1.6;">
          <h2>Password Reset Request 🔐</h2>
          <p>Your One-Time Password (OTP) for resetting your Smart Campus account is:</p>
          <h2 style="letter-spacing: 2px;">${otp}</h2>
          <p>This OTP will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn’t request this, please ignore this email.</p>
          <hr>
          <p style="font-size: 0.9em; color: #666;">
            This is an automated message from Smart Campus Entry System.
          </p>
        </div>
      `,
    });
    console.log(`📧 OTP email sent successfully to ${toEmail}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending OTP email to ${toEmail}:`, error.message);
    throw error;
  }
}

module.exports = { sendCredentialsEmail, sendResetOTP };
