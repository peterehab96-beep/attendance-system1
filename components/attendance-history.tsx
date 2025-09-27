"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Filter, Search, Clock, CheckCircle, AlertCircle, BookOpen, BarChart3 } from "lucide-react"

interface AttendanceRecord {
  id: string
  sessionId: string
  subject: string
  academicLevel: string
  scannedAt: Date
  score: number
  status: "present" | "late" | "absent"
}

interface Student {
  id: string
  name: string
  email: string
  academicLevel: string
  subjects: string[]
}

interface AttendanceHistoryProps {
  records: AttendanceRecord[]
  student: Student
}

export function AttendanceHistory({ records, student }: AttendanceHistoryProps) {
  const [filteredRecords, setFilteredRecords] = useState(records)
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")

  // Apply filters
  const applyFilters = () => {
    let filtered = records

    // Subject filter
    if (subjectFilter !== "all") {
      filtered = filtered.filter((record) => record.subject === subjectFilter)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.sessionId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter((record) => record.scannedAt >= filterDate)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter((record) => record.scannedAt >= filterDate)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter((record) => record.scannedAt >= filterDate)
          break
      }
    }

    setFilteredRecords(filtered)
  }

  // Apply filters when any filter changes
  React.useEffect(() => {
    applyFilters()
  }, [subjectFilter, searchTerm, dateFilter, records])

  const clearFilters = () => {
    setSubjectFilter("all")
    setSearchTerm("")
    setDateFilter("all")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "late":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "absent":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Present</Badge>
      case "late":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Late</Badge>
      case "absent":
        return <Badge variant="destructive">Absent</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Attendance History</h2>
        <p className="text-muted-foreground">View and filter your complete attendance record</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Search
          </CardTitle>
          <CardDescription>Filter your attendance records by subject, date, or search terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Subject</label>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {student.subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date Range</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Actions</label>
              <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filtered Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{filteredRecords.length}</div>
            <div className="text-sm text-muted-foreground">of {records.length} total</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredRecords.length > 0
                ? Math.round(
                    (filteredRecords.reduce((sum, record) => sum + record.score, 0) / filteredRecords.length) * 100,
                  ) / 100
                : 0}
            </div>
            <div className="text-sm text-muted-foreground">points per session</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {filteredRecords.length > 0
                ? Math.round(
                    (filteredRecords.filter((r) => r.status === "present").length / filteredRecords.length) * 100,
                  )
                : 0}
              %
            </div>
            <div className="text-sm text-muted-foreground">attendance rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Records List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Attendance Records
          </CardTitle>
          <CardDescription>
            {filteredRecords.length > 0
              ? `Showing ${filteredRecords.length} record${filteredRecords.length !== 1 ? "s" : ""}`
              : "No records match your current filters"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">No Records Found</h3>
                <p className="text-sm text-muted-foreground">
                  {records.length === 0
                    ? "You haven't attended any sessions yet. Start scanning QR codes to build your attendance history."
                    : "No records match your current filters. Try adjusting your search criteria."}
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(record.status)}
                      <div>
                        <div className="font-medium text-foreground flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span>{record.subject}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {record.scannedAt.toLocaleDateString()} at {record.scannedAt.toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Session: {record.sessionId.slice(-8)}</div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      {getStatusBadge(record.status)}
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{record.score} pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
