"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAttendanceStore } from "@/lib/attendance-store"
import { FileText, Download, BarChart3, Filter } from "lucide-react"

export function ReportsGenerator() {
  const store = useAttendanceStore()
  const [reportType, setReportType] = useState<string>("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")

  const academicLevels = ["First Year", "Second Year", "Third Year", "Fourth Year"]

  const subjects = [
    "Western Rules & Solfege 1",
    "Western Rules & Solfege 2",
    "Western Rules & Solfege 3",
    "Western Rules & Solfege 4",
    "Western Rules & Solfege 5",
    "Western Rules & Solfege 6",
    "Improvisation 1",
    "Improvisation 2",
    "Rhythmic Movement 1",
    "Rhythmic Movement 2",
    "Hymn Singing",
  ]

  const reportTypes = [
    { id: "attendance_summary", name: "Attendance Summary", description: "Overall attendance statistics" },
    { id: "student_performance", name: "Student Performance", description: "Individual student grades and attendance" },
    { id: "subject_analysis", name: "Subject Analysis", description: "Performance breakdown by subject" },
    { id: "daily_attendance", name: "Daily Attendance", description: "Day-by-day attendance records" },
  ]

  const generateReport = () => {
    // Mock report generation
    const reportData = {
      type: reportType,
      dateRange,
      filters: { level: selectedLevel, subject: selectedSubject },
      generatedAt: new Date().toISOString(),
      data: {
        totalStudents: 24,
        totalSessions: 15,
        averageAttendance: 87.5,
        topPerformers: ["Ahmed Hassan", "Fatima Ali", "Omar Mahmoud"],
      },
    }

    // In a real app, this would generate and download a PDF/Excel file
    console.log("Generated Report:", reportData)
    alert("Report generated successfully! In a real application, this would download a file.")
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
        <h2 className="text-xl sm:text-2xl font-bold text-white">Reports Generator</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Report Configuration */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300 text-sm">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="text-white">
                      <div className="py-1">
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs sm:text-sm text-gray-400">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm">Start Date</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">End Date</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Academic Level (Optional)</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all-levels" className="text-white">
                    All Levels
                  </SelectItem>
                  {academicLevels.map((level) => (
                    <SelectItem key={level} value={level} className="text-white">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Subject (Optional)</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all-subjects" className="text-white">
                    All Subjects
                  </SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject} className="text-white">
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateReport}
              disabled={!reportType}
              className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              Report Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportType && reportType !== "" ? (
              <div className="space-y-4">
                <div className="p-3 sm:p-4 bg-gray-700/30 rounded-lg">
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">
                    {reportTypes.find((t) => t.id === reportType)?.name}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-4">
                    {reportTypes.find((t) => t.id === reportType)?.description}
                  </p>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Date Range:</span>
                      <span className="text-white text-right">
                        {dateRange.start && dateRange.end ? `${dateRange.start} to ${dateRange.end}` : "All dates"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Academic Level:</span>
                      <span className="text-white">
                        {selectedLevel && selectedLevel !== "all" ? selectedLevel : "All levels"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Subject:</span>
                      <span className="text-white text-right">
                        {selectedSubject && selectedSubject !== "all" ? selectedSubject : "All subjects"}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-600" />

                <div className="space-y-3">
                  <h4 className="text-white font-medium text-sm sm:text-base">Sample Data Preview:</h4>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="p-2 sm:p-3 bg-gray-700/20 rounded">
                      <div className="text-gray-400">Total Students</div>
                      <div className="text-white font-bold text-lg sm:text-xl">24</div>
                    </div>
                    <div className="p-2 sm:p-3 bg-gray-700/20 rounded">
                      <div className="text-gray-400">Avg Attendance</div>
                      <div className="text-white font-bold text-lg sm:text-xl">87.5%</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm sm:text-base">Select a report type to see preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Reports */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg sm:text-xl">Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {reportTypes.map((type) => (
              <Button
                key={type.id}
                variant="outline"
                className="h-auto p-3 sm:p-4 flex flex-col items-start gap-2 border-gray-600 hover:bg-gray-700/50 bg-transparent text-left"
                onClick={() => {
                  setReportType(type.id)
                  generateReport()
                }}
              >
                <div className="font-medium text-white text-sm sm:text-base">{type.name}</div>
                <div className="text-xs sm:text-sm text-gray-400 text-left">{type.description}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
