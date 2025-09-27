"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Clock, CheckCircle, AlertCircle, RefreshCw, UserCheck, Mail, Calendar } from "lucide-react"

interface AttendanceMonitorProps {
  currentSession: any
  onEndSession: () => void
}

export function AttendanceMonitor({ currentSession, onEndSession }: AttendanceMonitorProps) {
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  if (!currentSession) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Live Attendance Monitor</h2>
          <p className="text-muted-foreground">Real-time tracking of student attendance for active sessions</p>
        </div>

        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            No active session found. Please generate a QR code first to start monitoring attendance.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const sessionDuration = Math.floor((Date.now() - currentSession.createdAt.getTime()) / 1000 / 60) // in minutes
  const attendanceCount = currentSession.attendees.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Live Attendance Monitor</h2>
        <p className="text-muted-foreground">Real-time tracking for the current attendance session</p>
      </div>

      {/* Session Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Session Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">{currentSession.academicLevel}</div>
              <div className="text-sm text-muted-foreground">{currentSession.subject}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{sessionDuration}m</div>
            <div className="text-sm text-muted-foreground">Started {currentSession.createdAt.toLocaleTimeString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Attendees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{attendanceCount}</div>
            <div className="text-sm text-muted-foreground">Students present</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Active
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">Session running</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Attendance List
                </CardTitle>
                <CardDescription>Students who have scanned the QR code</CardDescription>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </CardHeader>
            <CardContent>
              {attendanceCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-foreground">Waiting for Students</h3>
                    <p className="text-sm text-muted-foreground">
                      Students will appear here as they scan the QR code for attendance.
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {currentSession.attendees.map((attendee: any, index: number) => (
                      <div
                        key={attendee.studentId}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 animate-fade-in-up"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{attendee.studentName}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {attendee.email}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-foreground">Score: {attendee.score}</div>
                          <div className="text-xs text-muted-foreground">{attendee.scannedAt.toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Session Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Controls</CardTitle>
              <CardDescription>Manage the current attendance session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Session ID:</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {currentSession.id.slice(-8)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-foreground">{currentSession.createdAt.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="text-foreground">{sessionDuration} minutes</span>
                </div>
              </div>

              <Button variant="destructive" className="w-full" onClick={onEndSession}>
                End Session
              </Button>

              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  Ending the session will stop accepting new attendance scans and finalize the attendance record.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Scans:</span>
                <span className="font-medium text-foreground">{attendanceCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Score:</span>
                <span className="font-medium text-foreground">
                  {attendanceCount > 0
                    ? Math.round(
                        (currentSession.attendees.reduce((sum: number, a: any) => sum + a.score, 0) / attendanceCount) *
                          100,
                      ) / 100
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Session Rate:</span>
                <span className="font-medium text-foreground">
                  {sessionDuration > 0 ? Math.round((attendanceCount / sessionDuration) * 100) / 100 : 0} per min
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
