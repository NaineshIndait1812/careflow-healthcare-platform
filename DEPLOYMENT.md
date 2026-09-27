# CareFlow - Deployment Guide

## 🚀 Pre-Deployment Checklist

### ✅ Build Status
- [x] Production build passes (`npm run build`)
- [x] All critical files present
- [x] Environment variables configured
- [x] Supabase connection verified

### 📋 What's Included

#### Core Features
- **Authentication System**
  - Email/password login & registration
  - Role-based access (Patient/Admin)
  - Protected routes with automatic redirects
  - Rate limit handling (429 errors)

- **Patient Portal** (`/patient/*`)
  - Dashboard with overview
  - Appointments (book, view, cancel)
  - Emergency/Ambulance requests with live tracking
  - Blood bank search
  - Facilities finder
  - Notifications center
  - Profile management

- **Admin Portal** (`/admin/*`)
  - Dashboard with statistics
  - Appointments management
  - Emergency requests coordination
  - Blood inventory management
  - Facilities CRUD
  - Patient list view

#### Database Tables (Supabase)
- `profiles` - User profiles
- `appointments` - Appointment records
- `emergency_requests` - Ambulance requests
- `facilities` - Healthcare facilities
- `blood_banks` - Blood bank locations
- `blood_inventory` - Blood stock tracking
- `notifications` - User notifications

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# VITE_SUPABASE_URL=https://idacbpdcetpziekhbpeg.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ACDZhgrfD_JqbMl9Y3AEYA_QMGdXV7f
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

### Option 3: GitHub Pages
```bash
# Add to package.json:
"homepage": "https://yourusername.github.io/healthcare-platform",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Install gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

### Option 4: Manual Static Hosting
```bash
# Build the project
npm run build

# Upload the entire 'dist' folder to your hosting provider
# (Firebase Hosting, AWS S3, DigitalOcean, etc.)
```

## 🔧 Environment Setup

### Required Environment Variables
```env
VITE_SUPABASE_URL=https://idacbpdcetpziekhbpeg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ACDZhgrfD_JqbMl9Y3AEYA_QMGdXV7f
```

⚠️ **Important**: These variables are already configured in your `.env.local` file. Make sure to set them in your hosting provider's environment settings.

## 🗄️ Supabase Configuration

### 1. Email Rate Limits (if needed)
If you're still hitting rate limits during testing:
- Go to: Supabase Dashboard → Authentication → Rate Limits
- Adjust "Email send rate limit" temporarily for demos

### 2. Email Confirmation (for demos)
To skip email verification for hackathon demos:
- Go to: Supabase Dashboard → Authentication → Settings
- Disable "Enable email confirmations"
- ✅ This makes signup instant for judges

### 3. RLS Policies
Already configured! All tables have proper Row Level Security:
- Patients can only see their own data
- Admins have elevated access
- Public read access for facilities and blood banks

## 🧪 Testing Credentials

### Patient Account
```
Email: abc@gmail.com
Password: 123456
```

### Admin Account
```
Email: admin@careflow.com
Password: admin123
```

## 📱 Responsive Design
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (<768px) with hamburger menu

## 🎨 UI Theme
- Clean white medical professional design
- Green primary accent (#16A34A)
- Status-coded badges and indicators
- Smooth animations and transitions
- Accessible color contrast ratios

## ⚡ Performance Notes
- Bundle size: ~562 KB (minified)
- Gzip: ~152 KB
- Fast page loads with code splitting
- Optimized CSS (~34 KB)

## 🐛 Known Limitations (Non-Critical)
- ESLint warnings for React hooks dependencies (functional, no runtime impact)
- Large bundle size warning (acceptable for hackathon scope)
- Email rate limiting may occur during heavy testing

## 📞 Support & Troubleshooting

### Build fails?
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

### Supabase connection issues?
- Verify environment variables are set correctly
- Check Supabase project is active
- Confirm RLS policies are enabled

### Routing issues on deployed site?
Add a `_redirects` file (Netlify) or `vercel.json` (Vercel):

**For Netlify** (`public/_redirects`):
```
/*    /index.html   200
```

**For Vercel** (`vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## ✨ Final Checklist Before Going Live

- [ ] Test patient signup/login flow
- [ ] Test admin login
- [ ] Book an appointment as patient
- [ ] Create emergency request
- [ ] Verify admin can manage requests
- [ ] Test blood bank search
- [ ] Check mobile responsive layout
- [ ] Verify all navigation links work
- [ ] Test sign-out functionality
- [ ] Check that notifications appear

## 🎯 Deployment Command
```bash
npm run build
```

The `dist` folder is ready to deploy! 🚀

---

**Built with**: React 19, Vite 8, Supabase, React Router v7
**License**: Private
