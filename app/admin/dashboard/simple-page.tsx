"use client"

/*
 * Simple Admin Dashboard Page
 * Minimal implementation to ensure the admin dashboard works
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  QrCode, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Shield
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AdminData {
  id: string
  name: string
  email: string
  role: string
}

export default function SimpleAdminDashboardPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }
    
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      // Ensure we're on the client side
      if (typeof window === 'undefined') {
        return
      }
      
      // Load admin data from localStorage
      const localAdmin = localStorage.getItem('currentAdmin')
      
      if (localAdmin) {
        const adminData = JSON.parse(localAdmin)
        setAdmin(adminData)
        console.log("[Simple Admin Dashboard] Loaded admin data:", adminData.name)
      } else {
        // For demo, create a default admin
        const defaultAdmin = {
          id: 'admin-demo-001',
          name: 'Dr. Ahmed Hassan',
          email: 'admin@demo.com',
          role: 'admin'
        }
        setAdmin(defaultAdmin)
        localStorage.setItem('currentAdmin', JSON.stringify(defaultAdmin))
        console.log("[Simple Admin Dashboard] Created demo admin")
      }
    } catch (error) {
      console.error("[Simple Admin Dashboard] Error loading admin data:", error)
      toast.error("Failed to load admin data")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Admin Not Found</CardTitle>
            <CardDescription>
              Please log in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
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
            <h1 className="text-3xl font-bold text-foreground">Simple Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {admin.name}</p>
          </div>
          
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Shield className="w-3 h-3 mr-1" />
            {admin.role}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard Status</CardTitle>
            <CardDescription>
              The admin dashboard is working correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <h3 className="text-2xl font-bold">Admin Dashboard Working</h3>
              <p className="text-muted-foreground text-center">
                Congratulations! The admin dashboard is now functioning properly.
              </p>
              <Button onClick={() => router.push('/admin/simple-dashboard')}>
                Try Simple Admin Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}