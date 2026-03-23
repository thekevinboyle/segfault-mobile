import { useCallback } from 'react'
import { View, StyleSheet, Dimensions, type ViewStyle } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

const SNAP_POINTS = {
  collapsed: SCREEN_HEIGHT - 60,
  half: SCREEN_HEIGHT * 0.5,
  full: SCREEN_HEIGHT * 0.15,
}

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 150,
  mass: 0.5,
}

interface BottomSheetProps {
  children: React.ReactNode
  style?: ViewStyle
}

export function BottomSheet({ children, style }: BottomSheetProps) {
  const translateY = useSharedValue(SNAP_POINTS.collapsed)
  const context = useSharedValue({ y: 0 })

  const hapticFeedback = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [])

  const snapTo = useCallback((point: number) => {
    'worklet'
    translateY.value = withSpring(point, SPRING_CONFIG)
    runOnJS(hapticFeedback)()
  }, [translateY, hapticFeedback])

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value }
    })
    .onUpdate((event) => {
      const newY = context.value.y + event.translationY
      translateY.value = Math.max(SNAP_POINTS.full, Math.min(SNAP_POINTS.collapsed, newY))
    })
    .onEnd((event) => {
      const velocity = event.velocityY
      const currentY = translateY.value

      // Determine closest snap point, biased by velocity
      if (velocity > 500) {
        // Fast downward swipe
        if (currentY > SNAP_POINTS.half) {
          snapTo(SNAP_POINTS.collapsed)
        } else {
          snapTo(SNAP_POINTS.half)
        }
      } else if (velocity < -500) {
        // Fast upward swipe
        if (currentY < SNAP_POINTS.half) {
          snapTo(SNAP_POINTS.full)
        } else {
          snapTo(SNAP_POINTS.half)
        }
      } else {
        // Snap to closest
        const distCollapsed = Math.abs(currentY - SNAP_POINTS.collapsed)
        const distHalf = Math.abs(currentY - SNAP_POINTS.half)
        const distFull = Math.abs(currentY - SNAP_POINTS.full)

        if (distCollapsed < distHalf && distCollapsed < distFull) {
          snapTo(SNAP_POINTS.collapsed)
        } else if (distHalf < distFull) {
          snapTo(SNAP_POINTS.half)
        } else {
          snapTo(SNAP_POINTS.full)
        }
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle, style]}>
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
        {children}
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: '#111',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
  },
})
