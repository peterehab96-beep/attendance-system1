"use client"

/*
 * Simple Authentication Entry Point
 * A simplified authentication system for the simple QR attendance system
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  Users,
  LogIn,
  UserPlus
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function SimpleAuthPage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Simple Attendance System</h1>
        <p className="text-muted-foreground">Simplified authentication for QR-based attendance tracking</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Choose your role to access the attendance system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Create QR codes and monitor attendance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Generate attendance QR codes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Monitor student attendance
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Manage attendance sessions
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
                    Scan attendance QR codes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    View attendance history
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Track attendance records
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

          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>This is a simplified authentication system for the QR attendance system.</p>
            <p>All data is stored locally in your browser.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}