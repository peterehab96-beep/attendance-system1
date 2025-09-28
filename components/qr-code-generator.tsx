"use client"

/*
 * Installation instructions:
 * npm install qrcode @types/qrcode react-qr-code
 * 
 * This component generates real QR codes using the 'qrcode' library
 * and stores session data in Supabase for verification.
 */

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { QrCode, RefreshCw, Download, Copy, CheckCircle, AlertCircle, Clock, Users } from "lucide-react"
import { toast } from "sonner"
import QRCodeLib from "qrcode"
import { createClient } from "@/lib/supabase/client"

interface QRSessionData {
  sessionId: string
  token: string
  academicLevel: string
  subject: string
  timestamp: number
  expiresAt: number
  instructorId?: string
}

interface QRCodeGeneratorProps {
  academicLevels: string[]
  subjectsByLevel: Record<string, string[]>
  onSessionCreated: (session: any) => void
  hasActiveSession: boolean
}

export function QRCodeGenerator({
  academicLevels,
  subjectsByLevel,
  onSessionCreated,
  hasActiveSession,
}: QRCodeGeneratorProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [generatedQR, setGeneratedQR] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<QRSessionData | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQRCode = async () => {
    if (!selectedLevel || !selectedSubject) {
      toast.error("Please select both academic level and subject")
      return
    }

    setIsGenerating(true)
    console.log("[QR Generator] Starting QR code generation...")

    try {
      // Generate secure session data
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const secureToken = crypto.randomUUID() + Date.now().toString(36)
      const expiryTime = Date.now() + (5 * 60 * 1000) // 5 minutes as requested
      
      const qrSessionData: QRSessionData = {
        sessionId,
        token: secureToken,
        academicLevel: selectedLevel,
        subject: selectedSubject,
        timestamp: Date.now(),
        expiresAt: expiryTime,
      }

      const qrDataString = JSON.stringify(qrSessionData)
      console.log("[QR Generator] Session data created:", { sessionId, subject: selectedSubject, expiresIn: '5 minutes' })

      // Generate QR code as data URL using qrcode library
      const qrCodeDataUrl = await QRCodeLib.toDataURL(qrDataString, {
        width: 512,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })

      console.log("[QR Generator] QR code generated successfully")

      // Save session to Supabase
      const supabaseSession = {
        id: sessionId,
        qr_data: qrDataString,
        subject_name: selectedSubject,
        academic_level: selectedLevel,
        token: secureToken,
        expires_at: new Date(expiryTime).toISOString(),
        session_date: new Date().toISOString().split('T')[0],
        session_time: new Date().toTimeString().split(' ')[0],
        session_type: 'lecture',
        is_active: true,
        instructor_id: 'demo-instructor-id' // In real app, get from auth
      }

      // Try to save to Supabase, fallback to local storage
      try {
        // Create Supabase client for this operation
        const supabase = createClient()
        
        if (supabase) {
          const { data, error } = await supabase
            .from('attendance_sessions')
            .insert([supabaseSession])
            .select()
            .single()

          if (error) throw error
          console.log("[QR Generator] Session saved to Supabase:", data.id)
          toast.success("QR session saved to database")
        } else {
          throw new Error("Supabase not configured")
        }
      } catch (supabaseError) {
        console.warn("[QR Generator] Supabase save failed, using local storage:", supabaseError)
        // Fallback to local storage for demo
        localStorage.setItem(`qr_session_${sessionId}`, JSON.stringify(supabaseSession))
        toast.info("QR session saved locally (demo mode)")
      }

      // Update component state
      setGeneratedQR(qrCodeDataUrl)
      setQrCodeDataUrl(qrCodeDataUrl)
      setSessionData(qrSessionData)

      // Create session object for local state management
      const localSession = {
        id: sessionId,
        academicLevel: selectedLevel,
        subject: selectedSubject,
        qrCode: qrDataString,
        token: secureToken,
        expiresAt: new Date(expiryTime),
        createdAt: new Date(),
        isActive: true,
        attendees: [],
      }

      // Notify parent component
      await onSessionCreated(localSession)
      
      toast.success("QR Code generated successfully!", {
        description: `Valid for 5 minutes - ${selectedSubject}`,
        duration: 4000
      })

    } catch (error: any) {
      console.error("[QR Generator] Error generating QR code:", error)
      toast.error("Failed to generate QR code", {
        description: error.message || "Please try again"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyQRData = async () => {
    if (!sessionData) return

    try {
      const qrDataString = JSON.stringify(sessionData)
      await navigator.clipboard.writeText(qrDataString)
      setCopied(true)
      toast.success("QR data copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy QR data:", err)
      toast.error("Failed to copy QR data")
    }
  }

  const downloadQR = async () => {
    if (!qrCodeDataUrl || !sessionData) {
      toast.error('No QR code to download')
      return
    }

    try {
      // Create download link with data URL
      const link = document.createElement("a")
      const filename = `qr-attendance-${sessionData.subject.replace(/\s+/g, "-")}-${sessionData.academicLevel.replace(/\s+/g, "-")}-${new Date().toISOString().split('T')[0]}.png`
      
      link.href = qrCodeDataUrl
      link.download = filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('QR code downloaded!', {
        description: `Saved as ${filename}`,
        duration: 3000,
      })
      
    } catch (error: any) {
      console.error("Download failed:", error)
      toast.error('Download failed', {
        description: 'Please right-click the QR code and select "Save image as..."',
        duration: 5000,
      })
    }
  }

  const resetGenerator = () => {
    setSelectedLevel("")
    setSelectedSubject("")
    setGeneratedQR(null)
    setSessionData(null)
    setQrCodeDataUrl(null)
    setCopied(false)
    console.log("[QR Generator] Reset generator state")
  }

  const formatTimeRemaining = () => {
    if (!sessionData) return "--:--"
    
    const now = Date.now()
    const remaining = sessionData.expiresAt - now
    
    if (remaining <= 0) return "Expired"
    
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">QR Code Generator</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Generate unique QR codes for attendance tracking sessions
        </p>
      </div>

      {hasActiveSession && !generatedQR && (
        <Alert className="mx-4 sm:mx-0">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-sm">
            You have an active session running. End the current session before creating a new one, or continue with the
            existing session.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Configuration Panel */}
        <Card className="mx-4 sm:mx-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <QrCode className="w-4 w-4 sm:w-5 sm:h-5 mr-2" />
              Session Configuration
            </CardTitle>
            <CardDescription className="text-sm">
              Select the academic level and subject for the attendance session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Academic Level Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Academic Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full">
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
              <label className="text-sm font-medium text-foreground">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {selectedLevel &&
                    subjectsByLevel[selectedLevel]?.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="pt-2 sm:pt-4">
              <Button
                onClick={generateQRCode}
                disabled={!selectedLevel || !selectedSubject || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating QR Code...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </div>

            {generatedQR && (
              <div className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyQRData}
                    className="bg-transparent text-xs sm:text-sm"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadQR}
                    className="bg-transparent text-xs sm:text-sm"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Download
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetGenerator}
                  className="w-full bg-transparent text-xs sm:text-sm"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Generate New QR
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <Card className="mx-4 sm:mx-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Generated QR Code</CardTitle>
            <CardDescription className="text-sm">Students will scan this code to mark their attendance</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedQR ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 sm:p-4 bg-white rounded-lg border-2 border-dashed border-border">
                    <img
                      src={qrCodeDataUrl || "/placeholder.svg"}
                      alt="Attendance QR Code"
                      className="w-48 h-48 sm:w-64 sm:h-64 max-w-full"
                      style={{
                        imageRendering: 'pixelated'
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Session ID:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {sessionData?.sessionId.slice(-8)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Level:</span>
                    <Badge variant="secondary" className="text-xs">
                      {selectedLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Subject:</span>
                    <Badge variant="secondary" className="text-xs max-w-32 sm:max-w-none truncate">
                      {selectedSubject}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Expires in:</span>
                    <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeRemaining()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Status:</span>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                      Active
                    </Badge>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    QR code is ready! Students can scan this code to mark attendance. 
                    <strong>Valid for 5 minutes only.</strong>
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2 px-4">
                  <h3 className="font-medium text-foreground text-sm sm:text-base">No QR Code Generated</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Select an academic level and subject, then click "Generate QR Code" to create a new attendance
                    session.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}