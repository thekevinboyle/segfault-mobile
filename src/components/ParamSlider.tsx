import { View, StyleSheet, Text } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated'

interface ParamSliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  color?: string
  onChange: (value: number) => void
}

const SLIDER_HEIGHT = 120

export function ParamSlider({ label, value, min, max, step = 0.01, color = '#00ffcc', onChange }: ParamSliderProps) {
  const normalizedValue = (value - min) / (max - min)
  const thumbY = useSharedValue((1 - normalizedValue) * SLIDER_HEIGHT)
  const context = useSharedValue({ y: 0 })

  const updateValue = (newY: number) => {
    const normalized = 1 - Math.max(0, Math.min(1, newY / SLIDER_HEIGHT))
    const raw = min + normalized * (max - min)
    const stepped = Math.round(raw / step) * step
    const clamped = Math.max(min, Math.min(max, stepped))
    onChange(clamped)
  }

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: thumbY.value }
    })
    .onUpdate((event) => {
      const newY = Math.max(0, Math.min(SLIDER_HEIGHT, context.value.y + event.translationY))
      thumbY.value = newY
      runOnJS(updateValue)(newY)
    })

  const fillStyle = useAnimatedStyle(() => ({
    height: SLIDER_HEIGHT - thumbY.value,
  }))

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: thumbY.value }],
  }))

  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value.toFixed(step >= 1 ? 0 : 2)}</Text>
      <GestureDetector gesture={gesture}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { backgroundColor: color + '40' }, fillStyle]} />
          <Animated.View style={[styles.thumb, { backgroundColor: color }, thumbStyle]} />
        </View>
      </GestureDetector>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
    width: 48,
  },
  value: {
    color: '#888',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  track: {
    width: 6,
    height: SLIDER_HEIGHT,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    borderRadius: 3,
    position: 'absolute',
    bottom: 0,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    left: -7,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
})
