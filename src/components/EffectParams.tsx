import { View, StyleSheet, Text, Pressable } from 'react-native'
import { useEffectStore } from '../stores/effectStore'
import { EFFECT_INFO } from '../effects-skia/pipeline'
import { ParamSlider } from './ParamSlider'

const PARAM_DEFS: Record<string, { key: string; label: string; min: number; max: number; step: number }[]> = {
  rgb_split: [
    { key: 'amount', label: 'AMT', min: 0, max: 5, step: 0.1 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  chromatic: [
    { key: 'intensity', label: 'INT', min: 0, max: 5, step: 0.1 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  posterize: [
    { key: 'levels', label: 'LVLS', min: 2, max: 16, step: 1 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  color_grade: [
    { key: 'brightness', label: 'BRT', min: -0.5, max: 0.5, step: 0.01 },
    { key: 'contrast', label: 'CNTR', min: 0.5, max: 2, step: 0.05 },
    { key: 'saturation', label: 'SAT', min: 0, max: 2, step: 0.05 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  block_displace: [
    { key: 'blockSize', label: 'SIZE', min: 0.01, max: 0.2, step: 0.005 },
    { key: 'displaceChance', label: 'CHNC', min: 0, max: 1, step: 0.01 },
    { key: 'displaceDistance', label: 'DIST', min: 0, max: 0.1, step: 0.005 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  static_displace: [
    { key: 'intensity', label: 'INT', min: 0, max: 1, step: 0.01 },
    { key: 'scale', label: 'SCALE', min: 1, max: 100, step: 1 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  pixelate: [
    { key: 'pixelSize', label: 'SIZE', min: 2, max: 32, step: 1 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  lens: [
    { key: 'curvature', label: 'CURV', min: -1, max: 1, step: 0.05 },
    { key: 'vignette', label: 'VIG', min: 0, max: 1, step: 0.01 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  scan_lines: [
    { key: 'lineCount', label: 'LINES', min: 50, max: 800, step: 10 },
    { key: 'lineOpacity', label: 'OPAC', min: 0, max: 0.5, step: 0.01 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  vhs: [
    { key: 'tearIntensity', label: 'TEAR', min: 0, max: 2, step: 0.05 },
    { key: 'noiseAmount', label: 'NOISE', min: 0, max: 0.2, step: 0.01 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  noise: [
    { key: 'amount', label: 'AMT', min: 0, max: 0.5, step: 0.01 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  dither: [
    { key: 'gridSize', label: 'GRID', min: 1, max: 8, step: 1 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  edges: [
    { key: 'threshold', label: 'THRSH', min: 5, max: 80, step: 1 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  feedback: [
    { key: 'zoom', label: 'ZOOM', min: 0.9, max: 1.1, step: 0.005 },
    { key: 'rotation', label: 'ROT', min: -15, max: 15, step: 0.5 },
    { key: 'hueShift', label: 'HUE', min: 0, max: 60, step: 1 },
    { key: 'decay', label: 'DECAY', min: 0.5, max: 0.99, step: 0.01 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  invert: [
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  dots: [
    { key: 'gridSize', label: 'SIZE', min: 4, max: 32, step: 1 },
    { key: 'dotScale', label: 'SCALE', min: 0.2, max: 1, step: 0.05 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  halftone: [
    { key: 'dotSize', label: 'SIZE', min: 4, max: 24, step: 1 },
    { key: 'angle', label: 'ANGLE', min: 0, max: 1.57, step: 0.05 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  pixel_sort: [
    { key: 'threshold', label: 'THRSH', min: 0, max: 1, step: 0.01 },
    { key: 'streakLength', label: 'LEN', min: 10, max: 300, step: 5 },
    { key: 'intensity', label: 'INT', min: 0, max: 1, step: 0.01 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
  sonify: [
    { key: 'sampleRate', label: 'RATE', min: 0.01, max: 1, step: 0.01 },
    { key: 'bitDepth', label: 'BITS', min: 1, max: 16, step: 1 },
    { key: 'drive', label: 'DRIVE', min: 0, max: 1, step: 0.01 },
    { key: 'mix', label: 'MIX', min: 0, max: 1, step: 0.01 },
  ],
}

interface EffectParamsProps {
  effectId: string
  onClose: () => void
}

export function EffectParams({ effectId, onClose }: EffectParamsProps) {
  const effects = useEffectStore((s) => s.effects)
  const updateParam = useEffectStore((s) => s.updateParam)
  const info = EFFECT_INFO[effectId]
  const params = effects[effectId]?.params ?? {}
  const defs = PARAM_DEFS[effectId] ?? []

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: info?.color }]}>{info?.label ?? effectId}</Text>
        <Pressable onPress={onClose} style={styles.doneButton}>
          <Text style={styles.doneText}>DONE</Text>
        </Pressable>
      </View>
      <View style={styles.sliders}>
        {defs.map((def) => (
          <ParamSlider
            key={def.key}
            label={def.label}
            value={params[def.key] ?? def.min}
            min={def.min}
            max={def.max}
            step={def.step}
            color={info?.color}
            onChange={(v) => updateParam(effectId, def.key, v)}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  doneButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#00ffcc',
  },
  doneText: {
    color: '#00ffcc',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sliders: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
})
