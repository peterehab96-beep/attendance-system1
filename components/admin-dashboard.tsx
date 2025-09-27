"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  LogOut,
  QrCode,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Clock,
  CheckCircle,
  Music,
  GraduationCap,
  BookOpen,
  Filter,
  Calculator,
  FileText,
  Shield,
} from "lucide-react"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { AttendanceMonitor } from "@/components/attendance-monitor"
import { GradingConfig } from "@/components/grading-config"
import { AttendanceFilters } from "@/components/attendance-filters"
import { GradingSystem } from "@/components/grading-system"
import { ReportsGenerator } from "@/components/reports-generator"
import { BackupManagement } from "@/components/backup-management"
import { useAttendanceStore } from "@/lib/attendance-store"
import { academicLevels, subjectsByLevel } from "@/lib/subjects-data"

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("qr-generator")
  const store = useAttendanceStore()
  const currentSession = store.getActiveSession()
  const allSessions = store.getAllSessions()
  const stats = store.getSessionStats()

  // Import shared academic levels and subjects data
  // const academicLevels and subjectsByLevel are now imported from lib/subjects-data.ts

  const handleSessionCreated = (sessionData: any) => {
    store.createSession(sessionData)
  }

  const handleEndSession = () => {
    if (currentSession) {
      store.endSession(currentSession.id)
    }
  }

  const navigationItems = [
    { id: "qr-generator", label: "QR Generator", icon: QrCode },
    { id: "monitor", label: "Live Monitor", icon: Users },
    { id: "grading", label: "Grading Config", icon: Settings },
    { id: "grading-system", label: "Grading System", icon: Calculator },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "backup", label: "Backup Management", icon: Shield },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "filters", label: "Data Filters", icon: Filter },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Music className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="text-sm text-muted-foreground">Music Education Attendance System</div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Stats Overview */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sessions:</span>
                <span className="font-medium text-foreground">{stats.totalSessions}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Attendees:</span>
                <span className="font-medium text-foreground">{stats.totalAttendees}</span>
              </div>
              {stats.activeSession && (
                <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Live Session
                </Badge>
              )}
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

          {/* Current Session Info */}
          {currentSession && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Active Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{currentSession.academicLevel}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground text-xs">{currentSession.subject}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground text-xs">{currentSession.createdAt.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-foreground font-medium">{currentSession.attendees.length} Present</span>
                </div>
                <Button size="sm" variant="destructive" className="w-full mt-3" onClick={handleEndSession}>
                  End Session
                </Button>
              </CardContent>
            </Card>
          )}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "qr-generator" && (
            <QRCodeGenerator
              academicLevels={[...academicLevels]}
              subjectsByLevel={Object.fromEntries(
                Object.entries(subjectsByLevel).map(([key, value]) => [key, [...value]])
              )}
              onSessionCreated={handleSessionCreated}
              hasActiveSession={!!currentSession}
            />
          )}

          {activeTab === "monitor" && (
            <AttendanceMonitor currentSession={currentSession} onEndSession={handleEndSession} />
          )}

          {activeTab === "grading" && <GradingConfig />}

          {activeTab === "grading-system" && <GradingSystem />}

          {activeTab === "reports" && <ReportsGenerator />}

          {activeTab === "backup" && <BackupManagement />}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Analytics Dashboard</h2>
                <p className="text-muted-foreground">Overview of attendance patterns and performance metrics</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stats.totalSessions}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Attendees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stats.totalAttendees}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stats.averageAttendance}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stats.activeSession ? 1 : 0}</div>
                  </CardContent>
                </Card>
              </div>

              {allSessions.length === 0 && (
                <Alert>
                  <BarChart3 className="w-4 h-4" />
                  <AlertDescription>
                    No attendance data available yet. Create your first session to see analytics.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {activeTab === "filters" && <AttendanceFilters sessions={allSessions} />}
        </main>
      </div>
    </div>
  )
}
