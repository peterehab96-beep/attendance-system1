"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Database, 
  Key, 
  Globe, 
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Info,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

export function SetupGuide() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const copyToClipboard = async (text: string, itemName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemName)
      toast.success(`📋 Copied ${itemName}`, {
        description: 'Text copied to clipboard',
        duration: 2000,
      })
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const checkEnvironmentStatus = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const isConfigured = !!(
      supabaseUrl && 
      supabaseKey && 
      supabaseUrl !== 'https://your-project-id.supabase.co' && 
      supabaseKey !== 'your-anon-public-key-here'
    )

    return {
      isConfigured,
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlPlaceholder: supabaseUrl === 'https://your-project-id.supabase.co',
      keyPlaceholder: supabaseKey === 'your-anon-public-key-here'
    }
  }

  const status = checkEnvironmentStatus()

  const setupSteps = [
    {
      number: 1,
      title: "Create Supabase Project",
      description: "Set up your database and authentication service",
      action: "Create Project",
      url: "https://supabase.com",
      completed: false, // We can't check this automatically
      details: [
        "Sign up at supabase.com",
        "Click 'New Project'",
        "Choose organization",
        "Enter project name: 'zagazig-music-attendance'",
        "Set database password (save it!)",
        "Select region: Europe West (closest to Egypt)",
        "Wait for project creation (2-3 minutes)"
      ]
    },
    {
      number: 2,
      title: "Get Project Credentials",
      description: "Copy your project URL and API keys",
      action: "Get Credentials",
      completed: status.hasUrl && status.hasKey && !status.urlPlaceholder && !status.keyPlaceholder,
      details: [
        "Go to Project Settings → API",
        "Copy 'Project URL'",
        "Copy 'anon public' key",
        "Copy 'service_role' key (keep secret!)"
      ]
    },
    {
      number: 3,
      title: "Configure Environment",
      description: "Update your .env.local file with credentials",
      action: "Update Config",
      completed: status.isConfigured,
      details: [
        "Open .env.local file in your project",
        "Replace placeholder URLs and keys",
        "Save the file",
        "Restart your development server"
      ]
    },
    {
      number: 4,
      title: "Set Up Database",
      description: "Run the SQL script to create tables",
      action: "Run SQL",
      completed: false, // We can't check this automatically
      details: [
        "Go to Supabase SQL Editor",
        "Create new query",
        "Copy content from supabase-setup.sql",
        "Paste and run the script",
        "Verify tables are created"
      ]
    }
  ]

  const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
NEXT_PUBLIC_APP_NAME="Faculty Attendance System"
NEXT_PUBLIC_FACULTY_NAME="Faculty of Music Education - Zagazig University"`

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            Supabase Setup Guide
          </CardTitle>
          <CardDescription>
            Configure your database and authentication service for full functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Current Status */}
          <Alert className={status.isConfigured ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
            {status.isConfigured ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            )}
            <AlertDescription>
              <div className="font-medium mb-2">
                {status.isConfigured ? "✅ Supabase is configured!" : "🔧 Supabase setup required"}
              </div>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  {status.hasUrl && !status.urlPlaceholder ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span>Project URL: {status.hasUrl ? (status.urlPlaceholder ? "Placeholder" : "Configured") : "Missing"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {status.hasKey && !status.keyPlaceholder ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span>API Key: {status.hasKey ? (status.keyPlaceholder ? "Placeholder" : "Configured") : "Missing"}</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Setup Steps */}
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-lg">Setup Steps</h3>
            {setupSteps.map((step, index) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.completed 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}>
                    {step.completed ? <CheckCircle className="w-4 h-4" /> : step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{step.title}</h4>
                    {step.completed && <Badge variant="outline" className="text-xs">Complete</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  <ul className="text-xs space-y-1 text-gray-500 mb-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-1">
                        <span className="text-gray-400">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  {step.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(step.url, '_blank')}
                      className="text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {step.action}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Environment Template */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-3">Environment Configuration Template</h3>
            <div className="relative">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border">
                <code>{envTemplate}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(envTemplate, "environment template")}
                className="absolute top-2 right-2 text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                {copiedItem === "environment template" ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => window.open('https://supabase.com', '_blank')}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Open Supabase
            </Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(window.location.origin, "current URL")}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Current URL
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Refresh Status
            </Button>
          </div>

          {/* Help Text */}
          <Alert className="mt-6">
            <Info className="w-4 h-4" />
            <AlertDescription className="text-xs">
              <strong>Need help?</strong> The system will work in demo mode until Supabase is configured. 
              All demo data is stored locally and will be replaced with real cloud storage once setup is complete.
              <br /><br />
              <strong>What you'll get:</strong> Real authentication, cloud data storage, real-time notifications, 
              data export, user management, and secure access control.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}