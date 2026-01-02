# Additional Environment Variables Needed

Add these to your `.env.local` file:

## Paystack (Required for Payments)

```bash
# Get these from https://dashboard.paystack.com/#/settings/developer
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

## Supabase Service Role (Optional - for admin operations)

```bash
# Get this from Supabase Dashboard > Settings > API
# Only needed if you want to perform admin operations from API routes
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Google Analytics (Already Added)

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Resend (Already Added)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=contact@mavidah.co
```

## Updated Complete .env.local Example

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=contact@mavidah.co

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# JWT (Auto-generated, keep as is)
AUTH_SECRET=your-secret-key-here
```

