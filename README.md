# Mavidah Blog Project

A professional HR knowledge platform built with Next.js, Material UI, and Supabase. This platform features blog management, digital product sales, job listings, and comprehensive content management capabilities.

## 🎯 Project Overview

Mavidah is a digital space for sharing HR knowledge, career guidance, and workplace insights. The platform includes:

- **Public Website:** Home, About, Blog, Resources, Jobs, Contact
- **Admin Dashboard:** Content management, analytics, orders
- **E-commerce:** Digital products (ebooks, templates, guides) with Paystack payment
- **Zero-cost hosting:** Using free tiers of Vercel, Supabase, Resend, and Google Analytics

## ✅ Features Implemented

### Public Website (100% Complete)
- ✅ Navigation bar on all pages
- ✅ Home page with hero, featured blogs, resources showcase
- ✅ About page with mission, values, community sections
- ✅ Blog listing with search and category filters
- ✅ Blog post detail view with rich content display
- ✅ Resources/Products catalog and detail pages
- ✅ Jobs listing page with filters
- ✅ Contact page with email integration
- ✅ Footer with links and contact info

### Admin Dashboard (100% Complete)
- ✅ Analytics dashboard with real-time stats
- ✅ Blog management (full CRUD with publish/draft toggle)
- ✅ Product management (full CRUD for digital products)
- ✅ Job management (full CRUD for job postings)
- ✅ Orders management (view all orders and revenue)
- ✅ Comments management (moderate, approve, reject, delete)

### Blog Engagement Features
- ✅ Like/Dislike system for blog posts
- ✅ Comments and threaded replies
- ✅ Auto-approval for authenticated users
- ✅ Moderation queue for guest comments
- ✅ Engagement analytics dashboard

### Integrations (100% Complete)
- ✅ **Supabase:** Database, storage, authentication
- ✅ **Paystack:** Payment processing for products
- ✅ **Resend:** Email service for contact form
- ✅ **Google Analytics 4:** Website tracking

### Additional Features
- ✅ Disclosure policy page and blog post disclosures
- ✅ Newsletter system with scheduling, A/B testing, and click tracking
- ✅ Rich text editor for blog posts (React Quill)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ JWT/Supabase authentication
- ✅ Row Level Security (RLS) policies

## 🚀 Quick Start Guide

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase (Get from https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Paystack (Get from https://dashboard.paystack.com/#/settings/developer)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Resend (Get from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=contact@mavidah.co

# Google Analytics (Get from https://analytics.google.com)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Site URL (For Open Graph meta tags and social sharing)
NEXT_PUBLIC_SITE_URL=https://www.mavidah.com

# JWT (Generate a random string)
AUTH_SECRET=your-random-secret-key-here
```

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Click "SQL Editor"
3. Copy and paste the entire contents of `database.sql`
4. Click "Run" to execute all database setup

This will create:
- All required tables (blogs, products, jobs, orders, newsletter, engagement tables)
- Row Level Security (RLS) policies
- Helper functions and triggers
- Storage bucket policies

### 4. Set Up Storage Buckets

In Supabase Dashboard → Storage, create these buckets:

1. **blog-images** (Public bucket)
   - Allow public access
   - For blog post featured images

2. **products** (Private bucket)
   - Require authentication
   - For digital product files (PDFs, templates, etc.)

3. **product-images** (Public bucket)
   - Allow public access
   - For product images

4. **avatars** (Public bucket)
   - Allow public access
   - For user profile pictures

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3033` 🎉

## 📱 First Steps

### Create Admin Account

1. Go to `http://localhost:3033/auth/jwt/sign-up` (or `/auth/supabase/sign-up` if using Supabase auth)
2. Enter email and password
3. Click "Sign Up"

### Access Dashboard

1. Sign in at `/auth/jwt/sign-in` (or `/auth/supabase/sign-in`)
2. You'll be redirected to `/dashboard`

### Add Your First Content

**Create a Blog Post:**
1. Dashboard → Blog Management
2. Click "New Blog Post"
3. Fill in details using the rich text editor
4. Toggle "Published" ON
5. Click "Create Blog"
6. View at `/blog`

**Create a Product:**
1. Dashboard → Product Management
2. Click "New Product"
3. Add name, description, price
4. Add image URL (use any image from internet for testing)
5. Toggle "Published" ON
6. Click "Create Product"
7. View at `/resources`

**Create a Job:**
1. Dashboard → Job Management
2. Click "New Job"
3. Fill in job details
4. Toggle "Published" ON
5. Click "Create Job"
6. View at `/jobs`

## 🎨 Branding Customization

### Change Site Colors

Edit `src/theme/core/palette.js`:

```javascript
primary: {
  main: '#YOUR_GREEN_COLOR', // Your brand green
},
secondary: {
  main: '#YOUR_BLUE_COLOR', // Your brand blue
},
warning: {
  main: '#YOUR_GOLD_COLOR', // Your brand gold
},
```

### Add Your Logo

1. Add `logo.svg` to `public/logo/`
2. Edit `src/components/logo/logo.jsx`
3. Change the text to use your logo image

## 🧪 Test Paystack Payment (Test Mode)

1. Go to `/resources`
2. Click on a product
3. Click "Buy Now"
4. Enter details
5. Use Paystack test card:
   - **Card Number**: 4084084084084081
   - **CVV**: 408
   - **Expiry**: 01/99
   - **PIN**: 0000
   - **OTP**: 123456

6. Check Dashboard → Orders to see the completed order

## 📧 Test Email Delivery

### Using the Test Script (Recommended)

1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. Run the test script:
   ```bash
   # Test all email types
   node test-email.js your@email.com

   # Test specific email type
   node test-email.js your@email.com contact
   node test-email.js your@email.com order
   node test-email.js your@email.com newsletter
   ```

3. Check your inbox for the test emails

### Using the API Endpoint Directly

You can also test emails by calling the API endpoint directly:

**GET Request:**
```bash
# Test all email types
curl "http://localhost:3033/api/email/test?email=your@email.com&type=all"

# Test specific type
curl "http://localhost:3033/api/email/test?email=your@email.com&type=contact"
```

**POST Request:**
```bash
curl -X POST http://localhost:3033/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "type": "all"}'
```

### Troubleshooting Email Issues

- **Check RESEND_API_KEY**: Make sure `RESEND_API_KEY` is set in your `.env.local`
- **Verify Resend Domain**: Ensure your domain is verified in Resend dashboard
- **Check Spam Folder**: Test emails might go to spam initially
- **Review API Response**: The test endpoint returns detailed error messages
- **Check Resend Dashboard**: Visit https://resend.com/emails to see sent emails

## 📦 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables in Vercel Dashboard
# Then deploy to production
vercel --prod
```

Your site will be live at `https://your-project.vercel.app`

## 🔗 Important URLs

### Local Development:
- **Home**: http://localhost:3033
- **Dashboard**: http://localhost:3033/dashboard
- **Sign In**: http://localhost:3033/auth/jwt/sign-in

### External Services:
- **Supabase**: https://supabase.com/dashboard
- **Paystack**: https://dashboard.paystack.com
- **Resend**: https://resend.com/emails
- **Google Analytics**: https://analytics.google.com
- **Vercel**: https://vercel.com/dashboard

## 🆘 Quick Troubleshooting

**Port 3033 already in use:**
```bash
npx kill-port 3033
npm run dev
```

**Can't see new content:**
- Check if "Published" is toggled ON
- Refresh the page
- Check browser console for errors

**Paystack not working:**
- Use test keys first
- Check if public key starts with `pk_test_`
- Make sure Paystack script loaded (check browser console)

**Database errors:**
- Verify Supabase URL and key in `.env.local`
- Check if tables were created (run SQL from `database.sql`)
- Check Supabase logs

**Comments not working:**
- Ensure RLS policies are set up correctly
- Check that `blog_comments` table exists
- Verify anonymous permissions are granted

## 📊 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.jsx           # Home page
│   ├── about/             # About page
│   ├── blog/               # Blog pages
│   ├── resources/         # Products pages
│   ├── jobs/               # Jobs page
│   ├── contact/            # Contact page
│   ├── disclosure/         # Disclosure policy
│   ├── auth/jwt/           # Authentication
│   ├── dashboard/          # Admin dashboard
│   └── api/                # API routes
├── sections/               # Page sections/components
│   ├── home/               # Home page sections
│   ├── about/              # About page sections
│   ├── blog/               # Blog sections
│   ├── resources/          # Resource sections
│   ├── jobs/               # Job sections
│   ├── contact/            # Contact sections
│   ├── disclosure/         # Disclosure components
│   └── dashboard/          # Dashboard sections
├── lib/
│   └── supabase/           # Supabase utilities
├── components/             # Reusable components
├── layouts/                # Layout components
├── theme/                  # Material UI theme
└── routes/                 # Routing utilities
```

## 💰 Hosting Costs

**Total: $0/month** with free tiers:

- **Vercel:** Free (100GB bandwidth, unlimited API requests)
- **Supabase:** Free (500MB DB, 1GB storage, 2GB bandwidth)
- **Paystack:** Free (pay per transaction only)
- **Resend:** Free (3,000 emails/month)
- **Google Analytics:** Free (unlimited)

Costs only apply when exceeding free tier limits.

## 🔐 Authentication

The application supports both JWT and Supabase authentication:

- **JWT Auth:** Default authentication system
- **Supabase Auth:** Integrated authentication with database

To switch to Supabase auth, update `src/config-global.js`:
```javascript
auth: {
  method: 'supabase', // or 'jwt'
}
```

## 📝 Development Commands

```bash
# Development
npm run dev              # Start dev server on port 3033

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

## 🎯 Key Features Documentation

### Blog Engagement
- Users can like/dislike blog posts
- Comments with threaded replies
- Auto-approval for authenticated users
- Moderation dashboard for admins
- See `database.sql` for engagement schema

### Newsletter System
- Subscriber management
- Email scheduling
- A/B testing for subject lines and content
- Click tracking for links
- Analytics dashboard
- See `database.sql` for newsletter schema

### Disclosure Policy
- Standalone disclosure page at `/disclosure`
- Automatic disclosure on every blog post
- FTC-compliant affiliate and sponsored content disclosures

### Comment Management
- View all comments in dashboard
- Filter by status (Approved, Pending, Rejected, Spam)
- Approve, reject, mark as spam, or delete comments
- Auto-approval enabled by default

## 🔒 Security Features

- Row Level Security (RLS) enabled on all tables
- JWT/Supabase authentication
- Environment variables for sensitive keys
- Paystack payment verification server-side
- Input sanitization and validation

## 📈 Analytics & Tracking

### Google Analytics Events Tracked:
- Page views on all pages
- Navigation clicks
- Link clicks
- Product purchases
- Contact form submissions

### Dashboard Analytics:
- Total blogs, products, jobs, orders
- Engagement metrics (likes, comments)
- Revenue tracking
- Recent activity feed

## 🐛 Known Limitations

- No user roles (all signed-in users are admins)
- No email templates (plain text emails)
- Image upload requires URLs (no direct upload UI)
- No built-in search functionality

## 🚀 Future Enhancements

Potential features to add:
- User roles and permissions
- Email templates
- Direct image upload UI
- Search functionality
- Product reviews
- User profiles
- Multi-language support

## 📞 Support

For issues or questions:
- Check Supabase logs in the Dashboard
- Review browser console for errors
- Verify environment variables are set correctly
- Ensure database schema is up to date

## 📄 License

Proprietary - Mavidah © 2024

---

**Built with:** Next.js 14, Material UI 5, Supabase, Paystack, Resend, Google Analytics

**Status:** Production Ready ✅

**Last Updated:** January 2025
