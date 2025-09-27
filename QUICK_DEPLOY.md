# Quick Start Deployment Checklist

Follow this step-by-step checklist to deploy your attendance system to Vercel for FREE.

## ✅ Pre-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database schema set up (ran `supabase-setup.sql`)
- [ ] GitHub account ready
- [ ] Vercel account ready

## 🗄️ Step 1: Supabase Setup

- [ ] Go to [https://supabase.com](https://supabase.com)
- [ ] Create new project: `attendance-system`
- [ ] Choose region: Europe West
- [ ] Save database password securely
- [ ] Go to SQL Editor and run `supabase-setup.sql`
- [ ] Go to Settings → API and copy:
  - [ ] Project URL: `https://xxxxx.supabase.co`
  - [ ] Anon public key: `eyJhbGciOiJIUzI1NiI...`
  - [ ] Service role key: `eyJhbGciOiJIUzI1NiI...`

## 📂 Step 2: GitHub Upload

- [ ] Go to [https://github.com](https://github.com)
- [ ] Create new repository: `attendance-system`
- [ ] Make it Public
- [ ] Upload ALL files from your local project folder
- [ ] Commit with message: "Initial deployment"

## 🚀 Step 3: Vercel Deployment

- [ ] Go to [https://vercel.com](https://vercel.com)
- [ ] Sign up with GitHub account
- [ ] Click "New Project"
- [ ] Import your `attendance-system` repository
- [ ] Click "Deploy" (will fail - this is normal!)

## 🔧 Step 4: Environment Variables

In Vercel project settings → Environment Variables, add:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase Anon Key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase Service Key
- [ ] `NEXTAUTH_SECRET` = Random 32+ character string
- [ ] `NEXTAUTH_URL` = Your Vercel app URL (will get this after deployment)

## 🔄 Step 5: Redeploy

- [ ] Go to Vercel "Deployments" tab
- [ ] Click "Redeploy" on latest deployment
- [ ] Wait for successful deployment (green checkmark)
- [ ] Copy your live URL: `https://attendance-system-xxxxx.vercel.app`

## ⚙️ Step 6: Final Configuration

- [ ] Update `NEXTAUTH_URL` environment variable with your live URL
- [ ] In Supabase → Authentication → URL Configuration:
  - [ ] Site URL: Your Vercel URL
  - [ ] Redirect URLs: `https://your-app.vercel.app/auth/callback`
- [ ] Redeploy one more time

## 🧪 Step 7: Testing

- [ ] Open your live URL
- [ ] Register new account
- [ ] Login works
- [ ] QR code generation works
- [ ] Attendance scanning works
- [ ] Admin dashboard accessible

## 🎉 Success!

Your attendance system is now live and accessible from anywhere!

**Live URL**: `https://attendance-system-xxxxx.vercel.app`

## 📱 Share With Users

Send this information to your users:

- **Website**: Your Vercel URL
- **Admin Access**: Use the admin credentials you set up
- **Student Access**: Students can register with their email
- **QR Codes**: Generate from admin dashboard for each class

## 🔄 Making Updates

To update your live site:
1. Update files on GitHub
2. Vercel automatically rebuilds and deploys
3. Changes live in 2-3 minutes

## 📞 Need Help?

If something doesn't work:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are correct
4. Test Supabase connection separately

**Time Estimate**: 15-30 minutes total for complete deployment.