"use client"

/*
 * Simple Student Scanner Page
 * A completely new, simplified QR code scanning system for attendance
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
  Camera,
  Upload,
  Clock,
  User,
  LogOut
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode"

interface StudentUser {
  id: string
  name: string
  email: string
  role: string
  academicLevel: string
  subjects: string[]
}

export default function SimpleStudentScanner() {
  const router = useRouter()
  const [student, setStudent] = useState<StudentUser | null>(null)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Load student data
  useEffect(() => {
    const loadStudentData = () => {
      try {
        const localStudent = localStorage.getItem('current_simple_student')
        if (localStudent) {
          const studentData = JSON.parse(localStudent)
          setStudent(studentData)
          console.log("[Simple Scanner] Loaded student:", studentData.name)
        } else {
          // Redirect to login if no student data
          router.push('/simple-auth/student/login')
        }
      } catch (error) {
        console.error("[Simple Scanner] Error loading student:", error)
        router.push('/simple-auth/student/login')
      }
    }

    loadStudentData()
  }, [router])

  // Handle student logout
  const handleLogout = () => {
    localStorage.removeItem('current_simple_student')
    router.push('/simple-auth/student/login')
    toast.success("Logged out successfully")
  }

  // Start camera scanning
  const startCameraScanning = () => {
    if (!selectedSubject) {
      toast.error("Please select a subject first")
      return
    }

    setIsScanning(true)
    setScanResult(null)
    setIsProcessing(false)
    
    // Clean up any existing scanner
    const existingElement = document.getElementById('qr-reader')
    if (existingElement) {
      existingElement.innerHTML = ''
    }

    try {
      // Initialize scanner
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false
        },
        false
      )

      // Success callback
      const onScanSuccess = (decodedText: string) => {
        if (isProcessing) return
        
        console.log("[Simple Scanner] QR Code detected:", decodedText)
        setIsProcessing(true)
        processQRCode(decodedText)
      }

      // Error callback
      const onScanFailure = (error: string) => {
        // Only log significant errors
        if (!error.includes("No QR code found")) {
          console.warn("[Simple Scanner] Scan error:", error)
        }
      }

      // Start scanning
      scanner.render(onScanSuccess, onScanFailure)
      
      toast.info("Camera started! Point at the QR code.")

    } catch (error) {
      console.error("[Simple Scanner] Camera error:", error)
      setIsScanning(false)
      toast.error("Failed to start camera. Try uploading an image instead.")
    }
  }

  // Stop camera scanning
  const stopCameraScanning = () => {
    setIsScanning(false)
    setScanResult(null)
    
    // Clean up scanner
    const existingElement = document.getElementById('qr-reader')
    if (existingElement) {
      existingElement.innerHTML = ''
    }
  }

  // Process QR code data
  const processQRCode = async (qrData: string) => {
    try {
      // Parse QR data
      let sessionData
      try {
        sessionData = JSON.parse(qrData)
      } catch (parseError) {
        setScanResult({
          success: false,
          message: "Invalid QR code format"
        })
        setIsProcessing(false)
        return
      }

      // Validate session data
      if (!sessionData.sessionId || !sessionData.subject) {
        setScanResult({
          success: false,
          message: "QR code is missing required data"
        })
        setIsProcessing(false)
        return
      }

      // Check if session has expired
      if (Date.now() > sessionData.expiresAt) {
        setScanResult({
          success: false,
          message: "QR code has expired. Please ask your instructor for a new one."
        })
        setIsProcessing(false)
        return
      }

      // Check if student is enrolled in this subject
      if (student && !student.subjects.includes(sessionData.subject)) {
        setScanResult({
          success: false,
          message: `You are not enrolled in ${sessionData.subject}`
        })
        setIsProcessing(false)
        return
      }

      // Check if student has already attended this session
      const attendanceKey = `attendance_${sessionData.sessionId}_${student?.id || 'demo'}`
      if (localStorage.getItem(attendanceKey)) {
        setScanResult({
          success: false,
          message: "You have already marked attendance for this session"
        })
        setIsProcessing(false)
        return
      }

      // Validate subject selection
      if (selectedSubject !== sessionData.subject) {
        setScanResult({
          success: false,
          message: `QR code is for ${sessionData.subject}, but you selected ${selectedSubject}`
        })
        setIsProcessing(false)
        return
      }

      // Record attendance
      const attendanceRecord = {
        sessionId: sessionData.sessionId,
        studentId: student?.id || 'demo_student',
        name: student?.name || 'Demo Student',
        email: student?.email || 'student@demo.com',
        subject: sessionData.subject,
        timestamp: Date.now(),
        academicLevel: sessionData.academicLevel
      }

      // Save to localStorage
      localStorage.setItem(attendanceKey, 'true')
      
      // Add to simple attendees list
      const attendeesKey = 'simple_attendees'
      const existingAttendees = localStorage.getItem(attendeesKey)
      const attendees = existingAttendees ? JSON.parse(existingAttendees) : []
      attendees.push(attendanceRecord)
      localStorage.setItem(attendeesKey, JSON.stringify(attendees))

      // Success
      setScanResult({
        success: true,
        message: `Attendance marked successfully for ${sessionData.subject}!`
      })
      
      toast.success("Attendance Marked!", {
        description: `You earned 10 points for ${sessionData.subject}`,
        duration: 4000
      })
      
      // Stop scanning
      stopCameraScanning()

    } catch (error) {
      console.error("[Simple Scanner] Error processing QR:", error)
      setScanResult({
        success: false,
        message: "Failed to process QR code. Please try again."
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!selectedSubject) {
      toast.error("Please select a subject first")
      return
    }

    setIsProcessing(true)
    setScanResult(null)

    const html5QrCode = new Html5Qrcode("file-scan-region")
    
    html5QrCode.scanFile(file, true)
      .then(decodedText => {
        console.log("[Simple Scanner] File QR detected:", decodedText)
        processQRCode(decodedText)
      })
      .catch(err => {
        console.error("[Simple Scanner] File scan error:", err)
        setScanResult({
          success: false,
          message: "Could not detect QR code in image. Try a clearer photo."
        })
        setIsProcessing(false)
      })
  }

  // Reset scanner
  const resetScanner = () => {
    setScanResult(null)
    setSelectedSubject("")
    stopCameraScanning()
  }

  // If no student data, don't render the scanner
  if (!student) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Simple QR Scanner</h1>
            <p className="text-muted-foreground">Scan QR codes to mark attendance</p>
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

        {/* Subject Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Select Subject
            </CardTitle>
            <CardDescription>
              Choose the subject you're attending before scanning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Subject</label>
              <Select 
                value={selectedSubject} 
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select the subject you're attending" />
                </SelectTrigger>
                <SelectContent>
                  {student?.subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedSubject && (
              <Alert className="mt-4">
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  Ready to scan for <strong>{selectedSubject}</strong>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Scan Result */}
        {scanResult && (
          <Alert 
            variant={scanResult.success ? "default" : "destructive"} 
            className="mb-6"
          >
            {scanResult.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <AlertDescription>
              {scanResult.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Camera Scanner
              </CardTitle>
              <CardDescription>
                Use your device camera to scan the QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isScanning ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-medium">Camera Ready</h3>
                    <p className="text-sm text-muted-foreground">
                      Click below to start scanning QR codes
                    </p>
                  </div>
                  <Button 
                    onClick={startCameraScanning} 
                    disabled={!selectedSubject || isProcessing}
                    className="w-full max-w-xs"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {isProcessing ? "Processing..." : "Start Camera"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div 
                    id="qr-reader" 
                    className="w-full"
                    style={{ 
                      border: '2px solid rgb(var(--primary))', 
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  />
                  
                  {isProcessing && (
                    <div className="text-center py-2">
                      <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        <Clock className="w-3 h-3 mr-1 animate-spin" />
                        Processing QR code...
                      </Badge>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    onClick={stopCameraScanning}
                    className="w-full"
                  >
                    Stop Camera
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Upload Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload QR Image
              </CardTitle>
              <CardDescription>
                Upload a photo of the QR code if camera is not available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-medium">Upload QR Image</h3>
                  <p className="text-sm text-muted-foreground">
                    Take a photo of the QR code and upload it here
                  </p>
                </div>
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={!selectedSubject || isProcessing}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : "Choose Image"}
                </Button>
                <input 
                  id="file-upload"
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <div id="file-scan-region" className="hidden" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reset Button */}
        {(scanResult || isScanning) && (
          <div className="flex justify-center mt-6">
            <Button 
              onClick={resetScanner} 
              variant="outline"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Reset Scanner
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}