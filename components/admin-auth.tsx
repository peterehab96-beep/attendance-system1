"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Shield, Eye, EyeOff, Lock, User, AlertCircle, Info } from "lucide-react"
import { AdminDashboard } from "@/components/admin-dashboard"
import { authService, type AuthUser } from "@/lib/auth-service"
import { createClient } from "@/lib/supabase/client"
import { BiometricAuth } from "@/components/biometric-auth"
import { BiometricTroubleshoot } from "@/components/biometric-troubleshoot"
import { notificationSystem } from "@/lib/notification-system"
import { toast } from "sonner"

interface AdminAuthProps {
  onBack: () => void
}

export function AdminAuth({ onBack }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showTroubleshoot, setShowTroubleshoot] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleBiometricSuccess = async (biometricData: { id: string; type: 'fingerprint' | 'face' }) => {
    // Create admin user from biometric authentication
    const adminUser: AuthUser = {
      id: biometricData.id,
      email: `admin@${biometricData.type}.local`,
      role: 'admin',
      fullName: 'Admin User',
    }
    
    setCurrentUser(adminUser)
    authService.storeUserLocally(adminUser)
    setIsAuthenticated(true)
    
    // Send notification for admin login
    notificationSystem.notifyLogin(
      adminUser.fullName, 
      `Biometric (${biometricData.type})`
    )
    
    toast.success(`🔐 Welcome Admin! Authenticated via ${biometricData.type}`, {
      description: 'Admin panel access granted',
      duration: 3000,
    })
  }

  const handleBiometricError = (error: string) => {
    setError(error)
    setShowTroubleshoot(true)
    notificationSystem.notifyError('Biometric Authentication Failed', error)
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const supabase = createClient()
      
      if (!supabase) {
        // Supabase not configured - show helpful message
        setError('Authentication service is not configured yet. Demo mode is available in the social auth section.')
        
        toast.warning('🔧 Configuration Required', {
          description: 'Supabase setup needed for Google authentication',
          duration: 4000,
        })
        
        notificationSystem.notifyError('Service Configuration', 'Authentication service requires Supabase setup')
        return
      }
      
      // Real Supabase authentication with admin check
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=admin`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            hd: 'zu.edu.eg' // Restrict to university domain
          },
        },
      })
      
      if (error) {
        setError(error.message)
        notificationSystem.notifyError('Google Sign-in Failed', error.message)
      } else {
        notificationSystem.notifyInfo('Redirecting to Google', 'Please sign in with your admin account')
      }
      // Note: The actual authentication will happen after redirect
    } catch (error: any) {
      const errorMessage = "Failed to sign in with Google. Please try again."
      setError(errorMessage)
      notificationSystem.notifyError('Authentication Error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const supabase = createClient()
      
      if (!supabase) {
        // Supabase not configured - show helpful message
        setError('Authentication service is not configured yet. Demo mode is available in the social auth section.')
        
        toast.warning('🔧 Configuration Required', {
          description: 'Supabase setup needed for Apple authentication',
          duration: 4000,
        })
        
        return
      }
      
      // Real Supabase authentication
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        setError(error.message)
      }
      // Note: The actual authentication will happen after redirect
    } catch (error: any) {
      setError("Failed to sign in with Apple. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate email format
    if (!authService.isValidEmail(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      const result = await authService.login({ email, password })

      if (result.success && result.user) {
        // Check if user is admin
        if (result.user.role !== 'admin') {
          setError("Access denied. Admin credentials required.")
          setIsLoading(false)
          return
        }

        setCurrentUser(result.user)
        authService.storeUserLocally(result.user)
        setIsAuthenticated(true)
      } else {
        setError(result.error || "Authentication failed")
      }
    } catch (error) {
      setError("An error occurred during authentication")
    }

    setIsLoading(false)
  }

  const handleLogout = async () => {
    await authService.logout()
    setIsAuthenticated(false)
    setCurrentUser(null)
    setEmail("")
    setPassword("")
    setError("")
  }

  if (isAuthenticated && currentUser) {
    return <AdminDashboard onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Role Selection
        </Button>

        {/* Login Card */}
        <Card className="border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Administrator Login</CardTitle>
              <CardDescription>Enter your secure credentials to access the admin panel</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {/* Social authentication completely disabled */}
            {/* Only email/password login available */}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Access Admin Panel"}
              </Button>
            </form>


          </CardContent>
        </Card>
      </div>
    </div>
  )
}
