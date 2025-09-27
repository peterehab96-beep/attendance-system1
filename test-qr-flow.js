/**
 * QR Code Attendance Testing Guide
 * 
 * This script helps test the complete QR code flow between admin and student
 */

// Test the complete QR attendance flow
function testQRAttendanceFlow() {
  console.log('🧪 Testing QR Code Attendance Flow...')
  
  // Step 1: Check if there are active sessions
  const checkActiveSessions = () => {
    const attendanceStore = window.attendanceStore || window.__attendanceStore__
    if (!attendanceStore) {
      console.error('❌ Attendance store not found')
      return false
    }
    
    const activeSession = attendanceStore.getActiveSession()
    const allSessions = attendanceStore.getAllSessions()
    
    console.log('📊 Session Status:')
    console.log(`   Total sessions: ${allSessions.length}`)
    console.log(`   Active session: ${activeSession ? 'YES' : 'NO'}`)
    
    if (activeSession) {
      console.log('✅ Active Session Found:')
      console.log(`   ID: ${activeSession.id}`)
      console.log(`   Subject: ${activeSession.subject}`)
      console.log(`   Level: ${activeSession.academicLevel}`)
      console.log(`   Attendees: ${activeSession.attendees.length}`)
      console.log(`   Expires: ${activeSession.expiresAt}`)
      console.log(`   Is Active: ${activeSession.isActive}`)
      
      // Check if session is expired
      const isExpired = new Date() > activeSession.expiresAt
      console.log(`   Expired: ${isExpired ? 'YES' : 'NO'}`)
      
      return activeSession
    } else {
      console.log('⚠️  No active session found. Admin needs to generate QR code first.')
      return false
    }
  }
  
  // Step 2: Test QR data validation
  const testQRData = (session) => {
    try {
      const qrData = JSON.parse(session.qrCode)
      console.log('\n🔍 QR Code Data Validation:')
      console.log(`   Session ID: ${qrData.sessionId ? '✅' : '❌'} ${qrData.sessionId}`)
      console.log(`   Token: ${qrData.token ? '✅' : '❌'} ${qrData.token?.substring(0, 10)}...`)
      console.log(`   Subject: ${qrData.subject ? '✅' : '❌'} ${qrData.subject}`)
      console.log(`   Timestamp: ${qrData.timestamp ? '✅' : '❌'} ${new Date(qrData.timestamp)}`)
      console.log(`   Expires At: ${qrData.expiresAt ? '✅' : '❌'} ${new Date(qrData.expiresAt)}`)
      
      return qrData
    } catch (error) {
      console.error('❌ Invalid QR data format:', error)
      return null
    }
  }
  
  // Step 3: Simulate student scan
  const simulateStudentScan = async (session, qrData) => {
    console.log('\n🎓 Simulating Student Scan...')
    
    const attendanceStore = window.attendanceStore || window.__attendanceStore__
    
    // Test student data
    const testStudent = {
      studentId: 'test-student-' + Date.now(),
      studentName: 'Test Student',
      email: 'test.student@demo.com',
      academicLevel: session.academicLevel,
      subject: session.subject
    }
    
    console.log('👤 Test Student:')
    console.log(`   ID: ${testStudent.studentId}`)
    console.log(`   Name: ${testStudent.studentName}`)
    console.log(`   Subject: ${testStudent.subject}`)
    
    try {
      const result = await attendanceStore.markAttendance(session.qrCode, testStudent)
      
      console.log('\n📝 Attendance Result:')
      console.log(`   Success: ${result.success ? '✅' : '❌'}`)
      console.log(`   Message: ${result.message}`)
      
      if (result.success) {
        // Check if student was added to session
        const updatedSession = attendanceStore.getActiveSession()
        const studentInSession = updatedSession?.attendees.find(a => a.studentId === testStudent.studentId)
        
        console.log('\n🔍 Verification:')
        console.log(`   Student in session: ${studentInSession ? '✅' : '❌'}`)
        console.log(`   Total attendees: ${updatedSession?.attendees.length || 0}`)
        
        if (studentInSession) {
          console.log(`   Scan time: ${studentInSession.scannedAt}`)
          console.log(`   Score: ${studentInSession.score}`)
        }
        
        // Check attendance records
        const records = attendanceStore.getAllAttendanceRecords()
        const studentRecord = records.find(r => r.sessionId === session.id && r.subject === testStudent.subject)
        
        console.log(`   Record created: ${studentRecord ? '✅' : '❌'}`)
        if (studentRecord) {
          console.log(`   Record ID: ${studentRecord.id}`)
          console.log(`   Record time: ${studentRecord.scannedAt}`)
        }
      }
      
      return result
    } catch (error) {
      console.error('❌ Error during attendance marking:', error)
      return { success: false, message: error.message }
    }
  }
  
  // Run the test
  const session = checkActiveSessions()
  if (session) {
    const qrData = testQRData(session)
    if (qrData) {
      simulateStudentScan(session, qrData)
    }
  }
  
  return session
}

// Helper function to create a test session
function createTestSession() {
  console.log('🏗️  Creating Test Session...')
  
  const attendanceStore = window.attendanceStore || window.__attendanceStore__
  if (!attendanceStore) {
    console.error('❌ Attendance store not found')
    return false
  }
  
  const testSession = {
    id: `test-session-${Date.now()}`,
    academicLevel: 'Second Year',
    subject: 'Western Rules & Solfege 3',
    qrCode: '',
    token: '',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    createdAt: new Date(),
    isActive: true,
    attendees: []
  }
  
  attendanceStore.createSession(testSession).then(createdSession => {
    console.log('✅ Test session created:', createdSession.id)
    console.log('🎯 Now you can test QR scanning!')
  }).catch(error => {
    console.error('❌ Failed to create test session:', error)
  })
}

// Helper function to check Supabase connection
function checkSupabaseConnection() {
  console.log('🔗 Checking Supabase Connection...')
  
  const supabaseUrl = window.location.hostname === 'localhost' ? 
    process?.env?.NEXT_PUBLIC_SUPABASE_URL : 
    'Check browser network tab for Supabase requests'
    
  console.log('🌐 Environment:')
  console.log(`   Running on: ${window.location.hostname}`)
  console.log(`   Supabase URL configured: ${supabaseUrl ? '✅' : '❌'}`)
  
  // Check if we can access the attendance store
  const attendanceStore = window.attendanceStore || window.__attendanceStore__
  if (attendanceStore && attendanceStore.supabase) {
    console.log('✅ Supabase client available in attendance store')
  } else {
    console.log('⚠️  Running in demo mode (no Supabase)')
  }
}

// Main test function
function runAttendanceSystemTest() {
  console.clear()
  console.log('🚀 Attendance System Test Suite')
  console.log('==============================\n')
  
  checkSupabaseConnection()
  console.log('\n')
  
  const session = testQRAttendanceFlow()
  
  if (!session) {
    console.log('\n💡 To test QR attendance flow:')
    console.log('1. Go to Admin dashboard')
    console.log('2. Generate a QR code for any subject')
    console.log('3. Come back and run: testQRAttendanceFlow()')
    console.log('\nOr create a test session:')
    console.log('Run: createTestSession()')
  }
  
  console.log('\n📋 Available Test Functions:')
  console.log('- testQRAttendanceFlow(): Test the complete QR flow')
  console.log('- createTestSession(): Create a test session')
  console.log('- checkSupabaseConnection(): Check database connection')
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  window.testQRAttendanceFlow = testQRAttendanceFlow
  window.createTestSession = createTestSession
  window.checkSupabaseConnection = checkSupabaseConnection
  window.runAttendanceSystemTest = runAttendanceSystemTest
}

// Auto-run when loaded
if (typeof window !== 'undefined') {
  console.log('🔧 QR Attendance Test Suite Loaded')
  console.log('Run: runAttendanceSystemTest() to start testing')
}

export { testQRAttendanceFlow, createTestSession, checkSupabaseConnection, runAttendanceSystemTest }