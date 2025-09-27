# Deployment Troubleshooting Guide

Common issues and solutions when deploying your attendance system to Vercel.

## 🚨 Build and Deployment Errors

### Error: "Build failed"
**Symptoms**: Vercel shows red "Failed" status, build logs show errors

**Solutions**:
1. **Check package.json**: Ensure all dependencies are listed correctly
2. **TypeScript errors**: Your `next.config.mjs` ignores TypeScript errors, but check for syntax issues
3. **Missing files**: Ensure all project files are uploaded to GitHub
4. **Environment variables**: Some builds fail if required environment variables are missing

```bash
# Check build locally first:
npm install
npm run build
```

### Error: "Function exceeded time limit"
**Symptoms**: Pages load slowly or timeout

**Solutions**:
1. **Optimize Supabase queries**: Add proper indexes to your database
2. **Reduce API calls**: Cache frequently accessed data
3. **Use Vercel Edge Functions**: For faster response times

### Error: "Module not found"
**Symptoms**: Import errors in deployed app

**Solutions**:
1. **Check case sensitivity**: File names must match exactly on Vercel
2. **Verify file paths**: Relative imports should start with `./` or `../`
3. **Missing dependencies**: Add missing packages to `package.json`

## 🔐 Authentication Issues

### Error: "Invalid redirect URL"
**Symptoms**: Login redirects fail, OAuth errors

**Solutions**:
1. **Update Supabase settings**:
   - Go to Supabase → Authentication → URL Configuration
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

2. **Check NEXTAUTH_URL**: Must match your actual Vercel URL exactly

### Error: "Session not found" or "User not authenticated"
**Symptoms**: Users can't login or stay logged in

**Solutions**:
1. **Verify environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` is correct
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the anon key (not service role)
   - `NEXTAUTH_SECRET` is set and long enough (32+ characters)

2. **Check cookies**: Ensure your domain allows cookies
3. **HTTPS required**: Authentication only works over HTTPS (Vercel provides this automatically)

### Error: "Invalid JWT token"
**Symptoms**: Authentication randomly fails

**Solutions**:
1. **Regenerate tokens**: Create new Supabase API keys
2. **Check token format**: JWT tokens should start with `eyJhbGciOiJIUzI1NiI...`
3. **Update all instances**: Make sure you updated all places where tokens are used

## 🗄️ Database Connection Issues

### Error: "Connection to database failed"
**Symptoms**: Can't read/write data, database operations fail

**Solutions**:
1. **Check Supabase status**: Visit [status.supabase.com](https://status.supabase.com)
2. **Verify credentials**: Double-check all Supabase environment variables
3. **Network issues**: Try connecting from different locations
4. **RLS policies**: Ensure Row Level Security policies allow your operations

### Error: "Table doesn't exist"
**Symptoms**: Database queries fail, missing tables

**Solutions**:
1. **Run database setup**: Execute `supabase-setup.sql` in Supabase SQL Editor
2. **Check schema**: Verify all tables were created successfully
3. **Migration issues**: Drop and recreate tables if needed

### Error: "Permission denied"
**Symptoms**: Can create users but can't read/write data

**Solutions**:
1. **RLS policies**: Check Row Level Security is properly configured
2. **User roles**: Ensure users have correct permissions
3. **Service role key**: Use service role key for admin operations

## 📱 Frontend Issues

### Error: "Camera not working"
**Symptoms**: QR scanner doesn't access camera

**Solutions**:
1. **HTTPS required**: Camera only works over HTTPS (Vercel provides this)
2. **Browser permissions**: Users must allow camera access
3. **Mobile compatibility**: Test on different devices and browsers
4. **Fallback option**: Provide manual entry option

### Error: "QR codes not generating"
**Symptoms**: QR code component shows blank or errors

**Solutions**:
1. **Check data**: Ensure QR code data is valid
2. **Library issues**: Verify QR code library is working
3. **Canvas support**: Some browsers have different canvas support

### Error: "Responsive design broken"
**Symptoms**: Mobile layout doesn't work properly

**Solutions**:
1. **Tailwind CSS**: Ensure all Tailwind classes are loading
2. **Viewport meta tag**: Check it's present in layout
3. **CSS conflicts**: Check for conflicting styles

## 🔧 Environment Variables Issues

### Error: "Environment variables not loading"
**Symptoms**: App behaves like in development mode

**Solutions**:
1. **Redeploy required**: Environment variables only apply after redeployment
2. **Spelling errors**: Variable names must match exactly
3. **Spaces/newlines**: Remove extra whitespace from values
4. **Environment selection**: Ensure variables are set for "Production"

### How to Debug Environment Variables:
```javascript
// Add this to any page temporarily:
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

## 🌐 Domain and SSL Issues

### Error: "SSL certificate error"
**Symptoms**: Browser shows "Not secure" warning

**Solutions**:
1. **Wait for propagation**: New domains can take 24 hours
2. **Check DNS**: Ensure DNS records point to Vercel
3. **Force SSL**: Enable "Force HTTPS" in Vercel settings

### Error: "Domain not working"
**Symptoms**: Custom domain shows 404 or doesn't load

**Solutions**:
1. **DNS configuration**: Follow Vercel's DNS instructions exactly
2. **Propagation time**: DNS changes can take up to 24 hours
3. **Remove and re-add**: Sometimes removing and re-adding the domain helps

## 📊 Performance Issues

### Error: "Site loads slowly"
**Symptoms**: Pages take long time to load

**Solutions**:
1. **Database optimization**: Add indexes to frequently queried columns
2. **Image optimization**: Use Next.js Image component
3. **Code splitting**: Lazy load components not immediately needed
4. **CDN**: Vercel provides global CDN automatically

### Error: "High bandwidth usage"
**Symptoms**: Approaching Vercel/Supabase limits

**Solutions**:
1. **Optimize images**: Compress and resize images
2. **Limit API calls**: Cache responses, debounce user inputs
3. **Database efficiency**: Optimize queries, use pagination

## 🔍 Debugging Steps

### 1. Check Vercel Deployment Logs
- Go to Vercel project → Deployments
- Click on failed deployment
- Read build logs for specific errors

### 2. Check Browser Console
- Open browser developer tools (F12)
- Look for JavaScript errors in Console tab
- Check Network tab for failed requests

### 3. Test Supabase Connection
- Go to Supabase project dashboard
- Try running queries in SQL Editor
- Check if authentication is working in Supabase Auth tab

### 4. Verify Environment Variables
- In Vercel project settings
- Check all required variables are present
- No extra spaces or characters

### 5. Test Locally First
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test build locally
npm run build
npm start
```

## 📞 Getting Help

### When to Contact Support:

**Vercel Issues:**
- Build failures that persist after following troubleshooting
- Domain configuration problems
- Performance issues with high traffic

**Supabase Issues:**
- Database connection problems
- Authentication setup issues
- Data migration problems

### Information to Provide:
1. **Error messages**: Exact error text
2. **Deployment URL**: Your Vercel app URL
3. **Screenshots**: Of errors or issues
4. **Steps to reproduce**: What actions cause the problem
5. **Browser/device**: What you're testing on

## 🎯 Prevention Tips

1. **Test locally first**: Always test changes on your local machine
2. **Gradual deployment**: Deploy small changes incrementally
3. **Monitor logs**: Check Vercel and Supabase logs regularly
4. **Backup configuration**: Keep copies of environment variables
5. **Version control**: Use Git branches for major changes
6. **Documentation**: Keep track of configuration changes

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Vercel deployment shows green "Ready" status
- ✅ Live URL loads without errors
- ✅ User registration and login work
- ✅ QR code generation and scanning work
- ✅ Database operations (attendance tracking) work
- ✅ Admin dashboard is accessible
- ✅ Mobile responsiveness works on different devices

Remember: Most deployment issues are configuration-related and can be resolved by carefully checking environment variables and following the setup guides step by step.