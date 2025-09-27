"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, GraduationCap, BookOpen, Calendar, Shield } from "lucide-react"

interface Student {
  id: string
  name: string
  email: string
  academicLevel: string
  subjects: string[]
}

interface StudentProfileProps {
  student: Student
}

export function StudentProfile({ student }: StudentProfileProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">My Profile</h2>
        <p className="text-muted-foreground">Your academic information and enrolled subjects</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{student.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{student.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Academic Level</label>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <Badge variant="secondary" className="font-medium">
                      {student.academicLevel}
                    </Badge>
                  </div>
                </div>

                {/* Student ID removed as requested for security */}
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Academic Information
              </CardTitle>
              <CardDescription>Your enrollment details and course information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Faculty</label>
                  <span className="text-foreground font-medium">Faculty of Specific Education</span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <span className="text-foreground font-medium">Department of Musical Sciences</span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">University</label>
                  <span className="text-foreground font-medium">Zagazig University</span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Academic Year</label>
                  <span className="text-foreground font-medium">2024-2025</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Subjects */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Enrolled Subjects
              </CardTitle>
              <CardDescription>
                {student.subjects.length} subject{student.subjects.length !== 1 ? "s" : ""} for {student.academicLevel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {student.subjects.map((subject, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-start space-x-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-sm">{subject}</div>
                        <div className="text-xs text-muted-foreground mt-1">{student.academicLevel}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Enrolled Subjects:</span>
                <span className="font-medium text-foreground">{student.subjects.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Academic Level:</span>
                <Badge variant="outline">{student.academicLevel}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account Status:</span>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Profile Created:</span>
                <span>Today</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Login:</span>
                <span>Just now</span>
              </div>
              <div className="flex items-center justify-between">
                <span>System Version:</span>
                <span>v2.0.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
