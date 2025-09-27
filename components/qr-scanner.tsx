"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Camera, QrCode, CheckCircle, AlertCircle, RefreshCw, Scan, Upload, Info } from "lucide-react"
import { CameraManager } from "@/lib/camera-utils"
import { useAttendanceStore } from "@/lib/attendance-store"
import { attendanceBackupHandler } from '@/lib/attendance-backup-handler'
import { toast } from 'sonner'

interface Student {
  id: string
  name: string
  email: string
  academicLevel: string
  subjects: string[]
}

interface QRScannerProps {
  student: Student
  onSuccessfulScan: (qrData: string) => Promise<{ success: boolean; message: string }>
}

export function QRScanner({ student, onSuccessfulScan }: QRScannerProps) {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const attendanceStore = useAttendanceStore()

  useEffect(() => {
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: "camera" as PermissionName })
      setCameraPermission(result.state)
    } catch (error) {
      console.log("[v0] Permission API not supported")
    }
  }

  const startCamera = async () => {
    try {
      console.log("[QR Scanner] Starting camera...")

      // Check if mediaDevices is available
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not supported on this device or browser")
      }

      // Stop any existing streams first
      if (videoRef.current?.srcObject) {
        stopCamera()
      }

      // Request camera permission with multiple fallback options
      let stream: MediaStream | null = null
      const constraints: MediaStreamConstraints[] = [
        {
          // Try with environment camera (back camera on mobile) - highest quality
          video: {
            facingMode: { exact: "environment" },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            frameRate: { ideal: 30, min: 15 }
          },
        },
        {
          // Fallback to environment camera with relaxed constraints
          video: {
            facingMode: "environment",
            width: { ideal: 1024, min: 480 },
            height: { ideal: 576, min: 360 },
          },
        },
        {
          // Fallback to user camera (front camera)
          video: {
            facingMode: "user",
            width: { ideal: 1024, min: 480 },
            height: { ideal: 576, min: 360 },
          },
        },
        {
          // Final fallback - any available camera with basic constraints
          video: {
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 },
          },
        },
        {
          // Last resort - minimal constraints
          video: true,
        }
      ]

      let lastError: Error | null = null
      
      for (let i = 0; i < constraints.length; i++) {
        try {
          console.log(`[QR Scanner] Trying camera constraint ${i + 1}/${constraints.length}...`)
          stream = await navigator.mediaDevices.getUserMedia(constraints[i])
          
          if (stream) {
            console.log(`[QR Scanner] Camera stream obtained with constraint ${i + 1}`)
            break
          }
        } catch (error: any) {
          console.log(`[QR Scanner] Constraint ${i + 1} failed:`, error.message)
          lastError = error
          continue
        }
      }

      if (!stream) {
        throw lastError || new Error("Failed to access any camera")
      }

      // Verify video element exists
      if (!videoRef.current) {
        stream.getTracks().forEach(track => track.stop())
        throw new Error("Video element not available")
      }

      // Set up video element
      const video = videoRef.current
      video.srcObject = stream
      
      // Configure video properties
      video.autoplay = true
      video.playsInline = true
      video.muted = true
      
      // Wait for video metadata to load with timeout
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Video loading timeout - camera may be busy"))
        }, 15000) // 15 second timeout
        
        const onLoadedMetadata = () => {
          clearTimeout(timeout)
          video.removeEventListener('loadedmetadata', onLoadedMetadata)
          video.removeEventListener('error', onError)
          resolve()
        }
        
        const onError = (event: Event) => {
          clearTimeout(timeout)
          video.removeEventListener('loadedmetadata', onLoadedMetadata)
          video.removeEventListener('error', onError)
          reject(new Error(`Video error: ${(event as any).error || 'Unknown error'}`)) 
        }
        
        video.addEventListener('loadedmetadata', onLoadedMetadata)
        video.addEventListener('error', onError)
        
        // If video is already loaded
        if (video.readyState >= 1) {
          onLoadedMetadata()
        }
      })
        
      // Start video playback
      try {
        await video.play()
      } catch (playError: any) {
        console.log("[QR Scanner] Auto-play failed, trying manual play...", playError)
        // On some browsers, auto-play might fail, but we can still use the camera
      }
      
      setCameraPermission("granted")
      setIsScanning(true)
      console.log("[QR Scanner] Camera started successfully")
      
      // Clear any previous error messages
      setScanResult(null)
      
    } catch (error: any) {
      console.error("[QR Scanner] Error accessing camera:", error)
      setCameraPermission("denied")
      
      let errorMessage = "Camera access failed. "
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += "Please allow camera permissions in your browser settings and refresh the page."
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += "No camera found on this device."
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += "Camera is being used by another application. Please close other camera apps and try again."
      } else if (error.name === 'SecurityError') {
        errorMessage += "Camera access is not allowed over insecure connections. Please use HTTPS."
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        errorMessage += "Camera does not support the required features."
      } else if (error.message.includes('timeout') || error.message.includes('busy')) {
        errorMessage += "Camera is busy or not responding. Please wait a moment and try again."
      } else {
        errorMessage += error.message || "Unknown camera error occurred."
      }
      
      errorMessage += " You can upload a QR code image instead."
      
      setScanResult({
        success: false,
        message: errorMessage,
      })
    }
  }

  const stopCamera = () => {
    console.log("[QR Scanner] Stopping camera...")
    
    try {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        
        // Stop all tracks
        stream.getTracks().forEach((track) => {
          track.stop()
          console.log(`[QR Scanner] Camera track stopped: ${track.kind}`)
        })
        
        // Clear the video source
        videoRef.current.srcObject = null
        videoRef.current.load() // Reset video element
      }
    } catch (error) {
      console.error("[QR Scanner] Error stopping camera:", error)
    }
    
    setIsScanning(false)
  }

  const captureAndScan = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.log("[v0] Video or canvas ref not available")
      return
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    if (!context) {
      console.log("[v0] Canvas context not available")
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    console.log("[v0] Image captured, simulating QR scan...")
    simulateQRScan()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("[v0] File selected for QR scanning:", file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      console.log("[v0] File loaded, simulating QR scan...")
      simulateQRScan()
    }
    reader.readAsDataURL(file)
  }

  const simulateQRScan = async () => {
    if (!selectedSubject) {
      setScanResult({
        success: false,
        message: "Please select your subject before scanning.",
      })
      return
    }

    console.log("[QR Scanner] Starting attendance marking process...")
    
    // Check if there's an active session from admin for this subject
    const activeSession = attendanceStore.getActiveSession()
    
    if (!activeSession) {
      setScanResult({
        success: false,
        message: "No active attendance session found. Ask your instructor to generate a QR code first.",
      })
      return
    }
    
    // Validate session matches student's subject
    if (activeSession.subject !== selectedSubject) {
      setScanResult({
        success: false,
        message: `QR code is for ${activeSession.subject}, but you selected ${selectedSubject}. Please select the correct subject.`,
      })
      return
    }
    
    // Check if session has expired
    if (new Date() > activeSession.expiresAt) {
      setScanResult({
        success: false,
        message: "QR code has expired. Ask your instructor to generate a new one.",
      })
      return
    }
    
    // Use the actual QR data from the active session
    const qrData = activeSession.qrCode

    console.log("[QR Scanner] Using real QR data from active session:", {
      sessionId: activeSession.id,
      subject: activeSession.subject,
      academicLevel: activeSession.academicLevel
    })
    
    try {
      const result = await onSuccessfulScan(qrData)
      console.log("[QR Scanner] Attendance marking result:", result)
      setScanResult(result)

      if (result.success) {
        console.log("[QR Scanner] Attendance marked successfully, stopping camera...")
        stopCamera()
        // Clear the result after 5 seconds
        setTimeout(() => {
          setScanResult(null)
          console.log("[QR Scanner] Result cleared")
        }, 5000)
      }
    } catch (error) {
      console.error("[QR Scanner] Error marking attendance:", error)
      setScanResult({
        success: false,
        message: "Failed to mark attendance. Please try again."
      })
    }
  }

  const resetScanner = () => {
    setScanResult(null)
    setSelectedSubject("")
    stopCamera()
  }

  return (
    <div className="space-y-4 sm:space-y-6 mobile-padding">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">QR Code Scanner</h2>
        <p className="text-muted-foreground mobile-text-sm">
          Scan the QR code displayed by your instructor to mark attendance
        </p>
      </div>

      {/* Subject Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Pre-Scan Setup
          </CardTitle>
          <CardDescription className="mobile-text-sm">
            Select your current subject before scanning the QR code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Current Subject</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select the subject you're attending" />
              </SelectTrigger>
              <SelectContent>
                {student.subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSubject && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription className="mobile-text-sm">
                Ready to scan for <strong>{selectedSubject}</strong> - {student.academicLevel}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Scanner Interface */}
      <div className="grid gap-4 sm:gap-6 mobile-grid-1 lg:grid-cols-2">
        {/* Camera Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Camera Scanner
            </CardTitle>
            <CardDescription className="mobile-text-sm">Use your device camera to scan the QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isScanning ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-medium text-foreground mobile-text-sm">Camera Ready</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Click "Start Camera" to begin scanning QR codes
                  </p>
                </div>
                <Button onClick={startCamera} disabled={!selectedSubject} className="w-full max-w-xs">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-48 sm:h-64 bg-black rounded-lg object-cover"
                    playsInline
                    muted
                  />
                  <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none">
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <Badge className="bg-black/50 text-white border-0 text-xs">
                      <Scan className="w-3 h-3 mr-1" />
                      Position QR code within frame
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button onClick={captureAndScan} className="flex-1">
                    <Scan className="w-4 h-4 mr-2" />
                    Scan QR Code
                  </Button>
                  <Button variant="outline" onClick={stopCamera} className="sm:w-auto bg-transparent">
                    Stop Camera
                  </Button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        {/* File Upload Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Upload QR Image
            </CardTitle>
            <CardDescription className="mobile-text-sm">
              Upload a photo of the QR code if camera is not available
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium text-foreground mobile-text-sm">Upload QR Image</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Take a photo of the QR code and upload it here
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedSubject}
                variant="outline"
                className="w-full max-w-xs"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>

            {cameraPermission === "denied" && (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="mobile-text-sm">
                  Camera access is blocked. You can still upload QR code images using the button above.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scan Result */}
      {scanResult && (
        <Alert variant={scanResult.success ? "default" : "destructive"}>
          {scanResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <span className="mobile-text-sm">{scanResult.message}</span>
            {scanResult.success && (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 w-fit">Attendance Marked</Badge>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Scanning Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-primary">1</span>
            </div>
            <p>Select your current subject from the dropdown above</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-primary">2</span>
            </div>
            <p>Start the camera or prepare to upload a QR code image</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-primary">3</span>
            </div>
            <p>Position the QR code within the camera frame or select an image file</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-primary">4</span>
            </div>
            <p>Click "Scan QR Code" and wait for confirmation of successful attendance</p>
          </div>
        </CardContent>
      </Card>

      {scanResult && !scanResult.success && (
        <div className="flex justify-center">
          <Button onClick={resetScanner} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
