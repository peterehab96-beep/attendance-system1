'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, EyeOff, User, Lock, Mail, UserPlus, LogIn, AlertCircle, CheckCircle } from 'lucide-react'
import { authService } from '@/lib/auth-service'
import { toast } from 'sonner'

interface SimpleLoginProps {
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
}

export default function SimpleLogin({ onSuccess, onError }: SimpleLoginProps) {
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  
  // Signup form state
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'admin',
    academicLevel: ''
  })

  // Demo accounts for quick access (hidden from UI for security)
  const demoAccounts = [
    { 
      label: 'طالب تجريبي (Student Demo)', 
      email: 'student@demo.com', 
      password: '123456',
      icon: '👨‍🎓'
    },
    { 
      label: 'مدير تجريبي (Admin Demo)', 
      email: 'admin@demo.com', 
      password: '123456',
      icon: '👨‍💼'
    },
    { 
      label: 'أحمد حسن محمد', 
      email: 'ahmed.hassan@test.zu.edu.eg', 
      password: 'student123',
      icon: '🎵'
    },
    { 
      label: 'د. سارة محمود', 
      email: 'dr.sarah@test.zu.edu.eg', 
      password: 'instructor123',
      icon: '👩‍🏫'
    }
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginForm.email || !loginForm.password) {
      toast.error('يرجى ملء جميع الحقول', {
        description: 'Please fill in all fields'
      })
      return
    }

    setLoading(true)
    
    try {
      const result = await authService.login({
        email: loginForm.email,
        password: loginForm.password
      })

      if (result.success && result.user) {
        toast.success('تم تسجيل الدخول بنجاح! 🎉', {
          description: `مرحباً ${result.user.fullName}`,
          duration: 3000
        })
        
        if (onSuccess) {
          onSuccess(result.user)
        }
        
        // Redirect or refresh
        setTimeout(() => {
          window.location.href = result.user?.role === 'admin' ? '/admin' : '/dashboard'
        }, 1000)
        
      } else {
        toast.error('خطأ في تسجيل الدخول', {
          description: result.error || 'Invalid credentials'
        })
        
        if (onError) {
          onError(result.error || 'Login failed')
        }
      }
    } catch (error) {
      toast.error('خطأ في الاتصال', {
        description: 'Connection error. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signupForm.fullName || !signupForm.email || !signupForm.password) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين')
      return
    }

    if (signupForm.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    
    try {
      const result = await authService.signup({
        fullName: signupForm.fullName,
        email: signupForm.email,
        password: signupForm.password,
        role: signupForm.role,
        academicLevel: signupForm.academicLevel
      })

      if (result.success && result.user) {
        toast.success('تم إنشاء الحساب بنجاح! 🎉', {
          description: `مرحباً ${result.user.fullName}`,
          duration: 3000
        })
        
        if (onSuccess) {
          onSuccess(result.user)
        }
        
        // Switch to login tab or redirect
        setActiveTab('login')
        setLoginForm({
          email: signupForm.email,
          password: signupForm.password
        })
        
      } else {
        toast.error('خطأ في إنشاء الحساب', {
          description: result.error || 'Signup failed'
        })
        
        if (onError) {
          onError(result.error || 'Signup failed')
        }
      }
    } catch (error) {
      toast.error('خطأ في الاتصال', {
        description: 'Connection error. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const useDemoAccount = (account: typeof demoAccounts[0]) => {
    setLoginForm({
      email: account.email,
      password: account.password
    })
    setActiveTab('login')
    
    toast.success(`تم تحديد الحساب التجريبي ${account.icon}`, {
      description: account.label
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">نظام الحضور الموسيقي</CardTitle>
          <CardDescription>
            جامعة الزقازيق - كلية التربية الموسيقية
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                تسجيل دخول
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                حساب جديد
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@zu.edu.eg"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    'تسجيل دخول'
                  )}
                </Button>
              </form>

              {/* Demo Accounts Section - Hidden for Security */}
              {/* Demo accounts are available but not displayed in UI */}
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم الكامل</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="الاسم الكامل"
                      value={signupForm.fullName}
                      onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="example@zu.edu.eg"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">نوع الحساب</Label>
                  <Select 
                    value={signupForm.role} 
                    onValueChange={(value: 'student' | 'admin') => 
                      setSignupForm({ ...signupForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">طالب</SelectItem>
                      <SelectItem value="admin">مدرس / إداري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {signupForm.role === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="academicLevel">المستوى الدراسي</Label>
                    <Select 
                      value={signupForm.academicLevel} 
                      onValueChange={(value) => 
                        setSignupForm({ ...signupForm, academicLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المستوى الدراسي" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Year">الفرقة الأولى</SelectItem>
                        <SelectItem value="Second Year">الفرقة الثانية</SelectItem>
                        <SelectItem value="Third Year">الفرقة الثالثة</SelectItem>
                        <SelectItem value="Fourth Year">الفرقة الرابعة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-password">كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="6 أحرف على الأقل"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="أعد كتابة كلمة المرور"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    'إنشاء حساب جديد'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              💡 للاختبار السريع: استخدم <strong>student@demo.com</strong> أو <strong>admin@demo.com</strong> 
              مع كلمة المرور <strong>123456</strong>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}