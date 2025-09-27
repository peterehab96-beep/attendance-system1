# 🧪 QR Code Attendance Testing Guide

## Overview
This guide will help you test the complete QR code attendance flow between admin and student to ensure data is properly saved to Supabase.

## Prerequisites
- Development server running: `npm run dev`
- Browser open to: `http://localhost:3000`
- Two browser tabs/windows (one for admin, one for student)

## 🎯 Test Scenario 1: Complete Flow Test

### Step 1: Admin Creates QR Session
1. **Open Tab 1 (Admin)**:
   - Go to `http://localhost:3000`
   - Click \"Admin\"
   - Login with: `admin@demo.com` / `123456`
   - Go to \"QR Generator\" tab

2. **Generate QR Code**:
   - Select Academic Level: \"Second Year\"
   - Select Subject: \"Western Rules & Solfege 3\"
   - Click \"Generate QR Code\"
   - Wait for QR code to appear
   - ✅ **Verify**: QR code is displayed with session info

3. **Check Active Session**:
   - Open browser console (F12)
   - Type: `window.attendanceStore.getActiveSession()`
   - ✅ **Verify**: Returns session object with:
     - `id`: Session ID
     - `subject`: \"Western Rules & Solfege 3\"
     - `isActive`: true
     - `attendees`: [] (empty array)
     - `expiresAt`: Future timestamp

### Step 2: Student Scans QR Code
4. **Open Tab 2 (Student)**:
   - Go to `http://localhost:3000`
   - Click \"Student\"
   - Login with: `student@demo.com` / `123456`
   - Go to \"QR Scanner\" tab

5. **Prepare for Scan**:
   - Select Subject: \"Western Rules & Solfege 3\" (MUST match admin's QR)
   - Click \"Start Camera\" or use \"Upload QR Image\"
   - Click \"Scan QR Code\"

6. **Verify Attendance Marking**:
   - ✅ **Expected Result**: \"Attendance marked successfully! ✅\"
   - ❌ **If Failed**: Check error message and console logs

### Step 3: Verify Data Persistence
7. **Check Session Updates (Admin Tab)**:
   - Go back to Admin tab
   - Go to \"Monitor\" tab
   - ✅ **Verify**: Student appears in attendance list
   - ✅ **Verify**: Real-time update shows \"1 attendee\"

8. **Check Browser Console**:
   ```javascript
   // Check active session has attendee
   const session = window.attendanceStore.getActiveSession()
   console.log('Attendees:', session.attendees)
   
   // Check attendance records
   const records = window.attendanceStore.getAllAttendanceRecords()
   console.log('Records:', records)
   ```

9. **Check Supabase Database (if configured)**:
   - Go to Supabase Dashboard → Table Editor
   - Check `attendance_sessions` table
   - Check `attendance_records` table
   - ✅ **Verify**: Records exist with correct student ID and session ID

## 🔍 Test Scenario 2: Debug Mode Test

### Enable Debug Logging
1. Open browser console (F12)
2. Run the test suite:
   ```javascript
   // Load test functions
   runAttendanceSystemTest()
   ```

3. **Test Active Sessions**:
   ```javascript
   testQRAttendanceFlow()
   ```

4. **Create Test Session** (if no admin QR):
   ```javascript
   createTestSession()
   ```

5. **Check Supabase Connection**:
   ```javascript
   checkSupabaseConnection()
   ```

## 🚨 Troubleshooting Common Issues

### Issue 1: \"No active session found\"
**Solution**:
- Admin must generate QR code first
- Check console: `window.attendanceStore.getAllSessions()`
- Verify session is active and not expired

### Issue 2: \"Subject mismatch\"
**Solution**:
- Student must select EXACT same subject as admin QR
- Case-sensitive matching

### Issue 3: \"QR code has expired\"
**Solution**:
- QR codes expire after 30 minutes
- Admin needs to generate new QR code

### Issue 4: \"Student already marked attendance\"
**Solution**:
- Each student can only scan once per session
- Use different demo account or end current session

### Issue 5: \"Data not saving to Supabase\"
**Solution**:
1. Check `.env.local` file has real Supabase credentials
2. Check browser network tab for Supabase API calls
3. Check Supabase dashboard for errors
4. Console should show \"Attendance synced to Supabase successfully\"

## 📊 Verification Checklist

### ✅ Local Storage (Demo Mode)
- [ ] Student attendance appears in admin monitor
- [ ] Attendance records stored in browser
- [ ] Data persists during browser session
- [ ] Real-time updates between admin/student

### ✅ Supabase Database (Production Mode)
- [ ] `attendance_sessions` table has session record
- [ ] `attendance_records` table has attendance record
- [ ] `profiles` table has student profile
- [ ] Data persists after browser refresh
- [ ] Data persists after logout/login

### ✅ Error Handling
- [ ] Proper error messages for invalid QR codes
- [ ] Proper error messages for expired sessions
- [ ] Proper error messages for duplicate scans
- [ ] Graceful fallback when Supabase unavailable

## 📝 Test Results Log

**Date**: ___________
**Tester**: ___________

**Demo Mode Test**:
- [ ] Admin QR generation: ✅ / ❌
- [ ] Student QR scanning: ✅ / ❌  
- [ ] Real-time updates: ✅ / ❌
- [ ] Data persistence: ✅ / ❌

**Supabase Mode Test** (if configured):
- [ ] Database session creation: ✅ / ❌
- [ ] Database attendance recording: ✅ / ❌
- [ ] Data persistence after refresh: ✅ / ❌
- [ ] Cross-device sync: ✅ / ❌

**Issues Found**:
_________________________________
_________________________________
_________________________________

**Notes**:
_________________________________
_________________________________
_________________________________

## 🎉 Expected Working Flow

1. **Admin generates QR** → Session created in database
2. **Student scans QR** → Attendance recorded in database  
3. **Real-time update** → Admin sees student immediately
4. **Data persists** → Available after refresh/logout
5. **Supabase sync** → Data in cloud database

If this complete flow works, your QR attendance system is functioning correctly! 🚀