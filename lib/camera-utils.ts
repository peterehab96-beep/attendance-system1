export interface CameraCapabilities {
  hasCamera: boolean
  hasPermission: boolean
  supportsFacingMode: boolean
  supportedConstraints: MediaTrackSupportedConstraints | null
}

export class CameraManager {
  private stream: MediaStream | null = null
  private video: HTMLVideoElement | null = null

  async checkCameraCapabilities(): Promise<CameraCapabilities> {
    const result: CameraCapabilities = {
      hasCamera: false,
      hasPermission: false,
      supportsFacingMode: false,
      supportedConstraints: null
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

      // Check permissions
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
        result.hasPermission = permission.state === 'granted'
      }
    } catch (error) {
      console.warn('Error checking camera capabilities:', error)
    }

    return result
  }

  async requestCameraAccess(videoElement: HTMLVideoElement): Promise<{
    success: boolean
    stream?: MediaStream
    error?: string
  }> {
    try {
      // Stop any existing stream
      this.stopCamera()

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Prefer back camera for QR scanning
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        }
      }

      // Try with facing mode first
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (error) {
        // Fallback without facing mode constraint
        console.warn('Environment facing mode not available, trying any camera')
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
          }
        })
      }

      // Set up video element
      this.video = videoElement
      this.stream = stream
      videoElement.srcObject = stream

      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = () => resolve(true)
        videoElement.onerror = reject
        setTimeout(reject, 5000) // 5 second timeout
      })

      await videoElement.play()

      return { success: true, stream }
    } catch (error: any) {
      let errorMessage = 'Camera access failed'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera does not support the required resolution.'
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Camera access blocked due to security restrictions.'
      } else if (error.message) {
        errorMessage = error.message
      }

      return { success: false, error: errorMessage }
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