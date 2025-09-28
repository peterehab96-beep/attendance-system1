"use client"

/*
 * Installation instructions for html5-qrcode:
 * npm install html5-qrcode@^2.3.8
 * 
 * This component uses the html5-qrcode library for real QR code scanning.
 * It supports both camera scanning and image upload for QR code detection.
 * GitHub: https://github.com/mebjas/html5-qrcode
 */

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Camera, QrCode, CheckCircle, AlertCircle, RefreshCw, Scan, Upload, Info, AlertTriangle } from "lucide-react"
import { useAttendanceStore } from "@/lib/attendance-store"
import { toast } from 'sonner'
import { createClient } from "@/lib/supabase/client"

// Dynamic import for html5-qrcode to avoid SSR issues
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode"

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

interface ScanResult {
  success: boolean
  message: string
}

type CameraPermission = "granted" | "denied" | "prompt"
type ScanMode = "camera" | "file" | "none"

export function QRScanner({ student, onSuccessfulScan }: QRScannerProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [cameraPermission, setCameraPermission] = useState<CameraPermission>("prompt")
  const [scanMode, setScanMode] = useState<ScanMode>("none")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scannerElementRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const html5QrCodeScannerRef = useRef<Html5QrcodeScanner | null>(null)
  
  const attendanceStore = useAttendanceStore()
  
  // Scanner configuration
  const qrConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    disableFlip: false
  }
  
  const cameraConfig = {
    facingMode: { ideal: "environment" }, // Prefer back camera
    width: { ideal: 640 },
    height: { ideal: 480 }
  }

  useEffect(() => {
    checkCameraPermission()
    
    // Cleanup on unmount
    return () => {
      cleanup()
    }
  }, [])
  
  useEffect(() => {
    // Log environment for debugging
    console.log("[QR Scanner] Environment check:", {
      isHTTPS: window.location.protocol === 'https:',
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      userAgent: navigator.userAgent,
      hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia
    })
  }, [])

  const checkCameraPermission = async () => {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: "camera" as PermissionName })
        setCameraPermission(result.state)
        console.log("[QR Scanner] Camera permission status:", result.state)
      } else {
        console.log("[QR Scanner] Permission API not supported")
      }
    } catch (error) {
      console.log("[QR Scanner] Permission check failed:", error)
    }
  }

  const cleanup = useCallback(() => {
    console.log("[QR Scanner] Cleaning up...")
    
    // Stop Html5QrcodeScanner
    if (html5QrCodeScannerRef.current) {
      try {
        html5QrCodeScannerRef.current.clear()
        console.log("[QR Scanner] Html5QrcodeScanner cleared")
      } catch (error) {
        console.warn("[QR Scanner] Error clearing Html5QrcodeScanner:", error)
      }
      html5QrCodeScannerRef.current = null
    }
    
    // Stop Html5Qrcode
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.stop()
        console.log("[QR Scanner] Html5Qrcode stopped")
      } catch (error) {
        console.warn("[QR Scanner] Error stopping Html5Qrcode:", error)
      }
      html5QrCodeRef.current = null
    }
    
    setIsScanning(false)
    setScanMode("none")
  }, [])
  
  const startCameraScanning = async () => {
    if (!selectedSubject) {
      setScanResult({
        success: false,
        message: "Please select your subject before scanning."
      })
      return
    }
    
    try {
      console.log("[QR Scanner] Starting camera scanning...")
      setScanResult(null)
      setIsProcessing(false)
      
      // Check for HTTPS or localhost
      const isSecureContext = window.location.protocol === 'https:' || 
                            window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1'
      
      if (!isSecureContext) {
        throw new Error("Camera requires HTTPS or localhost for security. Please use a secure connection.")
      }
      
      // Check camera support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not supported on this device. Please try uploading an image instead.")
      }
      
      // Cleanup any existing scanner
      cleanup()
      
      if (!scannerElementRef.current) {
        throw new Error("Scanner element not found")
      }
      
      // Initialize Html5QrcodeScanner
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: qrConfig.fps,
          qrbox: qrConfig.qrbox,
          aspectRatio: qrConfig.aspectRatio,
          disableFlip: qrConfig.disableFlip,
          videoConstraints: {
            facingMode: { ideal: "environment" },
            width: { ideal: 640, max: 1920 },
            height: { ideal: 480, max: 1080 }
          }
        },
        false // verbose logging
      )
      
      html5QrCodeScannerRef.current = scanner
      
      // Success callback
      const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        console.log("[QR Scanner] QR Code detected:", { decodedText, decodedResult })
        
        if (isProcessing) {
          console.log("[QR Scanner] Already processing, ignoring scan")
          return
        }
        
        setIsProcessing(true)
        
        try {
          await processQRCode(decodedText)
        } catch (error) {
          console.error("[QR Scanner] Error processing QR code:", error)
          setIsProcessing(false)
        }
      }
      
      // Error callback  
      const onScanFailure = (error: string) => {
        // Don't log every scan attempt failure - it's noisy
        if (!error.includes("No QR code found") && !error.includes("QR code parse error")) {
          console.warn("[QR Scanner] Scan error:", error)
        }
      }
      
      // Start scanning
      scanner.render(onScanSuccess, onScanFailure)
      
      setIsScanning(true)
      setScanMode("camera")
      setCameraPermission("granted")
      
      toast.success("Camera started! Position QR code in the frame.")
      
    } catch (error: any) {
      console.error("[QR Scanner] Camera start error:", error)
      
      let userMessage = "Camera access failed. "
      
      if (error.name === 'NotAllowedError') {
        setCameraPermission("denied")
        userMessage += "Please allow camera access and try again. Look for a camera icon in your browser's address bar."
      } else if (error.name === 'NotFoundError') {
        userMessage += "No camera found. Please connect a camera and try again."
      } else if (error.name === 'NotReadableError') {
        userMessage += "Camera is being used by another app. Please close other camera apps and try again."
      } else if (error.name === 'SecurityError' || error.message.includes('HTTPS')) {
        userMessage += "Camera blocked for security. Please use HTTPS or localhost."
      } else {
        userMessage += error.message || "Unknown error. Please try using image upload instead."
      }
      
      userMessage += " You can still upload QR code images."
      
      setScanResult({
        success: false,
        message: userMessage
      })
      
      toast.error("Camera failed", {
        description: userMessage.split('.')[0]
      })
    }
  }

  const stopCamera = () => {
    console.log("[QR Scanner] Stopping camera...")
    cleanup()
    toast.info("Camera stopped")
  }

  const processQRCode = async (qrData: string) => {
    console.log("[QR Scanner] Processing QR code:", qrData)
    
    try {
      // Validate subject selection
      if (!selectedSubject) {
        setScanResult({
          success: false,
          message: "Please select your subject before scanning."
        })
        return
      }
      
      // Parse QR data
      let qrSessionData
      try {
        qrSessionData = JSON.parse(qrData)
      } catch (parseError) {
        setScanResult({
          success: false,
          message: "Invalid QR code format. Please scan a valid attendance QR code."
        })
        return
      }

      // Validate QR data structure
      if (!qrSessionData.sessionId || !qrSessionData.token || !qrSessionData.subject) {
        setScanResult({
          success: false,
          message: "QR code is missing required data. Please scan a valid attendance QR code."
        })
        return
      }

      // Check expiration
      if (Date.now() > qrSessionData.expiresAt) {
        setScanResult({
          success: false,
          message: "QR code has expired. Please ask your instructor to generate a new one."
        })
        return
      }

      // Validate session matches student's subject
      if (qrSessionData.subject !== selectedSubject) {
        setScanResult({
          success: false,
          message: `QR code is for ${qrSessionData.subject}, but you selected ${selectedSubject}. Please select the correct subject.`
        })
        return
      }

      // Try to verify session exists in Supabase or localStorage
      let sessionExists = false
      
      try {
        const supabase = createClient()
        
        if (supabase) {
          const { data: session, error } = await supabase
            .from('attendance_sessions')
            .select('id, is_active, expires_at, token')
            .eq('id', qrSessionData.sessionId)
            .eq('is_active', true)
            .single()

          if (!error && session && session.token === qrSessionData.token) {
            sessionExists = true
            console.log("[QR Scanner] Session verified in Supabase")
          }
        }
      } catch (supabaseError) {
        console.warn("[QR Scanner] Supabase verification failed, checking localStorage:", supabaseError)
      }
      
      // Fallback to localStorage verification
      if (!sessionExists) {
        const localSessionKey = `qr_session_${qrSessionData.sessionId}`
        const localSession = localStorage.getItem(localSessionKey)
        
        if (localSession) {
          const parsedSession = JSON.parse(localSession)
          if (parsedSession.token === qrSessionData.token && parsedSession.is_active) {
            sessionExists = true
            console.log("[QR Scanner] Session verified in localStorage")
          }
        }
      }
      
      // Check if we also have an active session in the store (backward compatibility)
      if (!sessionExists) {
        const activeSession = attendanceStore.getActiveSession()
        if (activeSession && activeSession.qrCode === qrData) {
          sessionExists = true
          console.log("[QR Scanner] Session verified in store")
        }
      }
      
      if (!sessionExists) {
        setScanResult({
          success: false,
          message: "Invalid or expired QR code. Please ask your instructor to generate a new one."
        })
        return
      }
      
      console.log("[QR Scanner] QR validation successful, marking attendance...")
      
      // Process the attendance using the callback
      const result = await onSuccessfulScan(qrData)
      console.log("[QR Scanner] Attendance marking result:", result)
      
      setScanResult(result)
      
      if (result.success) {
        console.log("[QR Scanner] Attendance marked successfully, stopping scanner...")
        cleanup()
        toast.success("Attendance marked successfully!")
        
        // Clear the result after 5 seconds
        setTimeout(() => {
          setScanResult(null)
          console.log("[QR Scanner] Result cleared")
        }, 5000)
      } else {
        toast.error("Attendance failed", {
          description: result.message
        })
      }
      
    } catch (error) {
      console.error("[QR Scanner] Error processing QR code:", error)
      setScanResult({
        success: false,
        message: "Failed to process QR code. Please try again."
      })
      toast.error("Processing failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    if (!selectedSubject) {
      setScanResult({
        success: false,
        message: "Please select your subject before uploading an image."
      })
      return
    }
    
    console.log("[QR Scanner] File selected for QR scanning:", file.name)
    setScanResult(null)
    setIsProcessing(true)
    setScanMode("file")
    
    try {
      // Create Html5Qrcode instance for file scanning
      const html5QrCode = new Html5Qrcode("file-reader")
      html5QrCodeRef.current = html5QrCode
      
      // Scan the uploaded file
      const qrCodeMessage = await html5QrCode.scanFile(file, false)
      console.log("[QR Scanner] QR Code detected from file:", qrCodeMessage)
      
      await processQRCode(qrCodeMessage)
      
    } catch (error: any) {
      console.error("[QR Scanner] File scan error:", error)
      
      let message = "Could not detect QR code in the uploaded image. "
      
      if (error.includes("No QR code found")) {
        message += "Please make sure the image contains a clear, visible QR code."
      } else if (error.includes("Multiple QR codes found")) {
        message += "Multiple QR codes found. Please use an image with only one QR code."
      } else {
        message += "Please try a different image or use the camera scanner."
      }
      
      setScanResult({
        success: false,
        message
      })
      
      toast.error("File scan failed", {
        description: "Could not detect QR code in image"
      })
    } finally {
      setIsProcessing(false)
      setScanMode("none")
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const resetScanner = () => {
    console.log("[QR Scanner] Resetting scanner...")
    setScanResult(null)
    setSelectedSubject("")
    setIsProcessing(false)
    cleanup()
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
                {/* Html5QrcodeScanner will render here */}
                <div 
                  id="qr-reader" 
                  ref={scannerElementRef}
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
                      <Scan className="w-3 h-3 mr-1 animate-spin" />
                      Processing QR code...
                    </Badge>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button variant="outline" onClick={stopCamera} className="bg-transparent">
                    Stop Camera
                  </Button>
                </div>
              </div>
            )}
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
                disabled={!selectedSubject || isProcessing}
                variant="outline"
                className="w-full max-w-xs"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isProcessing && scanMode === "file" ? "Processing..." : "Choose Image"}
              </Button>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              
              {/* Hidden element for file scanning */}
              <div id="file-reader" className="hidden" />
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

      {/* Instructions and Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Info className="w-5 h-5" />
            QR Scanner Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cameraPermission === "denied" && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="space-y-2">
                <p className="font-medium">Camera Access Blocked</p>
                <div className="text-sm space-y-1">
                  <p>1. Click the camera icon in your browser's address bar</p>
                  <p>2. Select "Allow" for camera access</p>
                  <p>3. Refresh the page and try again</p>
                  <p>4. Make sure no other apps are using the camera</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-2 text-sm text-muted-foreground">
            <p><strong>How to use:</strong></p>
            <p>1. Select your subject from the dropdown above</p>
            <p>2. Start the camera or upload an image with a QR code</p>
            <p>3. Position the QR code clearly in the frame</p>
            <p>4. The scanner will automatically detect and process the QR code</p>
          </div>
          
          <div className="grid gap-2 text-sm text-muted-foreground">
            <p><strong>Common Issues:</strong></p>
            <p>• Camera blocked: Check address bar for camera permission icon</p>
            <p>• Camera in use: Close other camera apps (Zoom, Teams, etc.)</p>
            <p>• Security error: Ensure you're using HTTPS or localhost</p>
            <p>• QR not detected: Ensure good lighting and clear image</p>
            <p>• Mobile issues: Try both front and back cameras</p>
          </div>
          
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              <strong>Tip:</strong> For best results, hold the QR code steady in good lighting. The scanner will automatically detect it once positioned correctly.
            </AlertDescription>
          </Alert>
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