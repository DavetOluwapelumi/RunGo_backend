# Gmail App Password Setup Guide

## Current Issue
The error "Username and Password not accepted" indicates that the Gmail App Password is not working correctly.

## Step-by-Step Solution

### 1. Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security" in the left sidebar
3. Under "Signing in to Google," click "2-Step Verification"
4. Follow the steps to enable 2FA if not already enabled

### 2. Generate a New App Password
1. Go back to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security" → "2-Step Verification"
3. Scroll down and click "App passwords"
4. Select "Mail" as the app
5. Select "Other (Custom name)" as the device
6. Enter "Run.go Backend" as the name
7. Click "Generate"
8. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

### 3. Update Your .env File
Replace the current SMTP_PASSWORD in your `.env` file:

```env
SMTP_USER = "your-gmail@gmail.com"
SMTP_PASSWORD = "your-regular-gmail-password"
```

**Important:** 
- Remove spaces from the App Password
- Don't include quotes around the password
- Make sure there are no extra characters

### 4. Alternative: Use Gmail with "Less Secure Apps"
If you don't want to use 2FA:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security"
3. Turn OFF "2-Step Verification"
4. Turn ON "Less secure app access"
5. Use your regular Gmail password in the `.env` file

### 5. Test the Configuration
After updating the `.env` file:

1. Restart your server: `npm run start:dev`
2. Test with Postman:
   - `POST /v1/user/auth/forgot-password`
   - Body: `{"email": "titilayo13069@run.edu.ng"}`

## Troubleshooting

### If still getting authentication errors:
1. **Check the App Password format**: Should be exactly 16 characters, no spaces
2. **Verify 2FA is enabled**: App passwords only work with 2FA
3. **Try a different approach**: Use "Less secure app access" instead
4. **Check Gmail settings**: Make sure IMAP is enabled in Gmail settings

### Gmail Settings to Check:
1. Go to Gmail → Settings → Forwarding and POP/IMAP
2. Enable IMAP
3. Save changes

## Quick Test
You can test your SMTP settings with this simple command:
```bash
echo "Subject: Test Email" | sendmail -v your-test-email@example.com
```

## Alternative Email Services
If Gmail continues to cause issues, consider:
- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **SendGrid**: `smtp.sendgrid.net:587` 