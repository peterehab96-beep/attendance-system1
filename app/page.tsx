"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SplashScreen } from "@/components/splash-screen"
import { RoleSelection } from "@/components/role-selection"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for authentication errors in URL
    const error = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')
    
    if (error) {
      if (errorCode === 'otp_expired' || error === 'access_denied') {
        setAuthError('Email verification link has expired. Please try logging in with email and password instead.')
      } else {
        setAuthError(`Authentication failed: ${errorDescription || error}`)
      }
      
      // Clear the error from URL after showing it
      const cleanUrl = window.location.pathname
      router.replace(cleanUrl, { scroll: false })
      
      // Auto-hide error after 5 seconds
      setTimeout(() => setAuthError(null), 5000)
    }
  }, [searchParams, router])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      {authError && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                System Information
              </CardTitle>
              <CardDescription>
                Two QR systems are available for different use cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This application provides two distinct QR code-based attendance systems:
              </p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span><strong>Original System:</strong> Full-featured with Supabase integration and real-time monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span><strong>Simple System:</strong> Lightweight client-side only system with maximum compatibility</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/test-system')}
                >
                  Test Both Systems
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/simple-mode')}
                >
                  Use Simple System
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <RoleSelection />
      </div>
    </div>
  )
}