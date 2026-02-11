# 📧 Email Setup Guide for OTP Feature

## Overview
The forgot password feature sends OTP codes via email. You need to configure email settings in your backend.

---

## Option 1: Gmail (Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security"
3. Enable "2-Step Verification"

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "Smart Waste Segregator"
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Update backend/.env
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM_NAME=Smart Waste Segregator
```

---

## Option 2: Outlook/Hotmail

### Configuration:
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM_NAME=Smart Waste Segregator
```

---

## Option 3: Custom SMTP Server

### Configuration:
```env
EMAIL_HOST=smtp.your-domain.com
EMAIL_PORT=587
EMAIL_USER=your-email@your-domain.com
EMAIL_PASSWORD=your-password
EMAIL_FROM_NAME=Smart Waste Segregator
```

---

## Testing the Email Feature

### 1. Start Backend Server
```bash
cd backend
npm run dev
```

### 2. Test Forgot Password API
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3. Check Email
- Check your inbox for the OTP email
- OTP is valid for 10 minutes
- Email includes a nicely formatted HTML template

---

## Email Template Preview

The OTP email includes:
- ✅ Professional header with logo
- ✅ Clear OTP code display
- ✅ 10-minute expiry notice
- ✅ Security warning
- ✅ Step-by-step instructions
- ✅ Branded footer

---

## Troubleshooting

### Error: "Email could not be sent"

**Solution 1: Check credentials**
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- For Gmail, make sure you're using App Password, not regular password

**Solution 2: Check firewall**
- Ensure port 587 is not blocked
- Try port 465 with `secure: true` in sendEmail.js

**Solution 3: Enable less secure apps (Gmail)**
- Not recommended, use App Password instead

### Error: "Invalid login"

**For Gmail:**
- Make sure 2FA is enabled
- Use App Password, not account password
- Remove spaces from the 16-character password

**For Outlook:**
- Use your regular account password
- Check if account is locked

### OTP Not Received

**Check:**
1. Spam/Junk folder
2. Email address is correct
3. Backend logs for errors
4. Email service is not rate-limiting

---

## Security Best Practices

### 1. Never Commit .env Files
```bash
# Already in .gitignore
backend/.env
```

### 2. Use Environment Variables in Production
- Use your hosting platform's environment variable settings
- Never hardcode credentials

### 3. Rate Limiting
- Already implemented in auth routes
- Prevents OTP spam

### 4. OTP Expiry
- OTPs expire after 10 minutes
- Old OTPs are automatically invalidated

---

## Production Recommendations

### Use a Dedicated Email Service:

1. **SendGrid** (Free tier: 100 emails/day)
   - https://sendgrid.com/
   - More reliable than Gmail
   - Better deliverability

2. **Mailgun** (Free tier: 5,000 emails/month)
   - https://www.mailgun.com/
   - Easy to set up

3. **AWS SES** (Very cheap)
   - https://aws.amazon.com/ses/
   - $0.10 per 1,000 emails

### Example SendGrid Configuration:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM_NAME=Smart Waste Segregator
```

---

## Testing Checklist

- [ ] Email credentials configured in backend/.env
- [ ] Backend server running without errors
- [ ] Can send forgot password request
- [ ] OTP email received in inbox
- [ ] OTP code is 6 digits
- [ ] OTP verification works
- [ ] Password reset successful
- [ ] Can login with new password

---

## Quick Test Script

Save this as `test-email.js` in backend folder:

```javascript
import sendEmail from './utils/sendEmail.js';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
  try {
    await sendEmail({
      email: 'your-test-email@example.com',
      subject: 'Test Email',
      html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>'
    });
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
};

testEmail();
```

Run: `node test-email.js`

---

## Need Help?

If you're still having issues:
1. Check backend console for detailed error messages
2. Verify all environment variables are set
3. Try a different email provider
4. Check your email provider's SMTP documentation

---

**Your forgot password feature is now ready to use!** 🎉
