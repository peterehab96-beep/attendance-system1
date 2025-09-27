'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Fingerprint, Eye, Shield, Lock, AlertTriangle, CheckCircle } from 'lucide-react'
import { getSuperAdminCredentials, validateSuperAdminAccess } from '@/lib/admin-config'
import SecureSuperAdminService from '@/lib/super-admin-service'

interface BiometricAuthResult {
  success: boolean
  credential?: PublicKeyCredential
  error?: string
}

interface SuperAdminAuthProps {
  onAuthenticated: (credentials: { username: string, password: string }) => void
  onClose: () => void
}

export default function SuperAdminAuth({ onAuthenticated, onClose }: SuperAdminAuthProps) {
  const [step, setStep] = useState<'credentials' | 'success'>('credentials')
  const [isVerifying, setIsVerifying] = useState(false)
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [showCredentials, setShowCredentials] = useState(false)

  // Biometric authentication has been disabled
  // Only manual credentials are available

  const performBiometricAuth = async (): Promise<BiometricAuthResult> => {
    try {
      if (!biometricSupported) {
        throw new Error('Biometric authentication not supported')
      }

      setIsVerifying(true)
      setBiometricError('')

      // Generate challenge for super admin access
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      // Create credential request for authentication
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge,
        timeout: 30000,
        userVerification: 'required',
        allowCredentials: [] // Allow any registered credential
      }

      // Request user verification via biometrics
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential

      if (credential) {
        return { success: true, credential }
      } else {
        throw new Error('Authentication failed')
      }
    } catch (error: any) {
      let errorMessage = 'Biometric authentication failed'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Biometric authentication was cancelled or not allowed'
      } else if (error.name === 'InvalidStateError') {
        errorMessage = 'No biometric credentials registered'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Biometric authentication not supported on this device'
      }

      return { success: false, error: errorMessage }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleBiometricAuth = async () => {
    const result = await performBiometricAuth()
    
    if (result.success) {
      // Biometric authentication successful, reveal credentials
      const superAdminCreds = getSuperAdminCredentials()
      if (superAdminCreds) {
        setCredentials(superAdminCreds)
        setShowCredentials(true)
        setStep('success')
      } else {
        setBiometricError('Super admin credentials not available')
        setStep('credentials')
        setManualAccess(true)
      }
    } else {
      setBiometricError(result.error || 'Authentication failed')
      setStep('credentials')
      setManualAccess(true)
    }
  }

  const handleManualCredentialEntry = () => {
    if (SecureSuperAdminService.createSuperAdminSession(credentials)) {
      setStep('success')
      onAuthenticated(credentials)
    } else {
      setBiometricError('Invalid super admin credentials')
    }
  }

  const handleRevealCredentials = () => {
    const superAdminCreds = getSuperAdminCredentials()
    if (superAdminCreds) {
      setCredentials(superAdminCreds)
      setShowCredentials(true)
      onAuthenticated(superAdminCreds)
    }
  }

  const renderInitStep = () => (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        <CardTitle className="text-red-800">Super Admin Access</CardTitle>
        <p className="text-sm text-red-600 mt-2">
          Maximum Security Authentication Required
        </p>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Initializing secure authentication system...
          </p>
          <div className="animate-spin mx-auto h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      </CardContent>
    </Card>
  )

  const renderBiometricStep = () => (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
          <Fingerprint className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-blue-800">Biometric Verification</CardTitle>
        <Badge variant="secondary" className="mt-2">
          <Eye className="h-3 w-3 mr-1" />
          Face ID / Touch ID / Windows Hello
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {biometricError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{biometricError}</p>
            </div>
          </div>
        )}
        
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Use your device's biometric authentication to access super admin credentials
          </p>
          
          <Button
            onClick={handleBiometricAuth}
            disabled={isVerifying}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <Fingerprint className="h-4 w-4 mr-2" />
                Authenticate with Biometrics
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setStep('credentials')
              setManualAccess(true)
            }}
            className="w-full"
          >
            <Lock className="h-4 w-4 mr-2" />
            Use Manual Credentials
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderCredentialsStep = () => (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
          <Lock className="h-8 w-8 text-purple-600" />
        </div>
        <CardTitle className="text-purple-800">Manual Authentication</CardTitle>
        <p className="text-sm text-purple-600 mt-2">
          Enter super admin credentials
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {biometricError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{biometricError}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Username</label>
            <Input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="Enter super admin username"
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Enter super admin password" 
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={handleManualCredentialEntry}
          disabled={!credentials.username || !credentials.password}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Authenticate
        </Button>

        <Button variant="outline" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </CardContent>
    </Card>
  )

  const renderSuccessStep = () => (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-green-800">Authentication Successful</CardTitle>
        <Badge variant="default" className="mt-2 bg-green-600">
          Super Admin Access Granted
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCredentials && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Your Super Admin Credentials:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Username:</span>
                <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                  {credentials.username}
                </code>
              </div>
              <div>
                <span className="text-gray-600">Password:</span>
                <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                  {credentials.password}
                </code>
              </div>
            </div>
            <p className="text-xs text-red-600 mt-2">
              ⚠️ Store these credentials securely. They provide full system access.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {!showCredentials && (
            <Button
              onClick={handleRevealCredentials}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Reveal Credentials & Continue
            </Button>
          )}
          
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        {step === 'init' && renderInitStep()}
        {step === 'biometric' && renderBiometricStep()}
        {step === 'credentials' && renderCredentialsStep()}
        {step === 'success' && renderSuccessStep()}
      </div>
    </div>
  )
}