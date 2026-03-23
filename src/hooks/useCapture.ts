import { useCallback, useState, useRef } from 'react'
import { Alert } from 'react-native'
import * as MediaLibrary from 'expo-media-library'
import * as Sharing from 'expo-sharing'
import * as Haptics from 'expo-haptics'
import type { Camera } from 'react-native-vision-camera'

export function useCapture(cameraRef: React.RefObject<Camera | null>) {
  const [lastCapture, setLastCapture] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const takePhoto = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return

    setIsCapturing(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      // takeSnapshot captures the preview WITH Skia effects applied
      const snapshot = await cameraRef.current.takeSnapshot({ quality: 95 })
      const uri = `file://${snapshot.path}`

      // Request permission and save
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri)
        setLastCapture(uri)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } else {
        Alert.alert('Permission needed', 'Allow photo library access to save captures.')
      }
    } catch (e) {
      console.warn('Capture failed:', e)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setIsCapturing(false)
    }
  }, [cameraRef, isCapturing])

  const shareLastCapture = useCallback(async () => {
    if (!lastCapture) return
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(lastCapture)
    }
  }, [lastCapture])

  const dismissCapture = useCallback(() => {
    setLastCapture(null)
  }, [])

  return { takePhoto, lastCapture, isCapturing, shareLastCapture, dismissCapture }
}
