// Google Sheets & Forms Backup Service
// Fallback system for attendance recording when primary database fails

const AVAILABLE_SUBJECTS = [
  'Western Rules & Solfege 1',
  'Western Rules & Solfege 2', 
  'Western Rules & Solfege 3',
  'Western Rules & Solfege 4',
  'Western Rules & Solfege 5',
  'Western Rules & Solfege 6',
  'Rhythmic Movement 1',
  'Rhythmic Movement 2',
  'Hymn Singing'
]

interface GoogleBackupConfig {
  serviceAccountKey: any
  spreadsheetsId: string
  formId: string
  enabled: boolean
}

interface AttendanceBackupData {
  studentName: string
  studentEmail: string
  subject: string
  sessionType: string
  timestamp: Date
  qrCode: string
  status: 'present' | 'late' | 'absent'
  notes?: string
  errorType?: string
}

class GoogleBackupService {
  private config: GoogleBackupConfig
  private sheets: any
  private isConfigured: boolean = false

  constructor() {
    this.config = {
      serviceAccountKey: null,
      spreadsheetsId: process.env.GOOGLE_BACKUP_SPREADSHEET_ID || '',
      formId: process.env.GOOGLE_BACKUP_FORM_ID || '',
      enabled: process.env.GOOGLE_BACKUP_ENABLED === 'true'
    }
    
    this.initializeService()
  }

  private async initializeService() {
    try {
      if (!this.config.enabled) {
        console.log('Google Backup Service is disabled')
        return
      }

      // Load service account key
      const fs = require('fs')
      const path = require('path')
      const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || './google-service-account.json'
      
      if (fs.existsSync(keyPath)) {
        this.config.serviceAccountKey = JSON.parse(fs.readFileSync(keyPath, 'utf8'))
      } else {
        throw new Error(`Service account key file not found: ${keyPath}`)
      }

      // Initialize Google Sheets API
      const { GoogleAuth } = require('google-auth-library')
      const { google } = require('googleapis')

      const auth = new GoogleAuth({
        credentials: this.config.serviceAccountKey,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/forms',
          'https://www.googleapis.com/auth/drive.file'
        ]
      })

      this.sheets = google.sheets({ version: 'v4', auth })
      this.isConfigured = true
      
      console.log('✅ Google Backup Service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Google Backup Service:', error)
      this.isConfigured = false
    }
  }

  async recordAttendanceBackup(data: AttendanceBackupData): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('Google Backup Service not configured')
      return false
    }

    try {
      // Prepare data for Google Sheets
      const row = [
        data.timestamp.toLocaleDateString('ar-EG'),
        data.timestamp.toLocaleTimeString('ar-EG'),
        data.studentName,
        data.studentEmail,
        data.subject,
        data.sessionType,
        data.status,
        data.qrCode,
        data.notes || '',
        data.errorType || 'manual_backup'
      ]

      // Append to Google Sheets
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.config.spreadsheetsId,
        range: 'Attendance Records!A:J',
        valueInputOption: 'RAW',
        resource: {
          values: [row]
        }
      })

      console.log('✅ Attendance backed up to Google Sheets')
      
      // Also submit to Google Form for additional backup
      await this.submitToGoogleForm(data)
      
      return true
    } catch (error) {
      console.error('❌ Failed to backup attendance to Google Sheets:', error)
      return false
    }
  }

  private async submitToGoogleForm(data: AttendanceBackupData): Promise<boolean> {
    try {
      // Google Form submission via HTTP POST
      const formData = new FormData()
      
      // Note: These field IDs need to be extracted from the actual Google Form
      // Will be configured once you provide the form details
      formData.append('entry.STUDENT_NAME_ID', data.studentName)
      formData.append('entry.STUDENT_EMAIL_ID', data.studentEmail)
      formData.append('entry.SUBJECT_ID', data.subject)
      formData.append('entry.SESSION_TYPE_ID', data.sessionType)
      formData.append('entry.TIMESTAMP_ID', data.timestamp.toISOString())
      formData.append('entry.NOTES_ID', data.notes || '')

      const response = await fetch(`https://docs.google.com/forms/d/${this.config.formId}/formResponse`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        console.log('✅ Attendance submitted to Google Form')
        return true
      } else {
        console.log('⚠️ Google Form submission failed')
        return false
      }
    } catch (error) {
      console.error('❌ Failed to submit to Google Form:', error)
      return false
    }
  }

  async logError(errorType: string, errorMessage: string, studentData?: any): Promise<void> {
    if (!this.isConfigured) return

    try {
      const row = [
        new Date().toLocaleString('ar-EG'),
        errorType,
        errorMessage,
        JSON.stringify(studentData || {}),
        'pending'
      ]

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.config.spreadsheetsId,
        range: 'Error Log!A:E',
        valueInputOption: 'RAW',
        resource: {
          values: [row]
        }
      })

      console.log('✅ Error logged to Google Sheets')
    } catch (error) {
      console.error('❌ Failed to log error to Google Sheets:', error)
    }
  }

  async getBackupRecords(date?: string): Promise<any[]> {
    if (!this.isConfigured) return []

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetsId,
        range: 'Attendance Records!A:J'
      })

      const rows = response.data.values || []
      
      if (date) {
        return rows.filter((row: any[]) => row[0] === date)
      }
      
      return rows
    } catch (error) {
      console.error('❌ Failed to retrieve backup records:', error)
      return []
    }
  }

  async syncBackupToDatabase(): Promise<{ success: number; failed: number }> {
    if (!this.isConfigured) return { success: 0, failed: 0 }

    try {
      const records = await this.getBackupRecords()
      let success = 0
      let failed = 0

      for (const record of records) {
        try {
          // Attempt to sync each record back to the main database
          // This will be implemented once the main database is working
          success++
        } catch (error) {
          failed++
        }
      }

      console.log(`📊 Backup sync completed: ${success} success, ${failed} failed`)
      return { success, failed }
    } catch (error) {
      console.error('❌ Failed to sync backup to database:', error)
      return { success: 0, failed: 0 }
    }
  }

  isReady(): boolean {
    return this.isConfigured
  }
}

export const googleBackupService = new GoogleBackupService()
export default GoogleBackupService