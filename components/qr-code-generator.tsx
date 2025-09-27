"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { QrCode, RefreshCw, Download, Copy, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

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
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [generatedQR, setGeneratedQR] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateQRCode = async () => {
    if (!selectedLevel || !selectedSubject) return

    setIsGenerating(true)

    // Generate unique session ID and QR code data with proper security
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const secureToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15) + 
                       Date.now().toString(36)
    
    const expiryTime = Date.now() + (30 * 60 * 1000) // 30 minutes
    
    const qrData = JSON.stringify({
      sessionId: newSessionId,
      token: secureToken,
      academicLevel: selectedLevel,
      subject: selectedSubject,
      timestamp: Date.now(),
      expiresAt: expiryTime,
    })

    // Simulate QR code generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate QR code URL (using a placeholder QR service)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

    setGeneratedQR(qrCodeUrl)
    setSessionId(newSessionId)

    // Create session object with enhanced data
    const newSession = {
      id: newSessionId,
      academicLevel: selectedLevel,
      subject: selectedSubject,
      qrCode: qrData,
      token: secureToken,
      expiresAt: new Date(expiryTime),
      createdAt: new Date(),
      isActive: true,
      attendees: [],
    }

    // Use the improved createSession method
    await onSessionCreated(newSession)
    setIsGenerating(false)
  }

  const copyQRData = async () => {
    if (!generatedQR) return

    try {
      await navigator.clipboard.writeText(generatedQR)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy QR data:", err)
    }
  }

  const downloadQR = async () => {
    if (!generatedQR) {
      toast.error('No QR code to download')
      return
    }

    try {
      toast.loading('Preparing QR code download...', { duration: 2000 })
      
      // Create a higher quality canvas
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      
      if (!ctx) {
        throw new Error('Canvas context not available')
      }
      
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            // Set high resolution for better quality
            const scale = 4 // 4x higher resolution
            canvas.width = img.width * scale
            canvas.height = img.height * scale
            
            // Scale the context to draw the image at higher resolution
            ctx.scale(scale, scale)
            
            // Use better image rendering
            ctx.imageSmoothingEnabled = false
            
            // Draw the QR code
            ctx.drawImage(img, 0, 0)
            
            resolve()
          } catch (error) {
            reject(error)
          }
        }
        
        img.onerror = () => {
          reject(new Error('Failed to load QR code image'))
        }
        
        img.src = generatedQR
      })

      // Convert to blob with high quality
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          'image/png',
          1.0 // Maximum quality
        )
      })

      if (!blob) {
        throw new Error('Failed to create image blob')
      }

      // Create download
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      
      const filename = `attendance-qr-${selectedLevel.replace(/\s+/g, "-")}-${selectedSubject.replace(/\s+/g, "-")}-${new Date().toISOString().split('T')[0]}-${Date.now()}.png`
      
      link.href = url
      link.download = filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      URL.revokeObjectURL(url)
      
      toast.success('💾 QR code downloaded successfully!', {
        description: `Saved as ${filename}`,
        duration: 3000,
      })
      
    } catch (error: any) {
      console.error("Download failed:", error)
      
      // Enhanced fallback method
      try {
        toast.loading('Trying alternative download method...', { duration: 2000 })
        
        // Create a simple download link
        const link = document.createElement("a")
        const filename = `attendance-qr-${selectedLevel.replace(/\s+/g, "-")}-${selectedSubject.replace(/\s+/g, "-")}-${Date.now()}.png`
        
        // Try data URL approach
        if (generatedQR.startsWith('data:')) {
          link.href = generatedQR
        } else {
          // Convert to data URL
          const response = await fetch(generatedQR)
          const blob = await response.blob()
          link.href = URL.createObjectURL(blob)
        }
        
        link.download = filename
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        if (link.href.startsWith('blob:')) {
          URL.revokeObjectURL(link.href)
        }
        
        toast.success('QR code downloaded!', {
          description: 'Downloaded using fallback method',
          duration: 3000,
        })
        
      } catch (fallbackError) {
        console.error("Fallback download also failed:", fallbackError)
        
        toast.error('Download failed', {
          description: 'Please right-click the QR code and select "Save image as..."',
          duration: 5000,
        })
      }
    }
  }

  const resetGenerator = () => {
    setSelectedLevel("")
    setSelectedSubject("")
    setGeneratedQR(null)
    setSessionId(null)
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
                      src={generatedQR || "/placeholder.svg"}
                      alt="Attendance QR Code"
                      className="w-48 h-48 sm:w-64 sm:h-64 max-w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Session ID:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {sessionId?.slice(-8)}
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
                    QR code is ready! Students can now scan this code to mark their attendance for this session.
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
