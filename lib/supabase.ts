import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types
export interface Profile {
  id: string
  email: string
  full_name: string
  student_id?: string
  role: 'student' | 'admin' | 'instructor'
  year_level?: number
  phone?: string
  emergency_contact?: string
  avatar_url?: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  name: string
  code: string
  year_level: number
  semester: number
  credits: number
  instructor_id?: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AttendanceSession {
  id: string
  subject_id: string
  instructor_id: string
  session_date: string
  session_time: string
  session_type: 'lecture' | 'practical' | 'seminar' | 'exam'
  location?: string
  qr_code?: string
  is_active: boolean
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface AttendanceRecord {
  id: string
  session_id: string
  student_id: string
  check_in_time: string
  location?: string
  device_info?: string
  is_verified: boolean
  created_at: string
}

export interface Grade {
  id: string
  student_id: string
  subject_id: string
  grade_type: string
  score: number
  max_score: number
  percentage: number
  grade_date: string
  comments?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  action_url?: string
  expires_at?: string
  created_at: string
}

// Authentication helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Profile helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data as Profile
}

export const updateUserProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as Profile
}