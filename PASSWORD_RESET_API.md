# Password Reset API Documentation

This document describes the complete forgot password flow implemented in the Run.go backend API.

## Base URL
```
http://localhost:5000/v1
```

## Endpoints

### 1. Forgot Password (Send OTP)
**Endpoint:** `POST /user/auth/forgot-password`

**Description:** Sends a 6-digit OTP to the user's email for password reset.

**Request Payload:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "data": {
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `404 Not Found`: "Email not registered"
- `422 Unprocessable Entity`: "Failed to send OTP"
- `429 Too Many Requests`: Rate limit exceeded (3 requests per 5 minutes)

### 2. Verify OTP
**Endpoint:** `POST /user/auth/verify-otp`

**Description:** Verifies the OTP and returns a reset token for password reset.

**Request Payload:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "email": "user@example.com",
    "resetToken": "jwt_token_for_password_reset"
  }
}
```

**Error Responses:**
- `400 Bad Request`: "Invalid or expired OTP"
- `404 Not Found`: "Email not registered"
- `422 Unprocessable Entity`: "Failed to verify OTP"
- `429 Too Many Requests`: Rate limit exceeded (5 requests per 5 minutes)

### 3. Set New Password
**Endpoint:** `POST /user/auth/set-password`

**Description:** Sets a new password using the email and new password details.

**Request Payload:**
```json
{
  "email": "user@example.com",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": {
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request`: "Passwords do not match" or "Password must be at least 8 characters"
- `404 Not Found`: "Email not registered"
- `422 Unprocessable Entity`: "Failed to reset password"
- `429 Too Many Requests`: Rate limit exceeded (3 requests per 5 minutes)

## Security Features

### Rate Limiting
- **Forgot Password**: 3 requests per 5 minutes
- **Verify OTP**: 5 requests per 5 minutes
- **Set Password**: 3 requests per 5 minutes

### OTP Security
- 6-digit numeric OTP
- 10-minute expiration
- Single-use (marked as used after verification)
- Automatic cleanup of expired OTPs

### Password Requirements
- Minimum 8 characters
- Password confirmation validation
- Secure hashing using Argon2

### JWT Reset Tokens
- 15-minute expiration
- Specific to password reset operations
- Includes email and operation type

## Database Schema

### Password Reset OTPs Table
```sql
CREATE TABLE password_reset_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IDX_PASSWORD_RESET_OTP_EMAIL ON password_reset_otps(email);
CREATE INDEX IDX_PASSWORD_RESET_OTP_EXPIRES ON password_reset_otps(expires_at);
```

## Email Template

The system sends a professional HTML email template with:
- Run.go branding
- Clear OTP display
- Security warnings
- Expiration information
- Professional styling

## Implementation Details

### Services
- **EmailService**: Handles email sending using NestJS Mailer
- **PasswordResetService**: Manages OTP generation, verification, and password reset logic
- **UserAuthService**: Orchestrates the password reset flow

### Validation
- Email format validation
- OTP format validation (6 digits)
- Password strength validation
- Password confirmation matching

### Error Handling
- Comprehensive error messages
- Proper HTTP status codes
- Logging for debugging
- User-friendly error responses

## Usage Flow

1. **User requests password reset** → `POST /user/auth/forgot-password`
2. **System validates email and sends OTP** → Email sent with 6-digit code
3. **User verifies OTP** → `POST /user/auth/verify-otp`
4. **System validates OTP and returns reset token** → JWT token for password reset
5. **User sets new password** → `POST /user/auth/set-password`
6. **System updates password** → Password hashed and stored

## Testing

To test the endpoints:

1. **Start the server**: `npm run start:dev`
2. **Run migration**: `npm run migration:run`
3. **Test with a registered user email**
4. **Check email for OTP**
5. **Verify OTP and reset password**

## Environment Variables

Ensure these are configured:
- `SMTP_HOST`: SMTP server host
- `SMTP_USER`: SMTP username
- `SMTP_PASSWORD`: SMTP password
- `JWT_SECRET`: JWT signing secret 