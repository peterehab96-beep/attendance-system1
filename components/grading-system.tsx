"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAttendanceStore } from "@/lib/attendance-store"
import { Calculator, TrendingUp, Award, Users, BookOpen, Plus, Edit2 } from "lucide-react"

interface GradingRule {
  id: string
  name: string
  attendanceWeight: number
  participationWeight: number
  examWeight: number
  minAttendanceRate: number
}

const defaultGradingRules: GradingRule[] = [
  {
    id: "western_rules",
    name: "Western Rules & Solfege",
    attendanceWeight: 30,
    participationWeight: 20,
    examWeight: 50,
    minAttendanceRate: 75,
  },
  {
    id: "improvisation",
    name: "Improvisation",
    attendanceWeight: 40,
    participationWeight: 30,
    examWeight: 30,
    minAttendanceRate: 80,
  },
  {
    id: "rhythmic_movement",
    name: "Rhythmic Movement",
    attendanceWeight: 50,
    participationWeight: 30,
    examWeight: 20,
    minAttendanceRate: 85,
  },
  {
    id: "hymn_singing",
    name: "Hymn Singing",
    attendanceWeight: 35,
    participationWeight: 25,
    examWeight: 40,
    minAttendanceRate: 70,
  },
]

export function GradingSystem() {
  const store = useAttendanceStore()
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [gradingRules, setGradingRules] = useState<GradingRule[]>(defaultGradingRules)
  const [customRule, setCustomRule] = useState<Partial<GradingRule>>({})
  const [isEditingRules, setIsEditingRules] = useState(false)
  
  // Get real data from the attendance store
  const students = store.getAllStudents()
  const sessions = store.getAllSessions()
  const records = store.getAllAttendanceRecords()
  
  // Calculate real statistics
  const statistics = useMemo(() => {
    const totalStudents = students.length
    const totalSessions = sessions.length
    const totalRecords = records.length
    
    // Get unique subjects from sessions
    const subjects = Array.from(new Set(sessions.map((session: any) => session.subject)))
    const activeSubjects = subjects.length
    
    // Calculate grades for each student
    const studentGrades: number[] = []
    let passCount = 0
    
    students.forEach((student: any) => {
      const studentRecords = records.filter((r: any) => r.studentId === student.id)
      let totalGrade = 0
      let subjectCount = 0
      
      subjects.forEach(subject => {
        const subjectSessions = sessions.filter((s: any) => s.subject === subject)
        const subjectRecords = studentRecords.filter((r: any) => 
          subjectSessions.some((s: any) => s.id === r.sessionId)
        )
        
        if (subjectSessions.length > 0) {
          const grade = calculateStudentSubjectGrade(student.id, subject, subjectSessions, subjectRecords)
          totalGrade += grade.grade
          subjectCount++
        }
      })
      
      if (subjectCount > 0) {
        const avgGrade = totalGrade / subjectCount
        studentGrades.push(avgGrade)
        if (avgGrade >= 60) passCount++ // Assuming 60% is passing grade
      }
    })
    
    const averageGrade = studentGrades.length > 0 
      ? studentGrades.reduce((sum, grade) => sum + grade, 0) / studentGrades.length 
      : 0
    
    const passRate = totalStudents > 0 ? (passCount / totalStudents) * 100 : 0
    
    return {
      totalStudents,
      activeSubjects,
      averageGrade: Math.round(averageGrade * 10) / 10,
      passRate: Math.round(passRate * 10) / 10
    }
  }, [students, sessions, records])

  const calculateStudentSubjectGrade = (
    studentId: string, 
    subject: string, 
    subjectSessions: any[], 
    studentRecords: any[]
  ) => {
    const rule = gradingRules.find((r) => 
      subject.toLowerCase().includes(r.name.toLowerCase().split(' ')[0]) ||
      r.name.toLowerCase().includes(subject.toLowerCase())
    ) || gradingRules[0] // Default to first rule if no match

    if (subjectSessions.length === 0) {
      return { grade: 0, status: "No Sessions", breakdown: {} }
    }

    const totalSessions = subjectSessions.length
    const attendedSessions = studentRecords.length
    const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0
    
    // Calculate participation based on actual attendance scores (1-10 scale)
    const averageParticipation = studentRecords.length > 0 
      ? studentRecords.reduce((sum: number, r: any) => sum + (r.score || 8), 0) / studentRecords.length
      : 0
    
    // For demo purposes, calculate exam score based on attendance pattern
    // In real implementation, this would come from actual exam data
    const examScore = Math.min(100, 60 + (attendanceRate * 0.4) + (averageParticipation * 2))

    const attendanceGrade = (attendanceRate / 100) * rule.attendanceWeight
    const participationGrade = (averageParticipation / 10) * rule.participationWeight
    const examGrade = (examScore / 100) * rule.examWeight

    const totalGrade = attendanceGrade + participationGrade + examGrade
    const status = attendanceRate >= rule.minAttendanceRate && totalGrade >= 60 ? "Pass" : "Fail"

    return {
      grade: Math.round(totalGrade * 100) / 100,
      status,
      breakdown: {
        attendance: Math.round(attendanceGrade * 100) / 100,
        participation: Math.round(participationGrade * 100) / 100,
        exam: Math.round(examGrade * 100) / 100,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
      },
    }
  }

  const calculateStudentGrade = (studentId: string, subject: string) => {
    const subjectSessions = sessions.filter((s: any) => s.subject === subject)
    const studentRecords = records.filter((r: any) => 
      r.studentId === studentId && 
      subjectSessions.some((s: any) => s.id === r.sessionId)
    )
    
    return calculateStudentSubjectGrade(studentId, subject, subjectSessions, studentRecords)
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 85) return "text-green-400"
    if (grade >= 70) return "text-blue-400"
    if (grade >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getStatusBadge = (status: string) => {
    return status === "Pass" ? (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Pass</Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Fail</Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-6 w-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Grading System</h2>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-purple-600">
            Grading Rules
          </TabsTrigger>
          <TabsTrigger value="calculator" className="data-[state=active]:bg-purple-600">
            Grade Calculator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Students</p>
                    <p className="text-2xl font-bold text-white">{statistics.totalStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Active Subjects</p>
                    <p className="text-2xl font-bold text-white">{statistics.activeSubjects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Average Grade</p>
                    <p className="text-2xl font-bold text-white">{statistics.averageGrade || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Pass Rate</p>
                    <p className="text-2xl font-bold text-white">{statistics.passRate || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Student Grades Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No students registered yet</p>
                  <p className="text-gray-500 text-sm">Students will appear here once they start attending sessions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.slice(0, 5).map((student: any) => {
                    // Calculate overall grade for this student
                    const subjects = Array.from(new Set(sessions.map((s: any) => s.subject)))
                    let totalGrade = 0
                    let subjectCount = 0
                    let overallStatus = "Pass"
                    
                    subjects.forEach(subject => {
                      const grade = calculateStudentGrade(student.id, subject)
                      if (grade.grade > 0) {
                        totalGrade += grade.grade
                        subjectCount++
                        if (grade.status === "Fail") overallStatus = "Fail"
                      }
                    })
                    
                    const avgGrade = subjectCount > 0 ? Math.round((totalGrade / subjectCount) * 10) / 10 : 0
                    
                    return (
                      <div key={student.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {student.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="text-white font-medium">{student.name}</p>
                            <p className="text-sm text-gray-400">{student.studentId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-lg font-bold ${getGradeColor(avgGrade)}`}>
                              {avgGrade > 0 ? `${avgGrade}%` : 'N/A'}
                            </p>
                            <p className="text-sm text-gray-400">Overall</p>
                          </div>
                          {avgGrade > 0 ? getStatusBadge(overallStatus) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">No Data</Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {students.length > 5 && (
                    <div className="text-center pt-4">
                      <p className="text-gray-400 text-sm">And {students.length - 5} more students...</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Subject Grading Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gradingRules.map((rule) => (
                <div key={rule.id} className="p-4 bg-gray-700/30 rounded-lg">
                  <h3 className="text-white font-semibold mb-3">{rule.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Attendance</p>
                      <p className="text-white font-medium">{rule.attendanceWeight}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Participation</p>
                      <p className="text-white font-medium">{rule.participationWeight}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Exam</p>
                      <p className="text-white font-medium">{rule.examWeight}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Min Attendance</p>
                      <p className="text-white font-medium">{rule.minAttendanceRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Grade Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Select Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choose a subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {Array.from(new Set(sessions.map((s: any) => s.subject))).map((subject) => (
                        <SelectItem key={subject} value={subject} className="text-white">
                          {subject}
                        </SelectItem>
                      ))}
                      {sessions.length === 0 && (
                        <SelectItem value="no-subjects" disabled className="text-gray-400">
                          No subjects available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedSubject && selectedSubject !== "no-subjects" && (
                <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
                  <h3 className="text-white font-semibold mb-4">Grade Breakdown for {selectedSubject}</h3>
                  {students.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-400">No students registered for this subject</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {students.map((student: any) => {
                        const grade = calculateStudentGrade(student.id, selectedSubject)
                        return (
                          <div key={student.id} className="flex items-center justify-between p-3 bg-gray-600/30 rounded">
                            <div className="flex flex-col">
                              <span className="text-white font-medium">{student.name}</span>
                              <span className="text-sm text-gray-400">{student.studentId}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {grade.grade > 0 ? (
                                <>
                                  <div className="text-right">
                                    <span className={`font-bold ${getGradeColor(grade.grade)}`}>{grade.grade}%</span>
                                    {grade.breakdown.attendanceRate !== undefined && (
                                      <div className="text-xs text-gray-400">
                                        Attendance: {grade.breakdown.attendanceRate}%
                                      </div>
                                    )}
                                  </div>
                                  {getStatusBadge(grade.status)}
                                </>
                              ) : (
                                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                  No Data
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
