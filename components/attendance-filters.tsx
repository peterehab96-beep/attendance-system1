"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Filter,
  Search,
  Calendar,
  Download,
  RefreshCw,
  Users,
  BookOpen,
  GraduationCap,
  Clock,
  BarChart3,
  FileText,
} from "lucide-react"

interface AttendanceSession {
  id: string
  academicLevel: string
  subject: string
  qrCode: string
  createdAt: Date
  isActive: boolean
  attendees: Array<{
    studentId: string
    studentName: string
    email: string
    scannedAt: Date
    score: number
  }>
}

interface AttendanceFiltersProps {
  sessions: AttendanceSession[]
}

export function AttendanceFilters({ sessions }: AttendanceFiltersProps) {
  const [filters, setFilters] = useState({
    academicLevel: "all",
    subject: "all",
    dateRange: "all",
    status: "all",
    searchTerm: "",
  })

  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const levels = [...new Set(sessions.map((s) => s.academicLevel))].sort()
    const subjects = [...new Set(sessions.map((s) => s.subject))].sort()
    return { levels, subjects }
  }, [sessions])

  // Apply filters and sorting
  const filteredSessions = useMemo(() => {
    let filtered = sessions

    // Academic level filter
    if (filters.academicLevel !== "all") {
      filtered = filtered.filter((session) => session.academicLevel === filters.academicLevel)
    }

    // Subject filter
    if (filters.subject !== "all") {
      filtered = filtered.filter((session) => session.subject === filters.subject)
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (filters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter((session) => session.createdAt >= filterDate)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter((session) => session.createdAt >= filterDate)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter((session) => session.createdAt >= filterDate)
          break
      }
    }

    // Status filter
    if (filters.status !== "all") {
      if (filters.status === "active") {
        filtered = filtered.filter((session) => session.isActive)
      } else if (filters.status === "completed") {
        filtered = filtered.filter((session) => !session.isActive)
      }
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (session) =>
          session.subject.toLowerCase().includes(searchLower) ||
          session.academicLevel.toLowerCase().includes(searchLower) ||
          session.id.toLowerCase().includes(searchLower) ||
          session.attendees.some((attendee) => attendee.studentName.toLowerCase().includes(searchLower)),
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "date":
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case "level":
          comparison = a.academicLevel.localeCompare(b.academicLevel)
          break
        case "subject":
          comparison = a.subject.localeCompare(b.subject)
          break
        case "attendance":
          comparison = a.attendees.length - b.attendees.length
          break
        default:
          comparison = 0
      }

      return sortOrder === "desc" ? -comparison : comparison
    })

    return filtered
  }, [sessions, filters, sortBy, sortOrder])

  // Statistics
  const stats = useMemo(() => {
    const totalSessions = filteredSessions.length
    const totalAttendees = filteredSessions.reduce((sum, session) => sum + session.attendees.length, 0)
    const averageAttendance = totalSessions > 0 ? Math.round((totalAttendees / totalSessions) * 100) / 100 : 0
    const activeSessions = filteredSessions.filter((session) => session.isActive).length

    return {
      totalSessions,
      totalAttendees,
      averageAttendance,
      activeSessions,
    }
  }, [filteredSessions])

  const clearFilters = () => {
    setFilters({
      academicLevel: "all",
      subject: "all",
      dateRange: "all",
      status: "all",
      searchTerm: "",
    })
  }

  const exportData = () => {
    // Create CSV data
    const csvData = [
      ["Session ID", "Date", "Time", "Academic Level", "Subject", "Status", "Attendees", "Average Score"].join(","),
      ...filteredSessions.map((session) => {
        const avgScore =
          session.attendees.length > 0
            ? Math.round(
                (session.attendees.reduce((sum, attendee) => sum + attendee.score, 0) / session.attendees.length) * 100,
              ) / 100
            : 0

        return [
          session.id,
          session.createdAt.toLocaleDateString(),
          session.createdAt.toLocaleTimeString(),
          session.academicLevel,
          session.subject,
          session.isActive ? "Active" : "Completed",
          session.attendees.length,
          avgScore,
        ].join(",")
      }),
    ].join("\n")

    // Download CSV
    const blob = new Blob([csvData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-data-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Data Filters & Analytics</h2>
          <p className="text-muted-foreground">Filter, search, and analyze attendance data with advanced options</p>
        </div>

        <Button onClick={exportData} disabled={filteredSessions.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter Controls
          </CardTitle>
          <CardDescription>Apply filters to narrow down the attendance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Academic Level Filter */}
            <div className="space-y-2">
              <Label>Academic Level</Label>
              <Select
                value={filters.academicLevel}
                onValueChange={(value) => setFilters({ ...filters, academicLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-levels">All Levels</SelectItem>
                  {filterOptions.levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Filter */}
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={filters.subject} onValueChange={(value) => setFilters({ ...filters, subject: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {filterOptions.subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
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

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-sessions">All Sessions</SelectItem>
                  <SelectItem value="active-sessions">Active Only</SelectItem>
                  <SelectItem value="completed-sessions">Completed Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="level">Academic Level</SelectItem>
                  <SelectItem value="subject">Subject</SelectItem>
                  <SelectItem value="attendance">Attendance Count</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label>Order</Label>
              <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions, subjects, students..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={clearFilters} className="bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filtered Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalSessions}</div>
            <div className="text-sm text-muted-foreground">of {sessions.length} total</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalAttendees}</div>
            <div className="text-sm text-muted-foreground">across all sessions</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.averageAttendance}</div>
            <div className="text-sm text-muted-foreground">students per session</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.activeSessions}</div>
            <div className="text-sm text-muted-foreground">currently running</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtered Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Filtered Results
          </CardTitle>
          <CardDescription>
            {filteredSessions.length > 0
              ? `Showing ${filteredSessions.length} session${filteredSessions.length !== 1 ? "s" : ""}`
              : "No sessions match your current filters"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">No Results Found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or search terms to find the data you're looking for.
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredSessions.map((session) => {
                  const avgScore =
                    session.attendees.length > 0
                      ? Math.round(
                          (session.attendees.reduce((sum, attendee) => sum + attendee.score, 0) /
                            session.attendees.length) *
                            100,
                        ) / 100
                      : 0

                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center space-y-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {session.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <span>{session.subject}</span>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-2">
                            <GraduationCap className="w-3 h-3" />
                            <span>{session.academicLevel}</span>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center space-x-2">
                            <Clock className="w-3 h-3" />
                            <span>{session.createdAt.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center space-x-2">
                          {session.isActive ? (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Completed</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium text-foreground">{session.attendees.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium text-foreground">{avgScore}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
