"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SplashScreen } from "@/components/splash-screen"
import { RoleSelection } from "@/components/role-selection"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

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
      <RoleSelection />
    </div>
  )
}
