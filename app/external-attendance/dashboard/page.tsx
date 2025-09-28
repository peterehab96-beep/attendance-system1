"use client"

/*
 * External Attendance Dashboard
 * This is the new system where students are redirected after scanning QR codes
 * with their phone's native camera app
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  AlertCircle, 
  Clock,
  User,
  LogOut,
  Award,
  Calendar,
  TrendingUp
} from "lucide-react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface StudentUser {
  id: string
  name: string
  email: string
  role: string
  academicLevel: string
  subjects: string[]
}

interface AttendanceRecord {
  id: string
  session_id: string
  student_id: string
  student_name: string
  student_email: string
  subject_name: string
  check_in_time: string
  grade_points: number
  attendance_sessions?: {
    subject_name: string
    academic_level: string
    session_date: string
    session_time: string
  }
}

export default function ExternalAttendanceDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [student, setStudent] = useState<StudentUser | null>(null)
  const [attendanceStatus, setAttendanceStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState({
    totalAttendance: 0,
    averageGrade: 0,
    attendanceRate: 0
  })

  // Load student data and process attendance
  useEffect(() => {
    const processAttendance = async () => {
      try {
        // Get session info from URL
        const sessionId = searchParams.get('sessionId')
        const token = searchParams.get('token')
        
        // Load student data from localStorage
        const localStudent = localStorage.getItem('current_simple_student')
        if (!localStudent) {
          // Redirect to login if no student data
          router.push('/simple-auth/student/login')
          return
        }
        
        const studentData = JSON.parse(localStudent)
        setStudent(studentData)
        
        // If we have session info, process attendance
        if (sessionId && token) {
          await recordAttendance(sessionId, studentData)
        }
        
        // Load attendance history and stats
        await loadAttendanceHistory(studentData.id)
        await loadStudentStats(studentData.id)
        
      } catch (error) {
        console.error("[External Attendance] Error:", error)
        setAttendanceStatus({
          success: false,
          message: "Failed to process attendance. Please try again."
        })
      } finally {
        setIsLoading(false)
      }
    }

    processAttendance()
  }, [router, searchParams])

  const recordAttendance = async (sessionId: string, studentData: StudentUser) => {
    try {
      // Get Supabase client
      const supabase = createClient()
      
      if (!supabase) {
        setAttendanceStatus({
          success: false,
          message: "Failed to connect to database. Please try again."
        })
        return
      }
      
      // Get session details to validate and get subject info
      const { data: session, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('subject_name, academic_level')
        .eq('id', sessionId)
        .single()
      
      if (sessionError) {
        setAttendanceStatus({
          success: false,
          message: "Invalid session. Please scan a valid QR code."
        })
        return
      }
      
      // Check if student already attended this session
      const { data: existingRecord, error: checkError } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('session_id', sessionId)
        .eq('student_id', studentData.id)
        .single()
      
      if (existingRecord) {
        setAttendanceStatus({
          success: false,
          message: "You have already marked attendance for this session."
        })
        return
      }
      
      // Insert attendance record
      const { error: insertError } = await supabase
        .from('attendance_records')
        .insert({
          session_id: sessionId,
          student_id: studentData.id,
          student_name: studentData.name,
          student_email: studentData.email,
          subject_name: session.subject_name,
          check_in_time: new Date().toISOString(),
          method: 'external_scan',
          status: 'present',
          grade_points: 10.0 // Default grade
        })
      
      if (insertError) {
        throw insertError
      }
      
      // Success
      setAttendanceStatus({
        success: true,
        message: `Attendance marked successfully for ${session.subject_name}!`
      })
      
      toast.success("Attendance Marked!", {
        description: `You earned 10 points for ${session.subject_name}`,
        duration: 4000
      })
      
      // Reload data to update stats
      await loadAttendanceHistory(studentData.id)
      await loadStudentStats(studentData.id)
      
    } catch (error) {
      console.error("[External Attendance] Error recording attendance:", error)
      setAttendanceStatus({
        success: false,
        message: "Failed to record attendance. Please try again."
      })
    }
  }

  const loadAttendanceHistory = async (studentId: string) => {
    try {
      const supabase = createClient()
      
      if (supabase) {
        const { data, error } = await supabase
          .from('attendance_records')
          .select(`
            *,
            attendance_sessions (
              subject_name,
              academic_level,
              session_date,
              session_time
            )
          `)
          .eq('student_id', studentId)
          .order('check_in_time', { ascending: false })
          .limit(10)

        if (!error && data) {
          setAttendanceHistory(data)
        }
      }
    } catch (error) {
      console.warn("[External Attendance] Could not load attendance history:", error)
    }
  }

  const loadStudentStats = async (studentId: string) => {
    try {
      const supabase = createClient()
      
      if (supabase) {
        // Get total attendance count
        const { count: totalAttendance, error: countError } = await supabase
          .from('attendance_records')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentId)
        
        // Get average grade
        const { data: grades, error: gradesError } = await supabase
          .from('attendance_records')
          .select('grade_points')
          .eq('student_id', studentId)
        
        if (!countError && !gradesError && grades) {
          const averageGrade = grades.length > 0 
            ? grades.reduce((sum, record) => sum + record.grade_points, 0) / grades.length
            : 0
          
          setStats({
            totalAttendance: totalAttendance || 0,
            averageGrade: parseFloat(averageGrade.toFixed(1)),
            attendanceRate: 100 // Simplified for now
          })
        }
      }
    } catch (error) {
      console.warn("[External Attendance] Could not load student stats:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('current_simple_student')
    router.push('/simple-auth/student/login')
    toast.success("Logged out successfully")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Processing attendance...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Student Not Found</CardTitle>
            <CardDescription>
              Please log in to access your attendance dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/simple-auth/student/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance Dashboard</h1>
            <p className="text-muted-foreground">Your attendance and performance stats</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Attendance Status */}
        {attendanceStatus && (
          <Alert 
            variant={attendanceStatus.success ? "default" : "destructive"} 
            className="mb-6"
          >
            {attendanceStatus.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <AlertDescription>
              {attendanceStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Student Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Welcome, {student.name}
            </CardTitle>
            <CardDescription>
              Student Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{student.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Academic Level</p>
                <Badge variant="secondary">{student.academicLevel}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enrolled Subjects</p>
                <p className="text-sm">{student.subjects.length} subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Attendance</p>
                  <p className="text-2xl font-bold">{stats.totalAttendance}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Grade</p>
                  <p className="text-2xl font-bold">{stats.averageGrade}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance History */}
        {attendanceHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Attendance
              </CardTitle>
              <CardDescription>
                Your last 10 attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceHistory.map((record) => (
                  <div 
                    key={record.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {record.attendance_sessions?.subject_name || record.subject_name || 'Unknown Subject'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.attendance_sessions?.session_date || new Date(record.check_in_time).toLocaleDateString()} at {record.attendance_sessions?.session_time || new Date(record.check_in_time).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Present
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        +{record.grade_points} pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}