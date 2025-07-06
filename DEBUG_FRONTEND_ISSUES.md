# Frontend Login Debugging Guide

## Backend Status ✅
- Backend is running on port 5000
- Login endpoint: `POST http://localhost:5000/v1/user/auth/login`
- Response format is correct

## Expected Login Response Format
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "identifier": "user-123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "isStudent": false,
      "matricNumber": null
    }
  }
}
```

## Common Frontend Issues & Solutions

### 1. Response Structure Mismatch
**Problem**: Frontend expecting different response structure
**Solution**: Update frontend to handle the nested `data` object

```javascript
// ❌ Wrong - accessing directly
const token = response.jwtToken;
const user = response.user;

// ✅ Correct - accessing from data object
const token = response.data.jwtToken;
const user = response.data.user;
```

### 2. Token Storage Issues
**Problem**: Token not being stored properly
**Solution**: Ensure proper token storage

```javascript
// Store token
localStorage.setItem('jwtToken', response.data.jwtToken);
localStorage.setItem('user', JSON.stringify(response.data.user));

// Check if token exists
const token = localStorage.getItem('jwtToken');
if (!token) {
  // Redirect to login
  window.location.href = '/login';
}
```

### 3. Redirect Logic Issues
**Problem**: Redirect not happening after successful login
**Solution**: Add proper redirect logic

```javascript
// After successful login
if (response.success && response.data.jwtToken) {
  // Store data
  localStorage.setItem('jwtToken', response.data.jwtToken);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  // Redirect to dashboard
  window.location.href = '/dashboard';
  // OR for React Router
  // navigate('/dashboard');
}
```

### 4. CORS Issues
**Problem**: CORS errors in browser console
**Solution**: Backend has CORS enabled, check frontend URL

### 5. Alert Loop Issues
**Problem**: Alerts keep popping up
**Solution**: Check for infinite loops in login logic

```javascript
// ❌ Wrong - can cause infinite loops
if (!token) {
  alert('Please login');
  window.location.href = '/login';
}

// ✅ Correct - add flags to prevent loops
let redirecting = false;
if (!token && !redirecting) {
  redirecting = true;
  alert('Please login');
  window.location.href = '/login';
}
```

## Testing Steps

### 1. Test Backend Response
```bash
curl -X POST http://localhost:5000/v1/user/auth/test-login-response
```

### 2. Test Real Login
```bash
curl -X POST http://localhost:5000/v1/user/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password",
    "isStudent": false
  }'
```

### 3. Check Browser Console
- Open Developer Tools (F12)
- Check Console for errors
- Check Network tab for failed requests

### 4. Check Local Storage
```javascript
// In browser console
console.log('JWT Token:', localStorage.getItem('jwtToken'));
console.log('User:', localStorage.getItem('user'));
```

## Debug Endpoints Available

1. **Health Check**: `GET http://localhost:5000/v1/health`
2. **API Info**: `GET http://localhost:5000/v1/api-info`
3. **Test Login Response**: `POST http://localhost:5000/v1/user/auth/test-login-response`
4. **Debug Users**: `POST http://localhost:5000/v1/user/auth/debug-users`

## Frontend Code Checklist

- [ ] Response handling accesses `response.data.jwtToken`
- [ ] Token is stored in localStorage/sessionStorage
- [ ] User data is stored properly
- [ ] Redirect happens after successful login
- [ ] No infinite loops in authentication logic
- [ ] Error handling for failed login attempts
- [ ] Loading states during login process 