import { useCallback, useState, useRef } from 'react'
import { View, StyleSheet, Pressable, Text, ScrollView } from 'react-native'
import {
  useCameraDevice,
  Camera,
  type CameraPosition,
} from 'react-native-vision-camera'
import { useSkiaFrameProcessor } from 'react-native-vision-camera'
import { Skia } from '@shopify/react-native-skia'
import { useEffectStore } from '../stores/effectStore'
import { SHADER_MAP, UNIFORM_BUILDERS, EFFECT_INFO, EFFECT_IDS } from '../effects-skia/pipeline'

export function CameraScreen() {
  const [facing, setFacing] = useState<CameraPosition>('back')
  const [showGrid, setShowGrid] = useState(false)
  const device = useCameraDevice(facing)
  const effects = useEffectStore((s) => s.effects)
  const toggleEffect = useEffectStore((s) => s.toggleEffect)
  const startTime = useRef(performance.now())

  const frameProcessor = useSkiaFrameProcessor((frame) => {
    'worklet'

    const time = (performance.now() - startTime.current) / 1000
    const resolution: [number, number] = [frame.width, frame.height]

    // Get enabled effect IDs
    const enabledIds = EFFECT_IDS.filter(id => effects[id]?.enabled)

    if (enabledIds.length === 0) {
      // No effects — just render the camera frame
      frame.render()
    } else {
      // Chain effects: camera → effect1 → effect2 → ...
      // Start with the camera frame as the first input shader
      let currentShader = frame.toShader()

      for (const id of enabledIds) {
        const runtimeEffect = SHADER_MAP[id]
        const buildUniforms = UNIFORM_BUILDERS[id]
        if (!runtimeEffect || !buildUniforms) continue

        const params = effects[id]?.params ?? {}
        const uniforms = buildUniforms(params, resolution, time)

        const nextShader = runtimeEffect.makeShaderWithChildren(
          uniforms,
          [currentShader],
        )

        if (nextShader) {
          currentShader = nextShader
        }
      }

      // Draw the final chained result
      const paint = Skia.Paint()
      paint.setShader(currentShader)
      frame.drawRect(
        Skia.XYWHRect(0, 0, frame.width, frame.height),
        paint,
      )
    }

    // HUD overlay
    const hudPaint = Skia.Paint()
    hudPaint.setColor(Skia.Color('rgba(0, 255, 204, 0.7)'))
    const font = Skia.Font(null, 24)
    frame.drawText('STRAND TRACER', 20, 48, hudPaint, font)

    // Active effect count
    const activeCount = EFFECT_IDS.filter(id => effects[id]?.enabled).length
    if (activeCount > 0) {
      const countPaint = Skia.Paint()
      countPaint.setColor(Skia.Color('rgba(0, 255, 204, 0.5)'))
      const smallFont = Skia.Font(null, 16)
      frame.drawText(`${activeCount} FX ACTIVE`, 20, 72, countPaint, smallFont)
    }
  }, [effects])

  const flipCamera = useCallback(() => {
    setFacing(f => f === 'back' ? 'front' : 'back')
  }, [])

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDevice}>No camera device found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat="rgb"
      />

      {/* Effect grid overlay */}
      {showGrid && (
        <View style={styles.gridOverlay}>
          <ScrollView contentContainerStyle={styles.gridContent}>
            <Text style={styles.gridTitle}>EFFECTS</Text>
            <View style={styles.grid}>
              {EFFECT_IDS.map((id) => {
                const info = EFFECT_INFO[id]
                const isActive = effects[id]?.enabled
                return (
                  <Pressable
                    key={id}
                    style={[
                      styles.gridCell,
                      isActive && { backgroundColor: info.color + '33', borderColor: info.color },
                    ]}
                    onPress={() => toggleEffect(id)}
                  >
                    <View style={[styles.led, isActive && { backgroundColor: info.color }]} />
                    <Text style={[styles.gridLabel, isActive && { color: info.color }]}>
                      {info.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.circleButton} onPress={flipCamera}>
          <Text style={styles.buttonLabel}>FLIP</Text>
        </Pressable>

        <View style={styles.recordButton}>
          <View style={styles.recordInner} />
        </View>

        <Pressable
          style={[styles.circleButton, showGrid && styles.circleButtonActive]}
          onPress={() => setShowGrid(g => !g)}
        >
          <Text style={[styles.buttonLabel, showGrid && styles.buttonLabelActive]}>FX</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  noDevice: {
    color: '#888',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 110,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  gridContent: {
    alignItems: 'center',
  },
  gridTitle: {
    color: '#00ffcc',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    maxWidth: 340,
  },
  gridCell: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  led: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  gridLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#00ffcc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleButtonActive: {
    backgroundColor: '#00ffcc',
  },
  buttonLabel: {
    color: '#00ffcc',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  buttonLabelActive: {
    color: '#0a0a0a',
  },
  recordButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#ff0044',
  },
})
