"use client"

/*
 * Simple Student Login Page
 * A simplified login page for student users
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  LogIn,
  ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface StudentUser {
  id: string
  name: string
  email: string
  password: string
  role: string
  academicLevel: string
  subjects: string[]
}

export default function SimpleStudentLoginPage() {
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
      const users: StudentUser[] = usersData ? JSON.parse(usersData) : []

      // Find student user
      const studentUser = users.find(user => 
        user.email === email && 
        user.password === password && 
        user.role === 'student'
      )

      if (studentUser) {
        // Save current student to localStorage
        localStorage.setItem('current_simple_student', JSON.stringify(studentUser))
        
        toast.success("Login successful!", {
          description: `Welcome back, ${studentUser.name}`
        })
        
        // Redirect to student scanner
        router.push('/student/simple-scan')
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
          <h1 className="text-2xl font-bold text-foreground">Student Login</h1>
        </div>
        <div className="w-16" /> {/* Spacer for center alignment */}
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
            Student Login
          </CardTitle>
          <CardDescription>
            Sign in to access the QR scanner
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
                placeholder="student@example.com"
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
                onClick={() => router.push('/simple-auth/student/register')}
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