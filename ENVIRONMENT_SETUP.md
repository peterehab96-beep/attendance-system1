# Production Environment Variables Setup

Copy this template and replace the values with your actual credentials from Supabase.

## Required Environment Variables

### Supabase Configuration (Required)
Get these from your Supabase project dashboard at https://supabase.com

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-service-role-key
```

### Authentication Configuration (Required)
```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-random-32-character-secret-string-here
```

### Optional Social Authentication
Only add these if you want Google/Apple login:

```
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
APPLE_ID=your-apple-oauth-id
APPLE_SECRET=your-apple-oauth-secret
```

## How to Set Up Each Variable

### 1. NEXT_PUBLIC_SUPABASE_URL
- Go to your Supabase project dashboard
- Navigate to Settings → API
- Copy the "Project URL" 
- Example: `https://abcdefghijk.supabase.co`

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- In the same API settings page
- Copy the "Anon public" key (the long JWT token)
- Starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. SUPABASE_SERVICE_ROLE_KEY
- In the same API settings page
- Copy the "Service role" key (different JWT token)
- Also starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ⚠️ Keep this secret! Don't expose it in client-side code

### 4. NEXTAUTH_URL
- This will be your Vercel deployment URL
- After deploying to Vercel, you'll get a URL like: `https://attendance-system-abc123.vercel.app`
- Use that complete URL

### 5. NEXTAUTH_SECRET
- Generate a random 32+ character string
- You can use: https://generate-secret.vercel.app/32
- Or create your own random string: `openssl rand -base64 32`

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" tab
3. Click "Environment Variables" in the sidebar
4. For each variable above:
   - Name: Enter the variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Value: Enter the actual value
   - Environment: Select "Production" (and optionally Preview/Development)
   - Click "Save"

## Testing Your Configuration

After setting all variables:

1. Go to Vercel "Deployments" tab
2. Click "Redeploy" on your latest deployment
3. Wait for deployment to complete
4. Open your live site
5. Try to:
   - Register a new account
   - Login with existing account
   - Create a QR code
   - Scan attendance

## Security Best Practices

- ✅ Never commit `.env` files to GitHub
- ✅ Only use environment variables for sensitive data
- ✅ Regularly rotate your NEXTAUTH_SECRET
- ✅ Monitor your Supabase usage and access logs
- ✅ Use Row Level Security (RLS) in Supabase
- ✅ Keep your service role key secret

## Common Mistakes to Avoid

- ❌ Using placeholder values instead of real credentials
- ❌ Missing the `https://` prefix in URLs
- ❌ Copy-pasting with extra spaces or line breaks
- ❌ Using the wrong Supabase key (anon vs service role)
- ❌ Not updating NEXTAUTH_URL after deployment

## Backup Your Configuration

Save your environment variables securely:
1. Use a password manager
2. Keep a secure backup file
3. Document which Supabase project they belong to
4. Note the creation date for rotation purposes

## Need Help?

If your deployment isn't working:
1. Check Vercel deployment logs for errors
2. Verify all environment variables are set correctly
3. Test your Supabase connection in the Supabase dashboard
4. Check browser console for JavaScript errors

Remember: Environment variables are only loaded during build time, so you need to redeploy after changing them!