# Email Configuration Setup Guide

## Quick Fix for Testing

To temporarily disable email sending and allow registration to work, add this to your `.env` file:

```env
SKIP_EMAIL_SENDING=true
```

This will allow registration to proceed without sending emails. The OTP will be logged in the console.

## Proper Email Setup

### For Gmail:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Add these environment variables** to your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

### For Other Email Providers:

#### Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### Yahoo:
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```

## Testing Your Configuration

Run the test script to verify your email setup:

```bash
node test-email-config.js
```

## Troubleshooting

### Common Issues:

1. **ETIMEDOUT Error**: 
   - Try port 587 instead of 465
   - Check your internet connection
   - Try a different network

2. **Authentication Failed**:
   - Use App Password instead of regular password
   - Enable 2FA on your email account
   - Check username/password spelling

3. **Connection Refused**:
   - Check if your ISP blocks SMTP
   - Try using a different email provider
   - Check firewall settings

### For Development:

If you want to test without email setup, use:
```env
SKIP_EMAIL_SENDING=true
```

The OTP will be logged in the console, and you can manually verify it. 