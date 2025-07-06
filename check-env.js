require('dotenv').config();

console.log('=== Environment Variables Check ===');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***SET***' : 'NOT SET');
console.log('SMTP_TRANSPORT:', process.env.SMTP_TRANSPORT);
console.log('==============================='); 