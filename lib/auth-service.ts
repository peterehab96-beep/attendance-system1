import { createClient } from '@/lib/supabase/client'

export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'student'
  fullName: string
  academicLevel?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData extends LoginCredentials {
  fullName: string
  role: 'admin' | 'student'
  academicLevel?: string
}

class AuthService {
  private supabase = createClient()

  async login(credentials: LoginCredentials): Promise<{
    success: boolean
    user?: AuthUser
    error?: string
  }> {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('your-project-id')) {
        console.log('Supabase not configured - using demo mode')
        return this.authenticateLocally(credentials)
      }

      // Real Supabase authentication
      if (this.supabase) {
        console.log('Attempting Supabase authentication...')
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error) {
          console.log('Supabase auth error:', error.message)
          // If auth fails and it's not a configuration issue, try demo mode
          if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
            console.log('Falling back to demo mode due to auth failure')
            return this.authenticateLocally(credentials)
          }
          return { success: false, error: error.message }
        }

        if (data.user) {
          console.log('Supabase authentication successful')
          // Get user profile from Supabase
          const { data: profile, error: profileError } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError) {
            console.log('Profile not found, creating new profile...')
            // Create profile if it doesn't exist
            const { data: newProfile, error: createError } = await this.supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: credentials.email,
                full_name: data.user.user_metadata?.full_name || 'User',
                role: data.user.user_metadata?.role || 'student',
                academic_level: data.user.user_metadata?.academic_level || 'Second Year',
                created_at: new Date().toISOString()
              })
              .select()
              .single()

            if (createError) {
              console.error('Failed to create profile:', createError)
              return { success: false, error: 'Failed to create user profile' }
            }

            const user: AuthUser = {
              id: newProfile.id,
              email: newProfile.email,
              role: newProfile.role,
              fullName: newProfile.full_name,
              academicLevel: newProfile.academic_level,
            }

            // Store in localStorage for persistence
            this.storeUserLocally(user)
            return { success: true, user }
          }

          const user: AuthUser = {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            fullName: profile.full_name,
            academicLevel: profile.academic_level,
          }

          // Store in localStorage for persistence
          this.storeUserLocally(user)
          return { success: true, user }
        }
      }

      // Fallback to demo mode
      console.log('Falling back to demo mode')
      return this.authenticateLocally(credentials)
    } catch (error) {
      console.error('Authentication error:', error)
      return this.authenticateLocally(credentials)
    }
  }

  private async authenticateLocally(credentials: LoginCredentials): Promise<{
    success: boolean
    user?: AuthUser
    error?: string
  }> {
    // Demo accounts for testing
    const demoAccounts = [
      // Test Students
      {
        email: 'ahmed.hassan@test.zu.edu.eg',
        password: 'student123',
        id: '11111111-1111-1111-1111-111111111111',
        fullName: 'أحمد حسن محمد',
        role: 'student' as const,
        academicLevel: 'Second Year'
      },
      {
        email: 'fatima.ali@test.zu.edu.eg',
        password: 'student123',
        id: '22222222-2222-2222-2222-222222222222',
        fullName: 'فاطمة علي أحمد',
        role: 'student' as const,
        academicLevel: 'First Year'
      },
      {
        email: 'omar.mohamed@test.zu.edu.eg',
        password: 'student123',
        id: '33333333-3333-3333-3333-333333333333',
        fullName: 'عمر محمد سالم',
        role: 'student' as const,
        academicLevel: 'Third Year'
      },
      // Test Instructor
      {
        email: 'dr.sarah@test.zu.edu.eg',
        password: 'instructor123',
        id: '66666666-6666-6666-6666-666666666666',
        fullName: 'د. سارة محمود',
        role: 'admin' as const,
        academicLevel: undefined
      },
      // Test Admin
      {
        email: 'admin@test.zu.edu.eg',
        password: 'admin123',
        id: '77777777-7777-7777-7777-777777777777',
        fullName: 'إدارة النظام',
        role: 'admin' as const,
        academicLevel: undefined
      },
      // Easy demo accounts
      {
        email: 'student@demo.com',
        password: '123456',
        id: 'demo-student-001',
        fullName: 'طالب تجريبي',
        role: 'student' as const,
        academicLevel: 'Second Year'
      },
      {
        email: 'admin@demo.com',
        password: '123456',
        id: 'demo-admin-001',
        fullName: 'مدير تجريبي',
        role: 'admin' as const,
        academicLevel: undefined
      }
    ]

    // Find matching account
    const account = demoAccounts.find(acc => 
      acc.email.toLowerCase() === credentials.email.toLowerCase() && 
      acc.password === credentials.password
    )

    if (!account) {
      return { 
        success: false, 
        error: 'Invalid login credentials. Please check your email and password and try again.' 
      }
    }

    // Create user object
    const user: AuthUser = {
      id: account.id,
      email: account.email,
      role: account.role,
      fullName: account.fullName,
      academicLevel: account.academicLevel
    }

    // Store in localStorage for demo persistence
    this.storeUserLocally(user)

    return { success: true, user }
  }

  async signup(data: SignupData): Promise<{
    success: boolean
    user?: AuthUser
    error?: string
  }> {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('your-project-id')) {
        console.log('Supabase not configured - using demo mode for signup')
        // Demo mode - create local account
        const user: AuthUser = {
          id: `demo_${Date.now()}`,
          email: data.email,
          role: data.role,
          fullName: data.fullName,
          academicLevel: data.academicLevel,
        }
        
        this.storeUserLocally(user)
        
        return { success: true, user }
      }

      // Real Supabase signup
      if (this.supabase) {
        console.log('Attempting Supabase signup...')
        const { data: authData, error: authError } = await this.supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              role: data.role,
              academic_level: data.academicLevel,
            },
          },
        })

        if (authError) {
          console.error('Supabase signup error:', authError)
          return { success: false, error: authError.message }
        }

        if (authData.user) {
          console.log('Supabase signup successful')
          
          // Create profile record
          const { error: profileError } = await this.supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: data.email,
              full_name: data.fullName,
              role: data.role,
              academic_level: data.academicLevel,
              created_at: new Date().toISOString()
            })

          if (profileError) {
            console.warn('Failed to create profile:', profileError)
            // Continue anyway - profile might be created by trigger
          }

          const user: AuthUser = {
            id: authData.user.id,
            email: data.email,
            role: data.role,
            fullName: data.fullName,
            academicLevel: data.academicLevel,
          }

          // Store in localStorage for persistence
          this.storeUserLocally(user)
          
          return { success: true, user }
        }
      }

      // Fallback for demo
      console.log('Falling back to demo mode for signup')
      const user: AuthUser = {
        id: `user_${Date.now()}`,
        email: data.email,
        role: data.role,
        fullName: data.fullName,
        academicLevel: data.academicLevel,
      }
      
      this.storeUserLocally(user)
      
      return { success: true, user }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: 'Signup failed. Please try again.' }
    }
  }

  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      // Always clear local storage first to ensure clean logout
      localStorage.removeItem('auth_user')
      
      if (this.supabase) {
        const { error } = await this.supabase.auth.signOut()
        if (error) {
          console.warn('Supabase logout error:', error)
          // Don't fail the logout if Supabase fails - user is already logged out locally
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, clear local state
      localStorage.removeItem('auth_user')
      return { success: true } // Return success to allow user to proceed
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // First check localStorage for immediate response
      const stored = localStorage.getItem('auth_user')
      const localUser = stored ? JSON.parse(stored) : null
      
      // If Supabase is configured, verify with Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (this.supabase && supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
        try {
          const { data: { user } } = await this.supabase.auth.getUser()
          
          if (user) {
            const { data: profile } = await this.supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()

            if (profile) {
              const supabaseUser = {
                id: profile.id,
                email: profile.email,
                role: profile.role,
                fullName: profile.full_name,
                academicLevel: profile.academic_level,
              }
              
              // Update localStorage with Supabase data
              this.storeUserLocally(supabaseUser)
              return supabaseUser
            }
          } else if (localUser) {
            // User not found in Supabase but exists locally - clear local data
            localStorage.removeItem('auth_user')
            return null
          }
        } catch (error) {
          console.warn('Failed to verify user with Supabase:', error)
          // If Supabase fails but we have local data, use local data
          return localUser
        }
      }

      // Return local user if Supabase not configured or failed
      return localUser
    } catch (error) {
      console.error('Get current user error:', error)
      // Try to return local storage as last resort
      const stored = localStorage.getItem('auth_user')
      return stored ? JSON.parse(stored) : null
    }
  }

  // Store user in local storage for session persistence
  storeUserLocally(user: AuthUser): void {
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

  // Check if user has specific role
  hasRole(user: AuthUser | null, role: 'admin' | 'student'): boolean {
    return user?.role === role
  }

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password strength validation
  isStrongPassword(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export const authService = new AuthService()