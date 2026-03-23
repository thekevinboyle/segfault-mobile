import { View, StyleSheet, Pressable, Text } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useEffectStore } from '../stores/effectStore'
import { EFFECT_INFO, EFFECT_IDS } from '../effects-skia/pipeline'

interface EffectGridProps {
  onEffectSelect?: (id: string) => void
}

export function EffectGrid({ onEffectSelect }: EffectGridProps) {
  const effects = useEffectStore((s) => s.effects)
  const toggleEffect = useEffectStore((s) => s.toggleEffect)

  const handleToggle = (id: string) => {
    toggleEffect(id)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleLongPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onEffectSelect?.(id)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GLITCH</Text>
      <View style={styles.grid}>
        {EFFECT_IDS.map((id) => {
          const info = EFFECT_INFO[id]
          const isActive = effects[id]?.enabled
          return (
            <Pressable
              key={id}
              style={[
                styles.cell,
                isActive && { borderColor: info.color, backgroundColor: info.color + '20' },
              ]}
              onPress={() => handleToggle(id)}
              onLongPress={() => handleLongPress(id)}
            >
              <View style={[styles.led, isActive && { backgroundColor: info.color, shadowColor: info.color, shadowRadius: 4, shadowOpacity: 0.8 }]} />
              <Text style={[styles.label, isActive && { color: info.color }]}>
                {info.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    color: '#00ffcc',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 12,
    textAlign: 'center',
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
})
