"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAttendanceStore } from "@/lib/attendance-store"
import { TrendingUp, Award, BookOpen, Calendar, Target } from "lucide-react"

interface StudentGradesProps {
  studentId: string
}

export function StudentGrades({ studentId }: StudentGradesProps) {
  const store = useAttendanceStore()
  const stats = store.getStudentStats(studentId)
  const records = store.getStudentAttendanceRecords(studentId)

  const subjects = [
    { name: "Western Rules & Solfege 3", grade: 85, attendance: 90, status: "Excellent" },
    { name: "Improvisation 1", grade: 78, attendance: 85, status: "Good" },
    { name: "Rhythmic Movement 1", grade: 92, attendance: 95, status: "Excellent" },
  ]

  const getGradeColor = (grade: number) => {
    if (grade >= 85) return "text-green-400"
    if (grade >= 70) return "text-blue-400"
    if (grade >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      Excellent: "bg-green-500/20 text-green-400 border-green-500/30",
      Good: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      Average: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      Poor: "bg-red-500/20 text-red-400 border-red-500/30",
    }
    return <Badge className={colors[status as keyof typeof colors] || colors.Average}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Award className="h-6 w-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">My Grades</h2>
      </div>

      {/* Overall Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Overall GPA</p>
                <p className="text-2xl font-bold text-white">3.42</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Attendance Rate</p>
                <p className="text-2xl font-bold text-white">{stats.attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Subjects</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Avg Score</p>
                <p className="text-2xl font-bold text-white">{stats.averageScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Grades */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" />
            Subject Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subjects.map((subject) => (
            <div key={subject.name} className="p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">{subject.name}</h3>
                {getStatusBadge(subject.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Grade</span>
                    <span className={`font-bold ${getGradeColor(subject.grade)}`}>{subject.grade}%</span>
                  </div>
                  <Progress value={subject.grade} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Attendance</span>
                    <span className="text-white font-medium">{subject.attendance}%</span>
                  </div>
                  <Progress value={subject.attendance} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Grade Breakdown */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Grade Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-400">Attendance</p>
                <p className="text-lg font-bold text-green-400">30%</p>
              </div>
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-400">Participation</p>
                <p className="text-lg font-bold text-blue-400">20%</p>
              </div>
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-400">Exams</p>
                <p className="text-lg font-bold text-purple-400">50%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
