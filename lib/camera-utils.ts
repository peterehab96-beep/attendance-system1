export interface CameraCapabilities {
  hasCamera: boolean
  hasPermission: boolean
  supportsFacingMode: boolean
  supportedConstraints: MediaTrackSupportedConstraints | null
  isSecureContext: boolean
  availableDevices: MediaDeviceInfo[]
}

export interface CameraError {
  type: 'permission' | 'not_found' | 'busy' | 'security' | 'constraints' | 'unknown'
  message: string
  suggestion: string
}

export class CameraManager {
  private stream: MediaStream | null = null
  private video: HTMLVideoElement | null = null

  async checkCameraCapabilities(): Promise<CameraCapabilities> {
    const result: CameraCapabilities = {
      hasCamera: false,
      hasPermission: false,
      supportsFacingMode: false,
      supportedConstraints: null,
      isSecureContext: window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost',
      availableDevices: []
    }

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return result
    }

    result.hasCamera = true

    try {
      // Check supported constraints
      if (navigator.mediaDevices.getSupportedConstraints) {
        result.supportedConstraints = navigator.mediaDevices.getSupportedConstraints()
        result.supportsFacingMode = result.supportedConstraints.facingMode || false
      }

      // Get available devices
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices()
        result.availableDevices = devices.filter(device => device.kind === 'videoinput')
      }

      // Check permissions
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
          result.hasPermission = permission.state === 'granted'
        } catch (error) {
          console.warn('Permission query failed:', error)
        }
      }
    } catch (error) {
      console.warn('Error checking camera capabilities:', error)
    }

    return result
  }

  private parseError(error: any): CameraError {
    let type: CameraError['type'] = 'unknown'
    let message = 'Camera access failed'
    let suggestion = 'Please try again or use the image upload option'

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      type = 'permission'
      message = 'Camera permission was denied'
      suggestion = 'Click the camera icon in your browser address bar and allow camera access, then refresh the page'
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      type = 'not_found'
      message = 'No camera found on this device'
      suggestion = 'Please ensure your camera is connected and working'
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      type = 'busy'
      message = 'Camera is being used by another application'
      suggestion = 'Close other apps that might be using the camera (Zoom, Skype, Teams, etc.) and try again'
    } else if (error.name === 'SecurityError') {
      type = 'security'
      message = 'Camera access blocked for security reasons'
      suggestion = 'Please use HTTPS or localhost to access the camera'
    } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
      type = 'constraints'
      message = 'Camera does not support the required settings'
      suggestion = 'Try using a different camera or device'
    } else if (error.message) {
      message = error.message
    }

    return { type, message, suggestion }
  }

  async requestCameraAccess(videoElement: HTMLVideoElement): Promise<{
    success: boolean
    stream?: MediaStream
    error?: string
    errorDetails?: CameraError
  }> {
    try {
      // Check capabilities first
      const capabilities = await this.checkCameraCapabilities()
      
      if (!capabilities.hasCamera) {
        return {
          success: false,
          error: 'Camera API not supported on this device or browser',
          errorDetails: {
            type: 'not_found',
            message: 'Camera API not supported',
            suggestion: 'Please use a modern browser or device with camera support'
          }
        }
      }

      if (!capabilities.isSecureContext) {
        return {
          success: false,
          error: 'Camera access requires a secure connection (HTTPS)',
          errorDetails: {
            type: 'security',
            message: 'Insecure context detected',
            suggestion: 'Please use HTTPS or localhost to access the camera'
          }
        }
      }

      // Stop any existing stream
      this.stopCamera()

      // Progressive constraint fallback
      const constraints: MediaStreamConstraints[] = [
        {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
          }
        },
        {
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
          }
        },
        {
          video: {
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 },
          }
        },
        {
          video: true
        }
      ]

      let stream: MediaStream | null = null
      let lastError: any = null

      for (let i = 0; i < constraints.length; i++) {
        try {
          console.log(`Attempting camera access with constraint set ${i + 1}/${constraints.length}`)
          stream = await navigator.mediaDevices.getUserMedia(constraints[i])
          
          // Verify stream has video tracks
          if (stream && stream.getVideoTracks().length > 0) {
            console.log(`Camera access successful with constraint set ${i + 1}`)
            break
          } else {
            if (stream) {
              stream.getTracks().forEach(track => track.stop())
            }
            throw new Error('No video tracks available in stream')
          }
        } catch (error) {
          console.warn(`Constraint set ${i + 1} failed:`, error)
          lastError = error
          continue
        }
      }

      if (!stream) {
        const errorDetails = this.parseError(lastError)
        return {
          success: false,
          error: errorDetails.message,
          errorDetails
        }
      }

      // Set up video element
      this.video = videoElement
      this.stream = stream
      videoElement.srcObject = stream

      // Configure video element
      videoElement.autoplay = true
      videoElement.playsInline = true
      videoElement.muted = true

      // Wait for video to be ready with proper error handling
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video loading timeout - camera may be busy or hardware issue'))
        }, 10000) // 10 second timeout
        
        const cleanup = () => {
          clearTimeout(timeout)
          videoElement.removeEventListener('loadedmetadata', onLoadedMetadata)
          videoElement.removeEventListener('error', onError)
        }

        const onLoadedMetadata = () => {
          cleanup()
          // Verify video dimensions
          if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
            reject(new Error('Video stream is not providing valid dimensions'))
            return
          }
          console.log(`Video loaded: ${videoElement.videoWidth}x${videoElement.videoHeight}`)
          resolve()
        }

        const onError = (event: Event) => {
          cleanup()
          const errorMsg = (event as any).error?.message || 'Video element error'
          reject(new Error(`Video error: ${errorMsg}`))
        }

        videoElement.addEventListener('loadedmetadata', onLoadedMetadata)
        videoElement.addEventListener('error', onError)

        // Check if already loaded
        if (videoElement.readyState >= 1) {
          onLoadedMetadata()
        }
      })

      // Attempt to play video
      try {
        await videoElement.play()
        console.log('Video playback started successfully')
      } catch (playError: any) {
        console.warn('Auto-play failed, but camera access is working:', playError)
        // Auto-play failure is not critical for QR scanning
      }

      return { success: true, stream }
    } catch (error: any) {
      console.error('Camera access error:', error)
      const errorDetails = this.parseError(error)
      return {
        success: false,
        error: errorDetails.message,
        errorDetails
      }
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop()
        console.log(`Stopped ${track.kind} track`)
      })
      this.stream = null
    }

    if (this.video) {
      this.video.srcObject = null
      this.video = null
    }
  }

  captureFrame(canvas: HTMLCanvasElement): {
    success: boolean
    imageData?: ImageData
    error?: string
  } {
    if (!this.video || !this.stream) {
      return { success: false, error: 'Camera not active' }
    }

    try {
      const context = canvas.getContext('2d')
      if (!context) {
        return { success: false, error: 'Canvas context not available' }
      }

      // Set canvas size to match video
      canvas.width = this.video.videoWidth
      canvas.height = this.video.videoHeight

      // Draw current video frame to canvas
      context.drawImage(this.video, 0, 0)

      // Get image data for QR processing
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      return { success: true, imageData }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to capture frame' }
    }
  }

  isActive(): boolean {
    return this.stream !== null && this.video !== null
  }

  getVideoDimensions(): { width: number, height: number } | null {
    if (!this.video) return null
    return {
      width: this.video.videoWidth,
      height: this.video.videoHeight
    }
  }
}