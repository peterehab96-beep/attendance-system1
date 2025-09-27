"use client"

import { useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { useAttendanceStore } from "@/lib/attendance-store"
import { CheckCircle, Users, Clock, AlertCircle } from "lucide-react"

interface RealTimeNotificationsProps {
  isAdmin?: boolean
  studentId?: string
}

export function RealTimeNotifications({ isAdmin = false, studentId }: RealTimeNotificationsProps) {
  const store = useAttendanceStore()
  const [lastAttendeeCount, setLastAttendeeCount] = useState(0)
  const [lastSessionId, setLastSessionId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const activeSession = store.getActiveSession()
      
      if (activeSession && isAdmin) {
        // Notify admin of new attendees
        const currentAttendeeCount = activeSession.attendees.length
        
        if (activeSession.id !== lastSessionId) {
          // New session started
          setLastSessionId(activeSession.id)
          setLastAttendeeCount(currentAttendeeCount)
          
          toast({
            title: "Session Started",
            description: `${activeSession.subject} - ${activeSession.academicLevel}`,
            className: "bg-blue-50 border-blue-200",
          })
        } else if (currentAttendeeCount > lastAttendeeCount) {
          // New student joined
          const newAttendees = activeSession.attendees.slice(lastAttendeeCount)
          
          newAttendees.forEach((attendee) => {
            toast({
              title: "New Attendance Marked",
              description: `${attendee.studentName} joined ${activeSession.subject}`,
              className: "bg-green-50 border-green-200",
              action: (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-700 text-sm">Present</span>
                </div>
              ),
            })
          })
          
          setLastAttendeeCount(currentAttendeeCount)
        }
      }
      
      // Check for session expiry
      if (activeSession && new Date() > activeSession.expiresAt) {
        toast({
          title: "Session Expired",
          description: "QR code has expired. Please generate a new one.",
          variant: "destructive",
          action: (
            <AlertCircle className="w-4 h-4" />
          ),
        })
      }
    })

    return unsubscribe
  }, [store, isAdmin, lastAttendeeCount, lastSessionId])

  // For students - notify when they successfully mark attendance
  useEffect(() => {
    if (!isAdmin && studentId) {
      const unsubscribe = store.subscribe(() => {
        const activeSession = store.getActiveSession()
        if (activeSession) {
          const studentAttendance = activeSession.attendees.find(
            (attendee) => attendee.studentId === studentId
          )
          
          if (studentAttendance) {
            toast({
              title: "Attendance Confirmed",
              description: `You are marked present for ${activeSession.subject}`,
              className: "bg-green-50 border-green-200",
              action: (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ),
            })
          }
        }
      })

      return unsubscribe
    }
  }, [store, isAdmin, studentId])

  return null // This component only handles notifications
}