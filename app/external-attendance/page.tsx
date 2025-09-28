"use client"

/*
 * External Attendance System Navigation
 * Main entry point for the new external attendance system
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  QrCode, 
  Award,
  ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function ExternalAttendanceSystem() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
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
            <h1 className="text-2xl font-bold text-foreground">External Attendance System</h1>
            <p className="text-muted-foreground">New system for native camera QR scanning</p>
          </div>
          
          <div className="w-16" /> {/* Spacer for center alignment */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Dashboard Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Admin Dashboard
              </CardTitle>
              <CardDescription>
                Generate external QR codes and monitor attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create QR codes that work with native camera apps. Monitor live attendance and manage sessions.
              </p>
              <Button 
                onClick={() => router.push('/external-attendance/admin')}
                className="w-full"
              >
                Access Admin Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Grading Management Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Grading Management
              </CardTitle>
              <CardDescription>
                Set grading criteria and view student reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage student grading criteria, set minimum/maximum grades, and export attendance reports.
              </p>
              <Button 
                onClick={() => router.push('/external-attendance/grading')}
                variant="outline"
                className="w-full"
              >
                Manage Grading
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}