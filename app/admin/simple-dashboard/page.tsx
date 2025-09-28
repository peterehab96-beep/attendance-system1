"use client"

/*
 * Simple Admin Dashboard Page
 * A completely new, simplified QR code system for attendance tracking
 * Works on all devices and browsers with minimal complexity
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  QrCode, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Users,
  BookOpen
} from "lucide-react"
import { toast } from "sonner"
import QRCode from "qrcode"
import { useRouter } from "next/navigation"

interface SimpleSession {
  id: string
  subject: string
  academicLevel: string
  qrCodeData: string
  createdAt: Date
  expiresAt: Date
  isActive: boolean
}

export default function SimpleAdminDashboard() {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [generatedQR, setGeneratedQR] = useState<string | null>(null)
  const [currentSession, setCurrentSession] = useState<SimpleSession | null>(null)
  const [attendees, setAttendees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Simple subject data
  const academicLevels = ["First Year", "Second Year", "Third Year", "Fourth Year"]
  
  const subjectsByLevel = {
    "First Year": [
      "Western Rules & Solfege 1",
      "Western Rules & Solfege 2", 
      "Rhythmic Movement 1"
    ],
    "Second Year": [
      "Western Rules & Solfege 3",
      "Western Rules & Solfege 4",
      "Hymn Singing",
      "Rhythmic Movement 2"
    ],
    "Third Year": [
      "Western Rules & Solfege 5",
      "Improvisation 1"
    ],
    "Fourth Year": [
      "Western Rules & Solfege 6", 
      "Improvisation 2"
    ]
  }

  // Generate a simple QR code for attendance
  const generateSimpleQR = async () => {
    if (!selectedSubject || !selectedLevel) {
      toast.error("Please select both subject and academic level")
      return
    }

    setIsLoading(true)
    
    try {
      // Create simple session data
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const sessionData = {
        sessionId: sessionId,
        subject: selectedSubject,
        academicLevel: selectedLevel,
        timestamp: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
      }
      
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(sessionData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      
      // Create session object
      const newSession: SimpleSession = {
        id: sessionId,
        subject: selectedSubject,
        academicLevel: selectedLevel,
        qrCodeData: JSON.stringify(sessionData),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + (5 * 60 * 1000)),
        isActive: true
      }
      
      // Save to localStorage
      localStorage.setItem('current_simple_session', JSON.stringify(newSession))
      localStorage.setItem('simple_attendees', JSON.stringify([]))
      
      // Update state
      setGeneratedQR(qrCodeDataUrl)
      setCurrentSession(newSession)
      setAttendees([])
      
      toast.success("QR Code Generated!", {
        description: `Valid for 5 minutes - ${selectedSubject}`,
        duration: 4000
      })
      
    } catch (error) {
      console.error("Error generating QR:", error)
      toast.error("Failed to generate QR code")
    } finally {
      setIsLoading(false)
    }
  }

  // Load existing session if available
  useEffect(() => {
    const savedSession = localStorage.getItem('current_simple_session')
    const savedAttendees = localStorage.getItem('simple_attendees')
    
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        setCurrentSession({
          ...session,
          createdAt: new Date(session.createdAt),
          expiresAt: new Date(session.expiresAt)
        })
        
        // Generate QR code for existing session
        QRCode.toDataURL(session.qrCodeData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        }).then(url => setGeneratedQR(url)).catch(console.error)
      } catch (e) {
        console.error("Error loading session:", e)
      }
    }
    
    if (savedAttendees) {
      try {
        setAttendees(JSON.parse(savedAttendees))
      } catch (e) {
        console.error("Error loading attendees:", e)
      }
    }
  }, [])

  // Simulate real-time attendance updates
  useEffect(() => {
    if (!currentSession) return
    
    const interval = setInterval(() => {
      const savedAttendees = localStorage.getItem('simple_attendees')
      if (savedAttendees) {
        try {
          setAttendees(JSON.parse(savedAttendees))
        } catch (e) {
          console.error("Error updating attendees:", e)
        }
      }
    }, 2000) // Check every 2 seconds
    
    return () => clearInterval(interval)
  }, [currentSession])

  // End current session
  const endSession = () => {
    localStorage.removeItem('current_simple_session')
    setCurrentSession(null)
    setGeneratedQR(null)
    setAttendees([])
    setSelectedSubject("")
    setSelectedLevel("")
    toast.success("Session ended")
  }

  // Format time remaining
  const getTimeRemaining = () => {
    if (!currentSession) return "00:00"
    
    const now = Date.now()
    const remaining = currentSession.expiresAt.getTime() - now
    
    if (remaining <= 0) return "Expired"
    
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Simple Attendance System</h1>
            <p className="text-muted-foreground">Generate QR codes for student attendance</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>

        {/* Session Status */}
        {currentSession && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="font-medium">Active Session:</span> {currentSession.subject} - {currentSession.academicLevel}
                <br />
                <span className="text-sm text-muted-foreground">
                  {attendees.length} students attended • Expires in: {getTimeRemaining()}
                </span>
              </div>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={endSession}
              >
                End Session
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Generation Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Generate Attendance QR
              </CardTitle>
              <CardDescription>
                Create a QR code for students to scan and mark attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Academic Level Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Academic Level</label>
                <Select 
                  value={selectedLevel} 
                  onValueChange={setSelectedLevel}
                  disabled={!!currentSession}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic level" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select 
                  value={selectedSubject} 
                  onValueChange={setSelectedSubject}
                  disabled={!selectedLevel || !!currentSession}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedLevel && subjectsByLevel[selectedLevel as keyof typeof subjectsByLevel]?.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              {!currentSession ? (
                <Button 
                  onClick={generateSimpleQR} 
                  disabled={!selectedSubject || !selectedLevel || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate QR Code
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={endSession} 
                  variant="outline"
                  className="w-full"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  End Current Session
                </Button>
              )}
            </CardContent>
          </Card>

          {/* QR Display Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Attendance QR Code
              </CardTitle>
              <CardDescription>
                Students scan this code to mark attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedQR ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg border">
                      <img 
                        src={generatedQR} 
                        alt="Attendance QR Code" 
                        className="w-48 h-48 sm:w-64 sm:h-64"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Subject:</span>
                      <Badge variant="secondary">{currentSession?.subject}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Expires:</span>
                      <Badge variant="outline">{getTimeRemaining()}</Badge>
                    </div>
                  </div>
                  
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>
                      Show this QR code to students. They have 5 minutes to scan it for attendance.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                  <QrCode className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">No QR Code Generated</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a subject and academic level to generate a QR code
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attendance Monitor */}
        {currentSession && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Attendance Monitor
              </CardTitle>
              <CardDescription>
                Students who have scanned the QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendees.length > 0 ? (
                <div className="space-y-3">
                  {attendees.map((attendee: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{attendee.name || "Student"}</p>
                        <p className="text-sm text-muted-foreground">
                          {attendee.email || "No email"} • {new Date(attendee.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Present
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                  <Users className="w-8 h-8 text-muted-foreground" />
                  <h3 className="font-medium">No Attendees Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Students will appear here after scanning the QR code
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}