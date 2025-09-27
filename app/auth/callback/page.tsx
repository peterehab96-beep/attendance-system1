"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      // Check for URL error parameters first
      const error = searchParams.get('error')
      const errorCode = searchParams.get('error_code')
      const errorDescription = searchParams.get('error_description')
      
      if (error) {
        console.log('Auth callback URL error:', { error, errorCode, errorDescription })
        
        if (errorCode === 'otp_expired' || error === 'access_denied') {
          setStatus('expired')
          setMessage('Email verification link has expired or is invalid. Please try logging in again.')
          
          // Redirect to main page after delay
          setTimeout(() => {
            router.push('/')
          }, 4000)
          return
        }
        
        setStatus('error')
        setMessage(`Authentication failed: ${errorDescription || error}`)
        setTimeout(() => {
          router.push('/')
        }, 4000)
        return
      }
      
      if (!supabase) {
        setStatus('error')
        setMessage('Authentication service unavailable')
        setTimeout(() => {
          router.push('/')
        }, 3000)
        return
      }

      try {
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Auth callback session error:', sessionError)
          setStatus('error')
          setMessage('Authentication failed: ' + sessionError.message)
          setTimeout(() => {
            router.push('/')
          }, 4000)
          return
        }

        if (data.session) {
          const user = data.session.user
          const userMetadata = user.user_metadata
          
          // Store user info in localStorage for session persistence
          const authUser = {
            id: user.id,
            email: user.email || '',
            role: 'student' as const, // Default to student, admin can be set later
            fullName: userMetadata.full_name || userMetadata.name || user.email?.split('@')[0] || 'User',
            academicLevel: 'Second Year', // Default level
          }
          
          localStorage.setItem('auth_user', JSON.stringify(authUser))
          
          // Register student in attendance system if not admin
          if (authUser.role === 'student') {
            try {
              const { attendanceStore } = await import('@/lib/attendance-store')
              attendanceStore.registerStudentFromOAuth({
                id: user.id,
                name: authUser.fullName,
                email: authUser.email,
                academicLevel: authUser.academicLevel,
                provider: user.app_metadata.provider === 'google' ? 'google' : 'apple'
              })
            } catch (error) {
              console.warn('Failed to register in attendance store:', error)
              // Continue anyway - OAuth auth was successful
            }
          }
          
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          // Redirect after a short delay
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('No session found. Please try logging in again.')
          setTimeout(() => {
            router.push('/')
          }, 4000)
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error)
        setStatus('error')
        setMessage('An unexpected error occurred during authentication')
        setTimeout(() => {
          router.push('/')
        }, 4000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {(status === 'error' || status === 'expired') && <XCircle className="h-6 w-6 text-red-500" />}
            
            {status === 'loading' && 'Processing Authentication...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Failed'}
            {status === 'expired' && 'Link Expired'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          {status === 'expired' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This usually happens when using email verification links. For this system, please use direct email/password login instead.
              </AlertDescription>
            </Alert>
          )}
          
          {(status === 'error' || status === 'expired') && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You will be redirected back to the login page shortly.
              </p>
              <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                Go Back Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}