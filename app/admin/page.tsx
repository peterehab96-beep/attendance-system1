"use client"

/*
 * Admin Dashboard Navigation
 * Allows admins to choose between simple dashboard and Supabase dashboard
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  QrCode, 
  Database,
  Award,
  ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
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
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Choose your dashboard</p>
          </div>
          
          <div className="w-16" /> {/* Spacer for center alignment */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Simple Dashboard Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Simple Dashboard
              </CardTitle>
              <CardDescription>
                Basic QR code generation with local storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use this dashboard for basic QR code generation. Data is stored locally on your device.
              </p>
              <Button 
                onClick={() => router.push('/admin/simple-dashboard')}
                className="w-full"
              >
                Use Simple Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Supabase Dashboard Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Supabase Dashboard
              </CardTitle>
              <CardDescription>
                Advanced dashboard with Supabase integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use this dashboard for full Supabase integration. Attendance data is stored in the cloud.
              </p>
              <Button 
                onClick={() => router.push('/admin/simple-supabase')}
                variant="outline"
                className="w-full"
              >
                Use Supabase Dashboard
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
                Set grading criteria and view reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage student grading criteria and view attendance reports.
              </p>
              <Button 
                onClick={() => router.push('/admin/grading')}
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