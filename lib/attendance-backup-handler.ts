// Enhanced Attendance Handler (Simplified for production build)
// Handles attendance recording with Supabase database

import { createClient } from '@/lib/supabase/client'

interface AttendanceData {
  studentId: string
  studentName: string
  studentEmail: string
  sessionId: string
  subject: string
  sessionType: string
  qrCode: string
  timestamp: Date
  status: 'present' | 'late' | 'absent'
  notes?: string
}

class AttendanceBackupHandler {
  private supabase = createClient()

  async recordAttendance(data: AttendanceData): Promise<{
    success: boolean
    method: 'database' | 'local_fallback' | 'failed'
    error?: string
  }> {
    // Try to record to primary database (Supabase)
    try {
      const result = await this.recordToDatabase(data)
      if (result.success) {
        console.log('✅ Attendance recorded to primary database')
        return { success: true, method: 'database' }
      }
    } catch (error) {
      console.warn('⚠️ Primary database failed, using local fallback...', error)
    }

    // If database fails, store locally (temporary solution)
    try {
      this.storeLocalFallback(data)
      return { success: true, method: 'local_fallback' }
    } catch (error) {
      console.error('❌ All methods failed:', error)
      return { 
        success: false, 
        method: 'failed',
        error: 'All attendance recording methods failed'
      }
    }
  }

  private async recordToDatabase(data: AttendanceData): Promise<{ success: boolean; error?: string }> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    try {
      // Record to attendance_records table
      const { error } = await this.supabase
        .from('attendance_records')
        .insert({
          session_id: data.sessionId,
          student_id: data.studentId,
          subject_id: data.subject, // Will need to map subject name to ID
          status: data.status,
          scan_timestamp: data.timestamp.toISOString(),
          notes: data.notes
        })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private storeLocalFallback(data: AttendanceData) {
    // Store in localStorage as fallback
    const key = `attendance_fallback_${Date.now()}`
    const fallbackData = {
      ...data,
      timestamp: data.timestamp.toISOString(),
      stored_at: new Date().toISOString()
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(fallbackData))
      console.log('📦 Attendance stored locally as fallback')
    }
  }

  async syncBackupToDatabase(): Promise<{
    total: number
    successful: number
    failed: number
    errors: string[]
  }> {
    // Sync from localStorage fallback
    if (typeof window === 'undefined') {
      return { total: 0, successful: 0, failed: 0, errors: ['Not available on server side'] }
    }

    const fallbackKeys = Object.keys(localStorage).filter(key => key.startsWith('attendance_fallback_'))
    const errors: string[] = []
    let successful = 0
    let failed = 0

    for (const key of fallbackKeys) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        // Try to sync to database
        const result = await this.recordToDatabase({
          ...data,
          timestamp: new Date(data.timestamp)
        })
        
        if (result.success) {
          localStorage.removeItem(key)
          successful++
        } else {
          failed++
          errors.push(result.error || 'Unknown error')
        }
      } catch (error: any) {
        failed++
        errors.push(`Failed to sync ${key}: ${error.message}`)
      }
    }

    return {
      total: fallbackKeys.length,
      successful,
      failed,
      errors
    }
  }

  async getBackupStatus(): Promise<{
    googleBackupReady: boolean
    databaseReady: boolean
    lastBackupSync: Date | null
    pendingRecords: number
  }> {
    let databaseReady = false
    
    try {
      if (this.supabase) {
        const { error } = await this.supabase.from('attendance_records').select('id').limit(1)
        databaseReady = !error
      }
    } catch {
      databaseReady = false
    }

    // Get pending local fallback records count
    let pendingRecords = 0
    if (typeof window !== 'undefined') {
      pendingRecords = Object.keys(localStorage).filter(key => key.startsWith('attendance_fallback_')).length
    }

    return {
      googleBackupReady: false, // Disabled for now
      databaseReady,
      lastBackupSync: null,
      pendingRecords
    }
  }
}

export const attendanceBackupHandler = new AttendanceBackupHandler()
export default AttendanceBackupHandler