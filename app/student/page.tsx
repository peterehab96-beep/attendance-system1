"use client"

/*
 * Student Dashboard Navigation
 * Allows students to choose between simple scanner and Supabase scanner
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  QrCode, 
  Database,
  ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function StudentDashboard() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
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
            <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-muted-foreground">Choose your QR scanning method</p>
          </div>
          
          <div className="w-16" /> {/* Spacer for center alignment */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Simple Scanner Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Simple QR Scanner
              </CardTitle>
              <CardDescription>
                Basic QR scanning with local storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use this scanner for basic attendance marking. Data is stored locally on your device.
              </p>
              <Button 
                onClick={() => router.push('/student/simple-scan')}
                className="w-full"
              >
                Use Simple Scanner
              </Button>
            </CardContent>
          </Card>

          {/* Supabase Scanner Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Supabase QR Scanner
              </CardTitle>
              <CardDescription>
                Advanced QR scanning with Supabase integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use this scanner for full Supabase integration. Attendance data is stored in the cloud.
              </p>
              <Button 
                onClick={() => router.push('/student/supabase-scan')}
                variant="outline"
                className="w-full"
              >
                Use Supabase Scanner
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}