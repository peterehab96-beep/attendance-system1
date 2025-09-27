"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  Database, 
  Cloud, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Upload,
  Clock
} from 'lucide-react'
import { attendanceBackupHandler } from '@/lib/attendance-backup-handler'
import { toast } from 'sonner'

interface BackupStatus {
  googleBackupReady: boolean
  databaseReady: boolean
  lastBackupSync: Date | null
  pendingRecords: number
}

export function BackupManagement() {
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncResults, setSyncResults] = useState<any>(null)

  useEffect(() => {
    loadBackupStatus()
  }, [])

  const loadBackupStatus = async () => {
    try {
      const status = await attendanceBackupHandler.getBackupStatus()
      setBackupStatus(status)
    } catch (error) {
      console.error('Failed to load backup status:', error)
      toast.error('فشل في تحميل حالة النسخ الاحتياطي')
    }
  }

  const handleSyncBackup = async () => {
    setIsLoading(true)
    setSyncProgress(0)
    setSyncResults(null)

    try {
      toast.info('بدء مزامنة النسخ الاحتياطي...')
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const results = await attendanceBackupHandler.syncBackupToDatabase()
      
      clearInterval(progressInterval)
      setSyncProgress(100)
      setSyncResults(results)
      
      if (results.successful > 0) {
        toast.success(`تم مزامنة ${results.successful} سجل بنجاح`)
      }
      
      if (results.failed > 0) {
        toast.warning(`فشل في مزامنة ${results.failed} سجل`)
      }

      // Reload status
      await loadBackupStatus()
    } catch (error) {
      toast.error('فشل في مزامنة النسخ الاحتياطي')
      console.error('Sync failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!backupStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            جاري تحميل حالة النسخ الاحتياطي...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Backup Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            حالة أنظمة النسخ الاحتياطي
          </CardTitle>
          <CardDescription>
            مراقبة حالة قاعدة البيانات الأساسية ونظام النسخ الاحتياطي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Database Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5" />
              <div>
                <div className="font-medium">قاعدة البيانات الأساسية</div>
                <div className="text-sm text-muted-foreground">Supabase Database</div>
              </div>
            </div>
            <Badge variant={backupStatus.databaseReady ? "default" : "destructive"}>
              {backupStatus.databaseReady ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  متصلة
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  غير متصلة
                </>
              )}
            </Badge>
          </div>

          {/* Google Backup Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5" />
              <div>
                <div className="font-medium">نظام النسخ الاحتياطي</div>
                <div className="text-sm text-muted-foreground">Google Sheets & Forms</div>
              </div>
            </div>
            <Badge variant={backupStatus.googleBackupReady ? "default" : "secondary"}>
              {backupStatus.googleBackupReady ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  جاهز
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  غير مُعد
                </>
              )}
            </Badge>
          </div>

          {/* Pending Records */}
          {backupStatus.pendingRecords > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                يوجد {backupStatus.pendingRecords} سجل حضور في النسخة الاحتياطية بحاجة للمزامنة
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Backup Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            عمليات النسخ الاحتياطي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sync Progress */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>جاري المزامنة...</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} />
            </div>
          )}

          {/* Sync Results */}
          {syncResults && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div>إجمالي السجلات: {syncResults.total}</div>
                  <div>تم بنجاح: {syncResults.successful}</div>
                  <div>فشل: {syncResults.failed}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleSyncBackup}
              disabled={!backupStatus.googleBackupReady || isLoading}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              مزامنة النسخ الاحتياطي
            </Button>
            
            <Button 
              variant="outline"
              onClick={loadBackupStatus}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              تحديث الحالة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Google Backup Setup Instructions */}
      {!backupStatus.googleBackupReady && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              إعداد النسخ الاحتياطي مطلوب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                لتفعيل نظام النسخ الاحتياطي، يرجى تكوين المتغيرات التالية:
              </p>
              <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                <div>GOOGLE_SHEETS_ID=your_sheet_id</div>
                <div>GOOGLE_FORM_ID=your_form_id</div>
                <div>ENABLE_GOOGLE_BACKUP=true</div>
                <div>GOOGLE_SERVICE_ACCOUNT_KEY=your_service_key</div>
              </div>
              <p className="text-muted-foreground">
                راجع دليل الإعداد لمعرفة كيفية الحصول على هذه القيم.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Sync Info */}
      {backupStatus.lastBackupSync && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              آخر مزامنة: {backupStatus.lastBackupSync.toLocaleString('ar-EG')}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}