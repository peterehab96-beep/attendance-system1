"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import SimpleLogin from "./simple-login"

interface SocialAuthProps {
  onSuccess?: (provider: string, userData: any) => void
  onError?: (error: string) => void
  userType?: 'student' | 'admin'
}

export function SocialAuth({ onSuccess, onError, userType = 'student' }: SocialAuthProps) {
  const [showSimpleLogin, setShowSimpleLogin] = useState(false)

  // Google and social authentication has been disabled
  // Only email/password authentication is available

  if (showSimpleLogin) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowSimpleLogin(false)}
          className="w-full"
        >
          ← العودة إلى خيارات تسجيل الدخول
        </Button>
        <SimpleLogin 
          onSuccess={(user) => {
            if (onSuccess) {
              onSuccess('email', user)
            }
          }}
          onError={onError}
        />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500" />
          تسجيل الدخول إلى النظام
        </CardTitle>
        <CardDescription>
          سجل الدخول باستخدام البريد الإلكتروني والحسابات التجريبية
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Social authentication has been disabled - only email/password available */}

        {/* Primary Email Login */}
        <Button
          onClick={() => setShowSimpleLogin(true)}
          className="w-full touch-button hover:scale-105 transition-all duration-200"
          size="lg"
        >
          <ArrowRight className="mr-2 h-5 w-5" />
          تسجيل دخول بالبريد الإلكتروني
        </Button>

        {/* Demo Account Quick Access - Hidden for Security */}
        {/* Demo accounts available but not displayed in UI */}

        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-xs">
            🔐 النظام يستخدم المصادقة بالبريد الإلكتروني وكلمة المرور فقط.
            <br />
            <strong>تم إلغاء:</strong> تسجيل الدخول بجوجل والمصادقة البيومترية نهائياً.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
