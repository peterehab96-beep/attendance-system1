import { supabase } from './supabase'

export interface AttendanceData {
  sessionId: string
  studentId: string
  location?: string
  deviceInfo?: string
}

export interface SessionData {
  subjectId: string
  instructorId: string
  sessionDate: string
  sessionTime: string
  sessionType: 'lecture' | 'practical' | 'seminar' | 'exam'
  location?: string
  duration?: number
}

// Attendance Functions
export const createAttendanceSession = async (sessionData: SessionData) => {
  try {
    // Generate QR code data
    const qrData = {
      sessionId: crypto.randomUUID(),
      timestamp: Date.now(),
      subject: sessionData.subjectId
    }

    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert({
        subject_id: sessionData.subjectId,
        instructor_id: sessionData.instructorId,
        session_date: sessionData.sessionDate,
        session_time: sessionData.sessionTime,
        session_type: sessionData.sessionType,
        location: sessionData.location,
        qr_code: JSON.stringify(qrData),
        is_active: true,
        expires_at: new Date(Date.now() + (sessionData.duration || 60) * 60000).toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating attendance session:', error)
    throw error
  }
}

export const recordAttendance = async (attendanceData: AttendanceData) => {
  try {
    // Check if session exists and is active
    const { data: session, error: sessionError } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('id', attendanceData.sessionId)
      .eq('is_active', true)
      .single()

    if (sessionError || !session) {
      throw new Error('Session not found or inactive')
    }

    // Check if student already checked in
    const { data: existing } = await supabase
      .from('attendance_records')
      .select('id')
      .eq('session_id', attendanceData.sessionId)
      .eq('student_id', attendanceData.studentId)
      .single()

    if (existing) {
      throw new Error('Student already checked in for this session')
    }

    // Record attendance
    const { data, error } = await supabase
      .from('attendance_records')
      .insert({
        session_id: attendanceData.sessionId,
        student_id: attendanceData.studentId,
        check_in_time: new Date().toISOString(),
        location: attendanceData.location,
        device_info: attendanceData.deviceInfo,
        is_verified: true
      })
      .select()
      .single()

    if (error) throw error

    // Send notification to student
    await createNotification(
      attendanceData.studentId,
      'Attendance Recorded',
      `Your attendance has been successfully recorded for ${session.session_type}`,
      'success'
    )

    // Send notification to instructor
    await createNotification(
      session.instructor_id,
      'Student Attendance',
      `A student has checked in for your ${session.session_type}`,
      'info'
    )

    return data
  } catch (error) {
    console.error('Error recording attendance:', error)
    throw error
  }
}

export const getAttendanceRecords = async (sessionId: string) => {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        student:profiles!attendance_records_student_id_fkey(
          full_name,
          student_id,
          email
        )
      `)
      .eq('session_id', sessionId)
      .order('check_in_time', { ascending: true })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching attendance records:', error)
    throw error
  }
}

export const getStudentAttendance = async (studentId: string, subjectId?: string) => {
  try {
    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        session:attendance_sessions!attendance_records_session_id_fkey(
          session_date,
          session_time,
          session_type,
          location,
          subject:subjects!attendance_sessions_subject_id_fkey(
            name,
            code
          )
        )
      `)
      .eq('student_id', studentId)

    if (subjectId) {
      query = query.eq('session.subject_id', subjectId)
    }

    const { data, error } = await query.order('check_in_time', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching student attendance:', error)
    throw error
  }
}

// Notification Functions
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error',
  actionUrl?: string
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        action_url: actionUrl,
        is_read: false
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

export const getUserNotifications = async (userId: string, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }
}

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) throw error
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

// Subject Functions
export const getSubjectsByYear = async (yearLevel: number) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('year_level', yearLevel)
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching subjects:', error)
    throw error
  }
}

export const getStudentSubjects = async (studentId: string) => {
  try {
    const { data, error } = await supabase
      .from('student_subjects')
      .select(`
        *,
        subject:subjects!student_subjects_subject_id_fkey(*)
      `)
      .eq('student_id', studentId)
      .eq('is_active', true)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching student subjects:', error)
    throw error
  }
}

// Grade Functions
export const recordGrade = async (
  studentId: string,
  subjectId: string,
  gradeType: string,
  score: number,
  maxScore: number,
  comments?: string
) => {
  try {
    const percentage = (score / maxScore) * 100

    const { data, error } = await supabase
      .from('grades')
      .insert({
        student_id: studentId,
        subject_id: subjectId,
        grade_type: gradeType,
        score,
        max_score: maxScore,
        percentage,
        grade_date: new Date().toISOString(),
        comments
      })
      .select()
      .single()

    if (error) throw error

    // Notify student of new grade
    await createNotification(
      studentId,
      'New Grade Recorded',
      `You received ${score}/${maxScore} (${percentage.toFixed(1)}%) for ${gradeType}`,
      percentage >= 60 ? 'success' : 'warning'
    )

    return data
  } catch (error) {
    console.error('Error recording grade:', error)
    throw error
  }
}

export const getStudentGrades = async (studentId: string, subjectId?: string) => {
  try {
    let query = supabase
      .from('grades')
      .select(`
        *,
        subject:subjects!grades_subject_id_fkey(name, code)
      `)
      .eq('student_id', studentId)

    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }

    const { data, error } = await query.order('grade_date', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching student grades:', error)
    throw error
  }
}