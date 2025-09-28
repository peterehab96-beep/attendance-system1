"use client"

/*
 * Simple Student Registration Page
 * A simplified registration page for student users
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  UserPlus,
  ArrowLeft,
  BookOpen
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

const academicLevels = ["First Year", "Second Year", "Third Year", "Fourth Year"]

const subjectsByLevel = {
  "First Year": [
    "Western Rules & Solfege 1",
    "Western Rules & Solfege 2", 
    "Rhythmic Movement 1"
  ],
  "Second Year": [
    "Western Rules & Solfege 3",
    "Western Rules & Solfege 4",
    "Hymn Singing",
    "Rhythmic Movement 2"
  ],
  "Third Year": [
    "Western Rules & Solfege 5",
    "Improvisation 1"
  ],
  "Fourth Year": [
    "Western Rules & Solfege 6", 
    "Improvisation 2"
  ]
}

export default function SimpleStudentRegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [academicLevel, setAcademicLevel] = useState("")
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject) 
        : [...prev, subject]
    )
  }

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

    if (!academicLevel) {
      setError("Please select your academic level")
      setIsLoading(false)
      return
    }

    if (selectedSubjects.length === 0) {
      setError("Please select at least one subject")
      setIsLoading(false)
      return
    }

    try {
      // Get existing users from localStorage
      const usersData = localStorage.getItem('simple_users')
      const users: StudentUser[] = usersData ? JSON.parse(usersData) : []

      // Check if email already exists
      const existingUser = users.find(user => user.email === email)
      if (existingUser) {
        setError("An account with this email already exists")
        setIsLoading(false)
        return
      }

      // Create new student user
      const newStudent: StudentUser = {
        id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        password, // In a real app, this would be hashed
        role: 'student',
        academicLevel,
        subjects: selectedSubjects
      }

      // Save user to localStorage
      users.push(newStudent)
      localStorage.setItem('simple_users', JSON.stringify(users))

      // Save as current student
      localStorage.setItem('current_simple_student', JSON.stringify(newStudent))

      toast.success("Registration successful!", {
        description: `Welcome, ${newStudent.name}`
      })

      // Redirect to student scanner
      router.push('/student/simple-scan')
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
    <div className="max-w-2xl mx-auto">
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
          <h1 className="text-2xl font-bold text-foreground">Student Register</h1>
        </div>
        <div className="w-16" /> {/* Spacer for center alignment */}
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <UserPlus className="w-5 h-5" />
            Student Registration
          </CardTitle>
          <CardDescription>
            Create an account to access the QR scanner
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ahmed Mohamed"
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
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="space-y-2">
              <Label>Academic Level</Label>
              <Select value={academicLevel} onValueChange={setAcademicLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your academic level" />
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

            {academicLevel && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Select Subjects
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {subjectsByLevel[academicLevel as keyof typeof subjectsByLevel]?.map((subject) => (
                    <Button
                      key={subject}
                      type="button"
                      variant={selectedSubjects.includes(subject) ? "default" : "outline"}
                      className="justify-start h-auto py-3 px-4 text-left"
                      onClick={() => handleSubjectToggle(subject)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full border ${selectedSubjects.includes(subject) ? 'bg-primary' : 'border-muted-foreground'}`} />
                        <span className="text-sm">{subject}</span>
                      </div>
                    </Button>
                  ))}
                </div>
                {selectedSubjects.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

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
                onClick={() => router.push('/simple-auth/student/login')}
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