# 🚀 Deploy CareFlow to Vercel - Step by Step

## Method 1: Vercel CLI (Fastest - 2 minutes)

### Step 1: Install Vercel CLI
Open your terminal in the project folder and run:
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```
This will open your browser. Login with:
- GitHub account (recommended)
- GitLab
- Bitbucket
- or Email

### Step 3: Deploy
Just run this single command:
```bash
vercel
```

You'll be asked a few questions:
```
? Set up and deploy "healthcare-platform"? [Y/n] Y
? Which scope do you want to deploy to? [Your username]
? Link to existing project? [y/N] N
? What's your project's name? careflow
? In which directory is your code located? ./
```

**IMPORTANT: When asked about build settings:**
```
? Want to override the settings? [y/N] N
```
Just press Enter (it will auto-detect Vite)

### Step 4: Add Environment Variables
After deploy, you'll get a URL like: `https://careflow-xxxx.vercel.app`

1. Go to: https://vercel.com/dashboard
2. Click on your "careflow" project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

**Variable 1:**
- Key: `VITE_SUPABASE_URL`
- Value: `https://idacbpdcetpziekhbpeg.supabase.co`
- Environment: ✓ Production ✓ Preview ✓ Development

**Variable 2:**
- Key: `VITE_SUPABASE_PUBLISHABLE_KEY`
- Value: `sb_publishable_ACDZhgrfD_JqbMl9Y3AEYA_QMGdXV7f`
- Environment: ✓ Production ✓ Preview ✓ Development

5. Click **Save**

### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

### ✅ Done! Your app is live!

---

## Method 2: Vercel Dashboard (No CLI - 3 minutes)

### Step 1: Push to GitHub (if not already)
```bash
git init
git add .
git commit -m "Initial commit - CareFlow"
git branch -M main
git remote add origin https://github.com/yourusername/careflow.git
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Connect your GitHub account
4. Select your `careflow` repository
5. Click **Import**

### Step 3: Configure Build Settings
Vercel will auto-detect Vite. Settings should be:
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 4: Add Environment Variables
Before clicking Deploy, expand **Environment Variables** and add:

**Variable 1:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://idacbpdcetpziekhbpeg.supabase.co`

**Variable 2:**
- Name: `VITE_SUPABASE_PUBLISHABLE_KEY`
- Value: `sb_publishable_ACDZhgrfD_JqbMl9Y3AEYA_QMGdXV7f`

### Step 5: Deploy
Click **"Deploy"** button

Wait 1-2 minutes for build to complete.

### ✅ Done! You'll get a live URL like: `https://careflow-xxxx.vercel.app`

---

## Method 3: Drag & Drop (Easiest - No Git Required)

### Step 1: Build Your Project
```bash
npm run build
```
This creates a `dist` folder with your production files.

### Step 2: Go to Vercel
1. Visit: https://vercel.com/new
2. Click **"Browse"** or drag your `dist` folder onto the page

### Step 3: Deploy
Vercel will upload and deploy immediately!

### Step 4: Add Environment Variables (Important!)
1. Go to your project dashboard
2. **Settings** → **Environment Variables**
3. Add the two VITE variables (see Method 1, Step 4)
4. Trigger a redeploy:
   - Go to **Deployments** tab
   - Click "..." on latest deployment
   - Click **"Redeploy"**

### ✅ Done!

---

## 🧪 Test Your Deployed App

### 1. Visit your Vercel URL
Example: `https://careflow-xxxx.vercel.app`

### 2. Test Patient Login
- Email: `abc@gmail.com`
- Password: `123456`
- ✓ Check dashboard loads
- ✓ Try booking an appointment
- ✓ Request emergency ambulance

### 3. Test Admin Login
- Logout from patient
- Email: `admin@careflow.com`
- Password: `admin123`
- ✓ Check admin dashboard
- ✓ View statistics
- ✓ Manage appointments

### 4. Test Responsive Design
- Resize browser to mobile size
- ✓ Hamburger menu should appear
- ✓ Sidebar should collapse

---

## 🔧 Common Issues & Fixes

### Issue 1: White Screen After Deploy
**Cause:** Environment variables not set
**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set
3. Redeploy

### Issue 2: 404 on Page Refresh
**Cause:** Missing routing configuration
**Fix:** Already handled! Your project has `vercel.json` with proper rewrites

### Issue 3: Supabase Connection Error
**Cause:** Environment variables don't match
**Fix:**
- Double-check variable names (must start with `VITE_`)
- Verify Supabase URL and key are correct
- No trailing spaces in values

### Issue 4: Build Fails
**Cause:** Missing dependencies
**Fix:**
```bash
rm -rf node_modules
npm install
npm run build
vercel --prod
```

---

## 🎯 What You'll Get

✅ Live URL: `https://careflow-[random].vercel.app`
✅ Automatic HTTPS/SSL
✅ Global CDN (fast worldwide)
✅ Automatic deployments on Git push (if using Git)
✅ Free custom domain support
✅ Analytics dashboard

---

## 📱 Share Your App

Once deployed, share your Vercel URL:
```
🏥 CareFlow - Healthcare Management Platform
🔗 https://careflow-xxxx.vercel.app

Test Accounts:
👤 Patient: abc@gmail.com / 123456
👨‍💼 Admin: admin@careflow.com / admin123
```

---

## 🚀 Quick Commands Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Open project in browser
vercel open
```

---

## ✨ You're Ready to Deploy!

**Recommended:** Use Method 1 (CLI) - it's the fastest and most reliable.

Just run:
```bash
npm install -g vercel
vercel login
vercel
```

Then add environment variables in dashboard and run `vercel --prod`

**Good luck! 🎉**
