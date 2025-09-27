"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, Eye, EyeOff, Mail, User, GraduationCap, BookOpen } from "lucide-react"
import { StudentDashboard } from "@/components/student-dashboard"
import { useAttendanceStore } from "@/lib/attendance-store"
import { createClient } from "@/lib/supabase/client"
import { BiometricAuth } from "@/components/biometric-auth"
import { toast } from "sonner"
import { authService } from "@/lib/auth-service"
import { academicLevels, subjectsByLevel } from "@/lib/subjects-data"

interface StudentAuthProps {
  onBack: () => void
}

interface Student {
  id: string
  name: string
  email: string
  password: string
  academicLevel: string
  subjects: string[]
}

export function StudentAuth({ onBack }: StudentAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [activeTab, setActiveTab] = useState("login")
  const store = useAttendanceStore()
  const supabase = createClient()

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Registration form state
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regAcademicLevel, setRegAcademicLevel] = useState("")
  const [regSubjects, setRegSubjects] = useState<string[]>([])
  const [showRegPassword, setShowRegPassword] = useState(false)

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Import shared academic levels and subjects data
  // const academicLevels and subjectsByLevel are now imported from lib/subjects-data.ts

  const handleBiometricSuccess = async (biometricData: { id: string; type: 'fingerprint' | 'face' }) => {
    // Create a mock student account for biometric authentication
    const newStudent = {
      id: biometricData.id,
      name: `Student User`,
      email: `${biometricData.type}@biometric.local`,
      password: '',
      academicLevel: 'Second Year',
      subjects: [...subjectsByLevel['Second Year']],
    }
    
    store.registerStudent(newStudent)
    setCurrentStudent(newStudent)
    setIsAuthenticated(true)
    
    toast.success(`Welcome! Authenticated via ${biometricData.type}`)
  }

  const handleBiometricError = (error: string) => {
    setError(error)
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      if (!supabase) {
        setError("Authentication service unavailable. Please try again later.")
        return
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      
      if (error) {
        setError(error.message)
      }
      // Note: The actual authentication will happen after redirect
    } catch (error) {
      setError("Failed to sign in with Google. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      if (!supabase) {
        setError("Authentication service unavailable. Please try again later.")
        return
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        setError(error.message)
      }
      // Note: The actual authentication will happen after redirect
    } catch (error) {
      setError("Failed to sign in with Apple. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log('[Student Auth] Attempting login...', { email: loginEmail })
      const result = await authService.login({ email: loginEmail, password: loginPassword })

      if (result.success && result.user) {
        console.log('[Student Auth] Login successful:', result.user)
        
        // Check if user is student
        if (result.user.role !== 'student') {
          setError("Access denied. Student credentials required.")
          setIsLoading(false)
          return
        }

        // Load student profile from Supabase with subjects
        const supabase = createClient()
        let studentSubjects = [...(subjectsByLevel[result.user.academicLevel as keyof typeof subjectsByLevel] || subjectsByLevel['Second Year'])]
        
        if (supabase) {
          try {
            // Get student profile with subjects from Supabase
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', result.user.id)
              .eq('role', 'student')
              .single()
              
            if (profile && profile.subjects && profile.subjects.length > 0) {
              studentSubjects = profile.subjects
              console.log('[Student Auth] Loaded subjects from Supabase:', studentSubjects)
            } else {
              console.log('[Student Auth] No subjects in Supabase, using default for level:', result.user.academicLevel)
            }
          } catch (error) {
            console.warn('[Student Auth] Failed to load profile from Supabase:', error)
          }
        }
        
        // Convert to student format with proper subjects
        const student = {
          id: result.user.id,
          name: result.user.fullName,
          email: result.user.email,
          password: loginPassword,
          academicLevel: result.user.academicLevel || 'Second Year',
          subjects: studentSubjects
        }
        
        // Register student in the attendance store (ensures local sync)
        await store.registerStudent(student)
        setCurrentStudent(student)
        setIsAuthenticated(true)
        
        toast.success(`Welcome back, ${result.user.fullName}!`)
        console.log('[Student Auth] Student logged in successfully with subjects:', studentSubjects)
      } else {
        setError(result.error || "Authentication failed")
      }
    } catch (error) {
      console.error('[Student Auth] Login error:', error)
      setError("An error occurred during authentication")
    }

    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!regAcademicLevel) {
      setError("Please select your academic level")
      setIsLoading(false)
      return
    }

    if (regSubjects.length === 0) {
      setError("Please select at least one subject")
      setIsLoading(false)
      return
    }

    try {
      console.log('[Student Auth] Attempting registration...', { name: regName, email: regEmail, level: regAcademicLevel })
      
      // First register with auth service (creates user account)
      const result = await authService.signup({
        fullName: regName,
        email: regEmail,
        password: regPassword,
        role: 'student',
        academicLevel: regAcademicLevel
      })

      if (result.success && result.user) {
        console.log('[Student Auth] Registration successful:', result.user)
        
        // Convert to student format
        const student = {
          id: result.user.id,
          name: result.user.fullName,
          email: result.user.email,
          password: regPassword,
          academicLevel: regAcademicLevel,
          subjects: [...regSubjects]
        }
        
        // Register student in the attendance store with Supabase sync
        await store.registerStudent(student)
        
        // IMPORTANT: Also save to Supabase profiles table with subjects
        const supabase = createClient()
        if (supabase) {
          try {
            // Update profile with subjects info
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: result.user.id,
                email: result.user.email,
                full_name: result.user.fullName,
                role: 'student',
                academic_level: regAcademicLevel,
                subjects: regSubjects, // Save selected subjects
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              
            if (profileError) {
              console.warn('Failed to save profile to Supabase:', profileError)
            } else {
              console.log('Student profile saved to Supabase with subjects:', regSubjects)
            }
          } catch (error) {
            console.warn('Failed to sync profile to Supabase:', error)
          }
        }
        
        setCurrentStudent(student)
        setIsAuthenticated(true)
        
        toast.success(`Welcome, ${result.user.fullName}! Your account has been created and linked to Supabase.`)
        console.log('[Student Auth] Student registered successfully with subjects:', regSubjects)
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (error) {
      console.error('[Student Auth] Registration error:', error)
      setError("An error occurred during registration")
    }

    setIsLoading(false)
  }

  const handleSubjectToggle = (subject: string) => {
    setRegSubjects((prev) => (prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]))
  }

  if (isAuthenticated && currentStudent) {
    return <StudentDashboard student={currentStudent} onLogout={() => setIsAuthenticated(false)} />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Role Selection
        </Button>

        {/* Auth Card */}
        <Card className="border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Student Access</CardTitle>
              <CardDescription>Login to your account or register as a new student</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {/* Social authentication completely disabled */}
            {/* Only email/password authentication available */}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@student.zu.edu.eg"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {error}
                        {error.includes('Email not confirmed') && (
                          <div className="mt-2 text-xs">
                            <strong>Note:</strong> This system uses direct email/password authentication. 
                            Email verification is not required for registration.
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>

                    {/* Social authentication removed */}
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="your.email@student.zu.edu.eg"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Create a secure password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                      >
                        {showRegPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="academic-level">Academic Level</Label>
                    <Select value={regAcademicLevel} onValueChange={setRegAcademicLevel} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your academic level" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="w-4 h-4" />
                              <span>{level}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {regAcademicLevel && (
                    <div className="space-y-2">
                      <Label>Select Subjects</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {subjectsByLevel[regAcademicLevel as keyof typeof subjectsByLevel]?.map((subject) => (
                          <div key={subject} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={subject}
                              checked={regSubjects.includes(subject)}
                              onChange={() => handleSubjectToggle(subject)}
                              className="rounded border-border"
                            />
                            <Label htmlFor={subject} className="text-sm flex items-center space-x-2 cursor-pointer">
                              <BookOpen className="w-3 h-3" />
                              <span>{subject}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {error}
                        {error.includes('Email not confirmed') && (
                          <div className="mt-2 text-xs">
                            <strong>Note:</strong> This system uses direct email/password authentication. 
                            Email verification is not required for registration.
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
