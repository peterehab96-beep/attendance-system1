"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { XCircle } from 'lucide-react'

interface BiometricAuthProps {
  onSuccess: (biometricData: { id: string; type: 'fingerprint' | 'face' }) => void
  onError: (error: string) => void
  userType?: 'student' | 'admin'
}

export function BiometricAuth({ onSuccess, onError, userType = 'student' }: BiometricAuthProps) {
  // Biometric authentication has been disabled
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          المصادقة البيومترية معطلة
        </CardTitle>
        <CardDescription>
          تم إلغاء تفعيل المصادقة بالبصمة والوجه نهائياً
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <XCircle className="w-4 h-4" />
          <AlertDescription>
            المصادقة البيومترية غير متاحة بعد الآن. يرجى استخدام تسجيل الدخول بالبريد الإلكتروني وكلمة المرور.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default BiometricAuth
