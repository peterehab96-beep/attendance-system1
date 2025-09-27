"use client"

import { toast } from 'sonner'
import React from 'react'

export interface NotificationData {
  id: string
  type: 'attendance' | 'login' | 'registration' | 'error' | 'success' | 'info'
  title: string
  message: string
  timestamp: Date
  userId?: string
  sessionId?: string
  data?: any
}

class NotificationSystem {
  private listeners: Array<(notification: NotificationData) => void> = []
  private notifications: NotificationData[] = []

  // Subscribe to notifications
  subscribe(listener: (notification: NotificationData) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Send notification
  notify(notification: Omit<NotificationData, 'id' | 'timestamp'>) {
    const fullNotification: NotificationData = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    this.notifications.unshift(fullNotification)
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }

    // Notify all listeners
    this.listeners.forEach(listener => listener(fullNotification))

    // Show toast notification
    this.showToast(fullNotification)

    return fullNotification
  }

  private showToast(notification: NotificationData) {
    const options = {
      duration: 4000,
      closeButton: true,
    }

    switch (notification.type) {
      case 'attendance':
        toast.success(notification.title, {
          description: notification.message,
          ...options,
        })
        break
      case 'login':
        toast.success(notification.title, {
          description: notification.message,
          ...options,
        })
        break
      case 'registration':
        toast.success(notification.title, {
          description: notification.message,
          ...options,
        })
        break
      case 'success':
        toast.success(notification.title, {
          description: notification.message,
          ...options,
        })
        break
      case 'error':
        toast.error(notification.title, {
          description: notification.message,
          duration: 6000,
          closeButton: true,
        })
        break
      case 'info':
        toast.info(notification.title, {
          description: notification.message,
          ...options,
        })
        break
      default:
        toast(notification.title, {
          description: notification.message,
          ...options,
        })
    }
  }

  // Predefined notification methods
  notifyLogin(userName: string, method: string) {
    return this.notify({
      type: 'login',
      title: 'Login Successful',
      message: `Welcome ${userName}! Authenticated via ${method}`,
    })
  }

  notifyRegistration(userName: string) {
    return this.notify({
      type: 'registration', 
      title: 'Registration Complete',
      message: `Account created successfully for ${userName}`,
    })
  }

  notifyAttendanceMarked(studentName: string, subject: string, sessionId: string) {
    return this.notify({
      type: 'attendance',
      title: 'Attendance Marked',
      message: `${studentName} attended ${subject}`,
      sessionId,
      data: { studentName, subject },
    })
  }

  notifyStudentAttendance(subject: string, timestamp: Date) {
    return this.notify({
      type: 'attendance',
      title: 'Attendance Confirmed',
      message: `Your attendance for ${subject} has been recorded at ${timestamp.toLocaleTimeString()}`,
      data: { subject, timestamp },
    })
  }

  notifyAdminNewAttendance(studentName: string, subject: string, timestamp: Date, sessionId: string) {
    return this.notify({
      type: 'attendance',
      title: 'New Attendance',
      message: `${studentName} just joined ${subject} session`,
      sessionId,
      data: { studentName, subject, timestamp },
    })
  }

  notifyError(title: string, message: string) {
    return this.notify({
      type: 'error',
      title,
      message,
    })
  }

  notifySuccess(title: string, message: string) {
    return this.notify({
      type: 'success',
      title,
      message,
    })
  }

  notifyInfo(title: string, message: string) {
    return this.notify({
      type: 'info',
      title,
      message,
    })
  }

  // Get all notifications
  getAllNotifications(): NotificationData[] {
    return [...this.notifications]
  }

  // Get notifications by type
  getNotificationsByType(type: NotificationData['type']): NotificationData[] {
    return this.notifications.filter(n => n.type === type)
  }

  // Clear all notifications
  clearAll() {
    this.notifications = []
    this.listeners.forEach(listener => 
      listener({
        id: 'clear_all',
        type: 'info',
        title: 'Notifications Cleared',
        message: 'All notifications have been cleared',
        timestamp: new Date(),
      })
    )
  }

  // Clear notifications by type
  clearByType(type: NotificationData['type']) {
    this.notifications = this.notifications.filter(n => n.type !== type)
  }
}

// Global notification system instance
export const notificationSystem = new NotificationSystem()

// React hook for using notifications
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<NotificationData[]>([])

  React.useEffect(() => {
    const unsubscribe = notificationSystem.subscribe((notification) => {
      setNotifications(notificationSystem.getAllNotifications())
    })

    // Initialize with existing notifications
    setNotifications(notificationSystem.getAllNotifications())

    return unsubscribe
  }, [])

  return {
    notifications,
    notify: notificationSystem.notify.bind(notificationSystem),
    notifyLogin: notificationSystem.notifyLogin.bind(notificationSystem),
    notifyRegistration: notificationSystem.notifyRegistration.bind(notificationSystem),
    notifyAttendanceMarked: notificationSystem.notifyAttendanceMarked.bind(notificationSystem),
    notifyStudentAttendance: notificationSystem.notifyStudentAttendance.bind(notificationSystem),
    notifyAdminNewAttendance: notificationSystem.notifyAdminNewAttendance.bind(notificationSystem),
    notifyError: notificationSystem.notifyError.bind(notificationSystem),
    notifySuccess: notificationSystem.notifySuccess.bind(notificationSystem),
    notifyInfo: notificationSystem.notifyInfo.bind(notificationSystem),
    clearAll: notificationSystem.clearAll.bind(notificationSystem),
    clearByType: notificationSystem.clearByType.bind(notificationSystem),
  }
}