import { useEffect, useState, useCallback } from 'react'
import { Camera } from 'react-native-vision-camera'

export type PermissionStatus = 'loading' | 'granted' | 'denied' | 'not-determined'

export function usePermissions() {
  const [status, setStatus] = useState<PermissionStatus>('loading')

  useEffect(() => {
    const cameraPermission = Camera.getCameraPermissionStatus()
    if (cameraPermission === 'granted') {
      setStatus('granted')
    } else if (cameraPermission === 'denied') {
      setStatus('denied')
    } else {
      setStatus('not-determined')
    }
  }, [])

  const requestPermissions = useCallback(async () => {
    const result = await Camera.requestCameraPermission()
    setStatus(result === 'granted' ? 'granted' : 'denied')
  }, [])

  return { status, requestPermissions }
}
