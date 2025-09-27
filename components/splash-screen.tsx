"use client"

import React, { useState, useEffect } from 'react'
import { Music, CheckCircle, Users, QrCode, GraduationCap, Clock, Sparkles, Star, Zap } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showParticles, setShowParticles] = useState(false)
  const [logoRotation, setLogoRotation] = useState(0)

  const features = [
    { icon: Music, text: "Music Education Faculty", color: "text-purple-400", bgColor: "from-purple-500/20 to-purple-600/30" },
    { icon: QrCode, text: "QR Code Attendance", color: "text-blue-400", bgColor: "from-blue-500/20 to-blue-600/30" },
    { icon: Users, text: "Student Management", color: "text-green-400", bgColor: "from-green-500/20 to-green-600/30" },
    { icon: GraduationCap, text: "Academic Excellence", color: "text-yellow-400", bgColor: "from-yellow-500/20 to-yellow-600/30" },
  ]

  const loadingMessages = [
    "Connecting to servers...",
    "Loading student data...", 
    "Initializing QR system...",
    "Preparing dashboard...",
    "Almost ready!"
  ]

  const [currentMessage, setCurrentMessage] = useState(0)

  useEffect(() => {
    // Enhanced step progression
    const steps = [
      { delay: 600, step: 1 },
      { delay: 1000, step: 2 },
      { delay: 1400, step: 3 },
      { delay: 1800, step: 4 },
    ]

    const timeouts = steps.map(({ delay, step }) =>
      setTimeout(() => {
        setCurrentStep(step)
        if (step === 2) setShowParticles(true)
      }, delay)
    )

    // Progress animation with message updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1.5
        
        // Update message based on progress
        const messageIndex = Math.floor((newProgress / 100) * loadingMessages.length)
        if (messageIndex < loadingMessages.length && messageIndex !== currentMessage) {
          setCurrentMessage(messageIndex)
        }
        
        if (newProgress >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => onComplete(), 800)
          return 100
        }
        return newProgress
      })
    }, 50)

    // Logo rotation animation
    const rotationInterval = setInterval(() => {
      setLogoRotation(prev => (prev + 1) % 360)
    }, 50)

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
      clearInterval(progressInterval)
      clearInterval(rotationInterval)
    }
  }, [onComplete, currentMessage])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0">
        {/* Twinkling stars */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-2 h-2 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
        
        {/* Floating sparkles */}
        {showParticles && [...Array(15)].map((_, i) => (
          <Sparkles
            key={`sparkle-${i}`}
            className="absolute w-4 h-4 text-yellow-300 opacity-60 animate-bounce-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
        
        {/* Gradient orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full blur-xl opacity-20 animate-float"
            style={{
              width: `${60 + Math.random() * 100}px`,
              height: `${60 + Math.random() * 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(45deg, 
                ${['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)]}, 
                ${['#ec4899', '#06b6d4', '#84cc16', '#ef4444'][Math.floor(Math.random() * 4)]}
              )`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Enhanced floating music elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => {
          const icons = [Music, Star, Zap]
          const Icon = icons[i % icons.length]
          return (
            <Icon
              key={`icon-${i}`}
              className="absolute w-6 h-6 text-purple-300 opacity-30 animate-bounce-sparkle"
              style={{
                left: `${10 + i * 12}%`,
                top: `${15 + (i % 4) * 20}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${1.5 + Math.random()}s`,
              }}
            />
          )
        })}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center text-white mobile-padding">
        {/* Enhanced logo and title */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div 
              className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse-glow shadow-2xl"
              style={{
                transform: `rotate(${logoRotation * 0.5}deg)`,
                boxShadow: '0 0 50px rgba(168, 85, 247, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2)'
              }}
            >
              <Music className="w-14 h-14 text-white animate-float drop-shadow-lg" />
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-rotate" />
              <div className="absolute inset-2 rounded-full border border-white/10 animate-rotate-reverse" />
            </div>
            
            {currentStep >= 1 && (
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-success-pop shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            )}
            
            {currentStep >= 3 && (
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-success-pop">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-text-shimmer drop-shadow-lg">
              Zagazig University
            </span>
          </h1>
          
          <h2 className="text-xl md:text-3xl font-semibold mb-2 animate-fade-in-up text-shadow-lg" style={{animationDelay: '0.3s'}}>
            <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              Music Education Faculty
            </span>
          </h2>
          
          <p className="text-gray-300 text-lg animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            Professional Attendance Management System
          </p>
        </div>

        {/* Enhanced feature showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isActive = currentStep > index
            
            return (
              <div
                key={index}
                className={`relative p-4 rounded-xl transition-all duration-700 overflow-hidden group ${
                  isActive 
                    ? `bg-gradient-to-br ${feature.bgColor} backdrop-blur-sm animate-feature-glow border border-white/20` 
                    : 'bg-gray-700/20 border border-gray-600/30'
                }`}
                style={{
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  animationDelay: `${index * 0.2}s`
                }}
              >
                {/* Shimmer effect */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}
                
                <Icon 
                  className={`w-8 h-8 mx-auto mb-2 transition-all duration-500 relative z-10 ${
                    isActive 
                      ? `${feature.color} animate-icon-bounce drop-shadow-lg` 
                      : 'text-gray-500'
                  }`}
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 8px currentColor)' : 'none'
                  }}
                />
                <p className={`text-sm transition-all duration-500 relative z-10 ${
                  isActive ? 'text-white font-medium' : 'text-gray-500'
                }`}>
                  {feature.text}
                </p>
                
                {/* Progress indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-blue-400 animate-shimmer" />
                )}
              </div>
            )
          })}
        </div>

        {/* Enhanced loading section */}
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <Clock className="w-6 h-6 text-purple-400 animate-rotate" />
              <div className="absolute inset-0 w-6 h-6 border-2 border-purple-400/30 rounded-full animate-ping" />
            </div>
            <span className="text-lg font-medium">
              {loadingMessages[currentMessage] || "Initializing System..."}
            </span>
          </div>
          
          {/* Enhanced progress bar */}
          <div className="w-full max-w-md mx-auto">
            <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-600/30">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-150 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect on progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
              
              {/* Glow effect */}
              <div 
                className="absolute top-0 h-full bg-gradient-to-r from-purple-400/50 to-blue-400/50 blur-sm transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <p className="text-sm text-gray-400">
                {Math.round(progress)}% Complete
              </p>
              <div className="flex space-x-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentStep > i ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced loading dots */}
          <div className="flex justify-center space-x-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-purple-400 rounded-full animate-loading-dots"
                style={{ 
                  animationDelay: `${i * 0.15}s`,
                  boxShadow: '0 0 10px currentColor'
                }}
              />
            ))}
          </div>
        </div>

        {/* Enhanced footer */}
        <div className="mt-8 text-xs text-gray-400 animate-fade-in-up" style={{animationDelay: '1s'}}>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <p className="text-center">© 2025 Zagazig University - Music Education</p>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-center mt-1 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            Powered by Modern Web Technology
          </p>
        </div>
      </div>

      {/* Enhanced animated border effect */}
      <div className="absolute inset-0 border-4 border-transparent bg-gradient-to-r from-purple-500 via-transparent to-blue-500 opacity-30 animate-gradient-x pointer-events-none" />
      
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-purple-400/50 animate-pulse" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-blue-400/50 animate-pulse" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-green-400/50 animate-pulse" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-yellow-400/50 animate-pulse" />
    </div>
  )
}