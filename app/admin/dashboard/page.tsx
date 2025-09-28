"use client"

/*
 * Admin Dashboard Page
 * Complete QR code generation and attendance monitoring interface for instructors.
 * 
 * Features:
 * - QR code generation with real qrcode library
 * - Subject and academic level selection
 * - Real-time attendance monitoring
 * - Session management
 * - Integration with Supabase database
 * - Responsive design with shadcn/ui components
 */

import { useState, useEffect } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  QrCode, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  FileText,
  Settings,
  Shield
} from "lucide-react"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { AttendanceMonitor } from "@/components/attendance-monitor"
import { useRouter } from "next/navigation"
import { useAttendanceStore } from "@/lib/attendance-store"
import { academicLevels, subjectsByLevel } from "@/lib/subjects-data"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface AdminData {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("qr-generator")
  const [sessionsToday, setSessionsToday] = useState(0)
  const [totalAttendees, setTotalAttendees] = useState(0)
  
  const store = useAttendanceStore()
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [allSessions, setAllSessions] = useState<any[]>([])

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }
    
    loadAdminData()
    loadDashboardStats()
    
    // Load sessions from store
    const loadSessions = () => {
      setCurrentSession(store.getActiveSession())
      setAllSessions(store.getAllSessions())
    }
    
    loadSessions()
    
    // Set up interval to refresh sessions
    const interval = setInterval(loadSessions, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadAdminData = async () => {
    try {
      // Ensure we're on the client side
      if (typeof window === 'undefined') {
        return
      }
      
      // Load admin data from localStorage
      const localAdmin = localStorage.getItem('currentAdmin')
      
      if (localAdmin) {
        const adminData = JSON.parse(localAdmin)
        setAdmin(adminData)
        console.log("[Admin Dashboard] Loaded admin data:", adminData.name)
      } else {
        // For demo, create a default admin
        const defaultAdmin = {
          id: 'admin-demo-001',
          name: 'Dr. Ahmed Hassan',
          email: 'admin@demo.com',
          role: 'admin'
        }
        setAdmin(defaultAdmin)
        localStorage.setItem('currentAdmin', JSON.stringify(defaultAdmin))
        console.log("[Admin Dashboard] Created demo admin")
      }
    } catch (error) {
      console.error("[Admin Dashboard] Error loading admin data:", error)
      toast.error("Failed to load admin data")
    } finally {
      setIsLoading(false)
    }
  }

  const loadDashboardStats = async () => {
    try {
      // Ensure we're on the client side
      if (typeof window === 'undefined') {
        return
      }
      
      // Try to load stats from Supabase if available
      const supabase = createClient()
      
      if (supabase) {
        // Get today's sessions
        const today = new Date().toISOString().split('T')[0]
        
        const { data: sessions, error: sessionsError } = await supabase
          .from('attendance_sessions')
          .select('id')
          .eq('session_date', today)
          .eq('is_active', true)

        if (!sessionsError && sessions) {
          setSessionsToday(sessions.length)
        }

        // Get total attendees today
        const { data: attendees, error: attendeesError } = await supabase
          .from('attendance_records')
          .select('id')
          .gte('check_in_time', `${today}T00:00:00Z`)
          .lt('check_in_time', `${today}T23:59:59Z`)

        if (!attendeesError && attendees) {
          setTotalAttendees(attendees.length)
        }

        console.log("[Admin Dashboard] Loaded stats from Supabase")
        return
      }

      // Fallback to localStorage stats
      const localSessions = allSessions.filter(session => {
        const sessionDate = new Date(session.createdAt).toDateString()
        const today = new Date().toDateString()
        return sessionDate === today
      })
      
      setSessionsToday(localSessions.length)
      
      const totalAttendance = localSessions.reduce((sum, session) => 
        sum + (session.attendees?.length || 0), 0
      )
      setTotalAttendees(totalAttendance)
      
      console.log("[Admin Dashboard] Loaded stats from localStorage")
      
    } catch (error) {
      console.warn("[Admin Dashboard] Could not load stats:", error)
    }
  }

  const handleSessionCreated = async (sessionData: any) => {
    try {
      // Update local store
      store.createSession(sessionData)
      
      // Reload stats
      await loadDashboardStats()
      
      toast.success("QR session created successfully!", {
        description: `Session for ${sessionData.subject} is now active`,
        duration: 4000
      })
    } catch (error) {
      console.error("[Admin Dashboard] Error creating session:", error)
      toast.error("Failed to create session")
    }
  }

  const handleEndSession = async () => {
    if (currentSession) {
      try {
        // End session in local store
        store.endSession(currentSession.id)
        
        // Update local state
        setCurrentSession(null)
        
        // Try to update in Supabase
        const supabase = createClient()
        
        if (supabase) {
          await supabase
            .from('attendance_sessions')
            .update({ is_active: false })
            .eq('id', currentSession.id)
        }
        
        toast.success("Session ended successfully")
        await loadDashboardStats()
      } catch (error) {
        console.error("[Admin Dashboard] Error ending session:", error)
        toast.error("Failed to end session")
      }
    }
  }

  const navigateToReports = () => {
    toast.info("Reports feature coming soon!")
  }

  const navigateToSettings = () => {
    toast.info("Settings feature coming soon!")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Admin Not Found</CardTitle>
            <CardDescription>
              Please log in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {admin.name}</p>
            </div>
            
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Shield className="w-3 h-3 mr-1" />
              {admin.role}
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <QrCode className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{sessionsToday}</p>
                    <p className="text-sm text-muted-foreground">Sessions Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{totalAttendees}</p>
                    <p className="text-sm text-muted-foreground">Total Attendees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                  <div>
                    <p className="text-2xl font-bold">{currentSession ? "1" : "0"}</p>
                    <p className="text-sm text-muted-foreground">Active Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{allSessions.length}</p>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Session Alert */}
          {currentSession && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  <strong>Active Session:</strong> {currentSession.subject} - {currentSession.academicLevel}
                  <br />
                  <span className="text-sm">
                    {currentSession.attendees?.length || 0} students attended • Expires: {new Date(currentSession.expiresAt).toLocaleTimeString()}
                  </span>
                </span>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleEndSession}
                  className="ml-4"
                >
                  End Session
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="qr-generator" className="flex items-center space-x-2">
                <QrCode className="w-4 h-4" />
                <span>QR Generator</span>
              </TabsTrigger>
              <TabsTrigger value="monitor" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Live Monitor</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Reports</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qr-generator" className="space-y-6">
              <QRCodeGenerator
                academicLevels={[...academicLevels]}
                subjectsByLevel={Object.fromEntries(
                  Object.entries(subjectsByLevel).map(([key, value]) => [key, [...value]])
                )}
                onSessionCreated={handleSessionCreated}
                hasActiveSession={!!currentSession}
              />
            </TabsContent>

            <TabsContent value="monitor" className="space-y-6">
              <AttendanceMonitor 
                currentSession={currentSession} 
                onEndSession={handleEndSession} 
              />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Attendance Reports</span>
                  </CardTitle>
                  <CardDescription>
                    Generate and download attendance reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Reports Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    Advanced reporting features are under development
                  </p>
                  <Button onClick={navigateToReports}>
                    Request Early Access
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>System Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure attendance system preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Settings Panel</h3>
                  <p className="text-muted-foreground mb-6">
                    Advanced configuration options coming soon
                  </p>
                  <Button onClick={navigateToSettings}>
                    Configure System
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  )
}