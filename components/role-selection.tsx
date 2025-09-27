"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Users, Music, ArrowRight } from "lucide-react"
import { AdminAuth } from "@/components/admin-auth"
import { StudentAuth } from "@/components/student-auth"

export function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<"admin" | "student" | null>(null)

  if (selectedRole === "admin") {
    return <AdminAuth onBack={() => setSelectedRole(null)} />
  }

  if (selectedRole === "student") {
    return <StudentAuth onBack={() => setSelectedRole(null)} />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Music className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Music Education System</h1>
          </div>
          <p className="text-muted-foreground text-lg">Select your role to access the attendance and grading system</p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Admin Card */}
          <Card className="group hover:border-primary/50 transition-all duration-300 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Administrator</CardTitle>
              <CardDescription className="text-base">
                Manage attendance sessions, generate QR codes, and track student performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Generate session QR codes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Real-time attendance monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Grade configuration & analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Advanced filtering & reports</span>
                </div>
              </div>
              <Button
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                onClick={() => setSelectedRole("admin")}
              >
                Access Admin Panel
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card className="group hover:border-primary/50 transition-all duration-300 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Student</CardTitle>
              <CardDescription className="text-base">
                Scan QR codes for attendance and view your academic progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Quick QR code scanning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Instant attendance confirmation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Personal attendance history</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Subject & date filtering</span>
                </div>
              </div>
              <Button
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                onClick={() => setSelectedRole("student")}
              >
                Student Access
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Zagazig University - Faculty of Specific Education</p>
          <p>Department of Musical Sciences</p>
        </div>
      </div>
    </div>
  )
}
