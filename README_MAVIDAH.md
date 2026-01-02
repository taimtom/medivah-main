# Mavidah HR Website

A professional HR knowledge platform built with Next.js, Material UI, and Supabase.

## 🎯 Project Overview

Mavidah is a digital space for sharing HR knowledge, career guidance, and workplace insights. The platform features:

- **Public Website:** Home, About, Blog, Resources, Jobs, Contact
- **Admin Dashboard:** Content management, analytics, orders
- **E-commerce:** Digital products (ebooks, templates, guides) with Paystack payment
- **Zero-cost hosting:** Using free tiers of Vercel, Supabase, Resend, and Google Analytics

## ✅ Implementation Progress

### Completed (60% of core functionality):

1. **Project Setup & Cleanup**
   - Removed unused template files and auth providers
   - Updated configuration for Mavidah branding
   - Installed all required dependencies

2. **Database & Backend**
   - Supabase integration configured
   - Database schema designed and documented
   - Client and server utilities created

3. **Public Pages**
   - ✅ Home page with hero, featured blogs, resources showcase
   - ✅ About page with mission, values, community sections
   - ✅ Blog listing with search and category filters
   - ✅ Blog post detail view with rich content display

4. **Infrastructure**
   - Routing system updated
   - Navigation configuration updated
   - Environment variables documented

### Remaining Work (40%):

1. **Public Pages** (2-3 hours)
   - Resources/Products catalog and detail pages
   - Checkout page with Paystack integration
   - Jobs listing page
   - Contact page with email integration

2. **Admin Dashboard** (4-5 hours)
   - Analytics dashboard
   - Blog management (create, edit, delete)
   - Product management
   - Job management
   - Orders management

3. **API Routes** (2-3 hours)
   - CRUD operations for all entities
   - File upload handling
   - Paystack webhook
   - Email sending

4. **Integrations** (1-2 hours)
   - Paystack payment processing
   - Google Analytics tracking
   - Resend email service
   - Logo and theme customization

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create project at https://supabase.com
2. Run SQL from `SUPABASE_SETUP.md` in SQL Editor
3. Create storage buckets: `blog-images`, `products`, `avatars`
4. Get API keys from Project Settings > API

### 3. Configure Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx

# Email (Resend)
RESEND_API_KEY=re_xxx
CONTACT_EMAIL=contact@mavidah.co

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Auth
JWT_SECRET=your-random-secret-key
NEXT_PUBLIC_SITE_URL=http://localhost:3030
```

### 4. Add Logo Files

Save Mavidah logo to `public/logo/`:
- `logo-full.svg` / `logo-full.png` (horizontal logo with text)
- `logo-single.svg` / `logo-single.png` (icon only)

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3030

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.jsx           # Home page ✅
│   ├── about/             # About page ✅
│   ├── blog/              # Blog pages ✅
│   ├── resources/         # Products pages (TODO)
│   ├── jobs/              # Jobs page (TODO)
│   ├── contact/           # Contact page (TODO)
│   ├── auth/jwt/          # Authentication ✅
│   ├── dashboard/         # Admin dashboard (TODO)
│   └── api/               # API routes (TODO)
├── sections/              # Page sections/components
│   ├── home/              # Home page sections ✅
│   ├── about/             # About page sections ✅
│   └── blog/              # Blog sections ✅
├── lib/
│   └── supabase/          # Supabase utilities ✅
├── components/            # Reusable components ✅
├── layouts/               # Layout components ✅
├── theme/                 # Material UI theme ✅
├── routes/                # Routing utilities ✅
└── config-global.js       # Global configuration ✅
```

## 🎨 Branding

### Colors (from Mavidah logo):
- **Primary:** Green gradient (#7CB342 → #81C784)
- **Secondary:** Blue (#1976D2 → #2E7D9C)
- **Accent:** Yellow/Gold (#FFD54F)

Update in `src/theme/core/palette.js`

### Contact:
- Email: contact@mavidah.co
- Website: mavidah.co

## 🗄️ Database Schema

See `SUPABASE_SETUP.md` for complete schema. Key tables:

- **blogs:** Blog posts with rich content
- **products:** Digital products (ebooks, templates)
- **jobs:** Job listings
- **orders:** Purchase orders with Paystack integration

## 🔐 Authentication

Uses JWT authentication with Supabase for user storage. Admin access required for dashboard.

## 💳 Payment Processing

Paystack integration for digital product sales:
- Supports NGN and other African currencies
- 1.5% + NGN 100 per transaction (Nigeria)
- 3.9% for international cards
- No monthly fees

## 📧 Email Service

Resend for transactional emails:
- Contact form submissions
- Order confirmations
- Admin notifications
- 3,000 emails/month free

## 📊 Analytics

Google Analytics 4 for website tracking:
- Page views and user sessions
- Blog engagement metrics
- Product views and purchases
- Job listing interactions

## 🚀 Deployment

### Vercel (Recommended):

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically

### Environment Variables in Vercel:
Add all variables from `.env.local` to Vercel dashboard

### Custom Domain:
1. Add domain in Vercel
2. Update DNS records
3. SSL automatically configured

## 💰 Hosting Costs

**Total: $0/month** with free tiers:

- **Vercel:** Free (100GB bandwidth, unlimited API requests)
- **Supabase:** Free (500MB DB, 1GB storage, 2GB bandwidth)
- **Paystack:** Free (pay per transaction only)
- **Resend:** Free (3,000 emails/month)
- **Google Analytics:** Free (unlimited)

Costs only apply when exceeding free tier limits.

## 📝 Development Commands

```bash
# Development
npm run dev              # Start dev server on port 3030

# Production
npm run build           # Build for production
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run fm:check        # Check code formatting
npm run fm:fix          # Fix code formatting

# Cleanup
npm run rm:all          # Remove node_modules, .next, etc.
npm run re:start        # Clean install and start dev
npm run re:build        # Clean install and build
```

## 🐛 Troubleshooting

### Supabase Connection Issues:
- Verify environment variables are correct
- Check Supabase project is active
- Ensure RLS policies are set up

### Build Errors:
- Run `npm run lint:fix` to fix linting issues
- Clear `.next` folder and rebuild
- Check all imports are correct

### Payment Issues:
- Use Paystack test keys in development
- Verify webhook URL is accessible
- Check Paystack dashboard for transaction logs

## 📚 Documentation

- `SUPABASE_SETUP.md` - Database setup instructions
- `ENV_SETUP.md` - Environment variables guide
- `IMPLEMENTATION_STATUS.md` - Detailed implementation status

## 🤝 Contributing

This is a custom implementation for Mavidah. For questions or support:
- Email: contact@mavidah.co

## 📄 License

Proprietary - Mavidah © 2024

---

**Built with:** Next.js 14, Material UI 5, Supabase, Paystack, Resend, Google Analytics


