const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    console.log('🔍 Testing Email Configuration...');

    // Check environment variables
    console.log('Environment Variables:');
    console.log('MAIL_HOST:', process.env.MAIL_HOST);
    console.log('MAIL_PORT:', process.env.MAIL_PORT);
    console.log('MAIL_USER:', process.env.MAIL_USER ? 'Set' : 'Not Set');
    console.log('MAIL_PASS:', process.env.MAIL_PASS ? 'Set' : 'Not Set');

    try {
        const transporter = nodemailer.createTransporter({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        console.log('📧 Testing SMTP connection...');

        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP connection successful!');

        // Test sending email
        const info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: process.env.MAIL_USER, // Send to yourself for testing
            subject: 'Email Test',
            text: 'This is a test email from your backend.',
        });

        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Email test failed:', error.message);
        console.error('Full error:', error);
    }
}

testEmail(); 