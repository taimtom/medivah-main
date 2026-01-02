# Environment Variables Setup

Create a `.env.local` file in the project root with these variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx

# Email (Resend)
RESEND_API_KEY=re_xxx
CONTACT_EMAIL=contact@mavidah.co

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Auth
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3030

# Optional
NEXT_PUBLIC_SERVER_URL=
NEXT_PUBLIC_ASSET_URL=
NEXT_PUBLIC_BASE_PATH=
BUILD_STATIC_EXPORT=false
```

## Getting Your Keys

1. **Supabase**: https://supabase.com - Create project, get keys from Settings > API
2. **Paystack**: https://paystack.com - Create account, get keys from Settings > API Keys
3. **Resend**: https://resend.com - Create account, generate API key
4. **Google Analytics**: https://analytics.google.com - Create property, get measurement ID


