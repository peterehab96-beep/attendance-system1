"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  LogOut,
  QrCode,
  History,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle,
  BarChart3,
  Award,
} from "lucide-react"
import { QRScanner } from "@/components/qr-scanner"
import { AttendanceHistory } from "@/components/attendance-history"
import { StudentProfile } from "@/components/student-profile"
import { StudentGrades } from "@/components/student-grades"
import { useAttendanceStore } from "@/lib/attendance-store"
import { createClient } from "@/lib/supabase/client"

interface Student {
  id: string
  name: string
  email: string
  password: string
  academicLevel: string
  subjects: string[]
}

interface StudentDashboardProps {
  student: Student
  onLogout: () => void
}

export function StudentDashboard({ student, onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState("scanner")
  const store = useAttendanceStore()
  const attendanceRecords = store.getStudentAttendanceRecords(student.id)
  const stats = store.getStudentStats(student.id)

  // Load student attendance data when component mounts
  useEffect(() => {
    console.log('[Student Dashboard] Loading attendance data for student:', student.id)
    // Data will be loaded through the attendance store automatically
  }, [student.id])

  const handleSuccessfulScan = async (qrData: string) => {
    try {
      console.log('[Student Dashboard] Processing QR scan...', qrData.substring(0, 50))
      
      // Parse QR data to get subject info
      let qrParsed
      try {
        qrParsed = JSON.parse(qrData)
      } catch (error) {
        console.error('[Student Dashboard] Invalid QR code format:', error)
        return { success: false, message: "Invalid QR code format" }
      }
      
      const result = await store.markAttendance(qrData, {
        studentId: student.id,
        studentName: student.name,
        email: student.email,
        academicLevel: student.academicLevel,
        subject: qrParsed.subject || 'General Subject',
      })

      console.log('[Student Dashboard] Attendance marking result:', result)
      return result
    } catch (error) {
      console.error('[Student Dashboard] Error in handleSuccessfulScan:', error)
      return { success: false, message: error instanceof Error ? error.message : "Failed to process QR code" }
    }
  }

  const navigationItems = [
    { id: "scanner", label: "QR Scanner", icon: QrCode },
    { id: "history", label: "Attendance History", icon: History },
    { id: "grades", label: "My Grades", icon: Award },
    { id: "profile", label: "My Profile", icon: User },
    { id: "analytics", label: "My Analytics", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{student.name}</h1>
                <p className="text-sm text-muted-foreground">{student.academicLevel}</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="text-sm text-muted-foreground">Student Portal</div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Attendance:</span>
                <span className="font-medium text-foreground">{stats.attendanceRate}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Avg Score:</span>
                <span className="font-medium text-foreground">{stats.averageScore}</span>
              </div>
            </div>

            <ThemeToggle />

            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r border-border bg-card p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              )
            })}
          </div>

          {/* Student Info Card */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">{student.academicLevel}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">{student.subjects.length} Subjects</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">{stats.attendedSessions} Sessions</span>
              </div>
            </CardContent>
          </Card>

          {/* Subjects List */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">My Subjects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {student.subjects.map((subject, index) => (
                <Badge key={index} variant="secondary" className="text-xs block text-center py-1">
                  {subject}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "scanner" && <QRScanner student={student} onSuccessfulScan={handleSuccessfulScan} />}

          {activeTab === "history" && <AttendanceHistory records={attendanceRecords} student={student} />}

          {activeTab === "grades" && <StudentGrades studentId={student.id} />}

          {activeTab === "profile" && <StudentProfile student={student} />}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">My Analytics</h2>
                <p className="text-muted-foreground">Overview of your attendance performance and progress</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stats.totalSessions}</div>
                    <div className="text-sm text-muted-foreground">All subjects</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Attended</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">{stats.attendedSessions}</div>
                    <div className="text-sm text-muted-foreground">Sessions present</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stats.attendanceRate}%</div>
                    <div className="text-sm text-muted-foreground">Overall performance</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stats.averageScore}</div>
                    <div className="text-sm text-muted-foreground">Points per session</div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance by Subject */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Subject</CardTitle>
                  <CardDescription>Your attendance record for each enrolled subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.subjects.map((subject) => {
                      const subjectRecords = attendanceRecords.filter((record) => record.subject === subject)
                      const subjectSessions = subjectRecords.length + 1 // Including some potential missed sessions
                      const subjectAttendance = subjectRecords.length
                      const subjectRate = Math.round((subjectAttendance / subjectSessions) * 100)

                      return (
                        <div key={subject} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-foreground">{subject}</div>
                              <div className="text-sm text-muted-foreground">
                                {subjectAttendance}/{subjectSessions} sessions
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-foreground">{subjectRate}%</div>
                            <Badge
                              variant={subjectRate >= 80 ? "default" : subjectRate >= 60 ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {subjectRate >= 80 ? "Excellent" : subjectRate >= 60 ? "Good" : "Needs Improvement"}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
