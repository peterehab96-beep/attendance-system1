# Supabase Setup Instructions

## Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `zagazig-music-attendance`
   - Database Password: Choose a strong password and save it
   - Region: Europe West (closest to Egypt)
5. Click "Create new project" and wait for setup to complete

## Step 2: Get Project Credentials
1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Configure Environment Variables
1. Copy `.env.local.example` to `.env.local`
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

## Step 4: Set Up Database Schema
1. In your Supabase project, go to "SQL Editor"
2. Create a new query
3. Copy the entire content from `supabase-setup.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the script

This will create:
- All necessary tables (profiles, subjects, attendance_sessions, etc.)
- Row Level Security (RLS) policies
- Database functions and triggers
- Sample data for testing

## Step 5: Configure Authentication Providers (Optional)
For Google and Apple OAuth:

### Google OAuth:
1. Go to Project Settings → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials from Google Cloud Console

### Apple OAuth:
1. Enable Apple provider in the same section
2. Add your Apple OAuth credentials from Apple Developer Console

## Step 6: Test the Connection
1. Start your development server: `npm run dev`
2. Try registering a new account
3. Check if data appears in your Supabase dashboard

## What This Setup Provides:
- ✅ Complete user authentication and profiles
- ✅ Real-time attendance tracking
- ✅ QR code generation and scanning
- ✅ Grade management system
- ✅ Notification system
- ✅ Subject and student management
- ✅ Data export and reporting
- ✅ Row-level security for data protection

## Troubleshooting:
- If you get connection errors, double-check your environment variables
- Make sure your Supabase project is fully deployed before testing
- Check the browser console for any JavaScript errors
- Verify RLS policies are properly set up in the Supabase dashboard

## Required Information to Provide:
Please provide me with:
1. **Project URL**: `https://your-project-id.supabase.co`
2. **Anon Public Key**: The long JWT token starting with `eyJhbGciOiJIUzI1NiI...`

Once you provide these, I'll update the application configuration automatically.