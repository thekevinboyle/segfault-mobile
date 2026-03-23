import { View, StyleSheet, Pressable, Text } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'
import { useEffectStore } from '../stores/effectStore'
import { EFFECT_PAGES } from '../effects-skia/pipeline'

interface EffectGridProps {
  onEffectSelect?: (id: string) => void
}

export function EffectGrid({ onEffectSelect }: EffectGridProps) {
  const effects = useEffectStore((s) => s.effects)
  const toggleEffect = useEffectStore((s) => s.toggleEffect)
  const currentPage = useEffectStore((s) => s.currentPage)
  const nextPage = useEffectStore((s) => s.nextPage)
  const prevPage = useEffectStore((s) => s.prevPage)

  const page = EFFECT_PAGES[currentPage]

  const handleToggle = (id: string) => {
    toggleEffect(id)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleLongPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onEffectSelect?.(id)
  }

  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationX < -50) {
        nextPage()
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } else if (event.translationX > 50) {
        prevPage()
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    })

  const totalActive = Object.values(effects).filter(e => e.enabled).length

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>{page?.name ?? 'EFFECTS'}</Text>
          <View style={styles.pageDots}>
            {EFFECT_PAGES.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentPage && styles.dotActive]} />
            ))}
          </View>
          {totalActive > 0 && (
            <Text style={styles.activeCount}>{totalActive} ACTIVE</Text>
          )}
        </View>

        <View style={styles.grid}>
          {page?.effects.map(({ id, label, color }) => {
            const isActive = effects[id]?.enabled
            return (
              <Pressable
                key={id}
                style={[
                  styles.cell,
                  isActive && { borderColor: color, backgroundColor: color + '20' },
                ]}
                onPress={() => handleToggle(id)}
                onLongPress={() => handleLongPress(id)}
              >
                <View style={[
                  styles.led,
                  isActive && { backgroundColor: color, shadowColor: color, shadowRadius: 4, shadowOpacity: 0.8 },
                ]} />
                <Text style={[styles.label, isActive && { color }]}>
                  {label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <Text style={styles.hint}>Swipe for pages / Long-press for params</Text>
      </View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  pageTitle: {
    color: '#00ffcc',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
  },
  pageDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
  },
  dotActive: {
    backgroundColor: '#00ffcc',
  },
  activeCount: {
    color: '#666',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  cell: {
    width: 76,
    height: 76,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  led: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2a2a2a',
  },
  label: {
    color: '#555',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  hint: {
    color: '#333',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 0.5,
  },
})
