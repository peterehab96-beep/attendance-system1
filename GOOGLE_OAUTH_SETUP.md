# 🔗 Google OAuth Setup with Supabase
**Complete Guide for Google Authentication Integration**

---

## 📋 **Prerequisites**

- Active Supabase project
- Google account
- Your application deployed (for production) or running locally

---

## 🚀 **Step 1: Google Cloud Console Setup**

### **1.1 Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **\"Select a project\"** → **\"New Project\"**
3. Enter project details:
   - **Project name**: `Music Attendance System`
   - **Organization**: Leave as default
4. Click **\"Create\"**
5. Wait for project creation (1-2 minutes)

### **1.2 Enable Google+ API**
1. In your Google Cloud project dashboard
2. Go to **\"APIs & Services\"** → **\"Library\"**
3. Search for **\"Google+ API\"**
4. Click on **\"Google+ API\"**
5. Click **\"Enable\"**
6. Wait for API to be enabled

### **1.3 Configure OAuth Consent Screen**
1. Go to **\"APIs & Services\"** → **\"OAuth consent screen\"**
2. Select **\"External\"** (for testing with any Google account)
3. Click **\"Create\"**
4. Fill in required fields:

```
App name: Music Education Attendance System
User support email: your-email@gmail.com
App logo: (optional - upload your university logo)
App domain: your-domain.vercel.app (or localhost for testing)
Authorized domains: 
  - vercel.app
  - localhost (for development)
Developer contact: your-email@gmail.com
```

5. Click **\"Save and Continue\"**
6. **Scopes**: Click **\"Add or Remove Scopes\"**
   - Select: `email`, `profile`, `openid`
   - Click **\"Update\"**
7. Click **\"Save and Continue\"**
8. **Test users** (for development):
   - Add your email and test user emails
   - Click **\"Add Users\"**
9. Click **\"Save and Continue\"**
10. Review and click **\"Back to Dashboard\"**

### **1.4 Create OAuth 2.0 Credentials**
1. Go to **\"APIs & Services\"** → **\"Credentials\"**
2. Click **\"+ Create Credentials\"** → **\"OAuth 2.0 Client IDs\"**
3. Select **\"Web application\"**
4. Configure:

```
Name: Music Attendance OAuth Client

Authorized JavaScript origins:
- http://localhost:3000 (for development)
- https://your-app-name.vercel.app (for production)

Authorized redirect URIs:
- http://localhost:3000/auth/callback (for development)  
- https://your-app-name.vercel.app/auth/callback (for production)
- https://your-supabase-project.supabase.co/auth/v1/callback (IMPORTANT!)
```

5. Click **\"Create\"**
6. **IMPORTANT**: Copy and save:
   - **Client ID**: `1234567890-abcdefghijklmnop.apps.googleusercontent.com`
   - **Client Secret**: `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45`

---

## 🗄️ **Step 2: Supabase Configuration**

### **2.1 Configure Google OAuth in Supabase**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **\"Authentication\"** → **\"Providers\"**
4. Find **\"Google\"** in the list
5. Toggle **\"Enable sign in with Google\"** to ON
6. Enter your Google credentials:

```
Client ID: 1234567890-abcdefghijklmnop.apps.googleusercontent.com
Client Secret: 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45
```

7. Click **\"Save\"**

### **2.2 Configure Redirect URLs**
1. In Supabase Dashboard → **\"Authentication\"** → **\"URL Configuration\"**
2. Set:

```
Site URL: https://your-app-name.vercel.app
(or http://localhost:3000 for development)

Redirect URLs:
- http://localhost:3000/auth/callback
- https://your-app-name.vercel.app/auth/callback
- http://localhost:3000/**
- https://your-app-name.vercel.app/**
```

3. Click **\"Save\"**

---

## 🔧 **Step 3: Update Environment Variables**

Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth (Optional - handled by Supabase)
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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45

# NextAuth
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=https://your-app-name.vercel.app
```

---

## 🛠️ **Step 4: Update Code for Google OAuth**

The Google OAuth integration is already prepared in your codebase. Just ensure the environment variables are set correctly.

### **Test Google Authentication:**

1. **Development Testing:**
   ```bash
   npm run dev
   # Open http://localhost:3000
   # Click \"Continue with Google\"
   ```

2. **Production Testing:**
   - Deploy to Vercel with updated environment variables
   - Test Google sign-in on your live site

---

## ✅ **Step 5: Verification Checklist**

### **Google Cloud Console:**
- [ ] Project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs include Supabase callback URL

### **Supabase:**
- [ ] Google provider enabled
- [ ] Client ID and Secret configured
- [ ] Redirect URLs set correctly
- [ ] Test authentication works

### **Application:**
- [ ] Environment variables updated
- [ ] Google sign-in button works
- [ ] User profiles created automatically
- [ ] Redirects work properly

---

## 🧪 **Step 6: Testing**

### **Test Flow:**
1. User clicks \"Continue with Google\"
2. Redirected to Google sign-in
3. User authorizes your app
4. Redirected back to your app
5. User profile created in Supabase
6. User logged in successfully

### **Expected Results:**
- ✅ Google popup/redirect appears
- ✅ User can sign in with Google account
- ✅ Profile created in `profiles` table
- ✅ User redirected to dashboard
- ✅ Authentication state persists

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: \"Error 400: redirect_uri_mismatch\"**
**Solution:** Check that redirect URIs in Google Console exactly match your URLs

### **Issue 2: \"This app isn't verified\"**
**Solution:** 
- For testing: Click \"Advanced\" → \"Go to app (unsafe)\"
- For production: Submit app for Google verification

### **Issue 3: \"Access blocked\"**
**Solution:** 
- Add test users in Google Console OAuth consent screen
- Or publish your app for general use

### **Issue 4: Authentication works but profile not created**
**Solution:** Check RLS policies in Supabase profiles table

---

## 📱 **Domain Configuration Examples**

### **For Development:**
```
JavaScript Origins:
- http://localhost:3000

Redirect URIs:
- http://localhost:3000/auth/callback
- https://your-project.supabase.co/auth/v1/callback
```

### **For Production:**
```
JavaScript Origins:
- https://your-app.vercel.app
- https://attendance-system.vercel.app

Redirect URIs:
- https://your-app.vercel.app/auth/callback
- https://your-project.supabase.co/auth/v1/callback
```

---

## 🔐 **Security Best Practices**

1. **Never expose Client Secret** in frontend code
2. **Use HTTPS** in production
3. **Restrict domains** in Google Console
4. **Regularly rotate** OAuth credentials
5. **Monitor usage** in Google Console
6. **Enable 2FA** on your Google account

---

## 📊 **Expected User Experience**

### **First Time Users:**
1. Click \"Continue with Google\"
2. Google consent screen appears
3. User grants permissions
4. Profile automatically created
5. Directed to onboarding/dashboard

### **Returning Users:**
1. Click \"Continue with Google\"
2. Instant authentication (if still logged into Google)
3. Directed to dashboard

---

## 📞 **Support & Troubleshooting**

### **Debug Steps:**
1. Check browser console for errors
2. Verify environment variables
3. Test redirect URLs manually
4. Check Supabase auth logs
5. Verify Google Console settings

### **Useful Commands:**
```javascript
// Check Supabase configuration
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)

// Test auth state
const { data: { user } } = await supabase.auth.getUser()
console.log(user)
```

---

**🎉 After completing these steps, your users will be able to sign in with Google seamlessly!**"