const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfig() {
    console.log('Testing email configuration...');
    console.log('Environment variables:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER ? '***SET***' : 'NOT SET');
    console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***SET***' : 'NOT SET');
    console.log('');

    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // Use TLS instead of SSL
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    try {
        console.log('Testing SMTP connection...');

        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP connection successful!');

        // Test sending email
        console.log('Testing email sending...');
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to yourself for testing
            subject: 'Test Email from Rungo Backend',
            text: 'This is a test email to verify your SMTP configuration.',
            html: '<p>This is a test email to verify your SMTP configuration.</p>',
        });

        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Email test failed:');
        console.error('Error:', error.message);

        if (error.code === 'EAUTH') {
            console.error('\n🔧 Authentication failed. Please check:');
            console.error('1. Your Gmail username and password are correct');
            console.error('2. You have enabled "Less secure app access" or');
            console.error('3. You are using an App Password (recommended)');
            console.error('4. 2FA is properly configured');
        } else if (error.code === 'ECONNECTION') {
            console.error('\n🔧 Connection failed. Please check:');
            console.error('1. Your internet connection');
            console.error('2. SMTP_HOST and SMTP_PORT are correct');
            console.error('3. Firewall is not blocking the connection');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('\n🔧 Connection timeout. Please check:');
            console.error('1. Your internet connection');
            console.error('2. Try using port 587 instead of 465');
            console.error('3. Check if your ISP is blocking SMTP');
        }
    }
}

testEmailConfig(); 