"use client"

/*
 * Simple Admin Registration Page
 * A simplified registration page for admin users
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  UserPlus,
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

export default function SimpleAdminRegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      // Get existing users from localStorage
      const usersData = localStorage.getItem('simple_users')
      const users: AdminUser[] = usersData ? JSON.parse(usersData) : []

      // Check if email already exists
      const existingUser = users.find(user => user.email === email)
      if (existingUser) {
        setError("An account with this email already exists")
        setIsLoading(false)
        return
      }

      // Create new admin user
      const newAdmin: AdminUser = {
        id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        password, // In a real app, this would be hashed
        role: 'admin'
      }

      // Save user to localStorage
      users.push(newAdmin)
      localStorage.setItem('simple_users', JSON.stringify(users))

      // Save as current admin
      localStorage.setItem('current_simple_admin', JSON.stringify(newAdmin))

      toast.success("Registration successful!", {
        description: `Welcome, ${newAdmin.name}`
      })

      // Redirect to admin dashboard
      router.push('/admin/simple-dashboard')
    } catch (error) {
      console.error("Registration error:", error)
      setError("An error occurred during registration")
      toast.error("Registration failed", {
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
          <h1 className="text-2xl font-bold text-foreground">Admin Register</h1>
        </div>
        <div className="w-16" /> {/* Spacer for center alignment */}
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <UserPlus className="w-5 h-5" />
            Administrator Registration
          </CardTitle>
          <CardDescription>
            Create an account to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. Ahmed Hassan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => router.push('/simple-auth/admin/login')}
                className="text-primary hover:underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}