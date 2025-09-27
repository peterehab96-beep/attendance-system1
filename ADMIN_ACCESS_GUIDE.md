# Admin Access Guide
## Faculty Attendance System - Dr. Peter Ehab

### 🔐 **Admin Authentication Information**

---

## 👨‍💼 **Current Admin Access Methods:**

### **1. OAuth-Only Authentication (Recommended)**
The system uses **Google OAuth** exclusively for security. No email/password login.

#### **Pre-Configured Admin Accounts:**
- **Dr. Peter Ehab**: `peter.ehab@zu.edu.eg` (Super Admin)
- **General Admin**: `admin@music.zu.edu.eg` (Admin)

#### **Auto-Admin Detection:**
Any email with:
- `@zu.edu.eg` domain + contains "dr." = **Super Admin**
- `@zu.edu.eg` domain + contains "admin" = **Admin**

---

## 🚀 **How to Access Admin Panel:**

### **Step 1: Navigate to Admin Login**
1. Open your application: `http://localhost:3003`
2. Select **"Administrator"** role
3. You'll see the admin login screen

### **Step 2: Sign In with Google**
1. Click **"Continue with Google"**
2. Sign in with your university Google account
3. System automatically detects admin privileges
4. Redirects to Admin Dashboard

### **Step 3: Admin Dashboard Access**
After successful authentication, you'll have access to:
- 📊 **Analytics Dashboard**
- 👥 **Student Management**
- 📚 **Subject Management** 
- ✅ **Attendance Monitoring**
- 📈 **Grade Management**
- 📋 **Reports & Export**
- ⚙️ **System Settings**

---

## 🔧 **Setting Up Additional Admins:**

### **Method 1: Database Configuration (After Setup)**
```sql
-- Run in Supabase SQL Editor after user first login
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'new-admin@zu.edu.eg';
```

### **Method 2: Modify Admin Config**
Edit `lib/admin-config.ts` to add new admins:

```typescript
export const ADMIN_USERS: AdminUser[] = [
  {
    email: 'peter.ehab@zu.edu.eg',
    name: 'Dr. Peter Ehab',
    role: 'super_admin',
    department: 'Music Education'
  },
  {
    email: 'new-admin@zu.edu.eg', // Add new admin here
    name: 'New Admin Name',
    role: 'admin',
    department: 'Music Education'
  }
]
```

---

## 👑 **Admin Role Levels:**

### **Super Admin** (Dr. Peter Ehab)
- ✅ Full system access
- ✅ Manage other admins
- ✅ System settings
- ✅ All student/attendance data
- ✅ Export and reports
- ✅ Subject management

### **Admin** (Faculty Staff)
- ✅ Manage attendance
- ✅ Manage grades
- ✅ View reports
- ✅ Manage subjects
- ❌ System settings
- ❌ Manage other admins

### **Instructor** (Teaching Staff)
- ✅ Manage attendance for their classes
- ✅ View reports for their subjects
- ❌ System-wide access
- ❌ Manage other users

---

## 🔍 **Troubleshooting Admin Access:**

### **"Access Denied" Error:**
- **Check Email Domain**: Must be `@zu.edu.eg`
- **Check Database**: Ensure profile role is set to 'admin'
- **Clear Browser Cache**: Sign out and sign in again

### **"Not Authorized" Message:**
- **First Login**: System creates profile automatically
- **Role Assignment**: May need manual role assignment in database
- **Email Verification**: Ensure using correct university email

### **OAuth Not Working:**
- **Supabase Setup**: Ensure Google provider is enabled
- **Database Setup**: Complete the database schema setup
- **Environment**: Check that `.env.local` is properly configured

---

## 🛡️ **Security Features:**

### **Built-in Security:**
- 🔐 **OAuth-only authentication** (no passwords to steal)
- 🏛️ **University domain restriction** (@zu.edu.eg)
- 👤 **Role-based access control**
- 🔍 **Audit logging** (planned)
- ⏱️ **Session management**

### **Admin Privileges Protection:**
- Only pre-configured emails can become super admin
- Database role verification required
- University domain enforcement
- Automatic logout on role change

---

## 📱 **Admin Dashboard Features:**

### **Real-time Monitoring:**
- 📊 Live attendance statistics
- 🔔 Instant notifications for student check-ins
- 📈 Real-time analytics dashboard
- 👥 Active users monitoring

### **Management Tools:**
- 👨‍🎓 Student profile management
- 📚 Subject and course setup
- ✅ Attendance session creation
- 📊 Grade entry and management
- 📋 Report generation and export

### **System Administration:**
- ⚙️ System settings configuration
- 👥 User role management
- 🔧 Database maintenance tools
- 📊 Usage analytics

---

## 🎯 **Quick Start for Dr. Peter Ehab:**

### **Immediate Access (5 minutes):**

1. **Complete Database Setup:**
   - Go to Supabase dashboard
   - Run the SQL script from `supabase-setup.sql`

2. **Enable Google OAuth:**
   - Supabase → Authentication → Providers
   - Enable Google provider

3. **Access Admin Panel:**
   - Visit: `http://localhost:3003`
   - Click: Administrator
   - Sign in with: `peter.ehab@zu.edu.eg` (or your Google account)

4. **Verify Admin Access:**
   - Should see full admin dashboard
   - All management features available
   - Super admin privileges active

---

## 📞 **Support Information:**

### **For Technical Issues:**
- Check browser console for errors
- Verify Supabase configuration
- Ensure database setup is complete
- Clear browser cache and cookies

### **For Access Issues:**
- Verify university email domain
- Check role assignment in database
- Ensure Google OAuth is properly configured
- Contact system administrator (Dr. Peter Ehab)

---

## 🎓 **Faculty-Specific Configuration:**

### **Music Education Faculty Setup:**
- **Department**: Pre-configured for Music Education
- **Subjects**: Ready for music curriculum
- **Academic Levels**: Second, Third, Fourth year support
- **Specialized Features**: Performance tracking, practice sessions

### **University Integration:**
- **Domain**: `@zu.edu.eg` enforcement
- **Branding**: Zagazig University theming
- **Academic Calendar**: Semester-based system
- **Language**: Arabic/English support

Your admin access is configured and ready! Complete the database setup to activate all features. 🎵📚