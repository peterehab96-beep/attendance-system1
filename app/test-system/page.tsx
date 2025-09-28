"use client"

/*
 * Test System Page
 * A simple page to test both the original and simple QR systems
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  QrCode, 
  Shield, 
  Users,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function TestSystemPage() {
  const router = useRouter()
  const [testResults, setTestResults] = useState<any[]>([])
  const [isTesting, setIsTesting] = useState(false)

  const runTests = async () => {
    setIsTesting(true)
    const results = []
    
    // Test 1: Check if required libraries are available
    try {
      if (typeof window !== 'undefined' && typeof (window as any).QRCode !== 'undefined') {
        results.push({ test: "QRCode Library", status: "passed", message: "Library is available" })
      } else {
        results.push({ test: "QRCode Library", status: "failed", message: "Library is missing" })
      }
    } catch (e) {
      results.push({ test: "QRCode Library", status: "failed", message: `Error: ${e}` })
    }

    // Test 2: Check if html5-qrcode is available
    try {
      if (typeof window !== 'undefined' && typeof (window as any).Html5QrcodeScanner !== 'undefined') {
        results.push({ test: "Html5QrcodeScanner", status: "passed", message: "Library is available" })
      } else {
        results.push({ test: "Html5QrcodeScanner", status: "failed", message: "Library is missing" })
      }
    } catch (e) {
      results.push({ test: "Html5QrcodeScanner", status: "failed", message: `Error: ${e}` })
    }

    // Test 3: Check localStorage functionality
    try {
      if (typeof window !== 'undefined') {
        const testKey = 'qr_system_test'
        localStorage.setItem(testKey, 'test')
        const value = localStorage.getItem(testKey)
        localStorage.removeItem(testKey)
        
        if (value === 'test') {
          results.push({ test: "localStorage", status: "passed", message: "Storage is working" })
        } else {
          results.push({ test: "localStorage", status: "failed", message: "Storage is not working properly" })
        }
      } else {
        results.push({ test: "localStorage", status: "failed", message: "Not available on server side" })
      }
    } catch (e) {
      results.push({ test: "localStorage", status: "failed", message: `Error: ${e}` })
    }

    // Test 4: Check if simple system pages exist
    try {
      const simpleModeResponse = await fetch('/simple-mode')
      if (simpleModeResponse.ok) {
        results.push({ test: "Simple Mode Page", status: "passed", message: "Page exists" })
      } else {
        results.push({ test: "Simple Mode Page", status: "failed", message: "Page not found" })
      }
    } catch (e) {
      results.push({ test: "Simple Mode Page", status: "failed", message: `Error: ${e}` })
    }

    // Test 5: Check if admin dashboard page exists
    try {
      const adminDashboardResponse = await fetch('/admin/dashboard')
      if (adminDashboardResponse.ok) {
        results.push({ test: "Admin Dashboard Page", status: "passed", message: "Page exists" })
      } else {
        results.push({ test: "Admin Dashboard Page", status: "failed", message: "Page not found" })
      }
    } catch (e) {
      results.push({ test: "Admin Dashboard Page", status: "failed", message: `Error: ${e}` })
    }

    setTestResults(results)
    setIsTesting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Test</h1>
            <p className="text-muted-foreground">Verify that both QR systems are working correctly</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Run System Tests</CardTitle>
            <CardDescription>
              Check if all components of both QR systems are working properly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runTests} 
              disabled={isTesting}
              className="w-full sm:w-auto"
            >
              {isTesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Running Tests...
                </>
              ) : (
                "Run All Tests"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Results from system functionality tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{result.test}</p>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                    {result.status === "passed" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Original System */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Original System
              </CardTitle>
              <CardDescription>
                Full-featured attendance system with Supabase integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Advanced QR generation and management
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Real-time attendance monitoring
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Supabase database integration
                </li>
              </ul>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => router.push('/admin/dashboard')}
                  className="w-full"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Button>
                <Button 
                  onClick={() => router.push('/student/scan')}
                  variant="outline"
                  className="w-full"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Student Scanner
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Simple System */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Simple System
              </CardTitle>
              <CardDescription>
                Lightweight system that works on all devices and browsers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Pure client-side operation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Camera and image upload options
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  5-minute QR codes for security
                </li>
              </ul>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => router.push('/admin/simple-dashboard')}
                  className="w-full"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Simple Admin
                </Button>
                <Button 
                  onClick={() => router.push('/student/simple-scan')}
                  variant="outline"
                  className="w-full"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Simple Scanner
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Both systems are available for use depending on your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">When to use Original System</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• When Supabase integration is required</li>
                <li>• For advanced attendance tracking</li>
                <li>• When real-time data synchronization is needed</li>
                <li>• For production environments with database support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">When to use Simple System</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• When maximum compatibility is needed</li>
                <li>• For offline or limited connectivity</li>
                <li>• When simplicity is preferred</li>
                <li>• For testing and demonstration purposes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}