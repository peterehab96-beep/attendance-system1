import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Handle GET requests - this will be called when a student scans a QR code with their phone camera
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  const token = searchParams.get('token')
  
  // Redirect to student dashboard with session info
  if (sessionId && token) {
    const redirectUrl = `/external-attendance/dashboard?sessionId=${sessionId}&token=${token}`
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }
  
  // If no session info, redirect to student login
  return NextResponse.redirect(new URL('/simple-auth/student/login', request.url))
}

// Handle POST requests - for recording attendance
export async function POST(request: NextRequest) {
  try {
    const { sessionId, studentId, studentName, studentEmail, subject } = await request.json()
    
    // Validate required fields
    if (!sessionId || !studentId) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }
    
    // Get Supabase client
    const supabase = createClient()
    
    // Check if student already attended this session
    const { data: existingRecord, error: checkError } = await supabase
      .from('attendance_records')
      .select('id')
      .eq('session_id', sessionId)
      .eq('student_id', studentId)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing record:', checkError)
      return NextResponse.json(
        { error: 'Failed to check attendance record' }, 
        { status: 500 }
      )
    }
    
    // If record exists, student already attended
    if (existingRecord) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'You have already marked attendance for this session' 
        }
      )
    }
    
    // Insert attendance record
    const { error: insertError } = await supabase
      .from('attendance_records')
      .insert({
        session_id: sessionId,
        student_id: studentId,
        student_name: studentName || 'Unknown Student',
        student_email: studentEmail || 'unknown@example.com',
        subject_name: subject || 'Unknown Subject',
        check_in_time: new Date().toISOString(),
        method: 'external_scan',
        status: 'present',
        grade_points: 10.0 // Default grade, can be updated by admin
      })
    
    if (insertError) {
      console.error('Error inserting attendance record:', insertError)
      return NextResponse.json(
        { error: 'Failed to record attendance' }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Attendance recorded successfully' 
    })
    
  } catch (error) {
    console.error('Error processing attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}