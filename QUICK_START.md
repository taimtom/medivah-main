# ⚡ Mavidah - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies (1 min)

```bash
cd starter-next-js
npm install
```

### 2. Set Up Environment Variables (2 min)

Create `.env.local` file:

```bash
# Supabase (Get from https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Paystack (Get from https://dashboard.paystack.com/#/settings/developer)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Resend (Get from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=contact@mavidah.co

# Google Analytics (Get from https://analytics.google.com)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# JWT (Generate a random string)
AUTH_SECRET=your-random-secret-key-here
```

### 3. Set Up Supabase Database (2 min)

1. Go to your Supabase project
2. Click "SQL Editor"
3. Copy and paste SQL from `SUPABASE_SETUP.md`
4. Click "Run"

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

---

## 📱 First Steps

### Create Admin Account
1. Go to `http://localhost:3000/auth/jwt/sign-up`
2. Enter email and password
3. Click "Sign Up"

### Access Dashboard
1. Sign in at `/auth/jwt/sign-in`
2. You'll be redirected to `/dashboard`

### Add Your First Content

**Create a Blog Post:**
1. Dashboard → Blog Management
2. Click "New Blog Post"
3. Fill in details
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

---

## 🎨 Quick Customization

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

See `BRANDING_GUIDE.md` for details.

---

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

---

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

---

## 🔗 Important URLs

### Local Development:
- **Home**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Sign In**: http://localhost:3000/auth/jwt/sign-in

### External Services:
- **Supabase**: https://supabase.com/dashboard
- **Paystack**: https://dashboard.paystack.com
- **Resend**: https://resend.com/emails
- **Google Analytics**: https://analytics.google.com
- **Vercel**: https://vercel.com/dashboard

---

## 🆘 Quick Troubleshooting

**Port 3000 already in use:**
```bash
npx kill-port 3000
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
- Check if tables were created (run SQL from SUPABASE_SETUP.md)
- Check Supabase logs

---

## 📚 Full Documentation

- **📖 Complete Guide**: `DEPLOYMENT_READY.md` ⭐ **START HERE**
- **🎨 Branding**: `BRANDING_GUIDE.md`
- **💾 Database**: `SUPABASE_SETUP.md`
- **🔐 Environment**: `ENV_ADDITIONS.md`
- **📊 Summary**: `FINAL_SUMMARY.md`

---

## ✅ What's Working Right Now

✅ Navigation bar on all pages  
✅ All public pages (Home, About, Blog, Resources, Jobs, Contact)  
✅ Admin dashboard with real-time analytics  
✅ Full CRUD for blogs, products, and jobs  
✅ Paystack payment integration  
✅ Contact form with email  
✅ Google Analytics tracking  
✅ Responsive design  
✅ JWT authentication  

---

## 🎯 Next Steps

1. **Replace Test Data**
   - Add real blog posts
   - Add real products with actual files
   - Add real job listings

2. **Customize Branding**
   - Add your logo
   - Update colors
   - Add favicons

3. **Go Live**
   - Switch to Paystack live keys
   - Deploy to Vercel
   - Set up custom domain

4. **Market Your Site**
   - Share on social media
   - Add to Google Search Console
   - Start creating content!

---

**You're all set! Start building your HR knowledge platform! 🚀**

Need help? Check the detailed guides in the documentation files.


