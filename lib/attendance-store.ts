"use client"

import React from "react"
import { createClient } from "@/lib/supabase/client"

interface AttendanceSession {
  id: string
  academicLevel: string
  subject: string
  qrCode: string
  token: string
  expiresAt: Date
  createdAt: Date
  isActive: boolean
  attendees: Array<{
    studentId: string
    studentName: string
    email: string
    scannedAt: Date
    score: number
  }>
}

interface Student {
  id: string
  name: string
  email: string
  password: string
  academicLevel: string
  subjects: string[]
}

interface AttendanceRecord {
  id: string
  sessionId: string
  subject: string
  academicLevel: string
  scannedAt: Date
  score: number
  status: "present" | "late" | "absent"
}

// Global state management for real-time attendance synchronization
class AttendanceStore {
  private sessions: AttendanceSession[] = []
  private students: Student[] = []
  private attendanceRecords: AttendanceRecord[] = []
  private listeners: Array<() => void> = []
  private supabase = createClient()

  // Initialize with empty data - students will be registered through Google/Apple OAuth
  constructor() {
    // No demo data - clean start for production system
    this.loadFromLocalStorage()
  }

  private loadFromLocalStorage() {
    try {
      // Load any existing data from localStorage for offline functionality
      const savedStudents = localStorage.getItem('attendance_students')
      const savedSessions = localStorage.getItem('attendance_sessions') 
      const savedRecords = localStorage.getItem('attendance_records')
      
      if (savedStudents) this.students = JSON.parse(savedStudents)
      if (savedSessions) this.sessions = JSON.parse(savedSessions)
      if (savedRecords) this.attendanceRecords = JSON.parse(savedRecords)
    } catch (error) {
      console.warn('Failed to load data from localStorage:', error)
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('attendance_students', JSON.stringify(this.students))
      localStorage.setItem('attendance_sessions', JSON.stringify(this.sessions))
      localStorage.setItem('attendance_records', JSON.stringify(this.attendanceRecords))
    } catch (error) {
      console.warn('Failed to save data to localStorage:', error)
    }
  }

  // Session management
  async createSession(sessionData: AttendanceSession) {
    // Deactivate existing sessions
    this.sessions = this.sessions.map((s) => ({ ...s, isActive: false }))
    
    // Create new session with proper token and expiry
    const newSession = {
      ...sessionData,
      token: this.generateSecureToken(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      qrCode: JSON.stringify({
        sessionId: sessionData.id,
        token: sessionData.token || this.generateSecureToken(),
        academicLevel: sessionData.academicLevel,
        subject: sessionData.subject,
        timestamp: Date.now(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).getTime()
      })
    }
    
    this.sessions.push(newSession)
    this.saveToLocalStorage()
    
    // Try to sync with Supabase if available
    if (this.supabase) {
      try {
        console.log('Syncing session to Supabase...')
        const { error } = await this.supabase
          .from('attendance_sessions')
          .insert({
            id: newSession.id,
            session_name: `${newSession.academicLevel} - ${newSession.subject}`,
            subject_id: null, // We'll need to create subjects table relationship later
            academic_level: newSession.academicLevel,
            qr_code_data: newSession.qrCode,
            secure_token: newSession.token,
            expires_at: newSession.expiresAt.toISOString(),
            is_active: true,
            created_at: new Date().toISOString()
          })
        
        if (error) {
          console.warn('Failed to sync session to Supabase:', error)
        } else {
          console.log('Session synced to Supabase successfully')
        }
      } catch (error) {
        console.warn('Supabase sync failed:', error)
      }
    }
    
    this.notifyListeners()
    return newSession
  }

  private generateSecureToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36)
  }

  getActiveSession(): AttendanceSession | null {
    const activeSession = this.sessions.find((session) => session.isActive)
    
    // Check if session has expired
    if (activeSession && new Date() > activeSession.expiresAt) {
      this.endSession(activeSession.id)
      return null
    }
    
    return activeSession || null
  }

  getAllSessions(): AttendanceSession[] {
    return [...this.sessions]
  }

  async endSession(sessionId: string) {
    this.sessions = this.sessions.map((session) =>
      session.id === sessionId ? { ...session, isActive: false } : session,
    )
    this.saveToLocalStorage()
    
    // Sync with Supabase if available
    if (this.supabase) {
      try {
        console.log('Ending session in Supabase...')
        const { error } = await this.supabase
          .from('attendance_sessions')
          .update({ 
            is_active: false,
            ended_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          
        if (error) {
          console.warn('Failed to sync session end to Supabase:', error)
        } else {
          console.log('Session ended in Supabase successfully')
        }
      } catch (error) {
        console.warn('Failed to sync session end to Supabase:', error)
      }
    }
    
    this.notifyListeners()
  }

  // Attendance management with proper validation and Supabase sync
  async markAttendance(
    qrCodeData: string,
    studentData: {
      studentId: string
      studentName: string
      email: string
      academicLevel: string
      subject: string
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Processing attendance marking...', { studentData, qrCodeLength: qrCodeData.length })
      
      // Parse and validate QR code
      let qrData
      try {
        qrData = JSON.parse(qrCodeData)
      } catch (error) {
        console.error('Invalid QR code JSON:', error)
        return { success: false, message: "Invalid QR code format" }
      }
      
      if (!qrData.sessionId || !qrData.token || !qrData.expiresAt) {
        console.error('Missing required QR data fields:', qrData)
        return { success: false, message: "Invalid QR code - missing required data" }
      }
      
      // Check if QR code has expired
      const expiryDate = new Date(qrData.expiresAt)
      if (new Date() > expiryDate) {
        console.log('QR code expired:', { now: new Date(), expiry: expiryDate })
        return { success: false, message: "QR code has expired" }
      }
      
      // Find the session
      const session = this.sessions.find((s) => s.id === qrData.sessionId)
      if (!session) {
        console.error('Session not found:', qrData.sessionId)
        // List available sessions for debugging
        console.log('Available sessions:', this.sessions.map(s => ({ id: s.id, subject: s.subject, active: s.isActive })))
        return { success: false, message: "Session not found. Please ask instructor to generate a new QR code." }
      }

      if (!session.isActive) {
        console.log('Session inactive:', session.id)
        return { success: false, message: "Session is no longer active" }
      }
      
      // Validate token
      let sessionQrData
      try {
        sessionQrData = JSON.parse(session.qrCode)
      } catch (error) {
        console.error('Invalid session QR data:', error)
        return { success: false, message: "Invalid session data" }
      }
      
      if (sessionQrData.token !== qrData.token) {
        console.error('Token mismatch:', { sessionToken: sessionQrData.token, qrToken: qrData.token })
        return { success: false, message: "Invalid QR code token" }
      }

      // Check if student already marked attendance
      const alreadyMarked = session.attendees.some((attendee) => attendee.studentId === studentData.studentId)
      if (alreadyMarked) {
        console.log('Student already marked attendance:', studentData.studentId)
        return { success: false, message: "You have already marked attendance for this session" }
      }

      // For demo mode, validate student enrollment (skip in production)
      const student = this.students.find((s) => s.id === studentData.studentId)
      if (student && student.subjects.length > 0 && !student.subjects.includes(studentData.subject)) {
        console.log('Student not enrolled in subject:', { student: studentData.studentId, subject: studentData.subject, enrolledSubjects: student.subjects })
        return { success: false, message: "You are not enrolled in this subject" }
      }
      
      // Validate subject matches
      if (session.subject !== studentData.subject) {
        console.log('Subject mismatch:', { sessionSubject: session.subject, studentSubject: studentData.subject })
        return { success: false, message: `QR code is for ${session.subject}, but you selected ${studentData.subject}` }
      }

      // Add attendee to session
      const attendanceScore = 10 // Default attendance score (can be configured by admin)
      const newAttendee = {
        studentId: studentData.studentId,
        studentName: studentData.studentName,
        email: studentData.email,
        scannedAt: new Date(),
        score: attendanceScore,
      }

      // Update the session with new attendee
      this.sessions = this.sessions.map((s) =>
        s.id === qrData.sessionId ? { ...s, attendees: [...s.attendees, newAttendee] } : s,
      )

      // Add to attendance records with detailed info
      const newRecord: AttendanceRecord = {
        id: `record_${Date.now()}_${studentData.studentId}`,
        sessionId: qrData.sessionId,
        subject: studentData.subject,
        academicLevel: studentData.academicLevel,
        scannedAt: new Date(),
        score: attendanceScore,
        status: "present",
      }

      this.attendanceRecords.unshift(newRecord)
      this.saveToLocalStorage()
      
      console.log('Attendance marked locally, syncing to Supabase...', newRecord)
      
      // Sync with Supabase if available
      if (this.supabase) {
        try {
          console.log('Syncing attendance to Supabase...')
          
          // Save attendance record
          const { error: attendanceError } = await this.supabase
            .from('attendance_records')
            .insert({
              id: newRecord.id,
              session_id: qrData.sessionId,
              student_id: studentData.studentId,
              check_in_time: newRecord.scannedAt.toISOString(),
              status: 'present',
              score: attendanceScore,
              location: 'Mobile App',
              device_info: JSON.stringify({
                userAgent: navigator.userAgent,
                platform: 'Web',
                timestamp: Date.now()
              }),
              is_verified: true
            })
            
          if (attendanceError) {
            console.warn('Failed to sync attendance to Supabase:', attendanceError)
          } else {
            console.log('Attendance synced to Supabase successfully')
            
            // Also save/update student grade record
            try {
              const { error: gradeError } = await this.supabase
                .from('grades')
                .upsert({
                  student_id: studentData.studentId,
                  subject_code: studentData.subject,
                  attendance_score: attendanceScore,
                  session_id: qrData.sessionId,
                  grade_date: new Date().toISOString().split('T')[0],
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                
              if (gradeError) {
                console.warn('Failed to sync grade to Supabase:', gradeError)
              } else {
                console.log('Grade record synced to Supabase successfully')
              }
            } catch (gradeError) {
              console.warn('Failed to sync grade:', gradeError)
            }
          }
        } catch (error) {
          console.warn('Failed to sync attendance to Supabase:', error)
          // Don't fail the operation if Supabase sync fails
        }
      } else {
        console.log('Supabase not available, attendance saved locally only')
      }
      
      this.notifyListeners()

      const successMessage = `Attendance marked successfully! ✅\nSession: ${session.subject}\nTime: ${newRecord.scannedAt.toLocaleTimeString()}`
      console.log('Attendance marking completed:', successMessage)
      
      return { success: true, message: successMessage }
    } catch (error) {
      console.error('Error marking attendance:', error)
      return { success: false, message: "Failed to process QR code. Please try again." }
    }
  }

  // Student management - Updated for OAuth integration and Supabase sync
  async registerStudentFromOAuth(studentData: {
    id: string
    name: string
    email: string
    academicLevel?: string
    provider: 'google' | 'apple'
  }): Promise<Student> {
    const newStudent: Student = {
      id: studentData.id,
      name: studentData.name,
      email: studentData.email,
      password: '', // No password needed for OAuth users
      academicLevel: studentData.academicLevel || 'Second Year',
      subjects: [], // Will be set later through course enrollment
    }
    
    // Check if student already exists
    const existingIndex = this.students.findIndex(s => s.email === studentData.email)
    if (existingIndex >= 0) {
      this.students[existingIndex] = newStudent
    } else {
      this.students.push(newStudent)
    }
    
    this.saveToLocalStorage()
    
    // Sync with Supabase if available
    if (this.supabase) {
      try {
        console.log('Syncing student to Supabase...')
        const { error } = await this.supabase
          .from('profiles')
          .upsert({
            id: newStudent.id,
            email: newStudent.email,
            full_name: newStudent.name,
            role: 'student',
            academic_level: newStudent.academicLevel,
            created_at: new Date().toISOString()
          })
          
        if (error) {
          console.warn('Failed to sync student to Supabase:', error)
        } else {
          console.log('Student synced to Supabase successfully')
        }
      } catch (error) {
        console.warn('Failed to sync student to Supabase:', error)
      }
    }
    
    this.notifyListeners()
    return newStudent
  }

  async registerStudent(studentData: Omit<Student, "id">): Promise<Student> {
    const newStudent: Student = {
      ...studentData,
      id: `student_${Date.now()}`,
    }
    this.students.push(newStudent)
    this.saveToLocalStorage()
    
    // Sync with Supabase if available
    if (this.supabase) {
      try {
        console.log('Syncing new student to Supabase...')
        const { error } = await this.supabase
          .from('profiles')
          .insert({
            id: newStudent.id,
            email: newStudent.email,
            full_name: newStudent.name,
            role: 'student',
            academic_level: newStudent.academicLevel,
            created_at: new Date().toISOString()
          })
          
        if (error) {
          console.warn('Failed to sync student to Supabase:', error)
        } else {
          console.log('Student synced to Supabase successfully')
        }
      } catch (error) {
        console.warn('Failed to sync student to Supabase:', error)
      }
    }
    
    this.notifyListeners()
    return newStudent
  }

  getStudentAttendanceRecords(studentId: string): AttendanceRecord[] {
    // Return records for the authenticated student
    const student = this.students.find((s) => s.id === studentId)
    if (!student) return []

    return this.attendanceRecords.filter((record) => student.subjects.includes(record.subject))
  }

  // Real-time updates
  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener())
    this.saveToLocalStorage()
  }

  // Public getters for accessing private data
  getAllStudents(): Student[] {
    return [...this.students]
  }

  getAllAttendanceRecords(): AttendanceRecord[] {
    return [...this.attendanceRecords]
  }

  // Utility methods
  getSessionStats() {
    const totalSessions = this.sessions.length
    const totalAttendees = this.sessions.reduce((sum, session) => sum + session.attendees.length, 0)
    const averageAttendance = totalSessions > 0 ? Math.round((totalAttendees / totalSessions) * 100) / 100 : 0
    const activeSession = this.sessions.some((session) => session.isActive)

    return {
      totalSessions,
      totalAttendees,
      averageAttendance,
      activeSession,
    }
  }

  getStudentStats(studentId: string) {
    const records = this.getStudentAttendanceRecords(studentId)
    const totalSessions = records.length + 2 // Including some missed sessions for demo
    const attendedSessions = records.length
    const attendanceRate = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0
    const averageScore =
      attendedSessions > 0
        ? Math.round((records.reduce((sum, r) => sum + r.score, 0) / attendedSessions) * 100) / 100
        : 0

    return {
      totalSessions,
      attendedSessions,
      attendanceRate,
      averageScore,
    }
  }
}

// Global instance
export const attendanceStore = new AttendanceStore()

// Make it globally accessible for testing and cross-component access
if (typeof window !== 'undefined') {
  const globalWindow = window as any
  globalWindow.attendanceStore = attendanceStore
  globalWindow.__attendanceStore__ = attendanceStore
}

// React hook for real-time updates
export function useAttendanceStore() {
  const [, forceUpdate] = React.useState({})

  React.useEffect(() => {
    const unsubscribe = attendanceStore.subscribe(() => {
      forceUpdate({})
    })
    return unsubscribe
  }, [])

  return attendanceStore
}
