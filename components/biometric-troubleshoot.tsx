"use client"

import React, { useState } from 'react'
import { BiometricDiagnostics } from './biometric-diagnostics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  Smartphone, 
  Globe, 
  Settings, 
  Shield, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'

interface BiometricTroubleshootProps {
  onRetry: () => void
}

export function BiometricTroubleshoot({ onRetry }: BiometricTroubleshootProps) {
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const checkCurrentStatus = () => {
    const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
    const hasWebAuthn = !!window.PublicKeyCredential
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|iphone|ipad|mobile/.test(userAgent)
    
    return {
      isHTTPS,
      hasWebAuthn,
      isMobile,
      browser: getBrowserName()
    }
  }

  const getBrowserName = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('chrome')) return 'Chrome'
    if (userAgent.includes('firefox')) return 'Firefox'
    if (userAgent.includes('safari')) return 'Safari'
    if (userAgent.includes('edge')) return 'Edge'
    return 'Unknown'
  }

  const status = checkCurrentStatus()

  const troubleshootingSteps = [
    {
      icon: Shield,
      title: "Security Requirements",
      items: [
        {
          text: "Secure connection (HTTPS)",
          status: status.isHTTPS ? 'success' : 'error',
          solution: !status.isHTTPS ? "Access the site via HTTPS or localhost" : null
        },
        {
          text: "WebAuthn API support",
          status: status.hasWebAuthn ? 'success' : 'error',
          solution: !status.hasWebAuthn ? `${status.browser} may not support WebAuthn. Try Chrome, Firefox, or Safari.` : null
        }
      ]
    },
    {
      icon: Smartphone,
      title: "Device Settings",
      items: [
        {
          text: "Biometric unlock enabled",
          status: 'info',
          solution: "Go to Settings → Security → Fingerprint/Face unlock and ensure it's enabled"
        },
        {
          text: "Screen lock configured",
          status: 'info',
          solution: "Device must have PIN, pattern, password, fingerprint, or face unlock set up"
        },
        {
          text: "Browser permissions",
          status: 'info',
          solution: "Allow browser to access biometric sensors when prompted"
        }
      ]
    },
    {
      icon: Globe,
      title: "Browser Compatibility",
      items: [
        {
          text: `Current browser: ${status.browser}`,
          status: ['Chrome', 'Firefox', 'Safari', 'Edge'].includes(status.browser) ? 'success' : 'warning',
          solution: !['Chrome', 'Firefox', 'Safari', 'Edge'].includes(status.browser) ? 
            "For best compatibility, use Chrome, Firefox, Safari, or Edge" : null
        },
        {
          text: "Mobile device detected",
          status: status.isMobile ? 'success' : 'info',
          solution: !status.isMobile ? "Biometric auth works best on mobile devices with built-in sensors" : null
        }
      ]
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <Info className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" />
          Biometric Authentication Setup
        </CardTitle>
        <CardDescription>
          Troubleshoot and fix biometric authentication issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {troubleshootingSteps.map((section, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center gap-2">
              <section.icon className="w-4 h-4 text-gray-500" />
              <h4 className="font-medium text-sm">{section.title}</h4>
            </div>
            <div className="pl-6 space-y-2">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="text-sm">{item.text}</span>
                  </div>
                  {item.solution && (
                    <Alert className="ml-6">
                      <AlertDescription className="text-xs">
                        💡 {item.solution}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          {showDiagnostics ? (
            <div className="space-y-4">
              <BiometricDiagnostics />
              <Button 
                variant="outline" 
                onClick={() => setShowDiagnostics(false)}
                className="w-full"
              >
                Hide Detailed Diagnostics
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry Biometric Setup
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDiagnostics(true)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Run Detailed Diagnostics
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Use Alternative Sign-In
              </Button>
            </div>
          )}
        </div>

        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription className="text-xs">
            <strong>Common Issues:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>On Android: Enable "Use fingerprint for app access" in browser settings</li>
              <li>On iOS: Ensure Face ID/Touch ID is enabled for Safari</li>
              <li>Clear browser cache and cookies if authentication fails repeatedly</li>
              <li>Some corporate networks may block biometric APIs for security</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}