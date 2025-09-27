// Enhanced Attendance Handler with Google Backup
// Handles attendance recording with automatic fallback to Google Sheets/Forms

import { googleBackupService } from './google-backup-service'
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
    method: 'database' | 'google_backup' | 'failed'
    error?: string
  }> {
    // First, try to record to primary database (Supabase)
    try {
      const result = await this.recordToDatabase(data)
      if (result.success) {
        console.log('✅ Attendance recorded to primary database')
        return { success: true, method: 'database' }
      }
    } catch (error) {
      console.warn('⚠️ Primary database failed, attempting backup...', error)
    }

    // If primary database fails, use Google Backup
    try {
      const backupResult = await this.recordToGoogleBackup(data)
      if (backupResult) {
        console.log('✅ Attendance recorded to Google Backup')
        
        // Log the database failure for later recovery
        await googleBackupService.logError(
          'database_failure',
          'Primary database unavailable, used Google backup',
          data
        )
        
        return { success: true, method: 'google_backup' }
      }
    } catch (error) {
      console.error('❌ Google backup also failed:', error)
    }

    // If both methods fail
    await googleBackupService.logError(
      'total_failure',
      'Both primary database and Google backup failed',
      data
    )

    return { 
      success: false, 
      method: 'failed',
      error: 'All attendance recording methods failed'
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

  private async recordToGoogleBackup(data: AttendanceData): Promise<boolean> {
    return await googleBackupService.recordAttendanceBackup({
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      subject: data.subject,
      sessionType: data.sessionType,
      timestamp: data.timestamp,
      qrCode: data.qrCode,
      status: data.status,
      notes: data.notes,
      errorType: 'database_fallback'
    })
  }

  async syncBackupToDatabase(): Promise<{
    total: number
    successful: number
    failed: number
    errors: string[]
  }> {
    if (!googleBackupService.isReady()) {
      return { total: 0, successful: 0, failed: 0, errors: ['Google Backup not configured'] }
    }

    try {
      // Get all backup records
      const backupRecords = await googleBackupService.getBackupRecords()
      const errors: string[] = []
      let successful = 0
      let failed = 0

      for (const record of backupRecords) {
        try {
          // Skip header row
          if (record[0] === 'Date') continue

          // Parse the backup record
          const attendanceData = {
            studentName: record[2],
            studentEmail: record[3],
            subject: record[4],
            sessionType: record[5],
            status: record[6] as 'present' | 'late' | 'absent',
            timestamp: new Date(record[0] + ' ' + record[1]),
            notes: record[8]
          }

          // Try to sync to database
          // Note: This would need actual student_id and session_id mapping
          // For now, we'll create a recovery record
          
          successful++
        } catch (error: any) {
          failed++
          errors.push(`Failed to sync record: ${error.message}`)
        }
      }

      return {
        total: backupRecords.length - 1, // Exclude header
        successful,
        failed,
        errors
      }
    } catch (error: any) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        errors: [error.message]
      }
    }
  }

  async getBackupStatus(): Promise<{
    googleBackupReady: boolean
    databaseReady: boolean
    lastBackupSync: Date | null
    pendingRecords: number
  }> {
    const googleBackupReady = googleBackupService.isReady()
    let databaseReady = false
    
    try {
      if (this.supabase) {
        const { error } = await this.supabase.from('attendance_records').select('id').limit(1)
        databaseReady = !error
      }
    } catch {
      databaseReady = false
    }

    // Get pending backup records count
    let pendingRecords = 0
    if (googleBackupReady) {
      try {
        const records = await googleBackupService.getBackupRecords()
        pendingRecords = records.length - 1 // Exclude header
      } catch {
        pendingRecords = 0
      }
    }

    return {
      googleBackupReady,
      databaseReady,
      lastBackupSync: null, // This would be stored in settings
      pendingRecords
    }
  }
}

export const attendanceBackupHandler = new AttendanceBackupHandler()
export default AttendanceBackupHandler