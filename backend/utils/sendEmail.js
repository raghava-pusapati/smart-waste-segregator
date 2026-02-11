import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    // Log configuration (without password)
    console.log('📧 Email Configuration:');
    console.log('  Host:', process.env.EMAIL_HOST || 'smtp.gmail.com');
    console.log('  Port:', process.env.EMAIL_PORT || 587);
    console.log('  User:', process.env.EMAIL_USER);
    console.log('  Password configured:', !!process.env.EMAIL_PASSWORD);
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });

    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // Email options
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Smart Waste Segregator'} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    console.log('📤 Sending email to:', options.email);
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
    
  } catch (error) {
    console.error('❌ Email Error Details:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    console.error('  Command:', error.command);
    throw error;
  }
};

export default sendEmail;
