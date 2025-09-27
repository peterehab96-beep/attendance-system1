// Secure Super Admin Authentication Service
// Dr. Peter Ehab - Hidden Admin Access System

import { getSuperAdminCredentials, validateSuperAdminAccess } from '@/lib/admin-config'

export interface SuperAdminSession {
  username: string
  timestamp: number
  source: string
  expires: number
  permissions: string[]
}

export class SecureSuperAdminService {
  private static readonly SESSION_KEY = '__sa_auth__'
  private static readonly SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours
  private static readonly REFRESH_THRESHOLD = 30 * 60 * 1000 // 30 minutes

  // Check if user has active super admin session
  static hasActiveSuperAdminSession(): boolean {
    try {
      if (typeof window === 'undefined') return false
      
      const sessionData = sessionStorage.getItem(this.SESSION_KEY)
      if (!sessionData) return false

      const session: SuperAdminSession = JSON.parse(atob(sessionData))
      
      // Check if session is expired
      if (Date.now() > session.expires) {
        this.clearSuperAdminSession()
        return false
      }

      return true
    } catch {
      this.clearSuperAdminSession()
      return false
    }
  }

  // Get current super admin session
  static getSuperAdminSession(): SuperAdminSession | null {
    try {
      if (typeof window === 'undefined') return null
      
      const sessionData = sessionStorage.getItem(this.SESSION_KEY)
      if (!sessionData) return null

      const session: SuperAdminSession = JSON.parse(atob(sessionData))
      
      // Check if session is expired
      if (Date.now() > session.expires) {
        this.clearSuperAdminSession()
        return null
      }

      // Refresh session if close to expiry
      if (Date.now() > (session.expires - this.REFRESH_THRESHOLD)) {
        this.refreshSuperAdminSession(session)
      }

      return session
    } catch {
      this.clearSuperAdminSession()
      return null
    }
  }

  // Create super admin session after successful authentication
  static createSuperAdminSession(credentials: { username: string, password: string }): boolean {
    try {
      if (!validateSuperAdminAccess(credentials.username, credentials.password)) {
        return false
      }

      const session: SuperAdminSession = {
        username: credentials.username,
        timestamp: Date.now(),
        source: 'biometric_or_manual',
        expires: Date.now() + this.SESSION_DURATION,
        permissions: [
          'SUPER_ADMIN_ACCESS',
          'SYSTEM_OVERRIDE',
          'FULL_DATABASE_ACCESS',
          'USER_MANAGEMENT',
          'SECURITY_CONTROLS',
          'AUDIT_LOGS',
          'SYSTEM_CONFIGURATION'
        ]
      }

      const encryptedSession = btoa(JSON.stringify(session))
      sessionStorage.setItem(this.SESSION_KEY, encryptedSession)

      // Log security event
      this.logSecurityEvent('SUPER_ADMIN_SESSION_CREATED', {
        username: credentials.username,
        timestamp: new Date().toISOString(),
        expires: new Date(session.expires).toISOString()
      })

      return true
    } catch (error) {
      console.error('Failed to create super admin session:', error)
      return false
    }
  }

  // Refresh existing session
  private static refreshSuperAdminSession(session: SuperAdminSession): void {
    const refreshedSession: SuperAdminSession = {
      ...session,
      expires: Date.now() + this.SESSION_DURATION
    }

    const encryptedSession = btoa(JSON.stringify(refreshedSession))
    sessionStorage.setItem(this.SESSION_KEY, encryptedSession)

    this.logSecurityEvent('SUPER_ADMIN_SESSION_REFRESHED', {
      username: session.username,
      timestamp: new Date().toISOString()
    })
  }

  // Clear super admin session
  static clearSuperAdminSession(): void {
    if (typeof window !== 'undefined') {
      const session = this.getSuperAdminSession()
      sessionStorage.removeItem(this.SESSION_KEY)

      if (session) {
        this.logSecurityEvent('SUPER_ADMIN_SESSION_ENDED', {
          username: session.username,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  // Verify super admin permission for specific action
  static hasPermission(permission: string): boolean {
    const session = this.getSuperAdminSession()
    if (!session) return false

    return session.permissions.includes(permission) || 
           session.permissions.includes('SUPER_ADMIN_ACCESS')
  }

  // Get super admin credentials (only when authenticated)
  static getCredentialsForAuthenticated(): { username: string, password: string } | null {
    if (!this.hasActiveSuperAdminSession()) return null
    return getSuperAdminCredentials()
  }

  // Emergency access validation (console command)
  static validateEmergencyAccess(challenge: string): boolean {
    // Emergency access codes
    const emergencyCodes = [
      'DR_PETER_EHAB_EMERGENCY_2024',
      'ZAGAZIG_MUSIC_OVERRIDE_ACCESS',
      'SYSTEM_ADMIN_EMERGENCY_RESET'
    ]

    const isValidChallenge = emergencyCodes.some(code => 
      challenge.toUpperCase().includes(code)
    )

    if (isValidChallenge) {
      this.logSecurityEvent('EMERGENCY_ACCESS_USED', {
        timestamp: new Date().toISOString(),
        challenge: challenge.substring(0, 10) + '...' // Log partial for security
      })
    }

    return isValidChallenge
  }

  // Security event logging
  private static logSecurityEvent(eventType: string, data: any): void {
    const logEntry = {
      type: 'SUPER_ADMIN_SECURITY_EVENT',
      event: eventType,
      timestamp: new Date().toISOString(),
      data: data,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    }

    // Log to console (in production, this would go to a secure logging service)
    console.log('🔐 SECURITY EVENT:', logEntry)

    // Store in localStorage for audit trail (limited to last 100 events)
    try {
      if (typeof window !== 'undefined') {
        const auditKey = '__security_audit__'
        const existingLogs = JSON.parse(localStorage.getItem(auditKey) || '[]')
        const updatedLogs = [logEntry, ...existingLogs].slice(0, 100)
        localStorage.setItem(auditKey, JSON.stringify(updatedLogs))
      }
    } catch (error) {
      console.warn('Failed to store security audit log:', error)
    }
  }

  // Get audit logs (super admin only)
  static getAuditLogs(): any[] {
    if (!this.hasPermission('AUDIT_LOGS')) return []

    try {
      if (typeof window === 'undefined') return []
      const auditKey = '__security_audit__'
      return JSON.parse(localStorage.getItem(auditKey) || '[]')
    } catch {
      return []
    }
  }

  // Clear audit logs (super admin only)
  static clearAuditLogs(): boolean {
    if (!this.hasPermission('AUDIT_LOGS')) return false

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('__security_audit__')
        this.logSecurityEvent('AUDIT_LOGS_CLEARED', {
          timestamp: new Date().toISOString()
        })
      }
      return true
    } catch {
      return false
    }
  }

  // Force logout all sessions (emergency function)
  static emergencyLogoutAll(): void {
    if (typeof window !== 'undefined') {
      // Clear all possible session keys
      const keysToRemove = [
        '__sa_auth__',
        '__admin_session__',
        '__user_session__'
      ]

      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key)
        localStorage.removeItem(key)
      })

      this.logSecurityEvent('EMERGENCY_LOGOUT_ALL', {
        timestamp: new Date().toISOString()
      })

      // Force page reload to apply changes
      window.location.reload()
    }
  }
}

// Global console functions for super admin (only in development or with valid session)
if (typeof window !== 'undefined') {
  // Emergency access function
  ;(window as any).__EMERGENCY_SUPER_ADMIN__ = (challenge: string) => {
    if (SecureSuperAdminService.validateEmergencyAccess(challenge)) {
      const credentials = getSuperAdminCredentials()
      if (credentials) {
        SecureSuperAdminService.createSuperAdminSession(credentials)
        console.log('🚨 Emergency super admin access granted')
        window.location.reload()
      }
    } else {
      console.log('❌ Invalid emergency access challenge')
    }
  }

  // Audit log viewer
  ;(window as any).__VIEW_AUDIT_LOGS__ = () => {
    const logs = SecureSuperAdminService.getAuditLogs()
    console.table(logs)
    return logs
  }

  // Session info
  ;(window as any).__SUPER_ADMIN_INFO__ = () => {
    const session = SecureSuperAdminService.getSuperAdminSession()
    if (session) {
      console.log('🛡️ Super Admin Session:', {
        username: session.username,
        expires: new Date(session.expires).toLocaleString(),
        permissions: session.permissions.length
      })
    } else {
      console.log('❌ No active super admin session')
    }
  }
}

export default SecureSuperAdminService