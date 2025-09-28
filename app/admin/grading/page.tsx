"use client"

/*
 * Grading Management Page
 * Allows admins to set grading criteria and view student reports
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Award, 
  Download,
  User,
  BookOpen,
  Calendar,
  TrendingUp
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface AdminData {
  id: string
  name: string
  email: string
  role: string
}

interface GradingCriteria {
  id: string
  subject: string
  academicLevel: string
  maxGrade: number
  minGrade: number
  requiredAttendance: number
}

interface StudentReport {
  id: string
  student_name: string
  student_email: string
  subject_name: string
  total_attendance: number
  average_grade: number
  final_grade: number
  status: 'pass' | 'fail' | 'incomplete'
}

export default function GradingManagementPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [gradingCriteria, setGradingCriteria] = useState<GradingCriteria[]>([])
  const [newCriteria, setNewCriteria] = useState({
    subject: "",
    academicLevel: "",
    maxGrade: 100,
    minGrade: 60,
    requiredAttendance: 10
  })
  const [reports, setReports] = useState<StudentReport[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Academic levels and subjects
  const academicLevels = ["First Year", "Second Year", "Third Year", "Fourth Year"]
  
  const subjectsByLevel = {
    "First Year": [
      "Western Rules & Solfege 1",
      "Western Rules & Solfege 2", 
      "Rhythmic Movement 1"
    ],
    "Second Year": [
      "Western Rules & Solfege 3",
      "Western Rules & Solfege 4",
      "Hymn Singing",
      "Rhythmic Movement 2"
    ],
    "Third Year": [
      "Western Rules & Solfege 5",
      "Improvisation 1"
    ],
    "Fourth Year": [
      "Western Rules & Solfege 6", 
      "Improvisation 2"
    ]
  }

  // Load admin data
  useEffect(() => {
    loadAdminData()
    loadGradingCriteria()
    loadStudentReports()
  }, [])

  const loadAdminData = async () => {
    try {
      const localAdmin = localStorage.getItem('currentAdmin')
      if (localAdmin) {
        const adminData = JSON.parse(localAdmin)
        setAdmin(adminData)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error("[Grading Management] Error loading admin:", error)
      router.push('/')
    }
  }

  const loadGradingCriteria = async () => {
    try {
      // For now, we'll use localStorage for grading criteria
      // In a real implementation, this would come from Supabase
      const savedCriteria = localStorage.getItem('grading_criteria')
      if (savedCriteria) {
        setGradingCriteria(JSON.parse(savedCriteria))
      }
    } catch (error) {
      console.warn("[Grading Management] Could not load grading criteria:", error)
    }
  }

  const loadStudentReports = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      
      if (supabase) {
        // This is a simplified version - in a real implementation, 
        // you would have more complex queries to calculate grades
        const { data, error } = await supabase
          .from('attendance_records')
          .select(`
            student_name,
            student_email,
            subject_name,
            grade_points
          `)
          .order('student_name')

        if (!error && data) {
          // Group by student and subject to create reports
          const groupedReports: Record<string, any> = {}
          
          data.forEach(record => {
            const key = `${record.student_name}-${record.subject_name}`
            if (!groupedReports[key]) {
              groupedReports[key] = {
                id: key,
                student_name: record.student_name,
                student_email: record.student_email,
                subject_name: record.subject_name,
                total_attendance: 0,
                grade_points: 0,
                count: 0
              }
            }
            
            groupedReports[key].total_attendance += 1
            groupedReports[key].grade_points += record.grade_points
            groupedReports[key].count += 1
          })
          
          // Calculate averages and final grades
          const reports = Object.values(groupedReports).map((report: any) => {
            const averageGrade = report.count > 0 ? report.grade_points / report.count : 0
            const finalGrade = Math.min(100, Math.max(0, averageGrade * report.total_attendance / 10))
            
            return {
              ...report,
              average_grade: parseFloat(averageGrade.toFixed(1)),
              final_grade: parseFloat(finalGrade.toFixed(1)),
              status: finalGrade >= 60 ? 'pass' : 'fail'
            }
          })
          
          setReports(reports)
        }
      }
    } catch (error) {
      console.error("[Grading Management] Error loading reports:", error)
      toast.error("Failed to load student reports")
    } finally {
      setIsLoading(false)
    }
  }

  const addGradingCriteria = () => {
    if (!newCriteria.subject || !newCriteria.academicLevel) {
      toast.error("Please fill in all required fields")
      return
    }
    
    const criteria: GradingCriteria = {
      id: `criteria_${Date.now()}`,
      ...newCriteria
    }
    
    const updatedCriteria = [...gradingCriteria, criteria]
    setGradingCriteria(updatedCriteria)
    localStorage.setItem('grading_criteria', JSON.stringify(updatedCriteria))
    
    // Reset form
    setNewCriteria({
      subject: "",
      academicLevel: "",
      maxGrade: 100,
      minGrade: 60,
      requiredAttendance: 10
    })
    
    toast.success("Grading criteria added successfully")
  }

  const deleteGradingCriteria = (id: string) => {
    const updatedCriteria = gradingCriteria.filter(criteria => criteria.id !== id)
    setGradingCriteria(updatedCriteria)
    localStorage.setItem('grading_criteria', JSON.stringify(updatedCriteria))
    toast.success("Grading criteria deleted")
  }

  const exportToExcel = () => {
    // Create CSV content
    let csvContent = "Student Name,Email,Subject,Total Attendance,Average Grade,Final Grade,Status\n"
    
    reports.forEach(report => {
      csvContent += `${report.student_name},${report.student_email},${report.subject_name},${report.total_attendance},${report.average_grade},${report.final_grade},${report.status}\n`
    })
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'student_reports.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("Reports exported to CSV")
  }

  const exportToPDF = () => {
    toast.info("PDF export functionality would be implemented here")
    // In a real implementation, you would use a library like jsPDF
  }

  const handleLogout = () => {
    localStorage.removeItem('currentAdmin')
    router.push('/')
    toast.success("Logged out successfully")
  }

  if (!admin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Grading Management</h1>
            <p className="text-muted-foreground">Set grading criteria and view student reports</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Add Grading Criteria Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Add Grading Criteria
            </CardTitle>
            <CardDescription>
              Set grading criteria for subjects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Academic Level</Label>
                <select 
                  value={newCriteria.academicLevel}
                  onChange={(e) => setNewCriteria({...newCriteria, academicLevel: e.target.value})}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="">Select academic level</option>
                  {academicLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Subject</Label>
                <select 
                  value={newCriteria.subject}
                  onChange={(e) => setNewCriteria({...newCriteria, subject: e.target.value})}
                  className="w-full p-2 border rounded-md bg-background"
                  disabled={!newCriteria.academicLevel}
                >
                  <option value="">Select subject</option>
                  {newCriteria.academicLevel && subjectsByLevel[newCriteria.academicLevel as keyof typeof subjectsByLevel]?.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Maximum Grade</Label>
                <Input 
                  type="number" 
                  value={newCriteria.maxGrade}
                  onChange={(e) => setNewCriteria({...newCriteria, maxGrade: parseInt(e.target.value) || 0})}
                  min="0"
                  max="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Minimum Grade</Label>
                <Input 
                  type="number" 
                  value={newCriteria.minGrade}
                  onChange={(e) => setNewCriteria({...newCriteria, minGrade: parseInt(e.target.value) || 0})}
                  min="0"
                  max="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Required Attendance</Label>
                <Input 
                  type="number" 
                  value={newCriteria.requiredAttendance}
                  onChange={(e) => setNewCriteria({...newCriteria, requiredAttendance: parseInt(e.target.value) || 0})}
                  min="1"
                />
              </div>
            </div>
            
            <Button onClick={addGradingCriteria} className="w-full md:w-auto">
              Add Criteria
            </Button>
          </CardContent>
        </Card>

        {/* Current Grading Criteria */}
        {gradingCriteria.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Current Grading Criteria</CardTitle>
              <CardDescription>
                Active grading criteria for subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Max Grade</TableHead>
                    <TableHead>Min Grade</TableHead>
                    <TableHead>Required Attendance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradingCriteria.map(criteria => (
                    <TableRow key={criteria.id}>
                      <TableCell>{criteria.subject}</TableCell>
                      <TableCell>{criteria.academicLevel}</TableCell>
                      <TableCell>{criteria.maxGrade}</TableCell>
                      <TableCell>{criteria.minGrade}</TableCell>
                      <TableCell>{criteria.requiredAttendance}</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteGradingCriteria(criteria.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Student Reports */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Reports
                </CardTitle>
                <CardDescription>
                  Attendance and grade reports for all students
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportToExcel} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={exportToPDF} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reports.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Avg Grade</TableHead>
                    <TableHead>Final Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.student_name}</p>
                          <p className="text-sm text-muted-foreground">{report.student_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{report.subject_name}</TableCell>
                      <TableCell>{report.total_attendance}</TableCell>
                      <TableCell>{report.average_grade}</TableCell>
                      <TableCell className="font-medium">{report.final_grade}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={report.status === 'pass' ? 'default' : report.status === 'fail' ? 'destructive' : 'secondary'}
                        >
                          {report.status === 'pass' ? 'Pass' : report.status === 'fail' ? 'Fail' : 'Incomplete'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <User className="w-8 h-8 text-muted-foreground" />
                <h3 className="font-medium">No Reports Available</h3>
                <p className="text-sm text-muted-foreground">
                  Student reports will appear here after attendance is recorded
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}