import { useCallback, useState, useRef } from 'react'
import { View, StyleSheet, Pressable, Text } from 'react-native'
import {
  useCameraDevice,
  Camera,
  type CameraPosition,
} from 'react-native-vision-camera'
import { useSkiaFrameProcessor } from 'react-native-vision-camera'
import { Skia } from '@shopify/react-native-skia'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useEffectStore } from '../stores/effectStore'
import { SHADER_MAP, UNIFORM_BUILDERS, EFFECT_IDS } from '../effects-skia/pipeline'
import { BottomSheet } from './BottomSheet'
import { EffectGrid } from './EffectGrid'
import { EffectParams } from './EffectParams'

export function CameraScreen() {
  const [facing, setFacing] = useState<CameraPosition>('back')
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null)
  const device = useCameraDevice(facing)
  const effects = useEffectStore((s) => s.effects)
  const startTime = useRef(performance.now())

  const frameProcessor = useSkiaFrameProcessor((frame) => {
    'worklet'

    const time = (performance.now() - startTime.current) / 1000
    const resolution: [number, number] = [frame.width, frame.height]

    const enabledIds = EFFECT_IDS.filter(id => effects[id]?.enabled)

    if (enabledIds.length === 0) {
      frame.render()
    } else {
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

      const paint = Skia.Paint()
      paint.setShader(currentShader)
      frame.drawRect(
        Skia.XYWHRect(0, 0, frame.width, frame.height),
        paint,
      )
    }

    // HUD overlay
    const hudPaint = Skia.Paint()
    hudPaint.setColor(Skia.Color('rgba(0, 255, 204, 0.6)'))
    const font = Skia.Font(null, 22)
    frame.drawText('STRAND TRACER', 20, 52, hudPaint, font)

    const activeCount = EFFECT_IDS.filter(id => effects[id]?.enabled).length
    if (activeCount > 0) {
      const countPaint = Skia.Paint()
      countPaint.setColor(Skia.Color('rgba(0, 255, 204, 0.4)'))
      const smallFont = Skia.Font(null, 14)
      frame.drawText(`${activeCount} FX`, 20, 70, countPaint, smallFont)
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
    <GestureHandlerRootView style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat="rgb"
      />

      {/* Bottom bar — always visible */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.circleButton} onPress={flipCamera}>
          <Text style={styles.buttonLabel}>FLIP</Text>
        </Pressable>

        <View style={styles.recordButton}>
          <View style={styles.recordInner} />
        </View>

        <View style={styles.circleButton}>
          <Text style={styles.buttonLabel}>REC</Text>
        </View>
      </View>

      {/* Sliding panel */}
      <BottomSheet>
        {selectedEffect ? (
          <EffectParams
            effectId={selectedEffect}
            onClose={() => setSelectedEffect(null)}
          />
        ) : (
          <EffectGrid onEffectSelect={setSelectedEffect} />
        )}
      </BottomSheet>
    </GestureHandlerRootView>
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 0,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff0044',
  },
})
