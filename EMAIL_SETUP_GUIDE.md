# Email Setup Guide

## Understanding the 403 Domain Restriction Error

### What the Error Means

When you see a **403 Forbidden** error in Resend logs with the message:
> "Testing domain restriction: The resend.dev domain is for testing and can only send to your own email address."

This means:
- ✅ Your code is working correctly
- ✅ Your API key is valid
- ❌ You're using the testing domain (`onboarding@resend.dev`)
- ❌ The testing domain can **only** send to the email address associated with your Resend account

### Why This Happens

Resend provides `resend.dev` as a testing domain. For security and spam prevention:
- You can only send emails **to yourself** (the email you used to sign up for Resend)
- You **cannot** send to other email addresses using `resend.dev`
- This is a limitation of the free testing domain

## Solutions

### Option 1: Use Your Verified Email for Testing (Quick Fix)

If you just want to test that emails are working:

1. Find your Resend account email (the one you signed up with)
2. Use that email address when testing:
   ```bash
   node test-email.js your-resend-account@email.com
   ```

This will work immediately without any domain verification.

### Option 2: Verify Your Own Domain (Recommended for Production)

To send emails to **any** recipient, you need to verify your own domain:

#### Step 1: Add Domain in Resend

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain (e.g., `mavidah.com`)
4. Click **"Add"**

#### Step 2: Verify Domain

Resend will provide DNS records you need to add:

1. Copy the DNS records from Resend
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Add the DNS records:
   - **SPF record** (TXT)
   - **DKIM records** (TXT)
   - **DMARC record** (TXT) - optional but recommended

#### Step 3: Wait for Verification

- DNS propagation can take 24-48 hours
- Resend will show verification status in the dashboard
- Once verified, you'll see a green checkmark ✅

#### Step 4: Update Your Code

Once your domain is verified, update the `from` addresses in your code:

**File: `src/lib/email/resend.js`**

Change:
```javascript
from: 'Mavidah Contact <onboarding@resend.dev>'
```

To:
```javascript
from: 'Mavidah Contact <contact@mavidah.com>'  // Use your verified domain
```

Or use an environment variable:
```javascript
from: `Mavidah Contact <${process.env.FROM_EMAIL || 'contact@mavidah.com'}>`
```

Then add to your `.env.local`:
```bash
FROM_EMAIL=contact@mavidah.com
```

#### Step 5: Test Again

```bash
node test-email.js any@email.com
```

Now you can send to any email address! 🎉

## Current Status

### What's Working ✅
- Email sending code is correct
- API integration is working
- Error handling is in place
- Test function is ready

### What Needs Fixing ❌
- Domain verification (if you want to send to any email)
- Or use your Resend account email for testing

## Quick Test Commands

```bash
# Test with your Resend account email (will work immediately)
node test-email.js your-resend-account@email.com

# Test all email types
node test-email.js your-resend-account@email.com all

# Test specific type
node test-email.js your-resend-account@email.com contact
node test-email.js your-resend-account@email.com order
node test-email.js your-resend-account@email.com newsletter
```

## Troubleshooting

### "Email sent successfully" but no email received

1. **Check spam folder** - Test emails often go to spam initially
2. **Check Resend logs** - Visit https://resend.com/emails to see delivery status
3. **Verify recipient email** - Make sure you're using the correct email address
4. **Check domain status** - If using custom domain, ensure it's verified

### Still getting 403 errors after domain verification

1. **Wait longer** - DNS changes can take up to 48 hours
2. **Check DNS records** - Verify all records are added correctly
3. **Check domain status** - Ensure it shows as "Verified" in Resend dashboard
4. **Update code** - Make sure you updated the `from` address in your code

### Test shows success but emails aren't delivered

- Check Resend dashboard logs for detailed error messages
- Verify your domain is fully verified (not just pending)
- Check if your domain has any restrictions or blacklists

## Next Steps

1. **For Development/Testing**: Use your Resend account email
2. **For Production**: Verify your domain and update the `from` addresses
3. **Monitor**: Check Resend dashboard regularly for delivery issues

## Additional Resources

- [Resend Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)
- [Resend DNS Records Guide](https://resend.com/docs/dashboard/domains/verify-your-domain)
- [Resend Email Logs](https://resend.com/emails)

---

**Need Help?** Check the Resend dashboard logs for detailed error messages and delivery status.
