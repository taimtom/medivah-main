# Switching to Supabase Authentication - Complete Guide

## ✅ What I've Done

I've successfully configured your application to use **Supabase Authentication** instead of JWT. Here's what was implemented:

### 1. **Auth Configuration**

- ✅ Changed `CONFIG.auth.method` from `'jwt'` to `'supabase'`
- ✅ Updated auth routes to include Supabase paths
- ✅ Modified auth guard to support both JWT and Supabase

### 2. **Supabase Auth Provider**

- ✅ Created `src/auth/context/supabase/auth-provider.jsx`
- ✅ Created `src/auth/context/supabase/action.js` with auth functions
- ✅ Integrated with Supabase client for session management

### 3. **Sign-In & Sign-Up Pages**

- ✅ Created `/auth/supabase/sign-in` page
- ✅ Created `/auth/supabase/sign-up` page
- ✅ Both pages use Material-UI forms with validation

### 4. **Root Layout Update**

- ✅ Updated to dynamically select auth provider based on config
- ✅ Supports both JWT and Supabase authentication

---

## 🚀 Next Steps - Set Up Your Admin Account

### Step 1: Create Your Admin User in Supabase

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** → **"Create new user"**
4. Fill in:
   - **Email**: `your-email@example.com` (your admin email)
   - **Password**: Create a strong password
   - **Auto Confirm User**: ✅ Check this box (important!)
5. Click **"Create user"**

### Step 2: Update RLS Policies (Better Security)

Now that we have Supabase auth, run this SQL to update the policies:

```sql
-- ============================================
-- DROP ALL EXISTING POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can read blogs" ON blogs;
DROP POLICY IF EXISTS "Anyone can insert blogs" ON blogs;
DROP POLICY IF EXISTS "Anyone can update blogs" ON blogs;
DROP POLICY IF EXISTS "Anyone can delete blogs" ON blogs;
DROP POLICY IF EXISTS "Public can view published blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can insert blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can update blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can delete blogs" ON blogs;

DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

DROP POLICY IF EXISTS "Anyone can read jobs" ON jobs;
DROP POLICY IF EXISTS "Anyone can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Anyone can update jobs" ON jobs;
DROP POLICY IF EXISTS "Anyone can delete jobs" ON jobs;
DROP POLICY IF EXISTS "Public can view published jobs" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can update jobs" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can delete jobs" ON jobs;

DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;

-- ============================================
-- CREATE NEW SECURE POLICIES
-- ============================================

-- BLOGS TABLE POLICIES
CREATE POLICY "Public can view published blogs"
ON blogs FOR SELECT
USING (published = true);

CREATE POLICY "Authenticated users can do everything with blogs"
ON blogs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- PRODUCTS TABLE POLICIES
CREATE POLICY "Public can view all products"
ON products FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can do everything with products"
ON products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- JOBS TABLE POLICIES
CREATE POLICY "Public can view published jobs"
ON jobs FOR SELECT
USING (published = true);

CREATE POLICY "Authenticated users can do everything with jobs"
ON jobs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ORDERS TABLE POLICIES
CREATE POLICY "Anyone can create orders"
ON orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything with orders"
ON orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

---

## ✅ Test Your Setup

### 1. **Restart Your Dev Server**

```bash
# Press Ctrl+C to stop
npm run dev
```

### 2. **Sign In**

1. Go to: `http://localhost:3033/dashboard`
2. You'll be redirected to: `http://localhost:3033/auth/supabase/sign-in`
3. Enter the credentials you created in Supabase
4. Click **"Sign in"**

### 3. **Create a Blog Post**

1. Navigate to **Blog Posts**
2. Click **"New Blog Post"**
3. Fill in the form with the rich text editor
4. Click **"Publish Blog"**

---

## 🎯 Why This Is Better

### Before (JWT):

- ❌ Separate authentication system
- ❌ RLS policies didn't work
- ❌ Had to allow unauthenticated access
- ❌ Less secure

### After (Supabase Auth):

- ✅ **Integrated authentication** with your database
- ✅ **RLS policies work automatically**
- ✅ **Secure by default** - only authenticated users can modify data
- ✅ **Public can view** published content
- ✅ **Admins can do everything** when signed in

---

## 🔐 Security Features

### Row Level Security (RLS) is Now Active:

1. **Public users** can:

   - View published blogs and jobs
   - View all products
   - Create orders (when purchasing)

2. **Authenticated users** (your admin account) can:

   - Create, read, update, delete **all content**
   - Manage orders
   - Full dashboard access

3. **Database is protected**:
   - Unauthenticated users can't modify data
   - All API calls are authenticated via Supabase

---

## 📝 Additional Features Available

### Sign Up New Admins:

- Go to `/auth/supabase/sign-up`
- Create new admin accounts
- All authenticated users have admin access

### Password Reset:

- Can be added later if needed
- Supabase has built-in email templates

### OAuth Login:

- Google, GitHub, etc. can be added
- Configure in Supabase Dashboard → Authentication → Providers

---

## 🐛 Troubleshooting

### If you can't sign in:

1. **Check Supabase URL and Key** in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   ```
2. **Verify user exists** in Supabase Dashboard → Authentication → Users
3. **Check Auto Confirm** is enabled for the user

### If RLS errors persist:

1. Run the SQL script above to update policies
2. Make sure you're signed in with a Supabase account
3. Check browser console for specific errors

---

## 🎉 You're All Set!

Your application now has:

- ✅ Secure Supabase authentication
- ✅ Working RLS policies
- ✅ Protected admin dashboard
- ✅ Public content access
- ✅ Rich text blog editor
- ✅ Full CRUD operations for all content

**Happy managing your Mavidah HR website!** 🚀
