# 🚀 Supabase Setup Guide for Dr. Peter Ehab

## Step 1: Create Your Supabase Project

1. **Go to Supabase**: Visit [https://supabase.com](https://supabase.com)
2. **Sign Up/Login**: Create an account or login with your existing account
3. **Create New Project**:
   - Click "New Project"
   - Organization: Choose or create one
   - Name: `attendance-system-zu`
   - Database Password: Create a strong password (save it securely)
   - Region: Choose closest to Egypt (EU West 1 - Dublin recommended)
   - Click "Create new project"

## Step 2: Get Your Project Credentials

1. **Wait for Project Creation**: This takes 1-2 minutes
2. **Go to Settings**: Click "Settings" in the left sidebar
3. **Click "API"**: Get your credentials:

### Copy These Values:

```
Project URL: https://your-unique-id.supabase.co
Anon Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

## Step 3: Update Your .env.local File

1. **Open**: `.env.local` file in your project
2. **Replace** the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-unique-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

## Step 4: Set Up Database Tables

1. **Go to SQL Editor**: In Supabase dashboard, click "SQL Editor"
2. **Create New Query**: Click "New query"
3. **Copy and Run Script**: Copy the entire content from `supabase-setup.sql` file
4. **Execute**: Click "Run" button
5. **Verify**: Go to "Table Editor" to see created tables

## Step 5: Test Your Setup

1. **Restart Development Server**:
   ```bash
   npm run dev
   ```

2. **Open**: http://localhost:3000
3. **Look for**: Green checkmark indicating Supabase is connected
4. **Try**: Register a new student account (it should save to Supabase now)

## Step 6: Enable Authentication Providers (Optional)

1. **Go to Authentication**: Click "Authentication" → "Providers"
2. **Enable Google**:
   - Toggle Google ON
   - Add your Google OAuth credentials if you have them
3. **Configure URLs**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## 🎯 Expected Results After Setup

✅ **Student Registration**: New accounts save to Supabase database
✅ **Login Persistence**: Users stay logged in after refresh
✅ **Attendance Data**: QR scanning saves to cloud database
✅ **Real-time Sync**: Data syncs between admin and student views
✅ **No Data Loss**: Information persists after logout/login

## 🔧 Troubleshooting

### Issue: "Supabase not configured"
- Check your `.env.local` file has correct values
- Restart your development server: `npm run dev`
- Verify no extra spaces in environment variables

### Issue: "Database tables not found"
- Run the SQL script in Supabase SQL Editor
- Check Table Editor to verify tables were created

### Issue: "Authentication errors"
- Verify your anon key is correct
- Check if your project URL is exactly right
- Ensure no trailing slashes in URLs

## 📞 Need Help?

If you encounter any issues:
1. Check browser console for error messages
2. Look at Supabase dashboard logs
3. Verify your environment variables match exactly
4. Make sure you restarted the development server

After completing these steps, your attendance system will be fully functional with persistent data storage!