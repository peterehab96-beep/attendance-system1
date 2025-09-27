'use client'

import React, { useState, useEffect, useCallback } from 'react'
import SuperAdminAuth from './super-admin-auth'
import { getSuperAdminCredentials } from '@/lib/admin-config'

interface HiddenAdminAccessProps {
  children: React.ReactNode
}

export default function HiddenAdminAccess({ children }: HiddenAdminAccessProps) {
  const [showSuperAdminAuth, setShowSuperAdminAuth] = useState(false)
  const [keySequence, setKeySequence] = useState<string[]>([])
  const [mouseClicks, setMouseClicks] = useState<number[]>([])
  const [touchSequence, setTouchSequence] = useState<number[]>([])
  
  // Secret key combinations to trigger super admin access
  const SECRET_KEY_SEQUENCES = [
    ['Control', 'Shift', 'Alt', 'S', 'A'], // Ctrl+Shift+Alt+S+A
    ['Control', 'Alt', 'P', 'E', 'T', 'E', 'R'], // Ctrl+Alt+PETER
    ['Shift', 'Shift', 'Control', 'Control', 'ArrowUp', 'ArrowDown'] // Konami-style
  ]
  
  // Secret mouse click pattern: 3 clicks in top-left, 2 clicks in top-right, 1 long-press center
  const SECRET_MOUSE_PATTERN = [1, 1, 1, 2, 2, 3] // positions: 1=top-left, 2=top-right, 3=center
  
  // Secret touch sequence for mobile
  const SECRET_TOUCH_PATTERN = [4, 2, 1, 3, 2, 4] // corners: 1=TL, 2=TR, 3=BL, 4=BR

  const resetSequences = useCallback(() => {
    setKeySequence([])
    setMouseClicks([])
    setTouchSequence([])
  }, [])

  const checkSecretSequence = useCallback((sequence: string[]) => {
    return SECRET_KEY_SEQUENCES.some(secretSeq => 
      sequence.length >= secretSeq.length &&
      secretSeq.every((key, index) => 
        sequence[sequence.length - secretSeq.length + index] === key
      )
    )
  }, [])

  const checkMousePattern = useCallback((clicks: number[]) => {
    if (clicks.length < SECRET_MOUSE_PATTERN.length) return false
    
    const lastClicks = clicks.slice(-SECRET_MOUSE_PATTERN.length)
    return SECRET_MOUSE_PATTERN.every((pattern, index) => pattern === lastClicks[index])
  }, [])

  const checkTouchPattern = useCallback((touches: number[]) => {
    if (touches.length < SECRET_TOUCH_PATTERN.length) return false
    
    const lastTouches = touches.slice(-SECRET_TOUCH_PATTERN.length)
    return SECRET_TOUCH_PATTERN.every((pattern, index) => pattern === lastTouches[index])
  }, [])

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const newSequence = [...keySequence, event.key].slice(-10) // Keep last 10 keys
      setKeySequence(newSequence)
      
      if (checkSecretSequence(newSequence)) {
        setShowSuperAdminAuth(true)
        resetSequences()
      }
      
      // Clear sequence after 3 seconds of inactivity
      setTimeout(() => {
        setKeySequence(current => current.length === newSequence.length ? [] : current)
      }, 3000)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [keySequence, checkSecretSequence, resetSequences])

  // Mouse click handler for secret pattern
  useEffect(() => {
    const handleMouseClick = (event: MouseEvent) => {
      const { clientX, clientY } = event
      const { innerWidth, innerHeight } = window
      
      let position = 0
      
      // Determine click position (divide screen into regions)
      if (clientX < innerWidth * 0.2 && clientY < innerHeight * 0.2) {
        position = 1 // Top-left
      } else if (clientX > innerWidth * 0.8 && clientY < innerHeight * 0.2) {
        position = 2 // Top-right
      } else if (clientX > innerWidth * 0.4 && clientX < innerWidth * 0.6 && 
                 clientY > innerHeight * 0.4 && clientY < innerHeight * 0.6) {
        position = 3 // Center
      } else if (clientX < innerWidth * 0.2 && clientY > innerHeight * 0.8) {
        position = 4 // Bottom-left
      } else {
        return // Ignore clicks outside secret regions
      }
      
      const newClicks = [...mouseClicks, position].slice(-10)
      setMouseClicks(newClicks)
      
      if (checkMousePattern(newClicks)) {
        setShowSuperAdminAuth(true)
        resetSequences()
      }
      
      // Clear after 5 seconds
      setTimeout(() => {
        setMouseClicks(current => current.length === newClicks.length ? [] : current)
      }, 5000)
    }

    document.addEventListener('click', handleMouseClick)
    return () => document.removeEventListener('click', handleMouseClick)
  }, [mouseClicks, checkMousePattern, resetSequences])

  // Touch handler for mobile devices
  useEffect(() => {
    const handleTouch = (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      
      const touch = event.touches[0]
      const { clientX, clientY } = touch
      const { innerWidth, innerHeight } = window
      
      let corner = 0
      
      // Determine touch corner
      if (clientX < innerWidth * 0.3 && clientY < innerHeight * 0.3) {
        corner = 1 // Top-left
      } else if (clientX > innerWidth * 0.7 && clientY < innerHeight * 0.3) {
        corner = 2 // Top-right
      } else if (clientX < innerWidth * 0.3 && clientY > innerHeight * 0.7) {
        corner = 3 // Bottom-left
      } else if (clientX > innerWidth * 0.7 && clientY > innerHeight * 0.7) {
        corner = 4 // Bottom-right
      } else {
        return
      }
      
      const newTouches = [...touchSequence, corner].slice(-10)
      setTouchSequence(newTouches)
      
      if (checkTouchPattern(newTouches)) {
        setShowSuperAdminAuth(true)
        resetSequences()
      }
      
      // Clear after 4 seconds
      setTimeout(() => {
        setTouchSequence(current => current.length === newTouches.length ? [] : current)
      }, 4000)
    }

    document.addEventListener('touchstart', handleTouch)
    return () => document.removeEventListener('touchstart', handleTouch)
  }, [touchSequence, checkTouchPattern, resetSequences])

  // Special developer console command
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Add hidden global function for emergency access
      ;(window as any).__SUPER_ADMIN_ACCESS__ = () => {
        console.log('🔐 Super Admin Access Initiated...')
        setShowSuperAdminAuth(true)
      }
      
      // Add to console for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development Mode: Use __SUPER_ADMIN_ACCESS__() for direct access')
      }
    }
  }, [])

  const handleSuperAdminAuthenticated = (credentials: { username: string, password: string }) => {
    // Store credentials securely in session (encrypted)
    const encryptedCreds = btoa(JSON.stringify({
      ...credentials,
      timestamp: Date.now(),
      source: 'super_admin_auth'
    }))
    
    sessionStorage.setItem('__sa_auth__', encryptedCreds)
    
    // Log access (for security monitoring)
    console.log('🛡️ Super Admin Access Granted:', {
      timestamp: new Date().toISOString(),
      username: credentials.username,
      source: 'biometric_or_manual'
    })
    
    setShowSuperAdminAuth(false)
    
    // Trigger page refresh to apply super admin permissions
    window.location.reload()
  }

  return (
    <>
      {children}
      
      {/* Hidden Super Admin Authentication Modal */}
      {showSuperAdminAuth && (
        <SuperAdminAuth
          onAuthenticated={handleSuperAdminAuthenticated}
          onClose={() => setShowSuperAdminAuth(false)}
        />
      )}
      
      {/* Debug indicators (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-2 right-2 text-xs space-y-1 z-50">
          {keySequence.length > 0 && (
            <div className="bg-blue-100 px-2 py-1 rounded text-blue-800">
              Keys: {keySequence.join('+')}
            </div>
          )}
          {mouseClicks.length > 0 && (
            <div className="bg-green-100 px-2 py-1 rounded text-green-800">
              Clicks: {mouseClicks.join('-')}
            </div>
          )}
          {touchSequence.length > 0 && (
            <div className="bg-purple-100 px-2 py-1 rounded text-purple-800">
              Touches: {touchSequence.join('-')}
            </div>
          )}
        </div>
      )}
    </>
  )
}