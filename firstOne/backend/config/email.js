const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    // Temporarily disable email to avoid authentication errors
    console.log('📧 Email temporarily disabled - Welcome email skipped for:', userEmail);
    return true;
    
    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Welcome to Your App!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 2.5em;">Welcome! 🎉</h1>
            <p style="margin: 10px 0; font-size: 1.2em;">We're excited to have you on board</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName || 'User'}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining our platform! You've successfully logged in and your account is now active.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>Explore our features and discover what you can do</li>
                <li>Add your first product to get started</li>
                <li>Customize your profile settings</li>
                <li>Connect with other users</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Get Started
              </a>
            </div>
            
            <p style="color: #999; font-size: 0.9em; text-align: center; margin-top: 30px;">
              If you have any questions, feel free to contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 0.8em;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 Your App. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

const sendAdminNotification = async (userEmail, userName, action) => {
  try {
    // Temporarily disable email to avoid authentication errors
    console.log('📧 Email temporarily disabled - Admin notification skipped for:', userName, action);
    return true;
    
    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to admin (your email)
      subject: `User ${action}: ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 2.5em;">Admin Notification 🔔</h1>
            <p style="margin: 10px 0; font-size: 1.2em;">User Activity Alert</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">User ${action} Successfully!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b6b; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">User Details:</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li><strong>Username:</strong> ${userName}</li>
                <li><strong>Email:</strong> ${userEmail || 'Not provided'}</li>
                <li><strong>Action:</strong> ${action}</li>
                <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              This is an automated notification to inform you about user activity on your platform.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 0.8em;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 Your App. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendAdminNotification,
  createTransporter,
};
