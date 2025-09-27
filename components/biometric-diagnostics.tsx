"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  Globe, 
  Settings, 
  Shield, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Fingerprint,
  Camera,
  Lock,
  Monitor
} from 'lucide-react'
import { toast } from 'sonner'

interface DiagnosticResult {
  name: string
  status: 'pass' | 'fail' | 'warning' | 'unknown'
  message: string
  solution?: string
  critical: boolean
}

export function BiometricDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setIsRunning(true)
    
    const results: DiagnosticResult[] = []
    
    try {
      // 1. Secure Context Check
      const isSecure = window.isSecureContext
      results.push({
        name: 'Secure Connection',
        status: isSecure ? 'pass' : 'fail',
        message: isSecure ? 'HTTPS connection verified' : 'Insecure connection detected',
        solution: !isSecure ? 'Access the site via HTTPS (https://) or localhost' : undefined,
        critical: true
      })

      // 2. WebAuthn API Support
      const hasWebAuthn = !!window.PublicKeyCredential
      results.push({
        name: 'WebAuthn API',
        status: hasWebAuthn ? 'pass' : 'fail',
        message: hasWebAuthn ? 'WebAuthn API is supported' : 'WebAuthn API not supported',
        solution: !hasWebAuthn ? 'Update your browser to the latest version (Chrome 67+, Firefox 60+, Safari 14+)' : undefined,
        critical: true
      })

      // 3. Platform Authenticator Check
      let platformAuthAvailable = false
      if (hasWebAuthn) {
        try {
          platformAuthAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        } catch (error) {
          console.warn('Platform authenticator check failed:', error)
        }
      }
      
      results.push({
        name: 'Biometric Hardware',
        status: platformAuthAvailable ? 'pass' : 'fail',
        message: platformAuthAvailable ? 'Biometric sensors detected' : 'No biometric sensors found',
        solution: !platformAuthAvailable ? 'Enable fingerprint/face unlock in your device settings, or try a different device' : undefined,
        critical: true
      })

      // 4. Device Information
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|iphone|ipad|mobile/.test(userAgent)
      const isIOS = /iphone|ipad/.test(userAgent)
      const isAndroid = /android/.test(userAgent)
      
      let deviceStatus: 'pass' | 'warning' | 'fail' = 'pass'
      let deviceMessage = 'Desktop device'
      let deviceSolution: string | undefined
      
      if (isMobile) {
        deviceMessage = isIOS ? 'iOS device detected' : isAndroid ? 'Android device detected' : 'Mobile device detected'
        if (!platformAuthAvailable) {
          deviceStatus = 'warning'
          deviceSolution = isIOS 
            ? 'Go to Settings → Face ID & Passcode or Touch ID & Passcode and enable biometric unlock'
            : 'Go to Settings → Security → Fingerprint or Face Unlock and set up biometric authentication'
        }
      } else {
        deviceStatus = 'warning'
        deviceMessage = 'Desktop/laptop device - biometric support varies'
        deviceSolution = 'For best biometric support, use a mobile device or laptop with built-in fingerprint sensor'
      }
      
      results.push({
        name: 'Device Type',
        status: deviceStatus,
        message: deviceMessage,
        solution: deviceSolution,
        critical: false
      })

      // 5. Browser Compatibility
      let browserName = 'Unknown'
      let browserStatus: 'pass' | 'warning' | 'fail' = 'warning'
      let browserSolution: string | undefined
      
      if (userAgent.includes('chrome')) {
        browserName = 'Chrome'
        browserStatus = 'pass'
      } else if (userAgent.includes('firefox')) {
        browserName = 'Firefox'
        browserStatus = 'pass'
      } else if (userAgent.includes('safari')) {
        browserName = 'Safari'
        browserStatus = 'pass'
      } else if (userAgent.includes('edge')) {
        browserName = 'Edge'
        browserStatus = 'pass'
      } else {
        browserStatus = 'warning'
        browserSolution = 'For best compatibility, use Chrome, Firefox, Safari, or Edge'
      }
      
      results.push({
        name: 'Browser Compatibility',
        status: browserStatus,
        message: `${browserName} browser detected`,
        solution: browserSolution,
        critical: false
      })

      // 6. Camera Access (for Face ID)
      let cameraStatus: 'pass' | 'fail' | 'unknown' = 'unknown'
      let cameraMessage = 'Camera access not tested'
      let cameraSolution: string | undefined
      
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        
        if (videoDevices.length > 0) {
          cameraStatus = 'pass'
          cameraMessage = `${videoDevices.length} camera(s) detected`
        } else {
          cameraStatus = 'fail'
          cameraMessage = 'No cameras detected'
          cameraSolution = 'Connect a camera for face authentication or use fingerprint instead'
        }
      } catch (error) {
        cameraStatus = 'fail'
        cameraMessage = 'Camera access denied or unavailable'
        cameraSolution = 'Allow camera permissions in browser settings for face authentication'
      }
      
      results.push({
        name: 'Camera Access',
        status: cameraStatus,
        message: cameraMessage,
        solution: cameraSolution,
        critical: false
      })
      
    } catch (error) {
      console.error('Diagnostics failed:', error)
      results.push({
        name: 'Diagnostic Error',
        status: 'fail',
        message: 'Failed to run complete diagnostics',
        solution: 'Try refreshing the page and running diagnostics again',
        critical: true
      })
    }
    
    setDiagnostics(results)
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'border-green-200 bg-green-50'
      case 'fail': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  const criticalIssues = diagnostics.filter(d => d.critical && d.status === 'fail')
  const canUseBiometrics = criticalIssues.length === 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          Biometric Authentication Diagnostics
        </CardTitle>
        <CardDescription>
          Comprehensive check of your device's biometric authentication capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <Alert className={canUseBiometrics ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {canUseBiometrics ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <AlertDescription>
            <div className="font-medium mb-2">
              {canUseBiometrics 
                ? "✅ Biometric authentication should work on this device" 
                : "❌ Biometric authentication is not available"}
            </div>
            <div className="text-sm">
              {canUseBiometrics 
                ? "All critical requirements are met. You can proceed with biometric setup."
                : `${criticalIssues.length} critical issue(s) need to be resolved first.`}
            </div>
          </AlertDescription>
        </Alert>

        {/* Diagnostic Results */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Diagnostic Results
          </h3>
          {diagnostics.map((diagnostic, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getStatusColor(diagnostic.status)}`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(diagnostic.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{diagnostic.name}</span>
                    {diagnostic.critical && (
                      <Badge variant="outline" className="text-xs">Critical</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{diagnostic.message}</p>
                  {diagnostic.solution && (
                    <Alert className="mt-2">
                      <Info className="w-3 h-3" />
                      <AlertDescription className="text-xs">
                        <strong>Solution:</strong> {diagnostic.solution}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics Again'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              toast.info('💡 Tip: Try These Steps', {
                description: '1. Enable device biometrics in settings 2. Use HTTPS 3. Try a different browser',
                duration: 5000,
              })
            }}
            className="flex items-center gap-2"
          >
            <Info className="w-4 h-4" />
            Show Quick Tips
          </Button>
        </div>

        {/* Device Specific Instructions */}
        <Alert>
          <Settings className="w-4 h-4" />
          <AlertDescription className="text-xs">
            <strong>Device-Specific Setup:</strong>
            <div className="mt-2 space-y-1">
              <div><strong>iPhone/iPad:</strong> Settings → Face ID & Passcode or Touch ID & Passcode</div>
              <div><strong>Android:</strong> Settings → Security → Fingerprint or Face Unlock</div>
              <div><strong>Windows:</strong> Settings → Accounts → Sign-in Options → Windows Hello</div>
              <div><strong>macOS:</strong> System Preferences → Touch ID or Face ID</div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}