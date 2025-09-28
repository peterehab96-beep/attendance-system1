"use client"

/*
 * Simple Mode Entry Point
 * A completely new, simplified QR system for attendance tracking
 * Works on all devices and browsers with minimal complexity
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  QrCode, 
  Users, 
  Shield,
  ArrowLeft,
  LogIn,
  UserPlus
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function SimpleModePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Simple Attendance Mode</h1>
            <p className="text-muted-foreground">A new, simplified QR system that works everywhere</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How This System Works</CardTitle>
            <CardDescription>
              A completely new approach to attendance tracking with maximum compatibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium mb-2">1. Admin Creates QR</h3>
                <p className="text-sm text-muted-foreground">
                  Instructor generates a simple QR code for the class
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium mb-2">2. Students Scan</h3>
                <p className="text-sm text-muted-foreground">
                  Students scan the QR with camera or upload image
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-medium mb-2">3. Attendance Recorded</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic attendance tracking with real-time updates
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200">Key Benefits</h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Works on all devices and browsers (mobile, desktop, tablet)</li>
                <li>• No complex setup or configuration required</li>
                <li>• 5-minute QR codes for security</li>
                <li>• Camera and image upload options</li>
                <li>• Real-time attendance monitoring</li>
                <li>• No internet required after QR generation</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Admin Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Administrator
              </CardTitle>
              <CardDescription>
                Generate QR codes and monitor attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Create simple QR codes for classes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  5-minute expiration for security
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Real-time attendance monitoring
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Works on any device or browser
                </li>
              </ul>
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  onClick={() => router.push('/simple-auth/admin/login')}
                  className="w-full"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/simple-auth/admin/register')}
                  className="w-full"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Admin Register
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student
              </CardTitle>
              <CardDescription>
                Scan QR codes to mark attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Camera scanning with fallback
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Image upload option for iOS
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Subject validation before scanning
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Instant attendance confirmation
                </li>
              </ul>
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  onClick={() => router.push('/simple-auth/student/login')}
                  className="w-full"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Student Login
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/simple-auth/student/register')}
                  className="w-full"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Student Register
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Info */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
            <CardDescription>
              How this simplified system achieves maximum compatibility
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Compatibility Features</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Pure client-side operation (no server required)</li>
                <li>• localStorage for data persistence</li>
                <li>• Responsive design for all screen sizes</li>
                <li>• Graceful degradation for older browsers</li>
                <li>• No external dependencies except QR libraries</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Security Measures</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 5-minute QR code expiration</li>
                <li>• Session-based attendance tracking</li>
                <li>• Duplicate scan prevention</li>
                <li>• Subject validation</li>
                <li>• Secure data handling</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}