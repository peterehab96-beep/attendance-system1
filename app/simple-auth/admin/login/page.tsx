"use client"

/*
 * Simple Admin Login Page
 * A simplified login page for admin users
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  LogIn,
  ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AdminUser {
  id: string
  name: string
  email: string
  password: string
  role: string
}

export default function SimpleAdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Get users from localStorage
      const usersData = localStorage.getItem('simple_users')
      const users: AdminUser[] = usersData ? JSON.parse(usersData) : []

      // Find admin user
      const adminUser = users.find(user => 
        user.email === email && 
        user.password === password && 
        user.role === 'admin'
      )

      if (adminUser) {
        // Save current admin to localStorage
        localStorage.setItem('current_simple_admin', JSON.stringify(adminUser))
        
        toast.success("Login successful!", {
          description: `Welcome back, ${adminUser.name}`
        })
        
        // Redirect to admin dashboard
        router.push('/admin/simple-dashboard')
      } else {
        setError("Invalid email or password")
        toast.error("Login failed", {
          description: "Invalid email or password"
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login")
      toast.error("Login failed", {
        description: "An error occurred. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
        </div>
        <div className="w-16" /> {/* Spacer for center alignment */}
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5" />
            Administrator Login
          </CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <button
                onClick={() => router.push('/simple-auth/admin/register')}
                className="text-primary hover:underline"
              >
                Register here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}